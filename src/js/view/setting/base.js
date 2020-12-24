import { STATE_CHANGE, } from '../../state/store.js';
import createRemoteSettingView from './remote.js';

/**
 * Processor setting view for a linear integer type parameter,
 * which has a slider and a number field.
 */
export default function createBaseSettingView(specs, my) {
	let that,
		
		initialise = function() {
		
			// find template, add clone to settings panel
			let template = document.querySelector('#template-setting-' + my.data.type);
			let clone = template.content.cloneNode(true);
			my.el = clone.firstElementChild;
			specs.parentEl.appendChild(my.el);
			
			// show label
			my.el.querySelector('.setting__label').innerHTML = my.data.label;

			if (my.data.isMidiControllable) {
				my.changeRemoteState();
			}

			document.addEventListener(STATE_CHANGE, handleStateChanges);
		},
		
		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChanges);
		},

		/**
		 * Handle state changes.
		 * @param {Object} e 
		 */
		handleStateChanges = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {

				case actions.CHANGE_PARAMETER:
					if (action.processorId === my.processorId && action.paramKey === my.key) {
						my.setValue(state.processors.byId[my.processorId].params.byId[my.key].value);
					}
					break;

				case actions.LOAD_SNAPSHOT:
					my.setValue(state.processors.byId[my.processorId].params.byId[my.key].value);
					break;
			
				case actions.RECREATE_PARAMETER:
					if (action.processorId === my.processorId && action.paramKey === my.key) {
						my.data = state.processors.byId[my.processorId].params.byId[my.key];
						my.initData();
						my.setValue(state.processors.byId[my.processorId].params.byId[my.key].value);
					}
					break;
				
				case actions.DELETE_PROCESSOR: {
					const { processors } = state;
					if (!processors.allIds.includes(my.processorId)) {
						terminate();
					}
					break;
				}
				
				case actions.TOGGLE_MIDI_LEARN_MODE:
				case actions.TOGGLE_MIDI_LEARN_TARGET:
				case actions.SELECT_PROCESSOR:
				// case actions.DELETE_PROCESSOR:
				case actions.ASSIGN_EXTERNAL_CONTROL:
				case actions.UNASSIGN_EXTERNAL_CONTROL:
					if (my.data.isMidiControllable) {
						my.changeRemoteState(state);
					}
					break;
			}
		};


	my = my || {};
	my.key = specs.key;
	my.data = specs.data;
	my.processorId = specs.processorId;
	my.el;
	
	that = that || {};
	if (my.data.isMidiControllable) {
		that = createRemoteSettingView(specs, my);
	}
	
	initialise();

	return that;
}
