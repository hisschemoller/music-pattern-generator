/**
 * Processor setting overlay for assinging MIDI control to the parameter.
 */
export default function createRemoteSettingView(specs, my) {
    var that,
        learnClickLayer,
        
        init = function() {
            if (my.data.isMidiControllable) {
                let template = document.querySelector('#template-setting-learnmode');
                let clone = template.content.cloneNode(true);
                learnClickLayer = clone.firstElementChild;
            }
        },
        
        /**
         * State of the parameter in the assignment process changed,
         * the element will show this visually.
         * @param {String} state New state of the parameter.
         */
        changeRemoteState = function(state) {
            if (my.data.isMidiControllable) {
                if (state.learnModeActive) {
                    showRemoteState('enter');

                    // search for assignment
                    let assignment;
                    state.assignments.allIds.forEach(assignID => {
                        const assign = state.assignments.byId[assignID];
                        if (assign.processorID === my.processorID && assign.paramKey === my.key) {
                            assignment = assign;
                        }
                    });

                    if (assignment) {
                        showRemoteState('assigned');
                    } else {
                        showRemoteState('unassigned');
                    }
                    if (state.learnTargetProcessorID === my.processorID && state.learnTargetParameterKey === my.key) {
                        showRemoteState('selected');
                    } else {
                        showRemoteState('deselected');
                    }
                } else {
                    showRemoteState('exit');
                }
            }
        },
        
        /**
         * State of the parameter in the assignment process changed,
         * the element will show this visually.
         * @param {String} status New state of the parameter.
         */
        showRemoteState = function(status) {
            switch (status) {
                case 'enter':
                    my.el.appendChild(learnClickLayer);
                    learnClickLayer.addEventListener('click', onLearnLayerClick);
                    break;
                case 'exit':
                    if (my.el.contains(learnClickLayer)) {
                        my.el.removeChild(learnClickLayer);
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
            my.store.dispatch(my.store.getActions().toggleMIDILearnTarget(my.processorID, my.key));
        };
    
    my = my || {};
    my.changeRemoteState = changeRemoteState;
    
    that = that || {};
    
    init();
    
    return that;
}
