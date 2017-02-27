/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteGroupView(specs, my) {
        var that,
            processor = specs.processor,
            parentEl = specs.parentEl,
            el,
            listEl,
            nameParam,
            itemViews = [],
            
            initialize = function() {
                // create the DOM element.
                var template = document.getElementById('template-remote-group');
                el = template.firstElementChild.cloneNode(true);
                parentEl.appendChild(el);
                
                listEl = el.querySelector('.remote__group-list');
                
                // listen for name parameter changes
                nameParam = processor.getParameters()['name'];
                if (nameParam) {
                    nameParam.addChangedCallback(setName);
                    setName(nameParam);
                }
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                parentEl.removeChild(el);
                nameParam.removeChangedCallback(setName);
                nameParam = null;
                processor = null;
            },
            
            /**
             * Check if this view is for a certain processor.
             * @param  {Object} proc MIDI processor object.
             * @return {Boolean} True if the processors match.
             */
            hasProcessor = function(proc) {
                return proc === processor;
            },
            
            hasParameter = function(param) {
                return processor.hasParameter(param);
            },
            
            addParameter = function(param, portName, channel, cc) {
                var itemView = ns.createRemoteItemView({
                    param: param,
                    parentEl: listEl,
                    portName: portName,
                    channel: channel,
                    cc: cc
                });
                itemViews.push(itemView);
            },
            
            setName = function(nameParam) {
                el.querySelector('.remote__group-header').innerHTML = nameParam.getValue();
            };
        
        that = specs.that || {};
        
        initialize();
        
        that.terminate = terminate;
        that.hasProcessor = hasProcessor;
        that.hasParameter = hasParameter;
        that.addParameter = addParameter;
        return that;
    }

    ns.createRemoteGroupView = createRemoteGroupView;

})(WH);
