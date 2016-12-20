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
        
            addProcessor = function(processorName, specs) {
                if (ns.midiProcessors && ns.midiProcessors[processorName]) {
                    specs.id = processorIdCounter;
                    var processor = ns.midiProcessors[processorName].create(specs);
                    processors.push(processor);
                    processorIdCounter += 1;
                    return processor;
                } else {
                    console.error('No MIDI processor found with name: ', processorName);
                }
            },
            
            removeProcessor = function() {
                
            },
            
            selectProcessorById = function(id) {
                var n = processors.length;
                for (var i = 0; i < n; i++) {
                    var processor = processors[i];
                    processor.setProperty('isSelected', processor.getProperty('id') === id);
                }
            };
       
        my = my || {};

        that = specs.that || {};
        
        that.addProcessor = addProcessor;
        that.removeProcessor = removeProcessor;
        that.selectProcessorById = selectProcessorById;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
