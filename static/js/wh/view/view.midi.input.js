/**
 * MIDI Input processor view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIInputView(specs, my) {
        var that,
            
            /**
             * This init function is called after the base view's initialise function,
             * so properties of on 'my' are available.
             */
            init = function() {
                my.networkEl.dataset.disabled = 'true';
            };
            
        my = my || {};
        
        that = ns.createMIDIBaseView(specs, my);
        
        init();
    
        return that;
    };

    ns.createMIDIInputView = createMIDIInputView;

})(WH);
