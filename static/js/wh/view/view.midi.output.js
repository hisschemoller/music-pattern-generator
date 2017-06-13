/**
 * MIDI Output processor view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIOutputView(specs, my) {
        var that,
            
            /**
             * This init function is called after the base view's initialise function,
             * so properties of on 'my' are available.
             */
            init = function() {
                my.syncEl.dataset.disabled = 'true';
                my.remoteEl.dataset.disabled = 'true';
            };
            
        my = my || {};
        
        that = ns.createMIDIBaseView(specs, my);
        
        init();
    
        return that;
    };

    ns.createMIDIOutputView = createMIDIOutputView;

})(WH);
