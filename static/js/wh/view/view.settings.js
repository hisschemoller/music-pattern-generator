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
                    if (params.hasOwnProperty(key)) {
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
                                    settingView = ns.createIntegerSettingView(settingViewSpecs);
                                    break;
                                case 'boolean':
                                    settingView = ns.createBooleanSettingView(settingViewSpecs);
                                    break;
                                case 'itemized':
                                    settingView = ns.createItemizedSettingView(settingViewSpecs);
                                    break;
                                case 'string':
                                    settingView = ns.createStringSettingView(settingViewSpecs);
                                    break;
                            }
                            // add view to list for future reference
                            settingViews.push(settingView);
                        }
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
             * Called before this view is deleted.
             */
            terminate = function() {
                if (el && el.parentNode) {
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
            
            /**
             * Check if this view is for a certain processor.
             * @param  {Object} proc MIDI processor object.
             * @return {Boolean} True if the processors match.
             */
            hasProcessor = function(proc) {
                return proc === processor;
            },
            
            toggleLearnMode = function(isLearnMode, addParamCallback) {
                var n = settingViews.length;
                while (--n >= 0) {
                    settingViews[n].toggleLearnMode(isLearnMode, addParamCallback);
                }
            };;
        
        that = specs.that || {};
        
        initialize();
        
        that.terminate = terminate;
        that.hasProcessor = hasProcessor;
        that.toggleLearnMode = toggleLearnMode;
        return that;
    };

    ns.createSettingsView = createSettingsView;

})(WH);
