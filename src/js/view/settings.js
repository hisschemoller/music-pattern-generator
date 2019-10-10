import createBooleanSettingView from './setting/boolean.js';
import createIntegerSettingView from './setting/integer.js';
import createItemizedSettingView from './setting/itemized.js';
import createStringSettingView from './setting/string.js';

/**
 * Processor settings view.
 */
export default function createSettingsPanel(specs, my) {
  const { data, parentEl, } = specs;
  const { id, params, } = data;

  let el,
      
    initialize = function() {
      let settingView;
      
      // const htmlString = require(`html-loader!../processors/${data.type}/settings.html`);
      el = document.createElement('div');
      el.innerHTML = specs.template;
      
      // loop through all processor parameters and add setting view if required
      params.allIds.forEach(paramId => {
        // only create setting if there's a container el for it in the settings panel
        var settingContainerEl = el.querySelector('.' + paramId);
        if (settingContainerEl) {
          let paramData = params.byId[paramId],
            settingViewSpecs = {
              key: paramId,
              data: paramData,
              parentEl: settingContainerEl,
              processorID: id
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
          store.dispatch(store.getActions().deleteProcessor(id));
        });
      }

      show(specs.isSelected);
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
      } else if (parentEl.contains(el)) {
        parentEl.removeChild(el);
      }
    },
        
    /**
     * Show or hide settings depending on ID.
     * @param {String} id ID of the selected processor.
     */
    select = function(_id) {
      show(_id ===   id);
    },
        
    getID = function() {
      return id;
    };

  initialize();
  
  return Object.freeze({
    getID,
    select,
    terminate,
  });
}
