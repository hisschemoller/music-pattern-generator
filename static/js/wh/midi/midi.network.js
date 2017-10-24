/**
 * Manages the graph of midi processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {

    function createMIDINetwork(specs, my) {
        var that,
            app = specs.app,
            appView = specs.appView,
            canvasView = specs.canvasView,
            midiRemote = specs.midiRemote,
            preferencesView = specs.preferencesView,
            processors = [],
            numProcessors = processors.length,
            numInputProcessors = 0,

            /**
             * Create a new processor in the network.
             * @param {Object} specs Processor specifications.
             * @param {Boolean} isRestore True if this is called as part of restoring a project.
             * @return {Object} The new processor.
             */
            createProcessor = function(specs, isRestore) {
                if (ns.midiProcessors && ns.midiProcessors[specs.type]) {
                    specs = specs || {};
                    specs.that = {};
                    specs.id = specs.id || specs.type + performance.now() + '_' + Math.random();
                    var processor = ns.midiProcessors[specs.type].create(specs);

                    // insert the processor at the right position
                    switch (specs.type) {
                        case 'input':
                            processors.unshift(processor);
                            numInputProcessors++;
                            break;
                        case 'output':
                            processors.push(processor);
                            break;
                        default:
                            processors.splice(numInputProcessors, 0, processor);
                    }

                    console.log('Create processor ' + processor.getType() + ' (id ' + processor.getID() + ')');
                    numProcessors = processors.length;
                    
                    setProcessorDefaultName(processor);

                    // create the views for the processor
                    switch (specs.type) {
                        case 'input':
                            break;
                        case 'output':
                            canvasView.createView(processor);
                            break;
                        case 'epg':
                            appView.createSettingsView(processor);
                            canvasView.createView(processor);
                            midiRemote.registerProcessor(processor);
                            selectProcessor(processor);
                            canvasView.markDirty();
                            break;
                    }
                } else {
                    console.error('No MIDI processor found of type: ', specs.type);
                }
                
                return processor;
            },

            /**
             * Delete a processor.
             * @param {String} processor Processor to delete.
             */
            deleteProcessor = function(processor) {
                // find the processor
                var processor;
                for (var i = 0; i < numProcessors; i++) {
                    if (processors[i] === processor) {
                        processor = processors[i];
                        break;
                    }
                }
                
                if (processor) {
                    console.log('Delete processor ' + processor.getType() + ' (id ' + processor.getID() + ')');
                    
                    // disconnect other processors that have this processor as destination
                    for (var i = 0; i < numProcessors; i++) {
                        if (typeof processors[i].disconnect === 'function') {
                            processors[i].disconnect(processor);
                        }
                    }
                    
                    // delete the views for the processor
                    switch (processor.getType()) {
                        case 'input':
                            numInputProcessors--;
                            break;
                        case 'output':
                            canvasView.deleteView(processor);
                            break;
                        case 'epg':
                            appView.deleteSettingsView(processor);
                            canvasView.deleteView(processor);
                            midiRemote.unregisterProcessor(processor);
                            break;
                    }

                    // disconnect this processor from its destinations
                    if (typeof processor.disconnect === 'function') {
                        processor.disconnect();
                    }
                    
                    selectNextProcessor(processor);
                    
                    if (typeof processor.terminate === 'function') {
                        processor.terminate();
                    }
                    
                    processors.splice(processors.indexOf(processor), 1);
                    numProcessors = processors.length;
                }
            },

            /**
             * Select a processor.
             * @param  {Object} processor Processor to select.
             */
            selectProcessor = function(processor) {
                app.togglePanel('settings', processor != null);
                for (var i = 0; i < numProcessors; i++) {
                    var proc = processors[i];
                    if (typeof proc.setSelected == 'function') {
                        proc.setSelected(proc === processor);
                    }
                }
            },

            /**
             * Select the next processor from the given.
             * @param  {Object} processor Processor to select.
             */
            selectNextProcessor = function(processor) {
                let processorIndex = processors.indexOf(processor),
                    nextIndex,
                    nextProcessor,
                    isNextProcessor;
                for (let i = 1, n = processors.length; i <= n; i++) {
                    nextIndex = (processorIndex + i) % n;
                    nextProcessor = processors[nextIndex];
                    if (nextProcessor.getType() !== 'input' && nextProcessor.getType() !== 'output' && nextProcessor !== processor) {
                        isNextProcessor = true;
                        selectProcessor(nextProcessor);
                        break;
                    }
                }
                
                if (!isNextProcessor) {
                    selectProcessor(null);
                }
            },
            
            /**
             * Set default processor name.
             * @param {Object} processor Processor to name.
             */
            setProcessorDefaultName = function(processor) {
                let name, number, spaceIndex, 
                    highestNumber = 0,
                    staticName = 'Processor';
                for (let i = 0; i < numProcessors; i++) {
                    name = processors[i].getParamValue('name');
                    if (name && name.indexOf(staticName) == 0) {
                        spaceIndex = name.lastIndexOf(' ');
                        if (spaceIndex != -1) {
                            number = parseInt(name.substr(spaceIndex), 10);
                            if (!isNaN(number)) {
                                highestNumber = Math.max(highestNumber, number);
                            }
                        }
                    }
                }
                processor.setParamValue('name', 'Processor ' + (highestNumber + 1));
            },

            /**
             * Let all processors process their data.
             * @param {Number} start Start time in ticks of timespan to process.
             * @param {Number} end End time in ticks of timespan to process.
             * @param {Number} nowToScanStart Duration from now until start time in ticks.
             * @param {Number} ticksToMsMultiplier Ticks to ms. conversion multiplier.
             * @param {Number} offset Position of transport playhead in ticks.
             */
            process = function(start, end, nowToScanStart, ticksToMsMultiplier, offset) {
                for (var i = 0; i < numProcessors; i++) {
                    processors[i].process(start, end, nowToScanStart, ticksToMsMultiplier, offset);
                }
            },

            /**
             * Update view. At requestAnimationFrame speed.
             * @param  {Number} position Transport playback position in ticks.
             */
            render = function(position) {
                for (var i = 0; i < numProcessors; i++) {
                    if (processors[i].render) {
                        processors[i].render(position);
                    }
                }
            },

            /**
             * Clear the whole network.
             * Remove all processors except the inputs and outputs.
             * Remove all the connections.
             */
            clear = function() {
                let type,
                    n = numProcessors;
                while (--n >= 0) {
                    type = processors[n].getType();
                    if (type !== 'input' && type !== 'output') {
                        deleteProcessor(processors[n]);
                    }
                }
            },

            /**
             * Restore network from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                // clear all old data
                clear();
                
                if (!data.processors || data.processors.length == 0) {
                    return;
                }
                
                // create the processors
                data.processors.forEach(function(item) {
                    // don't create MIDI inputs and outputs yet
                    if (item.type !== 'input' && item.type !== 'output') {
                        createProcessor({
                            type: item.type,
                            id: item.id
                        }, true);
                    }
                });

                // find midi processors created for the detected midi ports,
                // match them with the saved midi processor data,
                // by comparing the midi port ids
                // then give the matched processors the processor id from the saved data
                // so that connections to input and output processors can be restored
                var pdata = data.processors,
                    n = pdata.length,
                    procType,
                    numProcessors = processors.length;
                for (var i = 0; i < n; i++) {
                    if (pdata[i].type === 'input' || pdata[i].type === 'output') {
                        for (var j = 0; j < numProcessors; j++) {
                            procType = processors[j].getType();
                            if (procType === 'input' || procType === 'output') {
                                if (pdata[i].midiPortID === processors[j].getPort().id) {
                                    processors[j].setID(pdata[i].id);
                                }
                            }
                        }
                    }
                }

                // restore state of the processor
                for (var i = 0; i < n; i++) {
                    for (var j = 0; j < numProcessors; j++) {
                        if (pdata[i].id === processors[j].getID()) {
                            processors[j].setData(pdata[i]);
                        }
                    }
                }

                // connect the processors
                var sourceProcessor, numDestinations, destinationIDs;
                for (var i = 0; i < n; i++) {
                    destinationIDs = pdata[i].destinations;
                    if (destinationIDs && destinationIDs.length) {
                        // find source processor
                        sourceProcessor = null;
                        for (var j = 0; j < numProcessors; j++) {
                            if (pdata[i].id === processors[j].getID()) {
                                sourceProcessor = processors[j];
                            }
                        }

                        // find destination processor(s)
                        if (sourceProcessor) {
                            numDestinations = destinationIDs.length;
                            for (var j = 0; j < numDestinations; j++) {
                                for (var k = 0; k < numProcessors; k++) {
                                    if (destinationIDs[j] == processors[k].getID()) {
                                        sourceProcessor.connect(processors[k]);
                                        console.log('Connect ' + sourceProcessor.getType() + ' to ' + processors[k].getType());
                                    }
                                }
                            }
                        }
                    }
                }
            },

            /**
             * Write network settings to data object.
             * @return {Object} Data to store.
             */
            getData = function() {
                // collect data from all processors
                var processor,
                    procData = [];
                for (var i = 0; i < numProcessors; i++) {
                    procData.push(processors[i].getData());
                }

                return {
                    processors: procData
                };
            };

        my = my || {};

        that = ns.createMIDINetworkConnections(specs, my);

        that.createProcessor = createProcessor;
        that.deleteProcessor = deleteProcessor;
        that.selectProcessor = selectProcessor;
        that.process = process;
        that.render = render;
        that.clear = clear;
        that.setData = setData;
        that.getData = getData;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
