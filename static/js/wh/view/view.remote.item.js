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
            unregisterCallback = specs.unregisterCallback,
            el,
            
            initialize = function() {
                // create the DOM element.
                var template = document.getElementById('template-remote-item');
                el = template.firstElementChild.cloneNode(true);
                el.querySelector('.remote__item-label').innerHTML = param.getProperty('label');
                el.querySelector('.remote__item-channel').innerHTML = param.getRemoteProperty('channel');
                el.querySelector('.remote__item-cc').innerHTML = param.getRemoteProperty('controller');
                parentEl.appendChild(el);
                
                el.querySelector('.remote__item-remove').addEventListener('click', onUnregisterClick);
            },
            
            /**
             * Called before this view is deleted.
             */
            terminate = function() {
                el.querySelector('.remote__item-remove').removeEventListener('click', onUnregisterClick);
                parentEl.removeChild(el);
                param = null;
                parentEl = null;
            },
            
            hasParameter = function(parameter) {
                return parameter === param;
            },
            
            onUnregisterClick = function(e) {
                unregisterCallback(param);
            };
            
            that = specs.that || {};
            
            initialize();
            
            that.terminate = terminate;
            that.hasParameter = hasParameter;
            return that;
        }

        ns.createRemoteItemView = createRemoteItemView;

    })(WH);
            
