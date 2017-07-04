/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortBase(specs, my) {
        var that,
            
            setViewCallback = function(callback) {
                my.viewCallback = callback;
            },
            
            /**
             * Check if the MIDI port is still connected.
             * @return {Boolean} True if the MIDI port is connected.
             */
            getConnected = function() {
                return my.midiPort.state === 'connected';
            },
            
            getName = function() {
                return my.midiPort.name;
            },
                
            getID = function() {
                return my.midiPort.id;
            };
        
        my = my || {};
        my.midiPort = specs.midiPort;
        my.isNetworkEnabled = false;
        my.isSyncEnabled = false;
        my.isRemoteEnabled = false;
        my.network = specs.network;
        my.sync = specs.sync;
        my.remote = specs.remote;
        my.viewCallback;
        
        that = specs.that || {};
        
        that.setViewCallback = setViewCallback;
        that.getConnected = getConnected;
        that.getName = getName;
        that.getID = getID;
        return that;
    }

    ns.createMIDIPortBase = createMIDIPortBase;

})(WH);
