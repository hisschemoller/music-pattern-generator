import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';

/**
 * Processor setting overlay for assinging MIDI control to the parameter.
 */
export default function createRemoteSettingView(specs, my) {
	let that,
		learnClickLayer,
		
		init = function() {
			if (my.data.isMidiControllable) {
				const template = document.querySelector('#template-setting-learnmode');
				const clone = template.content.cloneNode(true);
				learnClickLayer = clone.firstElementChild;
			}
		},
		
		/**
		 * State of the parameter in the assignment process changed,
		 * the element will show this visually.
		 * @param {String} state New state of the parameter.
		 */
		changeRemoteState = function() {
			const { assignments, learnModeActive, learnTargetParameterKey, learnTargetProcessorId, } = getState();
			if (my.data.isMidiControllable) {
				if (learnModeActive) {
					showRemoteState('enter');

					// search for assignment
					let assignment;
					assignments.allIds.forEach(assignId => {
						const assign = assignments.byId[assignId];
						if (assign.processorId === my.processorId && assign.paramKey === my.key) {
							assignment = assign;
						}
					});

					if (assignment) {
						showRemoteState('assigned');
					} else {
						showRemoteState('unassigned');
					}
					if (learnTargetProcessorId === my.processorId && learnTargetParameterKey === my.key) {
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
			dispatch(getActions().toggleMIDILearnTarget(my.processorId, my.key));
		};
	
	my = my || {};
	my.changeRemoteState = changeRemoteState;
	
	that = that || {};
	
	init();
	
	return that;
}
