/**
 * MIDI network processor out connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorOut(specs, my) {
        var that,
            outputData = [],
            
            setOutputData = function() {
                
            },
            
            getOutputData = function() {
                return outputData;
            };
       
        my = my || {};
        my.setOutputData = setOutputData;

        that = specs.that || {};
        
        that.setOutputData = setOutputData;
        return that;
    };
    
    ns.createMIDIConnectorOut = createMIDIConnectorOut;

})(WH);
