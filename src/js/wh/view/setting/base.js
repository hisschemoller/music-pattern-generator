import createRemoteSettingView from './remote';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createBaseSettingView(specs, my) {
    var that,
        
        initialise = function() {
            // find template, add clone to settings panel
            let template = document.querySelector('#template-setting-' + my.data.type);
            let clone = template.content.cloneNode(true);
            my.el = clone.firstElementChild;
            specs.parentEl.appendChild(my.el);
            
            // show label
            my.el.querySelector('.setting__label').innerHTML = my.data.label;

            if (my.data.isMidiControllable) {
                my.changeRemoteState(specs.store.getState());
            }

            document.addEventListener(my.store.STATE_CHANGE, handleStateChanges);
        },
        
        terminate = function() {
            document.removeEventListener(my.store.STATE_CHANGE, handleStateChanges);
        },
        
        handleStateChanges = function(e) {
            switch (e.detail.action.type) {
                case e.detail.actions.CHANGE_PARAMETER:
                    if (e.detail.action.processorID === my.processorID && 
                        e.detail.action.paramKey === my.key) {
                        my.setValue(e.detail.state.processors.byId[my.processorID].params.byId[my.key].value);
                    }
                    break;
                
                case e.detail.actions.RECREATE_PARAMETER:
                    if (e.detail.action.processorID === my.processorID && 
                        e.detail.action.paramKey === my.key) {
                        my.data = e.detail.state.processors.byId[my.processorID].params.byId[my.key];
                        my.initData();
                    }
                    break;
                
                case e.detail.actions.TOGGLE_MIDI_LEARN_MODE:
                case e.detail.actions.TOGGLE_MIDI_LEARN_TARGET:
                case e.detail.actions.SELECT_PROCESSOR:
                case e.detail.actions.DELETE_PROCESSOR:
                case e.detail.actions.ASSIGN_EXTERNAL_CONTROL:
                case e.detail.actions.UNASSIGN_EXTERNAL_CONTROL:
                    if (my.data.isMidiControllable) {
                        my.changeRemoteState(e.detail.state);
                    }
                    break;
            }
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
    
    initialise();

    return that;
}
