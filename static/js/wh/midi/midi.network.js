/**
 * Manages the graph of midi processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDINetwork(specs, my) {
        var that,
            appView = specs.appView,
            remoteView = specs.remoteView,
            world = specs.world,
            processorIdCounter = 0,
            processors = [],
            numProcessors = processors.length,
            
            init = function() {
                ns.pubSub.on('create.processor', createProcessor);
                ns.pubSub.on('delete.processor', deleteProcessor);
                ns.pubSub.on('select.processor', selectProcessor);
            },
        
            createProcessor = function(specs) {
                if (ns.midiProcessors && ns.midiProcessors[specs.type]) {
                    specs.that = {};
                    specs.id = processorIdCounter;
                    var processor = ns.midiProcessors[specs.type].create(specs);
                    processors.push(processor);
                    console.log('Add processor ' + processor.getProperty('type') + ' (id ' + processor.getProperty('id') + ')');
                    processorIdCounter += 1;
                    numProcessors = processors.length;
                    // create the views for the processor
                    appView.createSettingsView(specs.type, processor);
                    remoteView.createRemoteGroup(processor);
                    world.createObject(specs.type, processor);
                    selectProcessor(processor);
                    
                    // TEMP
                    // if this is an EPG processor, connect it to MIDI out processor (if any)
                    if (specs.type == 'epg') {
                        for (var i = 0; i < numProcessors; i++) {
                            if (processors[i].getProperty('type') == 'output') {
                                processor.connect(processors[i]);
                                break;
                            }
                        }
                    }
                } else {
                    console.error('No MIDI processor found of type: ', specs.type);
                }
            },
            
            deleteProcessor = function(processor) {
                // disconnect other processors that have this processor as destination
                for (var i = 0; i < numProcessors; i++) {
                    if (typeof processors[i].disconnect === 'function') {
                        processors[i].disconnect(processor);
                    }
                }
                // disconnect this processor from its destinations
                processor.disconnect();
                selectNextProcessor(processor);
                appView.deleteSettingsView(processor);
                remoteView.deleteRemoteGroup(processor);
                world.deleteObject(processor);
                processor.terminate();
                processors.splice(processors.indexOf(processor), 1);
                numProcessors = processors.length;
            },
            
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
                if (processors.length > 1) {
                    var processorIndex = processors.indexOf(processor),
                        nextIndex = processorIndex + 1;
                    if (nextIndex == processors.length) {
                        nextIndex = 0;
                    }
                    selectProcessor(processors[nextIndex]);
                }
            },
            
            process = function(start, end, nowToScanStart, ticksToMsMultiplier, offset) {
                for (var i = 0; i < numProcessors; i++) {
                    processors[i].process(start, end, nowToScanStart, ticksToMsMultiplier, offset);
                }
            },
            
            render = function(position) {
                for (var i = 0; i < numProcessors; i++) {
                    if (processors[i].render) {
                        processors[i].render(position);
                    }
                }
            };
       
        my = my || {};

        that = specs.that || {};
        
        init();
        
        that.process = process;
        that.render = render;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
