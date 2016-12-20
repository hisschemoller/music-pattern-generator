/**
 * MIDI processor o generate Euclidean rhythm patterns.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorEPG(specs, my) {
        var that;
       
        my = my || {};

        that = specs.that || {};
        
        return that;
    };
    
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors['epg'] = {
        create: createMIDIProcessorEPG
    };

})(WH);
