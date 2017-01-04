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
                
                // create setting element from template, based on parameter type and add to settings panel
                for (var key in params) {
                    var settingContainerEl = el.getElementsByClassName(key)[0];
                    if (settingContainerEl) {
                        var param = params[key];
                        var settingTemplate = document.getElementById('template-setting-' + param.getType());
                        if (settingTemplate) {
                            var settingEl = settingTemplate.firstElementChild.cloneNode(true);
                            settingContainerEl.appendChild(settingEl);
                            
                        }
                    }
                }
            };
        
        that = specs.that || {};
        
        init();
        
        return that;
    };

    ns.createSettingsView = createSettingsView;

})(WH);
