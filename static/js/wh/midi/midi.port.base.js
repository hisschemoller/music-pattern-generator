/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortBase(specs, my) {
        var that,
            
            getName = function() {
                return my.midiPort.name;
            },
                
            getID = function() {
                return my.midiPort.id;
            };
        
        my = my || {};
        my.midiPort = specs.midiPort;
        
        that = specs.that || {};
        
        that.getName = getName;
        that.getID = getID;
        return that;
    }

    ns.createMIDIPortBase = createMIDIPortBase;

})(WH);
