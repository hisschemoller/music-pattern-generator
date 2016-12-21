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
                console.log('out', eventData.type, eventData.timestamp);
                outputData.push(eventData);
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
