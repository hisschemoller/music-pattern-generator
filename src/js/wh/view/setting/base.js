import createRemoteSettingView from './remote';
import { getProcessorByID } from '../../state/selectors';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createBaseSettingView(specs, my) {
    var that,
        
        init = function() {
            // find template, add clone to settings panel
            let template = document.querySelector('#template-setting-' + my.data.type);
            let clone = template.content.cloneNode(true);
            my.el = clone.firstElementChild;
            specs.parentEl.appendChild(my.el);
            
            // show label
            my.el.querySelector('.setting__label-text').innerHTML = my.data.label;

            document.addEventListener(my.store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CHANGE_PARAMETER:
                        if (e.detail.action.processorID === my.processorID && 
                            e.detail.action.paramKey === my.key) {
                            my.setValue(getProcessorByID(my.processorID).params[my.key].value);
                        }
                        break;
                }
            });
        };
        
    my = my || {};
    my.store = specs.store;
    my.key = specs.key;
    my.data = specs.data;
    my.processorID = specs.processorID;
    my.el;
    
    that = that || {};
    if (my.data.isMidiControllable) {
        that = createRemoteSettingView(specs, my);
    }
    
    init();

    return that;
}
