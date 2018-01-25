import createBooleanSettingView from './setting/boolean';
import createIntegerSettingView from './setting/integer';
import createItemizedSettingView from './setting/itemized';
import createStringSettingView from './setting/string';

/**
 * Processor settings view.
 */
export default function createSettingsPanel(specs, my) {
    var that,
        store = specs.store,
        data = specs.data,
        parentEl = specs.parentEl,
        // midiNetwork = specs.midiNetwork,
        // processor = specs.processor,
        settingViews = [],
        el,
        
        initialize = function() {
            const htmlString = require(`html-loader!../processors/${data.type}/settings.html`);
            el = document.createElement('div');
            el.innerHTML = htmlString;
            
            // loop through all processor parameters and add setting view if required
            for (var key in data.params) {
                if (data.params.hasOwnProperty(key)) {
                    
                    // only create setting if there's a container el for it in the settings panel
                    var settingContainerEl = el.querySelector('.' + key);
                    if (settingContainerEl) {
                        let paramData = data.params[key],
                            settingView,
                            settingViewSpecs = {
                                store: store,
                                key: key,
                                data: paramData,
                                parentEl: settingContainerEl,
                                processorID: data.id
                            };
                        
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
                    store.dispatch(store.getActions().deleteProcessor(data.id));
                });
            }

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.SELECT_PROCESSOR:
                        show(e.detail.action.id === data.id);
                        break;
                }
            });

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
            //         // only create setting if there's a container el for it in the settings panel
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
            return data.id;
        };
    
    that = data.that || {};
    
    initialize();
    
    that.terminate = terminate;
    // that.hasProcessor = hasProcessor;
    that.getID = getID;
    return that;
}
