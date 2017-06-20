/**
 * MIDI input port.
 * 
 * Each hard- or software MIDI device's input port is represented by a MIDI input port object.
 *
 * This object lets the user select:
 * Remote: The MIDI input is available as a source for external Note and CC control.
 * Sync: The MIDI input is available as a source for sync data like start, stop and MIDI clock.
 * 
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortInput(specs, my) {
        var that,
            midiMessageCallbacks = [],
            numMidiMessageCallbacks = 0,
            
            init = function() {
                my.midiPort.onmidimessage = function(e) {
                    if (midiMessageCallbacks.length) {
                        for (var i = 0; i < numMidiMessageCallbacks; i++) {
                            midiMessageCallbacks[i](e);
                        }
                    }
                }
            },
            
            /**
             * Add a listener for MIDI messages received on this input.
             * Typically from the MIDI remote and sync objects.
             * @param {Function} callback Callback function.
             */
            addMIDIMessageListener = function(callback) {
                var exists = false;
                for (var i = 0, n = midiMessageCallbacks.length; i < n; i++) {
                    if (midiMessageCallbacks[i] === callback) {
                        exists = true;
                    }
                }
                
                if (!exists) {
                    midiMessageCallbacks.push(callback);
                    numMidiMessageCallbacks = midiMessageCallbacks.length;
                }
            },
            
            /**
             * Remove a listener for MIDI messages received on this input.
             * Typically from the MIDI remote and sync objects.
             * @param {Function} callback Callback function to remove.
             */
            removeMIDIMessageListener = function(callback) {
                for (var i = 0, n = midiMessageCallbacks.length; i < n; i++) {
                    if (midiMessageCallbacks[i] === callback) {
                        midiMessageCallbacks.splice(i, 1);
                        numMidiMessageCallbacks = midiMessageCallbacks.length;
                        break;
                    }
                }
            },
            
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
                    my.remote.removeMidiInput(that);
                } else {
                    my.remote.addMidiInput(that);
                }
                my.isRemoteEnabled = !my.isRemoteEnabled;
                my.viewCallback('remote', my.isRemoteEnabled);
            },
            
            /**
             * Restore state from data object.
             * @param {Object} data Preferences data object.
             */
            setData = function(data) {
                toggleSync(data.isSyncEnabled);
                toggleRemote(data.isRemoteEnabled);
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
        
        init();
        
        that.addMIDIMessageListener = addMIDIMessageListener;
        that.removeMIDIMessageListener = removeMIDIMessageListener;
        that.toggleSync = toggleSync;
        that.toggleRemote = toggleRemote;
        that.setData = setData;
        that.getData = getData;
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
