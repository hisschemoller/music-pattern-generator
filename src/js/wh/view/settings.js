import createBooleanSettingView from './setting/boolean';
import createIntegerSettingView from './setting/integer';
import createItemizedSettingView from './setting/itemized';
import createStringSettingView from './setting/string';

/**
 * Processor settings view.
 */
export default function createSettingsPanel(specs, my) {
    var that,
        // midiNetwork = specs.midiNetwork,
        // processor = specs.processor,
        settingViews = [],
        el,
        
        initialize = function() {
            const htmlString = require(`html-loader!../processors/${specs.type}/settings.html`);
            const element = document.createElement('div');
            element.innerHTML = htmlString;
            console.log(specs);
            // loop through all processor parameters and add setting view if required
            for (var key in specs.params) {
                if (specs.params.hasOwnProperty(key)) {
                    console.log(key);
                    // only create setting if there's a container element for it in the settings panel
                    var settingContainerEl = element.querySelector('.' + key);
                    if (settingContainerEl) {
                        let paramData = specs.params[key],
                            settingView = {},
                            settingViewSpecs = {
                                key: key,
                                data: paramData,
                                parentEl: settingContainerEl
                            };
                        console.log(paramData.type);
                        // create the setting view based on the parameter type
                        switch (paramData.type) {
                            case 'integer':
                                settingView = createIntegerSettingView(settingViewSpecs);
                                break;
                            case 'boolean':
                                settingView = createBooleanSettingView(settingViewSpecs);
                                break;
                            case 'itemized':
                                settingView = createItemizedSettingView(settingViewSpecs);
                                break;
                            case 'string':
                                settingView = createStringSettingView(settingViewSpecs);
                                break;
                        }
                    }
                }
            }
            
            // default delete button of the settings panel
            if (el) {
                el.querySelector('.settings__delete').addEventListener('click', function(e) {
                    e.preventDefault();
                    // midiNetwork.deleteProcessor(processor);
                });
            }

            console.log(specs.id);
            console.log(el);

            return;


            // const params = processor.getParameters();
            // let template = document.querySelector('#template-settings-' + processor.getType());
            // let clone = template.content.cloneNode(true);
            // el = clone.firstElementChild;
            
            // if (typeof processor.addSelectCallback === 'function') {
            //     processor.addSelectCallback(show);
            // }
            
            // // loop through all processor parameters and add setting view if required
            // for (var key in params) {
            //     if (params.hasOwnProperty(key)) {
            //         // only create setting if there's a container element for it in the settings panel
            //         var settingContainerEl = el.querySelector('.' + key);
            //         if (settingContainerEl) {
            //             var param = params[key],
            //                 settingView = {},
            //                 settingViewSpecs = {
            //                     that: settingView,
            //                     param: param,
            //                     containerEl: settingContainerEl
            //                 };
            //             // create the setting view based on the parameter type
            //             switch (param.getProperty('type')) {
            //                 case 'integer':
            //                     settingView = ns.createIntegerSettingView(settingViewSpecs);
            //                     break;
            //                 case 'boolean':
            //                     settingView = ns.createBooleanSettingView(settingViewSpecs);
            //                     break;
            //                 case 'itemized':
            //                     settingView = ns.createItemizedSettingView(settingViewSpecs);
            //                     break;
            //                 case 'string':
            //                     settingView = ns.createStringSettingView(settingViewSpecs);
            //                     break;
            //             }
            //             // add view to list for future reference
            //             settingViews.push(settingView);
            //         }
            //     }
            // }
            
            // // default delete button of the settings panel
            // if (el) {
            //     el.querySelector('.settings__delete').addEventListener('click', function(e) {
            //         e.preventDefault();
            //         midiNetwork.deleteProcessor(processor);
            //     });
            // }
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            if (el && parentEl) {
                show(false);
            }
        },
        
        /**
         * Show settings if the processor is selected, else remove.
         * @param {Boolean} isSelected True if selected.
         */
        show = function(isSelected)  {
            if (isSelected) {
                parentEl.appendChild(el);
            } else if (el.parentNode === parentEl) {
                parentEl.removeChild(el);
            }
        },
        
        /**
         * Check if this view is for a certain processor.
         * @param  {Object} proc MIDI processor object.
         * @return {Boolean} True if the processors match.
         */
        // hasProcessor = function(proc) {
        //     return proc === processor;
        // },
        
        getID = function() {
            return specs.id;
        };
    
    that = specs.that || {};
    
    initialize();
    
    that.terminate = terminate;
    // that.hasProcessor = hasProcessor;
    that.getID = getID;
    return that;
}
