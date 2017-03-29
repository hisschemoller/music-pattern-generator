/**
 * Processor setting overlay for assinging MIDI control to the parameter.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteSettingView(specs, my) {
        var that,
            learnClickLayer,
            learnCallback,
            
            init = function() {
                if (my.param.getProperty('isMidiControllable')) {
                    
                    // set callback on parameter
                    my.param.setRemoteStateCallback(changeRemoteState);
                    
                    let template = document.querySelector('#template-setting-learnmode');
                    let clone = template.content.cloneNode(true);
                    learnClickLayer = clone.firstElementChild;
                }
            },
            
            changeRemoteState = function(state, callback) {
                switch (state) {
                    case 'enter':
                        my.el.appendChild(learnClickLayer);
                        learnCallback = callback;
                        learnClickLayer.addEventListener('click', onLearnLayerClick);
                        break;
                    case 'exit':
                        my.el.removeChild(learnClickLayer);
                        learnCallback = null;
                        learnClickLayer.removeEventListener('click', onLearnLayerClick);
                        break;
                    case 'selected':
                        learnClickLayer.dataset.selected = true;
                        break;
                    case 'deselected':
                        learnClickLayer.dataset.selected = false;
                        break;
                    case 'assigned':
                        learnClickLayer.dataset.assigned = true;
                        break;
                    case 'unassigned':
                        learnClickLayer.dataset.assigned = false;
                        break;
                    default:
                        console.log('Unknown remote state: ', state);
                        break;
                }
            },
            
            onLearnLayerClick = function(e) {
                learnCallback(my.param);
            };
        
        my = my || {};
        
        that = that || {};
        
        init();
        
        that.changeRemoteState = changeRemoteState;
        return that;
    };

    ns.createRemoteSettingView = createRemoteSettingView;

})(WH);
