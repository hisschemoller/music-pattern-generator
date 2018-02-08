import { getProcessorByID } from '../state/selectors';
import createRemoteItemView from './remote_item';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(specs, my) {
    var that,
        store = specs.store,
        // processor = specs.processor,
        processorID = specs.id,
        parentEl = specs.parentEl,
        el,
        listEl,
        nameParam,
        views = [],
        
        initialize = function() {
            // create the DOM element.
            let template = document.querySelector('#template-remote-group');
            let clone = template.content.cloneNode(true);
            el = clone.firstElementChild;
            parentEl.appendChild(el);
            
            listEl = el.querySelector('.remote__group-list');
            
            // listen for name parameter changes
            // nameParam = processor.getParameters()['name'];
            // if (nameParam) {
            //     nameParam.addChangedCallback(setName);
            //     setName(nameParam);
            // }

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
                }
            });
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            var n = views.length;
            while (--n >= 0) {
                views[n].terminate();
            }
            parentEl.removeChild(el);
            // nameParam.removeChangedCallback(setName);
            views = null;
            parentEl = null;
        },

        updateViews = function(processor) {
            for (let key in processor.parameters) {
                if (processor.parameters.hasOwnProperty(key)) {
                    let param = processor.parameters[key],
                        isAssigned = param.isMidiControllable && param.remoteChannel && param.remoteCC,
                        viewExists = views.find(view => view.getKey() === key);
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
            views.push(createRemoteItemView({
                store: store,
                paramKey: key,
                param: param,
                parentEl: listEl
            }));
        },

        removeView = function(key) {
            console.log('removeView', views);  
        },
        
        /**
         * Check if this view is for a certain processor.
         * @param  {Object} proc MIDI processor object.
         * @return {Boolean} True if the processors match.
         */
        // hasProcessor = function(proc) {
        //     return proc === processor;
        // },
        
        /**
         * Check if this view's processor has a certain parameter.
         * @param  {Object} proc Parameter object.
         * @return {Boolean} True if the parameter exists for the processor.
         */
        // hasParameter = function(param) {
        //     return processor.hasParameter(param);
        // },
        
        /**
         * Add a parameter that is assigned.
         * @param  {Object} param Processor parameter.
         * @param  {Function} unregisterCallback Callback for the unassign button click.
         */
        addParameter = function(param, unregisterCallback) {
            var itemView = ns.createRemoteItemView({
                param: param,
                parentEl: listEl,
                unregisterCallback: unregisterCallback
            });
            itemViews.push(itemView);
            updateGroupVisibility();
        },
        
        /**
         * Remove a parameter that isn't assigned anymore.
         * @param  {Object} param Processor parameter.
         */
        removeParameter = function(param) {
            var n = itemViews.length;
            while (--n >= 0) {
                if (itemViews[n].hasParameter(param)) {
                    itemViews[n].terminate();
                    itemViews.splice(n, 1);
                    break;
                }
            }
            updateGroupVisibility();
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
    // that.hasProcessor = hasProcessor;
    // that.hasParameter = hasParameter;
    that.addParameter = addParameter;
    that.removeParameter = removeParameter;
    return that;
}
