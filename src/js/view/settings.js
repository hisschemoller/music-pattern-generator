import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import createBooleanSettingView from './setting/boolean.js';
import createIntegerSettingView from './setting/integer.js';
import createItemizedSettingView from './setting/itemized.js';
import createStringSettingView from './setting/string.js';

/**
 * Processor settings view.
 */
export default function createSettingsPanel(specs) {
  const { data, parentEl, template, } = specs;
  const { id, params, } = data;

  let el,
      
    initialize = () => {
      let settingView;
      
      el = document.createElement('div');
      el.innerHTML = template;
      
      // loop through all processor parameters and add setting view if required
      params.allIds.forEach(paramId => {

        // only create setting if there's a container el for it in the settings panel
        const settingContainerEl = el.querySelector(`.${paramId}`);
        if (settingContainerEl) {
          let paramData = params.byId[paramId],
            settingViewSpecs = {
              key: paramId,
              data: paramData,
              parentEl: settingContainerEl,
              processorId: id,
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
      });
      
      // default delete button of the settings panel
      if (el && el.querySelector('.settings__delete')) {
        el.querySelector('.settings__delete').addEventListener('click', function(e) {
          e.preventDefault();
          dispatch(getActions().deleteProcessor(id));
        });
      }

      show(specs.isSelected);
    },
    
    /**
     * Called before this view is deleted.
     */
    terminate = () => {
      if (el && parentEl) {
        show(false);
      }
    },
        
    /**
     * Show settings if the processor is selected, else remove.
     * @param {Boolean} isSelected True if selected.
     */
    show = isSelected =>  {
      if (isSelected) {
        parentEl.appendChild(el);
      } else if (parentEl.contains(el)) {
        parentEl.removeChild(el);
      }
    },
        
    /**
     * Show or hide settings depending on ID.
     * @param {String} id ID of the selected processor.
     */
    select = (_id) => {
      show(_id === id);
    },

    getDOMElement = () => {
      return el;
    },
        
    getId = () => {
      return id;
    };

  initialize();
  
  return Object.freeze({
    getDOMElement,
    getId,
    select,
    terminate,
  });
}
