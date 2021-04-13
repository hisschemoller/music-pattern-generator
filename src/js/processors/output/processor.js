import { dispatch, getActions, getState, STATE_CHANGE, } from '../../state/store.js';
import createMIDIProcessorBase from '../../midi/processorbase.js';
import { getMIDIPortByID } from '../../midi/midi.js';

/**
 * MIDI output port processor.
 */
export function createProcessor(data, my = {}) {
	let that,
			midiOutput,
			params = {};
	
	const initialize = function() {
			document.addEventListener(STATE_CHANGE, handleStateChange);
			updatePortsParameter(getState());
			updateAllParams(getState().processors.byId[my.id].params.byId);
			updateMIDIPort();
		},

		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChange);
		},

		handleStateChange = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {
				case actions.CHANGE_PARAMETER:
					if (action.processorId === my.id) {
						updateAllParams(state.processors.byId[my.id].params.byId);
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
		 * @param {Number} nowToScanStart Timespan from current timeline position to scanStart.
		 * @param {Number} ticksToMsMultiplier Duration of one tick in milliseconds.
		 * @param {Number} offset Time from doc start to timeline start in ticks.
		 */
		process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {

			// retrieve events waiting at the processor's input
			const inputData = my.getInputData(),
				origin = performance.now() - (offset * ticksToMsMultiplier),
				n = inputData.length;
			
			if (midiOutput && midiOutput.state === 'connected') {
				for (var i = 0; i < n; i++) {
					const {  channel, durationTicks, pitch, timestampTicks, type, velocity, cc, cc_value} = inputData[i];

					// item.timestampTicks is time since transport play started
					const timestamp = origin + (timestampTicks * ticksToMsMultiplier);
					const duration = durationTicks * ticksToMsMultiplier;
					console.log(inputData[i]);
					switch (type) {
						case 'note':
							midiOutput.send([0x90 + (channel - 1), pitch, velocity], timestamp);
							midiOutput.send([0x80 + (channel - 1), pitch, 0], timestamp + duration);
							break;
						case 'cc':
							midiOutput.send([0xB0 + (channel - 1), cc, cc_value], timestamp);
							break;
					}
				}
			}
		},

		updateAllParams = function(parameters) {
			params.port = parameters.port.value;
			params.portName = parameters.port.model.find(element => element.value === params.port).label;
		},

		/**
		 * Retrieve the MIDI port the MIDI notes are sent to.
		 * After a port parameter change.
		 */
		updateMIDIPort = function() {
			midiOutput = getMIDIPortByID(params.port);

			// update the processor's name parameter
			dispatch(getActions().changeParameter(my.id, 'name', params.portName));
		},

		/**
		 * Update the ports parameter with the current available ports.
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
			dispatch(getActions().recreateParameter(my.id, 'port', { model: portsModel }));

			// set the parameter's value
			const recreatedState = getState(),
				portParam = recreatedState.processors.byId[my.id].params.byId.port,
				value = portParam.value,
				model = portParam.model;
			let item = model.find(element => element.value === value);
			item = item || model.find(element => element.value === 'none');
			
			dispatch(getActions().changeParameter(my.id, 'port', item.value));
			dispatch(getActions().changeParameter(my.id, 'name', item.label));
		},
		
		setEnabled = function(isEnabled) {
			my.isEnabled = isEnabled;
		},

		getMIDIPortID = function() {
			return portId;
		};

	my.isEnabled = true;

	that = createMIDIProcessorBase(data, that, my);

	initialize();
	
	that.terminate = terminate;
	that.process = process;
	that.setEnabled = setEnabled;
	that.getMIDIPortID = getMIDIPortID;
	return that;
}
