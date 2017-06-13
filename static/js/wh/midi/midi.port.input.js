/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortInput(specs, my) {
        var that,
            isSyncEnabled = false,
            isRemoteEnabled = false,
            
            /**
             * Make input available as sync source.
             */
            toggleSync = function() {
                if (isSyncEnabled) {
                    my.sync.removeMidiInput(my.midiPort);
                } else {
                    my.sync.addMidiInput(my.midiPort);
                }
                isSyncEnabled = !isSyncEnabled;
                my.viewCallback('sync', isSyncEnabled);
            },
            
            /**
             * Make input available as remote control source.
             */
            toggleRemote = function() {
                if (isRemoteEnabled) {
                    my.remote.removeMidiInput(my.midiPort);
                } else {
                    my.remote.addMidiInput(my.midiPort);
                }
                isRemoteEnabled = !isRemoteEnabled;
                my.viewCallback('remote', isRemoteEnabled);
            };
        
        my = my || {};
        
        that = ns.createMIDIPortBase(specs, my);
        
        that.toggleSync = toggleSync;
        that.toggleRemote = toggleRemote;
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
