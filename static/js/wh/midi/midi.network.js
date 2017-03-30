/**
 * Manages the graph of midi processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDINetwork(specs, my) {
        var that,
            appView = specs.appView,
            midiRemote = specs.midiRemote,
            world = specs.world,
            processors = [],
            numProcessors = processors.length,
            
            init = function() {
                ns.pubSub.on('create.processor', createProcessor);
                ns.pubSub.on('delete.processor', deleteProcessor);
                ns.pubSub.on('select.processor', selectProcessor);
            },
            
            /**
             * Create a new processor in the network.
             * @param {Object} specs Processor specifications.
             * @param {Boolean} isRestore True if this is called as part of restoring a project. 
             */
            createProcessor = function(specs, isRestore) {
                if (ns.midiProcessors && ns.midiProcessors[specs.type]) {
                    specs = specs || {};
                    specs.that = {};
                    specs.id = specs.id || specs.type + performance.now() + '_' + Math.random();
                    var processor = ns.midiProcessors[specs.type].create(specs);
                    processors.push(processor);
                    console.log('Add processor ' + processor.getType() + ' (id ' + processor.getID() + ')');
                    numProcessors = processors.length;
                    
                    // create the views for the processor
                    switch (specs.type) {
                        case 'input':
                        case 'output':
                            appView.createMIDIPortView(processor);
                            break;
                        case 'epg':
                            appView.createSettingsView(processor);
                            world.createObject(processor);
                            midiRemote.registerProcessor(processor);
                            selectProcessor(processor);
                            break;
                    }
                    
                    // If the app is in EPG mode,
                    // and this is a newly created processor (not a project restore),
                    // then connect each EPG processor to the first input and output port.
                    var epgMode = true;
                    if (epgMode && isRestore !== true) {
                        if (specs.type == 'epg') {
                            for (var i = 0; i < numProcessors; i++) {
                                if (processors[i].getType() == 'input') {
                                    processors[i].connect(processor);
                                }
                                if (processors[i].getType() == 'output') {
                                    processor.connect(processors[i]);
                                }
                            }
                        }
                    }
                } else {
                    console.error('No MIDI processor found of type: ', specs.type);
                }
            },
            
            /**
             * Delete a processor.
             * @param {Object} processor Processor to delete.
             */
            deleteProcessor = function(processor) {
                // disconnect other processors that have this processor as destination
                for (var i = 0; i < numProcessors; i++) {
                    if (typeof processors[i].disconnect === 'function') {
                        processors[i].disconnect(processor);
                    }
                }
                
                // delete the views for the processor
                switch (processor.getType()) {
                    case 'input':
                    case 'output':
                        appView.deleteMIDIPortView(processor);
                        break;
                    case 'epg':
                        appView.deleteSettingsView(processor);
                        world.deleteObject(processor);
                        midiRemote.unregisterProcessor(processor);
                        selectProcessor(processor);
                        break;
                }
                
                // disconnect this processor from its destinations
                processor.disconnect();
                selectNextProcessor(processor);
                processor.terminate();
                processors.splice(processors.indexOf(processor), 1);
                numProcessors = processors.length;
            },
            
            /**
             * Select a processor.
             * @param  {Object} processor Processor to select.
             */
            selectProcessor = function(processor) {
                for (var i = 0; i < numProcessors; i++) {
                    var proc = processors[i];
                    if (typeof proc.setSelected == 'function') {
                        proc.setSelected(proc === processor);
                    }
                }
            },
            
            /**
             * Select the next processor from the given.
             * @param  {Object} processor [description]
             */
            selectNextProcessor = function(processor) {
                let processorIndex = processors.indexOf(processor),
                    n = processors.length,
                    nextIndex,
                    nextProcessor;
                for (let i = 1; i <= n; i++) {
                    nextIndex = (processorIndex + i) % n;
                    nextProcessor = processors[nextIndex];
                    if (nextProcessor.getType() !== 'input' && nextProcessor.getType() !== 'output' && nextProcessor !== processor) {
                        selectProcessor(nextProcessor);
                        break;
                    }
                }
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
             * Connect all EPG processors to a MIDI input port.
             * @param {String} newPortID MIDI input to connect to.
             * @param {String} oldPortID MIDI input to disconnect from.
             */
            connectAllEPGToInput = function(newPortID, oldPortID) {
                let newPortProcessor, oldPortProcessor;
                for (let i = 0; i < numProcessors; i++) {
                    if (processors[i].getType() == 'input') {
                        let portID = processors[i].getPort().id;
                        if (portID == oldPortID) {
                            oldPortProcessor = processors[i];
                        }
                        if (portID == newPortID) {
                            newPortProcessor = processors[i];
                        }
                    }
                }
                for (let i = 0; i < numProcessors; i++) {
                    if (processors[i].getType() == 'epg') {
                        if (oldPortProcessor) {
                            oldPortProcessor.disconnect(processors[i]);
                        }
                        newPortProcessor.connect(processors[i]);
                    }
                }
            },
            
            /**
             * Connect all EPG processors to a MIDI output port.
             * @param {String} newPortID MIDI output to connect to.
             * @param {String} oldPortID MIDI output to disconnect from.
             */
            connectAllEPGToOutput = function(newPortID, oldPortID) {
                let newPortProcessor, oldPortProcessor;
                for (let i = 0; i < numProcessors; i++) {
                    if (processors[i].getType() == 'output') {
                        let portID = processors[i].getPort().id;
                        if (portID == oldPortID) {
                            oldPortProcessor = processors[i];
                        }
                        if (portID == newPortID) {
                            newPortProcessor = processors[i];
                        }
                    }
                }
                for (let i = 0; i < numProcessors; i++) {
                    if (processors[i].getType() == 'epg') {
                        if (oldPortProcessor) {
                            processors[i].disconnect(oldPortProcessor);
                        }
                        processors[i].connect(newPortProcessor);
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
                // create the processors
                var pdata = data.processors,
                    n = pdata.length;
                for (var i = 0; i < n; i++) {
                    // don't create MIDI inputs and outputs
                    if (pdata[i].type !== 'input' && pdata[i].type !== 'output') {
                        createProcessor({
                            type: pdata[i].type,
                            id: pdata[i].id
                        }, true);
                    }
                }
                
                // find midi processors created for the detected midi ports,
                // match them with the saved midi processor data,
                // by comparing the midi port ids
                // then give the matched processors the processor id from the saved data
                // so that connections to input and output processors can be restored
                var procType, 
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

        that = specs.that || {};
        
        init();
        
        that.process = process;
        that.render = render;
        that.connectAllEPGToInput = connectAllEPGToInput;
        that.connectAllEPGToOutput = connectAllEPGToOutput;
        that.clear = clear;
        that.setData = setData;
        that.getData = getData;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
