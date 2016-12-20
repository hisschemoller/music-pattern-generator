/**
 * Manages the graph of midi processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDINetwork(specs, my) {
        var that,
            processorIdCounter = 0,
        
            addProcessor = function(processorName, specs) {
                if (ns.midiProcessors && ns.midiProcessors[processorName]) {
                    specs.id = processorIdCounter;
                    var processor = ns.midiProcessors[processorName].create(specs);
                    processorIdCounter += 1;
                    return processor;
                } else {
                    console.error('No MIDI processor found with name: ', processorName);
                }
            },
            
            removeProcessor = function() {
                
            };
       
        my = my || {};

        that = specs.that || {};
        
        that.addProcessor = addProcessor;
        that.removeProcessor = removeProcessor;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
