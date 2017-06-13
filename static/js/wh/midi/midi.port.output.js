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
                        midiOutput: my.midiPort
                    });
                    isNetworkEnabled = true;
                }
                my.viewCallback('network', isNetworkEnabled);
            };
        
        my = my || {};
        
        that = ns.createMIDIPortBase(specs, my);
        
        that.toggleNetwork = toggleNetwork;
        return that;
    }

    ns.createMIDIPortOutput = createMIDIPortOutput;

})(WH);
