import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';

/**
 * Sample player processor.
 */
export function createProcessor(data, my = {}) {
	let that,
			params = {};
	
	const initialize = function() {
			document.addEventListener(STATE_CHANGE, handleStateChange);
			updateAllParams(getState().processors.byId[my.id].params.byId);
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
		 * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
		 * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
		 * @param {Number} offset Time from doc start to timeline start in ticks.
		 */
		process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {
		},

		updateAllParams = function(parameters) {
		};

	that = createMIDIProcessorBase(data, that, my);

	initialize();
	
	that.terminate = terminate;
	that.process = process;
	return that;
}
