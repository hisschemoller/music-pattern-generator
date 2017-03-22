/**
 * MIDI Input processor view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIInputView(specs, my) {
        var that,
            
            init = function() {};
            
        my = my || {};
        
        that = ns.createMIDIBaseView(specs, my);
        
        init();
    
        return that;
    };

    ns.createMIDIInputView = createMIDIInputView;

})(WH);
