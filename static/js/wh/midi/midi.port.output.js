/**
 * MIDI output port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortOutput(specs, my) {
        var that,
            isNetworkEnabled = false,
            networkProcessorID,
            
            init = function() {
                
            },
            
            /**
             * Toggle a MIDI output processor in the network.
             */
            toggleNetwork = function() {
                if (isNetworkEnabled) {
                    if (networkProcessorID) {
                        my.network.deleteProcessor(networkProcessorID);
                        networkProcessorID = null;
                        isNetworkEnabled = false;
                    }
                } else {
                    networkProcessorID = my.network.createProcessor({
                        type: 'output',
                        midiOutput: my.midiPort.value
                    });
                    isNetworkEnabled = true;
                }
            };
        
        my = my || {};
        
        that = ns.createMIDIPortBase(specs, my);
        
        init();
        
        that.toggleNetwork = toggleNetwork;
        return that;
    }

    ns.createMIDIPortOutput = createMIDIPortOutput;

})(WH);
