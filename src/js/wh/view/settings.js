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
        settingViews = [],
        el,
        
        initialize = function() {
            // const htmlString = require(`html-loader!../processors/${data.type}/settings.html`);
            el = document.createElement('div');
            el.innerHTML = specs.template;
            
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
        
        getID = function() {
            return data.id;
        };
    
    that = data.that || {};
    
    initialize();
    
    that.terminate = terminate;
    that.getID = getID;
    return that;
}
