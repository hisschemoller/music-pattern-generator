/**
 * Processor settings view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createSettingsView(specs, my) {
        var that,
            processor = specs.processor,
            parentEl = specs.parentEl,
            settingViews = [],
            el,
            
            initialize = function() {
                var params = processor.getParameters(),
                    template = document.querySelector('#template-settings-' + processor.getType());
                
                if (typeof processor.addSelectCallback === 'function') {
                    processor.addSelectCallback(show);
                }
                
                // create the settings panel
                if (template) {
                    el = document.importNode(template.content, true);
                }
                
                // loop through all processor parameters and add setting view if required
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        // only create setting if there's a container element for it in the settings panel
                        var settingContainerEl = el.querySelector('.' + key);
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
                if (el && parentEl) {
                    parentEl.removeChild(parentEl.children[0]);
                }
            },
            
            /**
             * Show settings if the processor is selected, else remove.
             * @param {Boolean} isSelected True if selected.
             */
            show = function(isSelected) {
                if (isSelected) {
                    parentEl.appendChild(el);
                } else {
                    parentEl.removeChild(parentEl.children[0]);
                }
            },
            
            /**
             * Check if this view is for a certain processor.
             * @param  {Object} proc MIDI processor object.
             * @return {Boolean} True if the processors match.
             */
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
