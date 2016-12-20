/**
 * Base functionality for all MIDI processors.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIProcessorBase(specs, my) {
        var that;
       
        my = my || {};

        that = specs.that || {};
        
        return that;
    };
    
    ns.createMIDIProcessorBase = createMIDIProcessorBase;

})(WH);
