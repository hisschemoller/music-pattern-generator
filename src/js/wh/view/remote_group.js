import { getProcessorByID } from '../state/selectors';
import createRemoteItemView from './remote_item';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(specs, my) {
    var that,
        store = specs.store,
        processorID = specs.id,
        parentEl = specs.parentEl,
        el,
        listEl,
        nameParam,
        views = {},
        
        initialize = function() {
            // create the DOM element.
            let template = document.querySelector('#template-remote-group');
            let clone = template.content.cloneNode(true);
            el = clone.firstElementChild;
            parentEl.appendChild(el);
            
            listEl = el.querySelector('.remote__group-list');

            setName(specs.name);

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CHANGE_PARAMETER:
                        if (e.detail.action.processorID === processorID && 
                            e.detail.action.paramKey === 'name') {
                            setName(getProcessorByID(processorID).params['name'].value);
                        }
                        break;
                    
                    case e.detail.actions.ASSIGN_EXTERNAL_CONTROL:
                        if (e.detail.state.learnTargetProcessorID === processorID) {
                            updateViews(e.detail.state.processors.find(processor => processor.id === processorID));
                        }
                        break;
                    
                    case e.detail.actions.UNASSIGN_EXTERNAL_CONTROL:
                        if (e.detail.action.processorID === processorID) {
                            updateViews(e.detail.state.processors.find(processor => processor.id === processorID));
                        }
                        break;
                }
            });
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            Object.values(views).forEach(view => { view.terminate() });
            parentEl.removeChild(el);
            views = null;
            parentEl = null;
        },

        updateViews = function(processor) {
            for (let key in processor.parameters) {
                if (processor.parameters.hasOwnProperty(key)) {
                    let param = processor.parameters[key],
                        isAssigned = param.isMidiControllable && param.remoteChannel && param.remoteCC,
                        viewExists = views[key];
                    if (isAssigned && !viewExists) {
                        addView(key, param);
                    } else if (!isAssigned && viewExists) {
                        removeView(key);
                    }
                }
            }
            el.dataset.hasAssignments = (views.length > 0);
        },

        addView = function(key, param) {
            views[key] = createRemoteItemView({
                store: store,
                paramKey: key,
                param: param,
                processorID: processorID,
                parentEl: listEl
            });
        },

        removeView = function(key) {
            views[key].terminate();
            delete views[key];
        },
        
        /**
         * If a group has no assignments its header is hidden.
         */
        updateGroupVisibility = function() {
            el.dataset.hasAssignments = (itemViews.length > 0);
        },
        
        /**
         * Set the group's header to the processor's name.
         * @param {String} name Processor's name.
         */
        setName = function(name) {
            el.querySelector('.remote__group-header-label').innerHTML = name;
        };
    
    that = specs.that || {};
    
    initialize();
    
    that.terminate = terminate;
    return that;
}
