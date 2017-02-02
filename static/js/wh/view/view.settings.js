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
            
            initialize = function() {
                var params = processor.getParameters(),
                    template = document.getElementById('template-settings-' + specs.type);
                
                if (typeof processor.addSelectCallback === 'function') {
                    processor.addSelectCallback(show);
                }
                
                // create the settings panel
                if (template) {
                    el = template.firstElementChild.cloneNode(true);
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
                            case 'itemized':
                                ns.createItemizedSettingView(settingViewSpecs);
                                break;
                        }
                        // add view to list for future reference
                        settingViews.push(settingView);
                    }
                }
                
                // default delete button of the settings panel
                if (el) {
                    el.querySelector('.settings__delete').addEventListener('click', function(e) {
                        e.preventDefault();
                        ns.pubSub.fire('delete.processor', processor);
                    });
                }
            },
            
            /**
             * [terminate description]
             */
            terminate = function() {
                if (el) {
                    el.parentNode.removeChild(el);
                }
            },
            
            /**
             * Show settings if the processor is selected, else remove.
             * @param {Boolean} isSelected True if selected.
             */
            show = function(isSelected) {
                var parentEl = document.getElementById('settings');
                if (isSelected) {
                    parentEl.appendChild(el);
                } else {
                    parentEl.removeChild(el);
                }
            },
            
            hasProcessor = function(proc) {
                return proc === processor;
            };
        
        that = specs.that || {};
        
        initialize();
        
        that.terminate = terminate;
        that.hasProcessor = hasProcessor;
        return that;
    };

    ns.createSettingsView = createSettingsView;

})(WH);
