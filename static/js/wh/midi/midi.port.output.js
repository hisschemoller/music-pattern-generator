/**
 * MIDI output port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortOutput(specs, my) {
        var that,
            networkProcessorID,
            
            setup = function() {
                my.midiPort.onstatechange = onPortStateChange;
            },
            
            /**
             * MIDI device was connected or disconnected.
             * The first time a MIDI device is connected is handled by the midi module.
             * This handles disconnected or reconnected ports.
             * @param {Object} e MIDIConnectionEvent object.
             */
            onPortStateChange = function(e) {
                switch (e.port.state) {
                    case 'connected':
                        toggleNetwork(my.wasNetworkEnabled);
                        my.viewCallback('connected', true);
                        break;
                    case 'disconnected':
                        my.wasNetworkEnabled = my.isNetworkEnabled
                        toggleNetwork(false);
                        my.viewCallback('connected', false);
                        break;
                }
            },

            /**
             * Create a MIDI output processor in the network,
             * or delete it from the network.
             * @param {Boolean} isEnabled State to switch to.
             */
            toggleNetwork = function(isEnabled) {
                if (isEnabled === true || isEnabled === false) {
                    if (isEnabled === my.isNetworkEnabled) {
                        return;
                    } 
                }
                
                if (my.isNetworkEnabled) {
                    if (networkProcessorID) {
                        my.network.deleteProcessor(networkProcessorID);
                        networkProcessorID = null;
                        my.isNetworkEnabled = false;
                    }
                } else {
                    networkProcessorID = my.network.createProcessor({
                        type: 'output',
                        midiOutput: my.midiPort
                    });
                    my.isNetworkEnabled = true;
                    ns.EPGMode.selectMIDIOutPort(networkProcessorID, toggleNetwork);
                }
                my.viewCallback('network', my.isNetworkEnabled);
            },
            
            /**
             * Restore state from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                toggleNetwork(data.isNetworkEnabled);
            }, 
            
            /**
             * Write state to data object.
             * @return {Object} Data object.
             */
            getData = function() {
                return {
                    midiPortID: my.midiPort.id,
                    isNetworkEnabled: my.isNetworkEnabled,
                    isSyncEnabled: my.isSyncEnabled,
                    isRemoteEnabled: my.isRemoteEnabled
                };
            };
        
        my = my || {};
        
        that = ns.createMIDIPortBase(specs, my);

        that.setup = setup;
        that.toggleNetwork = toggleNetwork;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMIDIPortOutput = createMIDIPortOutput;

})(WH);
