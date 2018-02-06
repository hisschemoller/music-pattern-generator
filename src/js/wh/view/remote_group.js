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
        itemViews = [],
        
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
                            setName(getProcessorByID(my.processorID).params['name'].value);
                        }
                        break;
                }
            });
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            var n = itemViews.length;
            while (--n >= 0) {
                itemViews[n].terminate();
            }
            parentEl.removeChild(el);
            // nameParam.removeChangedCallback(setName);
            itemViews = null;
            parentEl = null;
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
