/**
 * Manages the graph of midi processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDINetwork(specs, my) {
        var that,
            appView = specs.appView,
            world = specs.world,
            processorIdCounter = 0,
            processors = [],
            numProcessors = processors.length,
            
            init = function() {
                ns.pubSub.on('create.processor', createProcessor);
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
                    world.createObject(specs.type, processor);
                } else {
                    console.error('No MIDI processor found of type: ', specs.type);
                }
            },
            
            destroyProcessor = function() {
                numProcessors = processors.length;
            },
            
            selectProcessor = function(processor) {
                for (var i = 0; i < numProcessors; i++) {
                    var proc = processors[i];
                    proc.setProperty('isSelected', proc === processor);
                }
            },
            
            getProcessorByProperty = function(name, value) {
                for (var i = 0; i < numProcessors; i++) {
                    if (processors[i].getProperty(name) === value) {
                        return processors[i];
                    }
                }
            },
            
            process = function(start, end, nowToScanStart, ticksToMsMultiplier) {
                for (var i = 0; i < numProcessors; i++) {
                    processors[i].process(start, end, nowToScanStart, ticksToMsMultiplier);
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
        
        that.destroyProcessor = destroyProcessor;
        that.selectProcessor = selectProcessor;
        that.getProcessorByProperty = getProcessorByProperty;
        that.process = process;
        that.render = render;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
