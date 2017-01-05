/**
 * Processor settings view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createSettingsView(specs, my) {
        var that,
            processor = specs.processor,
            settingViews = [],
            el,
            
            init = function() {
                var params = processor.getParameters(),
                    template = document.getElementById('template-settings-' + specs.type);
                
                // create the settings panel
                if (template) {
                    el = template.firstElementChild.cloneNode(true);
                    var parentEl = document.getElementById('settings');
                    parentEl.innerHTML = '';
                    parentEl.appendChild(el);
                }
                
                // loop through all processor parameters and add setting view if required
                for (var key in params) {
                    // only create setting if there's a container element for it in the settings panel
                    var settingContainerEl = el.getElementsByClassName(key)[0];
                    if (settingContainerEl) {
                        var param = params[key],
                            settingView = {},
                            settingViewSpecs = {
                                that: settingView,
                                param: param,
                                containerEl: settingContainerEl
                            };
                        // create the setting view based on the parameter type
                        switch (param.getProperty('type')) {
                            case 'integer':
                                ns.createIntegerSettingView(settingViewSpecs);
                                break;
                            case 'boolean':
                                ns.createBooleanSettingView(settingViewSpecs);
                                break;
                        }
                        // add view to list for future reference
                        settingViews.push(settingView);
                    }
                }
            };
        
        that = specs.that || {};
        
        init();
        
        return that;
    };

    ns.createSettingsView = createSettingsView;

})(WH);
