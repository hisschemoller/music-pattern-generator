/**
 * MIDI input port.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortInput(specs, my) {
        var that;
        
        that = ns.createMIDIPortBase(specs, my);
        
        return that;
    }

    ns.createMIDIPortInput = createMIDIPortInput;

})(WH);
