import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';

/**
 * Processor setting overlay for assinging MIDI control to the parameter.
 */
export default function createRemoteSettingView(el, processorId, key, isMidiControllable) {
	let learnClickLayer,
		
		init = function() {
			if (isMidiControllable) {
				const template = document.querySelector('#template-setting-learnmode');
				const clone = template.content.cloneNode(true);
				learnClickLayer = clone.firstElementChild;
				changeRemoteState();
			}
		},
		
		/**
		 * State of the parameter in the assignment process changed,
		 * the element will show this visually.
		 * @param {String} state New state of the parameter.
		 */
		changeRemoteState = function() {
			const { assignments, learnModeActive, learnTargetParameterKey, learnTargetProcessorId, } = getState();
			if (isMidiControllable) {
				if (learnModeActive) {
					showRemoteState('enter');

					// search for assignment
					let assignment;
					assignments.allIds.forEach(assignId => {
						const assign = assignments.byId[assignId];
						if (assign.processorId === processorId && assign.paramKey === key) {
							assignment = assign;
						}
					});

					if (assignment) {
						showRemoteState('assigned');
					} else {
						showRemoteState('unassigned');
					}
					if (learnTargetProcessorId === processorId && learnTargetParameterKey === key) {
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
					el.appendChild(learnClickLayer);
					learnClickLayer.addEventListener('click', onLearnLayerClick);
					break;
				case 'exit':
					if (el.contains(learnClickLayer)) {
						el.removeChild(learnClickLayer);
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
			dispatch(getActions().toggleMIDILearnTarget(processorId, key));
		};
	
	init();
	
	return changeRemoteState;
}
