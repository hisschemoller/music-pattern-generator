import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';
import { PPQN } from '../../core/config.js';
import { getEuclidPattern, rotateEuclidPattern } from './utils.js';

export function createProcessor(data, my = {}) {
	let that,
		duration = 0,
		stepDuration = 0,
		euclidPattern = [],
		params = {},
		delayedEvents = [];

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
		 * @param {Object} e 
		 */
		handleStateChanges = e => {
			const { state, action, actions, } = e.detail;
			switch (action.type) {
				case actions.CHANGE_PARAMETER:
					if (action.processorID === my.id) {
						updateAllParams(state.processors.byId[my.id].params.byId);
						switch (action.paramKey) {
							case 'steps':
								updatePulsesAndRotation();
								updatePattern(true);
								break;
							case 'pulses':
							case 'rotation':
								updatePattern(true);
								break;
							case 'is_triplets':
							case 'rate':
								updatePattern();
								break;
							case 'target':
							case 'mode':
								updateEffectSettings();
								break;
						}
					}
					break;
					
				case actions.LOAD_PRESET:
					updateAllParams(state.processors.byId[my.id].params.byId);
					updatePulsesAndRotation();
					updatePattern(true);
					updateEffectSettings();
					break;

				case actions.RECREATE_PARAMETER:
					if (action.processorID === my.id) {
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
				processDelayedEvents(scanStart, scanEnd);
				return;
			}

			// calculate the processed timespan's position within the pattern, 
			// taking into account the pattern looping during this timespan.
			let localScanStart = scanStart % duration,
				localScanEnd = scanEnd % duration,
				localScanStart2 = false,
				localScanEnd2;
			if (localScanStart > localScanEnd) {
				localScanStart2 = 0;
				localScanEnd2 = localScanEnd;
				localScanEnd = duration;
			}

			inputData.forEach(event => {
				let isDelayed = false;

				// handle only MIDI Note events
				if (event.type === 'note') {

					// calculate the state of the effect at the event's time within the pattern
					const stepIndex = Math.floor((event.timestampTicks % duration) / stepDuration),
						state = euclidPattern[stepIndex],
						effectValue = state ? params.high : params.low;
					
					// apply the effect to the event's target parameter
					switch (params.target) {
						case 'velocity':
							event.velocity = params.isRelative ? event.velocity + effectValue : effectValue;
							event.velocity = Math.max(0, Math.min(event.velocity, 127));
							break;
						case 'pitch':
							event.pitch = params.isRelative ? event.pitch + effectValue : effectValue;
							event.pitch = Math.max(0, Math.min(event.pitch, 127));
							break;
						case 'channel':
							event.channel = params.isRelative ? event.channel + effectValue : effectValue;
							event.channel = Math.max(1, Math.min(event.channel, 16));
							break;
						case 'length':
							const valueInTicks = (effectValue / 32) * PPQN * 4; // max 32 == 1 measure == PPQN * 4
							event.durationTicks = params.isRelative ? event.durationTicks + valueInTicks : valueInTicks;
							event.durationTicks = Math.max(1, event.durationTicks);
							break;
						case 'delay':
							if (effectValue > 0) {
								const delayInTicks = Math.max(0, (effectValue / 32) * PPQN * 0.25); // 32 == 1 beat == PPQN
								
								// store note if delayed start time falls outside of the current scan range
								if (event.timestampTicks + delayInTicks > scanEnd) {
									delayedEvents.push({
										...event,
										timestampTicks: event.timestampTicks + delayInTicks
									});
									isDelayed = true;
								} else {
									event.timestampTicks = event.timestampTicks + delayInTicks;
								}
							}
							break;
						case 'output':
							// v2.2
							break;
					}

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
					if (!isDelayed) {
						my.setOutputData(event);
					}
				}
			});

			processDelayedEvents(scanStart, scanEnd);
		},
					
		/**
		 * Check if stored delayed events 
		 * @param {Number} scanStart Timespan start in ticks from timeline start.
		 * @param {Number} scanEnd   Timespan end in ticks from timeline start.
		 */
		processDelayedEvents = function(scanStart, scanEnd) {
			let i = delayedEvents.length;
			while (--i > -1) {
				const timestampTicks = delayedEvents[i].timestampTicks;
				if (scanStart <= timestampTicks && scanEnd > timestampTicks) {
					my.setOutputData(delayedEvents.splice(i, 1)[0]);
				}
			}
		},

		/**
		 * After a change of the steps parameter update the pulses and rotation parameters.
		 */
		updatePulsesAndRotation = function() {
			dispatch(getActions().recreateParameter(my.id, 'pulses', { 
				max: params.steps,
				value: Math.min(params.pulses, params.steps),
			}));
			dispatch(getActions().recreateParameter(my.id, 'rotation', {
				max: params.steps - 1,
				value: Math.min(params.rotation, params.steps - 1),
			}));

			dispatch(getActions().changeParameter(my.id, 'pulses', params.pulses));
			dispatch(getActions().changeParameter(my.id, 'rotation', params.rotation));
		},
					
		/**
		 * Update all pattern properties.
		 * @param {Boolean} isEuclidChange Steps, pulses or rotation change.
		 */
		updatePattern = function(isEuclidChange) {

			// euclidean pattern properties, changes in steps, pulses, rotation
			if (isEuclidChange) {
				euclidPattern = getEuclidPattern(params.steps, params.pulses);
				euclidPattern = rotateEuclidPattern(euclidPattern, params.rotation);
			}
			
			// playback properties, changes in isTriplets and rate
			const rate = params.isTriplets ? params.rate * (2 / 3) : params.rate;
			stepDuration = rate * PPQN;
			duration = params.steps * stepDuration;
		},

		/**
		 * Store parameter values locally for quick access by the process function.
		 * @param {Object} parameters Processor's paramer data in state.
		 */
		updateAllParams = function(parameters) {
			params.steps = parameters.steps.value;
			params.pulses = parameters.pulses.value;
			params.rotation = parameters.rotation.value;
			params.isTriplets = parameters.is_triplets.value;
			params.rate = parameters.rate.value;
			params.high = parameters.high.value;
			params.low = parameters.low.value;
			params.target = parameters.target.value;
			params.isRelative = parameters.mode.value !== parameters.mode.default;
		},
			
		updateEffectSettings = function() {
			let min, max, lowValue, highValue;

			// set minimum and maximum value according to target type
			switch (params.target) {
				case 'velocity':
					min = params.isRelative ? -127 : 0;
					max = 127;
					lowValue = params.isRelative ? 0 : 50;
					highValue = params.isRelative ? 0 : 100;
					break;
				case 'pitch':
					min = params.isRelative ? -127 : 0;
					max = 127;
					lowValue = params.isRelative ? 0 : 58;
					highValue = params.isRelative ? 0 : 60;
					break;
				case 'channel':
					min = params.isRelative ? -16 : 1;
					max = 16;
					lowValue = params.isRelative ? 0 : 1;
					highValue = params.isRelative ? 0 : 2;
					break;
				case 'length':
					min = params.isRelative ? -32 : 0;
					max = 32;
					lowValue = params.isRelative ? 0 : 4;
					highValue = params.isRelative ? 0 : 8;
					break;
				case 'delay':
					min = params.isRelative ? 0 : 0;
					max = 32;
					lowValue = params.isRelative ? 0 : 0;
					highValue = params.isRelative ? 0 : 2;
					break;
				case 'output':
					min = 1;
					max = 2;
					lowValue = 1;
					highValue = 2;
					break;
			}

			// clamp parameter's value between minimum and maximum value
			lowValue = Math.max(min, Math.min(lowValue, max));
			highValue = Math.max(min, Math.min(highValue, max));

			// apply all new settings to the effect parameters 
			dispatch(getActions().recreateParameter(my.id, 'low', { min: min, max: max, value: lowValue }));
			dispatch(getActions().recreateParameter(my.id, 'high', { min: min, max: max, value: highValue }));
		};

	that = createMIDIProcessorBase(data, that, my);

	initialize();

	that.terminate = terminate;
	that.process = process;
	return that;
}
