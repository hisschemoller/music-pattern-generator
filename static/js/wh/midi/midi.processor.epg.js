/**
 * MIDI processor o generate Euclidean rhythm patterns.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorEPG(specs, my) {
        var that;
       
        my = my || {};
        my.props = my.props || {};
        my.props.position3d = specs.position3d || null;

        that = ns.createMIDIProcessorBase(specs, my);
        
        return that;
    };
    
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors['epg'] = {
        create: createMIDIProcessorEPG
    };

})(WH);
