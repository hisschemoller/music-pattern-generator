import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';

export function createProcessor(data) {
	let params = {},
		stepIndex = 0,
		offsetCurrent = 0;
	
	const {
		getId,
		getType,
		id,
		// input connector
		addConnection,
		getInputData,
		removeConnection,
		// output connector
		clearOutputData,
		connect,
		disconnect,
		getDestinations,
		getOutputData,
		setOutputData,
	} = createMIDIProcessorBase(data);

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
					if (action.processorId === id) {
						updateAllParams(state.processors.byId[id].params.byId);
						switch (action.paramKey) {
							case 'offset':
								updateOffset();
								break;
							case 'sequence':
								break;
							case 'steps':
								updateSequence();
								break;
						}
					}
					break;
					
				case actions.LOAD_SNAPSHOT:
					updateAllParams(state.processors.byId[id].params.byId);
					updatePattern(true);
					updateOffset();
					break;

				case actions.RECREATE_PARAMETER:
					if (action.processorId === id) {
						updateAllParams(state.processors.byId[id].params.byId);
					}
					break;

				case actions.SET_TRANSPORT:
					if (state.transport === 'play') {
						stepIndex = params.offset;
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
			clearOutputData();

			// retrieve events waiting at the processor's input
			const inputData = getInputData();

			// abort if there's nothing to process
			if (inputData.length === 0) {
				return;
			}

			// if bypass is enabled push all input data directly to the output
			if (params.isBypass) {
				inputData.forEach(event => {
					setOutputData(event);
				});
				return;
			}

			inputData.forEach(event => {
				let isDelayed = false;

				// handle only MIDI Note events
				if (event.type === 'note') {

					event.pitch = event.pitch + params.sequence[stepIndex].pitch;

					// add events to processorEvents for the canvas to show them
					if (!processorEvents[id]) {
						processorEvents[id] = [];
					}

					const delayFromNowToNoteStart = (event.timestampTicks - scanStart) * ticksToMsMultiplier;
					processorEvents[id].push({
						stepIndex,
						delayFromNowToNoteStart,
						delayFromNowToNoteEnd: delayFromNowToNoteStart + (event.durationTicks * ticksToMsMultiplier)
					});

					// calculate the state of the effect at the event's time within the pattern
					stepIndex = (stepIndex + 1) % params.steps;

					// push the event to the processor's output
					setOutputData(event);
				}
			});
		},

		/**
		 * Store parameter values locally for quick access by the process function.
		 * @param {Object} parameters Processor's paramer data in state.
		 */
		updateAllParams = function(parameters) {
			params.isBypass = parameters.is_bypass.value;
			params.offset = parameters.offset.value;
			params.sequence = parameters.sequence.value;
			params.steps = parameters.steps.value;
		},

		/**
		 * Adjust stepIndex for changed offset.
		 * StepIndex follows change in offset bound by step amount.
		 */
		updateOffset = function() {
			stepIndex = (params.steps + (stepIndex + (params.offset - offsetCurrent))) % params.steps;
			offsetCurrent = params.offset;
		},

		/**
		 * Update all pattern properties.
		 */
		updatePattern = function() {},
		
		/**
		 * Update the sequence.
		 */
		updateSequence = () => {
			const { offset, sequence, steps } = params;
			if (steps > sequence.length) {
				for (let i = sequence.length; i < steps; i++) {
					sequence.push({
						pitch: 0,
					});
				}
			} else if (steps < sequence.length) {
				stepIndex = stepIndex % steps;
			}

			dispatch(getActions().recreateParameter(id, 'offset', { 
				max: steps - 1,
				value: Math.min(offset, steps),
			}));
			
			dispatch(getActions().recreateParameter(id, 'sequence', { value: sequence }));
		};

	initialize();

	return {
		addConnection,
		connect,
		disconnect,
		getDestinations,
		getId,
		getOutputData,
		getType,
		process,
		removeConnection,
		terminate,
	};
}
