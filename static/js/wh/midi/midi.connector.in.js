/**
 * MIDI network processor in connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorIn(specs, my) {
        var that,
            outputConnectors = [],
            numOutputConnectors = 0,
            
            getInputData = function() {
                for (var i = 0; i < numOutputConnectors; i++) {
                    var outputData = outputConnectors[i].getOutputData();
                }
            };
       
        my = my || {};
        my.getInputData = getInputData;

        that = specs.that || {};
        
        return that;
    };
    
    ns.createMIDIConnectorIn = createMIDIConnectorIn;

})(WH);
