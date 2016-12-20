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
                    console.log('addProcessor', processor.getProperty('id'));
                    return processor;
                } else {
                    console.error('No MIDI processor found with name: ', processorName);
                }
            },
            
            removeProcessor = function() {
                
            },
            
            selectProcessor = function(processor) {
                var n = processors.length;
                for (var i = 0; i < n; i++) {
                    var proc = processors[i];
                    proc.setProperty('isSelected', proc === processor);
                }
            },
            
            getProcessorByProperty = function(name, value) {
                var n = processors.length;
                for (var i = 0; i < n; i++) {
                    if (processors[i].getProperty(name) === value) {
                        return processors[i];
                    }
                }
            },
            
            connect = function(processorFrom, processorTo) {
                processorFrom.connect(processorTo);
            },
            
            disconnect = function() {
                
            };
       
        my = my || {};

        that = specs.that || {};
        
        that.addProcessor = addProcessor;
        that.removeProcessor = removeProcessor;
        that.selectProcessor = selectProcessor;
        that.getProcessorByProperty = getProcessorByProperty;
        that.connect = connect;
        that.disconnect = disconnect;
        return that;
    };

    ns.createMIDINetwork = createMIDINetwork;

})(WH);
