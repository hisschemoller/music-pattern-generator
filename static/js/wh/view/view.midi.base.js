/**
 * MIDI input or output port processor view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIBaseView(specs, my) {
        var that,
            parentEl = specs.parentEl,
            
            initialize = function() {
                // find template, add clone to midi ports list
                let template = document.querySelector('#template-midi-port');
                let clone = template.content.cloneNode(true);
                my.el = clone.firstElementChild;
                parentEl.appendChild(my.el);
                
                // show label
                my.el.querySelector('.midi-port__label').innerHTML = specs.name;
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                if (my.el && parentEl) {
                    parentEl.removeChild(my.el);
                }
            };
            
        my = my || {};
        my.el;
        
        that = that || {};
        
        initialize();
        
        that.terminate = terminate;
        return that;
    };

    ns.createMIDIBaseView = createMIDIBaseView;

})(WH);
