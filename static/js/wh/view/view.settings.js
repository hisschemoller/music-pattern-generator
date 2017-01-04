/**
 * Processor settings view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createSettingsView(specs, my) {
        var that,
            processor = specs.processor,
            el,
            
            init = function() {
                var params = processor.getParameters(),
                    template = document.getElementById('template-settings-' + specs.type);
                
                if (template) {
                    el = template.firstElementChild.cloneNode(true);
                    var parentEl = document.getElementById('settings');
                    parentEl.innerHTML = '';
                    parentEl.appendChild(el);
                }
                
                for (var key in params) {
                    console.log(key, params[key]);
                }
            };
        
        that = specs.that || {};
        
        init();
        
        return that;
    };

    ns.createSettingsView = createSettingsView;

})(WH);
