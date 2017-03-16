/**
 * MIDI network processor out connector.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIConnectorOut(specs, my) {
        var that,
            outputData = [],
            destinations = [],
            
            setOutputData = function(eventData) {
                outputData.push(eventData);
            },
            
            getOutputData = function() {
                return outputData;
            },
            
            /**
             * Connect this processor's output to another processor's input.
             * @param  {Object} processor Processor to connect to.
             */
            connect = function(processor) {
                var isConnected = false,
                    n = destinations.length;
                for (var i = 0; i < n; i++) {
                    if (processor === destinations[i]) {
                        isConnected = true;
                        break;
                    }
                }
                if (!isConnected) {
                    processor.addConnection(that);
                    destinations.push(processor);
                }
            },
            
            /**
             * Disconnect this processor's output from another processor's input.
             * @param  {Object} processor Processor to disconnect from, or undefined to remove all.
             */
            disconnect = function(processor) {
                var n = destinations.length;
                while (--n >= 0) {
                    if (!processor || (processor && processor === destinations[n])) {
                        destinations[n].removeConnection(that);
                        destinations.splice(n, 1);
                    }
                }
            },
            
            getDestinationsData = function(data) {
                data.destinations = [];
                var n = destinations.length;
                for (var i = 0; i < n; i++) {
                    data.destinations.push(destinations[i].getID());
                }
            };
       
        my = my || {};
        my.setOutputData = setOutputData;
        my.getDestinationsData = getDestinationsData;

        that = specs.that || {};
        
        that.getOutputData = getOutputData;
        that.connect = connect;
        that.disconnect = disconnect;
        return that;
    };
    
    ns.createMIDIConnectorOut = createMIDIConnectorOut;

})(WH);
