/**
 * Processor setting overlay for assinging MIDI control to the parameter.
 */
export default function createRemoteSettingView(specs, my) {
    var that,
        learnClickLayer,
        learnCallback,
        
        init = function() {
            if (my.data.isMidiControllable) {
                
                // set callback on parameter
                // my.param.addRemoteStateCallback(changeRemoteState);
                
                let template = document.querySelector('#template-setting-learnmode');
                let clone = template.content.cloneNode(true);
                learnClickLayer = clone.firstElementChild;
            }
        },
        
        /**
         * State of the parameter in the assignment process changed,
         * the element will show this visually.
         * @param {String} state New state of the parameter.
         * @param {Function} callback In learn mode, the function to call on click.
         */
        changeRemoteState = function(state, callback) {
            switch (state) {
                case 'enter':
                    my.el.appendChild(learnClickLayer);
                    learnCallback = callback;
                    learnClickLayer.addEventListener('click', onLearnLayerClick);
                    break;
                case 'exit':
                    if (my.el.contains(learnClickLayer)) {
                        my.el.removeChild(learnClickLayer);
                        learnCallback = null;
                        learnClickLayer.removeEventListener('click', onLearnLayerClick);
                    }
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
            // learnCallback(my.data);
            my.store.dispatch(my.store.getActions().toggleMIDILearnTarget(my.processorID, my.key));
        };
    
    my = my || {};
    my.changeRemoteState = changeRemoteState;
    
    that = that || {};
    
    init();
    
    return that;
}
