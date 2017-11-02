/**
 * MIDI output port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortOutput(specs, my) {
        var that,
            networkOutputProcessor,
            
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
                        toggleNetwork(false);
                        my.viewCallback('connected', false);
                        break;
                }
            },

            /**
             * Create a MIDI output processor in the network,
             * or delete it from the network.
             *
             * Toggle this MIDI port as output for the network.
             * When toggled off, disable the processor if it has any processors 
             * connected to it, or delete it if it hasn't any.
             * When toggled on, enable the processor if it is disabled, or 
             * create a new processor if it doesn't exist.
             * @param {Boolean} isEnabled (Optional) state to switch to.
             */
            toggleNetwork = function(isEnabled) {
                // handle the optional isEnabled argument
                if (isEnabled === true || isEnabled === false) {
                    if (isEnabled === my.isNetworkEnabled) {
                        return;
                    } 
                }
                
                if (my.isNetworkEnabled) {
                    if (networkOutputProcessor) {
                        if (networkOutputProcessor.hasInputConnections()) {
                            networkOutputProcessor.setEnabled(false);
                        } else {
                            my.network.deleteProcessor(networkOutputProcessor);
                            networkOutputProcessor = null;
                        }
                    }
                    my.isNetworkEnabled = false;
                } else {
                    if (networkOutputProcessor) {
                        networkOutputProcessor.setEnabled(true);
                    } else {
                        networkOutputProcessor = my.network.createProcessor({
                            type: 'output',
                            midiOutput: my.midiPort
                        });
                    }
                    my.isNetworkEnabled = true;
                }
                
                my.wasNetworkEnabled = my.isNetworkEnabled;
                my.viewCallback('network', my.isNetworkEnabled);
            },
            
            /**
             * Restore state from data object.
             * @param {Object} data Project MIDI data object.
             */
            setData = function(data = {}) {
                toggleNetwork(data.isNetworkEnabled || false);
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
