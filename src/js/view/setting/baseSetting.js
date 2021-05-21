import { STATE_CHANGE, } from '../../state/store.js';
import createRemoteSettingView from './remoteSetting.js';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createBaseSettingView(parentEl, processorId, key, paramData, initData, setValue) {
	
	let el;
	let changeRemoteState;
		
	const initialise = function() {
		
			// find template, add clone to settings panel
			const template = document.querySelector('#template-setting-' + paramData.type);
			const clone = template.content.cloneNode(true);
			el = clone.firstElementChild;
			parentEl.appendChild(el);
			
			// show label
			el.querySelector('.setting__label').innerHTML = paramData.label;

			document.addEventListener(STATE_CHANGE, handleStateChanges);
		},
		
		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChanges);
		},

		/**
		 * Handle state changes.
		 * @param {Object} e  Custom event.
		 */
		handleStateChanges = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {

				case actions.CHANGE_PARAMETER:
					if (action.processorId === processorId && action.paramKey === key) {
						setValue(state.processors.byId[processorId].params.byId[key].value);
					}
					break;

				case actions.LOAD_SNAPSHOT:
					setValue(state.processors.byId[processorId].params.byId[key].value);
					break;
			
				case actions.RECREATE_PARAMETER:
					if (action.processorId === processorId && action.paramKey === key) {
						paramData = state.processors.byId[processorId].params.byId[key];
						initData(paramData);
						setValue(state.processors.byId[processorId].params.byId[key].value);
					}
					break;
				
				case actions.DELETE_PROCESSOR: {
					const { processors } = state;
					if (!processors.allIds.includes(processorId)) {
						terminate();
					}
					break;
				}
				
				case actions.TOGGLE_MIDI_LEARN_MODE:
				case actions.TOGGLE_MIDI_LEARN_TARGET:
				case actions.SELECT_PROCESSOR:
				case actions.ASSIGN_EXTERNAL_CONTROL:
				case actions.UNASSIGN_EXTERNAL_CONTROL:
					if (paramData.isMidiControllable) {
						changeRemoteState(state);
					}
					break;
			}
		};
	
	initialise();
	
	if (paramData.isMidiControllable) {
		changeRemoteState = createRemoteSettingView(el, processorId, key, paramData.isMidiControllable);
	}

	return { el, terminate, };
}
