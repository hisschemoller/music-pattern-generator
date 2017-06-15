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
             */
            toggleSync = function() {
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
             */
            toggleRemote = function() {
                if (my.isRemoteEnabled) {
                    my.remote.removeMidiInput(my.midiPort);
                } else {
                    my.remote.addMidiInput(my.midiPort);
                }
                my.isRemoteEnabled = !my.isRemoteEnabled;
                my.viewCallback('remote', my.isRemoteEnabled);
            },
            };
        
        my = my || {};
        
        that = ns.createMIDIPortBase(specs, my);
        
        that.toggleSync = toggleSync;
        that.toggleRemote = toggleRemote;
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
