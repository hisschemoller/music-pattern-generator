import { dispatch, getActions, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';
import { PPQN } from '../../core/config.js';
import { getEuclidPattern, rotateEuclidPattern } from './utils.js';

export function createProcessor(data, my = {}) {
	let that,
		position = 0,
		duration = 0,
		noteDuration,
		params = {},
		euclidPattern = [],
		pulsesOnly = [];

	const initialize = data => {
			document.addEventListener(STATE_CHANGE, handleStateChanges);
			updateAllParams(data.params.byId);
			updatePattern(true);
		},

		terminate = () => {
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
							case 'note_length':
								updatePattern();
								break;
							case 'is_mute':
								break;
							}
						}
						break;
					
					case actions.LOAD_SNAPSHOT:
						updateAllParams(state.processors.byId[my.id].params.byId);
						updatePulsesAndRotation();
						updatePattern(true);
						break;
				}
		},
				
		/**
		 * Process events to happen in a time slice.
		 * timeline start        now      scanStart     scanEnd
		 * |----------------------|-----------|------------|
		 *                        |-----------| 
		 *                        nowToScanStart
		 * @param {Number} scanStart Timespan start in ticks from timeline start.
		 * @param {Number} scanEnd   Timespan end in ticks from timeline start.
		 * @param {Number} nowToScanStart Timespan from current timeline position to scanStart, in ticks.
		 * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
		 * @param {Number} offset Time from doc start to timeline start in ticks.
		 * @param {Array} processorEvents Array to collect processor generated events to displaying the view.
		 */
		process = (scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) => {

			// clear the output event stack
			my.clearOutputData();
			
			// abort if the processor is muted
			if (params.is_mute) {
				return;
			}
			
			// if the pattern loops during this timespan.
			let localScanStart = scanStart % duration,
				localScanEnd = scanEnd % duration,
				localScanStart2 = false,
				localScanEnd2;
			if (localScanStart > localScanEnd) {
				localScanStart2 = 0,
				localScanEnd2 = localScanEnd;
				localScanEnd = duration;
			}
			
			// check if notes occur during the current timespan
			pulsesOnly.forEach(pulse => {
				const { startTime, stepIndex, } = pulse;
				let scanStartToNoteStart = startTime - localScanStart;
				let isOn = (localScanStart <= startTime) && (startTime < localScanEnd);
						
				// if pattern looped back to the start
				if (localScanStart2 !== false && isOn === false) {
					scanStartToNoteStart = startTime - localScanStart + duration;
					isOn = isOn || (localScanStart2 <= startTime) && (startTime < localScanEnd2);
				}
				
				// if a note should play
				if (isOn) { 
					const { channel_out, pitch_out, velocity_out, } = params;
					const pulseStartTimestamp = scanStart + scanStartToNoteStart;
					
					// send the Note On message
					// subtract 1 from duration to avoid overlaps
					my.setOutputData({
						timestampTicks: pulseStartTimestamp,
						durationTicks: noteDuration - 1,
						channel: channel_out,
						type: 'note',
						pitch: pitch_out,
						velocity: velocity_out
					});
					
					// add events to processorEvents for the canvas to show them
					if (!processorEvents[my.id]) {
						processorEvents[my.id] = [];
					}
					
					const delayFromNowToNoteStart = (nowToScanStart + scanStartToNoteStart) * ticksToMsMultiplier;
					processorEvents[my.id].push({
						stepIndex,
						delayFromNowToNoteStart: delayFromNowToNoteStart,
						delayFromNowToNoteEnd: delayFromNowToNoteStart + (noteDuration * ticksToMsMultiplier)
					});
				}
			});
			
			if (localScanStart2 !== false) {
				localScanStart = localScanStart2;
			}
		},

		/**
		 * Store parameter values locally for quick access by the process function.
		 * @param {Object} parameters Processor's paramer data in state.
		 */
		updateAllParams = parameters => {
			params.steps = parameters.steps.value;
			params.pulses = parameters.pulses.value;
			params.rotation = parameters.rotation.value;
			params.isTriplets = parameters.is_triplets.value;
			params.rate = parameters.rate.value;
			params.note_length = parameters.note_length.value;
			params.is_mute = parameters.is_mute.value;
			params.channel_out = parameters.channel_out.value;
			params.pitch_out = parameters.pitch_out.value;
			params.velocity_out = parameters.velocity_out.value;
		},

		/**
		 * After a change of the steps parameter update the pulses and rotation parameters.
		 */
		updatePulsesAndRotation = () => {
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
		updatePattern = isEuclidChange => {

			// euclidean pattern properties, changes in steps, pulses, rotation
			if (isEuclidChange) {
				euclidPattern = getEuclidPattern(params.steps, params.pulses);
				euclidPattern = rotateEuclidPattern(euclidPattern, params.rotation);
			}
			
			// playback properties, changes in isTriplets, rate, noteLength
			const rate = params.is_triplets ? params.rate * (2 / 3) : params.rate;
			const stepDuration = rate * PPQN;
			noteDuration = params.note_length * PPQN;
			duration = params.steps * stepDuration;
			position = position % duration;
			
			// create array of note start times in ticks
			pulsesOnly.length = 0;

			for (var i = 0, n = euclidPattern.length; i < n; i++) {
				if (euclidPattern[i]) {
					pulsesOnly.push({
						startTime: i * stepDuration,
						stepIndex: i
					});
				}
			}
		};
	
	that = createMIDIProcessorBase(data, that, my);

	initialize(data);

	that.terminate = terminate;
	that.process = process;
	return that;
}