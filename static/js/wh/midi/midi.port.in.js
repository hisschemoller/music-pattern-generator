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
        my.props.type = type;

        that = ns.createMIDIProcessorBase(specs, my);
        
        return that;
    };
    
    var type = 'input';
    ns.midiProcessors = ns.midiProcessors || {};
    ns.midiProcessors[type] = {
        create: createMIDIPortIn
    };

})(WH);
