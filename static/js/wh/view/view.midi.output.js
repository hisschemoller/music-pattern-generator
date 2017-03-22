/**
 * MIDI Output processor view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIOutputView(specs, my) {
        var that,
            
            init = function() {};
            
        my = my || {};
        
        that = ns.createMIDIBaseView(specs, my);
        
        init();
    
        return that;
    };

    ns.createMIDIOutputView = createMIDIOutputView;

})(WH);
