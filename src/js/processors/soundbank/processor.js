import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';
import { initAudioFiles, playSound } from './utils.js';

/**
 * Sample player processor.
 */
export function createProcessor(data, my = {}) {
	let that,
			params = {};
	
	const initialize = function() {
			const { processors } = getState();
			document.addEventListener(STATE_CHANGE, handleStateChange);
			updateAllParams(processors.byId[my.id].params.byId);
			initAudioFiles(processors.byId[my.id].params.byId.sample.model);
		},

		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChange);
		},

		handleStateChange = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {
				case actions.CHANGE_PARAMETER:
					if (action.processorID === my.id) {
						updateAllParams(state.processors.byId[my.id].params.byId);
						switch (action.paramKey) {
							case 'sample':
								break;
						}
					}
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
		 */
		process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {

			// retrieve events waiting at the processor's input
			const inputData = my.getInputData();
			const origin = performance.now() - (offset * ticksToMsMultiplier);
			
			inputData.forEach(data => {

				// timestampTicks: Timespan from timeline start to note start
				const { channel, durationTicks, pitch, timestampTicks, type, velocity, } = data;
				const nowToEventInSecs = (timestampTicks - scanStart + nowToScanStart) * ticksToMsMultiplier * 0.001;
				playSound(nowToEventInSecs, params.sample, pitch, velocity);
			});
		},

		updateAllParams = function(parameters) {
			params.sample = parameters.sample.value;
		};

	that = createMIDIProcessorBase(data, that, my);

	initialize();
	
	that.terminate = terminate;
	that.process = process;
	return that;
}
