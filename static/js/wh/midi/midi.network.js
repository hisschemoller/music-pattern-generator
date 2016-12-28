/**
 * Manages the graph of midi processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDINetwork(specs, my) {
        var that,
            processorIdCounter = 0,
            processors = [],
            numProcessors = processors.length,
        
            createProcessor = function(processorName, specs) {
                if (ns.midiProcessors && ns.midiProcessors[processorName]) {
                    specs.that = {};
                    specs.id = processorIdCounter;
                    var processor = ns.midiProcessors[processorName].create(specs);
                    processors.push(processor);
                    processorIdCounter += 1;
                    numProcessors = processors.length;
                    console.log('Add processor ' + processor.getProperty('type') + ' (id ' + processor.getProperty('id') + ')');
                    return processor;
                } else {
                    console.error('No MIDI processor found with name: ', processorName);
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
            
            process = function(start, end) {
                for (var i = 0; i < numProcessors; i++) {
                    processors[i].process(start, end);
                }
            };
       
        my = my || {};

        that = specs.that || {};
        
        that.createProcessor = createProcessor;
        that.destroyProcessor = destroyProcessor;
        that.selectProcessor = selectProcessor;
        that.getProcessorByProperty = getProcessorByProperty;
        that.process = process;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
