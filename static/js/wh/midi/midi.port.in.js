/**
 * MIDI input port processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIPortIn(specs, my) {
        var that,
            midiInput = specs.midiInput;
       
        my = my || {};
        my.props = my.props || {};

        that = ns.createMIDIProcessorBase(specs, my);
        
        return that;
    };
    
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors['portIn'] = {
        create: createMIDIPortIn
    };

})(WH);
