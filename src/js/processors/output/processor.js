import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';
import { getMIDIAccessible, getMIDIPortById } from '../../midi/midi.js';

/**
 * MIDI output port processor.
 */
export function createProcessor(data) {
	let midiOutput,
		params = {};
	
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
			document.addEventListener(STATE_CHANGE, handleStateChange);
			updatePortsParameter(getState());
			updateAllParams(getState().processors.byId[id].params.byId);
			updateMIDIPort();
		},

		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChange);
		},

		handleStateChange = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {
				case actions.CHANGE_PARAMETER:
					if (action.processorId === id) {
						updateAllParams(state.processors.byId[id].params.byId);
						switch (action.paramKey) {
							case 'port':
								updateMIDIPort();
								break;
						}
					}
					break;
				
				case actions.CREATE_MIDI_PORT:
				case actions.UPDATE_MIDI_PORT:
				case actions.TOGGLE_MIDI_PREFERENCE:
					updatePortsParameter(state);
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
			if (midiOutput && midiOutput.state === 'connected') {

				// retrieve events waiting at the processor's input
				const inputData = getInputData();
				const origin = performance.now() - (offset * ticksToMsMultiplier);

				for (let i = 0, n = inputData.length; i < n; i++) {
					const { channel, durationTicks, pitch, timestampTicks, type, velocity, cc, cc_value, } = inputData[i];

					// item.timestampTicks is time since transport play started
					const timestamp = origin + (timestampTicks * ticksToMsMultiplier);
					const duration = durationTicks * ticksToMsMultiplier;

					switch (type) {
						case 'note':
							midiOutput.send([0x90 + (channel - 1), pitch, velocity], timestamp);
							midiOutput.send([0x80 + (channel - 1), pitch, 0], timestamp + duration);
							break;
						case 'cc':
							midiOutput.send([0xB0 + (channel - 1), cc, cc_value], timestamp);
							break;
					}

					// add events to processorEvents for the canvas to show them
					if (!processorEvents[id]) {
						processorEvents[id] = [];
					}

					const delayFromNowToNoteStart = (timestampTicks - scanStart) * ticksToMsMultiplier;
					
					processorEvents[id].push({
						delayFromNowToNoteStart,
						delayFromNowToNoteEnd: delayFromNowToNoteStart + (durationTicks * ticksToMsMultiplier)
					});
				}
			}
		},

		/**
		 * Store parameter values locally for quick access by the process function.
		 * @param {Object} parameters Processor's paramer data in state.
		 */
		updateAllParams = function(parameters) {
			params.port = parameters.port.value;
			params.portName = parameters.port.model.find(element => element.value === params.port).label;
		},

		/**
		 * Retrieve the MIDI port the MIDI notes are sent to.
		 * After a port parameter change.
		 */
		updateMIDIPort = function() {
			if (!getMIDIAccessible()) {
				return;
			}

			midiOutput = getMIDIPortById(params.port);

			// update the processor's name parameter
			dispatch(getActions().changeParameter(id, 'name', params.portName));
		},

		/**
		 * Update the 'ports' parameter with the current available ports.
		 * It's an itemized parameter so it uses a model as data.
		 * @param {Object} state App state.
		 */
		updatePortsParameter = function(state) {

			// rebuild the parameter's model and recreate the parameter
			const portsModel = [
				{ label: 'No output', value: 'none' }
			];
			state.ports.allIds.forEach(portId => {
				const port = state.ports.byId[portId];
				if (port.type === 'output' && port.networkEnabled && port.state === 'connected') {
					portsModel.push({ label: port.name, value: port.id });
				}
			});
			dispatch(getActions().recreateParameter(id, 'port', { model: portsModel }));

			// set the parameter's value
			const recreatedState = getState(),
				portParam = recreatedState.processors.byId[id].params.byId.port,
				value = portParam.value,
				model = portParam.model;
			let item = model.find(element => element.value === value);
			item = item || model.find(element => element.value === 'none');
			
			dispatch(getActions().changeParameter(id, 'port', item.value));
			dispatch(getActions().changeParameter(id, 'name', item.label));
		},

		/**
		 * Provide MIDI port's ID.
		 * @returns {String} MIDI Port ID.
		 */
		getMIDIPortId = function() {
			return portId;
		};

	initialize();
	
	return {
		addConnection,
		getId,
		getMIDIPortId,
		getType,
		process,
		removeConnection,
		terminate,
	};
}
