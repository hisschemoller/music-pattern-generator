/**
 * MIDI Input processor view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createMIDIBaseView(specs, my) {
        var that,
            
            init = function() {
                // find template, add clone to midi ports list
                var template = document.getElementById('template-midi-' + my.processor.getType());
                my.el = template.firstElementChild.cloneNode(true);
                specs.parentEl.appendChild(my.el);
                
                // show label
                my.el.querySelector('.midi-port__label').innerHTML = my.processor.getPort().name;
            };
            
        my = my || {};
        my.processor = specs.processor;
        my.el;
        
        that = that || {};
        
        init();
    
        return that;
    };

    ns.createMIDIBaseView = createMIDIBaseView;

})(WH);
