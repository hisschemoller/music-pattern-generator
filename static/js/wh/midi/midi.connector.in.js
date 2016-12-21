/**
 * MIDI network processor in connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorIn(specs, my) {
        var that,
            outConnectors = [],
            numOutConnectors = 0,
            
            getInputData = function() {
                var outputData = [];
                for (var i = 0; i < numOutConnectors; i++) {
                    var data = outConnectors[i].getOutputData();
                    var outputData = outputData.concat(data);
                    data.length = 0;
                }
                return outputData;
            },
            
            connect = function(outConnector) {
                outConnectors.push(outConnector);
                numOutConnectors = outConnectors.length;
                console.log('Connect ' + outConnector.getProperty('type') + ' (id ' + outConnector.getProperty('id') + ') to ' + that.getProperty('type') + ' (id ' + that.getProperty('id') + ')');
            },
            
            disconnect = function() {
                
            };
       
        my = my || {};
        my.getInputData = getInputData;

        that = specs.that || {};
        
        that.connect = connect;
        that.disconnect = disconnect;
        return that;
    };
    
    ns.createMIDIConnectorIn = createMIDIConnectorIn;

})(WH);
