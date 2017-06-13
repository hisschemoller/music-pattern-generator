/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortInput(specs, my) {
        var that,
            isRemoteEnabled = false,
            
            init = function() {
                
            },
            
            toggleSync = function() {
                console.log('toggleSync');
            },
            
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
        
        init();
        
        that.toggleSync = toggleSync;
        that.toggleRemote = toggleRemote;
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
