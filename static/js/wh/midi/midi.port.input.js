/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortInput(specs, my) {
        var that,
            
            /**
             * Make input available as sync source.
             * @param {Boolean} isEnabled State to switch to.
             */
            toggleSync = function(isEnabled) {
                if (isEnabled === true || isEnabled === false) {
                    if (isEnabled === my.isNetworkEnabled) {
                        return;
                    } 
                }
                
                if (my.isSyncEnabled) {
                    my.sync.removeMidiInput(my.midiPort);
                } else {
                    my.sync.addMidiInput(my.midiPort);
                }
                my.isSyncEnabled = !my.isSyncEnabled;
                my.viewCallback('sync', my.isSyncEnabled);
            },
            
            /**
             * Make input available as remote control source.
             * @param {Boolean} isEnabled State to switch to.
             */
            toggleRemote = function(isEnabled) {
                if (isEnabled === true || isEnabled === false) {
                    if (isEnabled === my.isNetworkEnabled) {
                        return;
                    } 
                }
                
                if (my.isRemoteEnabled) {
                    my.remote.removeMidiInput(my.midiPort);
                } else {
                    my.remote.addMidiInput(my.midiPort);
                }
                my.isRemoteEnabled = !my.isRemoteEnabled;
                my.viewCallback('remote', my.isRemoteEnabled);
            },
            
            /**
             * Restore state from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                my.isSyncEnabled = data.isSyncEnabled;
                my.viewCallback('sync', my.isSyncEnabled);
                my.isRemoteEnabled = data.isRemoteEnabled;
                my.viewCallback('remote', my.isRemoteEnabled);
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
        
        that.toggleSync = toggleSync;
        that.toggleRemote = toggleRemote;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
