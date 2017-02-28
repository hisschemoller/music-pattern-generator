/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createBaseSettingView(specs, my) {
        var that,
            
            init = function() {
                // find template, add clone to settings panel
                var template = document.getElementById('template-setting-' + my.param.getProperty('type'));
                my.el = template.firstElementChild.cloneNode(true);
                specs.containerEl.appendChild(my.el);
                
                // show label
                my.el.getElementsByClassName('setting__label-text')[0].innerHTML = my.param.getProperty('label');
            },
            
            /**
             * MIDI learn mode
             */
            
            learnClickLayer,
            learnCallback,
            
            initLearnMode = function() {
                // add learn mode layer
                if (my.param.getProperty('isMidiControllable')) {
                    var template = document.getElementById('template-setting-learnmode');
                    learnClickLayer = template.firstElementChild.cloneNode(true);
                }
            },
            
            toggleLearnMode = function(isLearnMode, callback) {
                if (my.param.getProperty('isMidiControllable')) {
                    if (isLearnMode) {
                        learnCallback = callback;
                        my.el.appendChild(learnClickLayer);
                        learnClickLayer.addEventListener('click', onLearnLayerClick);
                    } else {
                        learnCallback = null;
                        my.el.removeChild(learnClickLayer);
                        learnClickLayer.removeEventListener('click', onLearnLayerClick);
                    }
                }
            },
            
            onLearnLayerClick = function(e) {
                learnCallback(my.param);
            };
            
        my = my || {};
        my.param = specs.param;
        my.el;
        
        that = that || {};
        
        init();
        initLearnMode();
    
        that.toggleLearnMode = toggleLearnMode;
        return that;
    };

    ns.createBaseSettingView = createBaseSettingView;

})(WH);
