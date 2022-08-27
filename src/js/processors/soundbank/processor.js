import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';
import { loadSoundBankFiles, playSound, resumeAudio, setupAudio } from './utils.js';

/**
 * Sample player processor.
 */
export function createProcessor(data) {
	let params = {};
	
	const {
		getId,
		getType,
		id,
		// input connector
		addConnection,
		getInputData,
		removeConnection,
	} = createMIDIProcessorBase(data);
	
	const initialize = function() {
			const state = getState();
			const { processors } = state;
			document.addEventListener(STATE_CHANGE, handleStateChange);
			setupAudio(processors.byId[id].banks);
			updateAllParams(processors.byId[id].params.byId);
			updateBankParameter(state);
		},

		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChange);
		},

		/**
		 * Handle state changes.
		 * @param {Object} e Custom event.
		 */
		handleStateChange = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {
				case actions.CHANGE_PARAMETER:
					if (action.processorId === id) {
						updateAllParams(state.processors.byId[id].params.byId);
						switch (action.paramKey) {
							case 'bank':
								updateBankParameter(state);
								break;
						}
					}
					break;
				case actions.SET_TRANSPORT:
					resumeAudio();
					break;
			}
		},

		/**
		 * Process events to happen in a time slice.
		 * @param {Number} scanStart Timespan start in ticks from timeline start.
		 * @param {Number} scanEnd   Timespan end in ticks from timeline start.
		 * @param {Number} nowToScanStart Timespan from current timeline position to scanStart, in ticks.
		 * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
		 * @param {Number} offset Time from doc start to timeline start in ticks.
		 * @param {Array} processorEvents Array to collect processor generated events to display in the view.
		 */
		process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {

			// retrieve events waiting at the processor's input
			const inputData = getInputData();
			const origin = performance.now() - (offset * ticksToMsMultiplier);
			
			inputData.forEach(data => {

				// timestampTicks: Timespan from timeline start to note start
				const { channel, durationTicks, pitch, timestampTicks, type, velocity, } = data;
				const nowToEventInSecs = (timestampTicks - scanStart + nowToScanStart) * ticksToMsMultiplier * 0.001;
				playSound(nowToEventInSecs, params.bank, channel, pitch, velocity);

				// add events to processorEvents for the canvas to show them
				if (!processorEvents[id]) {
					processorEvents[id] = [];
				}
				
				const delayFromNowToNoteStart = (timestampTicks - scanStart) * ticksToMsMultiplier;
				processorEvents[id].push({
					delayFromNowToNoteStart,
					delayFromNowToNoteEnd: delayFromNowToNoteStart + (durationTicks * ticksToMsMultiplier)
				});
			});
		},

		/**
		 * Store parameter values locally for quick access by the process function.
		 * @param {Object} parameters Processor's paramer data in state.
		 */
		updateAllParams = function(parameters) {
			params.bank = parameters.bank.value;
		},
		
		/**
		 * Change the bank of samples.
		 * @param {Object} state Application state.
		 */
		updateBankParameter = state => {
			const { banks, params, } = state.processors.byId[id];
			const param = params.byId.bank;
			const bank = banks[param.value];
			loadSoundBankFiles(param.value, bank);

			// if the bank changes update the processor's name as well
			const label = param.model.find(item => item.value === param.value).label;
			dispatch(getActions().changeParameter(id, 'name', `Soundbank ${label}`));
		};

	initialize();
	
	return {
		addConnection,
		getId,
		getType,
		process,
		removeConnection,
		terminate,
	};
}
