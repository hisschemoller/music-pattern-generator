import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';

export function createProcessor(data, my = {}) {
	let that,
		params = {};

	const initialize = function() {
			document.addEventListener(STATE_CHANGE, handleStateChanges);
			updateAllParams(data.params.byId);
			updatePattern(true);
		},

		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChanges);
		},

		/**
		 * Handle state changes.
		 * @param {Object} e Application state.
		 */
		handleStateChanges = e => {
			const { state, action, actions, } = e.detail;
			switch (action.type) {

				case actions.CHANGE_PARAMETER:
					if (action.processorId === my.id) {
						updateAllParams(state.processors.byId[my.id].params.byId);
						switch (action.paramKey) {
						}
					}
					break;
					
				case actions.LOAD_SNAPSHOT:
					updateAllParams(state.processors.byId[my.id].params.byId);
					updatePattern(true);
					break;

				case actions.RECREATE_PARAMETER:
					if (action.processorId === my.id) {
						updateAllParams(state.processors.byId[my.id].params.byId);
					}
					break;
			}
		},
				
		/**
		 * Process events to happen in a time slice. This will
		 * - Get events waiting at the input
		 * - Process them according to the current parameter settings.
		 * - Send the processed events to the output.
		 * - Add the events to the processorEvents parameter for display in the view.
		 * 
		 * Events are plain objects with properties:
		 * @param {String} type 'note'
		 * @param {Number} timestampTicks Event start time, measured from timeline start
		 * @param {Number} durationTicks
		 * @param {Number} channel 1 - 16
		 * @param {Number} velocity 0 - 127
		 * @param {Number} pitch 0 - 127
		 * 
		 * This method's parameters:
		 * @param {Number} scanStart Timespan start in ticks from timeline start.
		 * @param {Number} scanEnd   Timespan end in ticks from timeline start.
		 * @param {Number} nowToScanStart Timespan from current timeline position to scanStart, in ticks
		 * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
		 * @param {Number} offset Time from doc start to timeline start in ticks.
		 * @param {Array} processorEvents Array to collect processor generated events to display in the view.
		 */
		process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {
			
			// clear the output event stack
			my.clearOutputData();

			// retrieve events waiting at the processor's input
			const inputData = my.getInputData();

			// abort if there's nothing to process
			if (inputData.length === 0) {
				return;
			}

			// if bypass is enabled push all input data directly to the output
			if (params.isBypass) {
				inputData.forEach(event => {
					my.setOutputData(event);
				});
				return;
			}

			inputData.forEach(event => {
				let isDelayed = false;

				// handle only MIDI Note events
				if (event.type === 'note') {

					// calculate the state of the effect at the event's time within the pattern
					const stepIndex = 0; // Math.floor((event.timestampTicks % duration) / stepDuration);

					// add events to processorEvents for the canvas to show them
					if (!processorEvents[my.id]) {
						processorEvents[my.id] = [];
					}

					const delayFromNowToNoteStart = (event.timestampTicks - scanStart) * ticksToMsMultiplier;
					processorEvents[my.id].push({
						stepIndex: stepIndex,
						delayFromNowToNoteStart: delayFromNowToNoteStart,
						delayFromNowToNoteEnd: delayFromNowToNoteStart + (event.durationTicks * ticksToMsMultiplier)
					});

					// push the event to the processor's output
					my.setOutputData(event);
				}
			});
		},

		/**
		 * Store parameter values locally for quick access by the process function.
		 * @param {Object} parameters Processor's paramer data in state.
		 */
		updateAllParams = function(parameters) {
			params.isBypass = parameters.is_bypass.value;
		},

		/**
		 * Update all pattern properties.
		 */
		updatePattern = function() {};

	that = createMIDIProcessorBase(data, that, my);

	initialize();

	that.terminate = terminate;
	that.process = process;
	return that;
}
