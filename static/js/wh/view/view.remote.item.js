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
            parentEl = specs.parentEl,
            portName = specs.portName,
            channel = specs.channel,
            cc = specs.cc,
            el,
            
            initialize = function() {
                // create the DOM element.
                var template = document.getElementById('template-remote-item');
                el = template.firstElementChild.cloneNode(true);
                el.querySelector('.remote__item-label').innerHTML = param.getProperty('label');
                el.querySelector('.remote__item-channel').innerHTML = channel;
                el.querySelector('.remote__item-cc').innerHTML = cc;
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
            
