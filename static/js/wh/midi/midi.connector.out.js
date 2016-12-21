/**
 * MIDI network processor out connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorOut(specs, my) {
        var that,
            outputData = [],
            
            setOutputData = function(eventData) {
                outputData.push(eventData);
            },
            
            getOutputData = function() {
                return outputData;
            };
       
        my = my || {};
        my.setOutputData = setOutputData;

        that = specs.that || {};
        
        that.getOutputData = getOutputData;
        return that;
    };
    
    ns.createMIDIConnectorOut = createMIDIConnectorOut;

})(WH);
