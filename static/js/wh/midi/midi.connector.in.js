/**
 * MIDI network processor in connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorIn(specs, my) {
        var that,
            sources = [],
            numSources = 0,
            
            getInputData = function() {
                var outputData = [], 
                    data = [];
                for (var i = 0; i < numSources; i++) {
                    data = sources[i].getOutputData();
                    outputData = outputData.concat(data);
                    data.length = 0;
                }
                return outputData;
            },
            
            addConnection = function(processor) {
                sources.push(processor);
                numSources = sources.length;
                console.log('Connect ' + processor.getType() + ' (id ' + processor.getID() + ') to ' + that.getType() + ' (id ' + that.getID() + ')');
            },
            
            removeConnection = function(processor) {
                var n = sources.length;
                while (--n >= 0) {
                    if (processor === sources[n]) {
                        sources.splice(n, 1);
                        numSources = sources.length;
                        console.log('Disconnect ' + processor.getType() + ' (id ' + processor.getID() + ') from ' + that.getType() + ' (id ' + that.getID() + ')');
                        break;
                    }
                }
            };
       
        my = my || {};
        my.getInputData = getInputData;

        that = specs.that || {};
        that.addConnection = addConnection;
        that.removeConnection = removeConnection;
        return that;
    };
    
    ns.createMIDIConnectorIn = createMIDIConnectorIn;

})(WH);
