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
            
            /**
             * Set output data that is the result of this processor's processing.
             * It will be collected by the processors attached to this output.
             * @param {Object} eventData MIDI event data.
             */
            setOutputData = function(eventData) {
                outputData.push(eventData);
            },
            
            /**
             * Public function for processors connected to this output to
             * collect the data this processor's process function has produced.
             * @return {Object} MIDI event data.
             */
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
            
            /**
             * The destinations are the processors this output is connected to.
             * This function collects the ID's of these processors and adds them
             * to a data object that can be stored.
             * So this project and its processor connections can be restored.
             * @param  {Object} data Project data object.
             */
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
