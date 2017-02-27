/**
 * View for a parameter that's linked to a remote MIDI controller.
 * The items are grouped by processor.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteItemView(specs, my) {
        var that,
            param = specs.param,
            el,
            parentEl = specs.parentEl,
            
            initialize = function() {
                // create the DOM element.
                var template = document.getElementById('template-remote-item');
                el = template.firstElementChild.cloneNode(true);
                el.querySelector('.remote__item-label').innerHTML = param.getProperty('label');
                parentEl.appendChild(el);
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {};
            
            that = specs.that || {};
            
            initialize();
            
            return that;
        }

        ns.createRemoteItemView = createRemoteItemView;

    })(WH);
            
