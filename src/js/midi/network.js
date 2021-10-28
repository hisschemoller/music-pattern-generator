import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { getProcessorData } from '../core/processor-loader.js';
import { process as processMIDIClock } from './midiclock.js';

let processors = [];

/**
 * Let all processors process their data.
 * @param {Number} start Start time in ticks of timespan to process.
 * @param {Number} end End time in ticks of timespan to process.
 * @param {Number} nowToScanStart Duration from now until start time in ticks.
 * @param {Number} ticksToMsMultiplier Ticks to ms. conversion multiplier.
 * @param {Number} offset Position of transport playhead in ticks.
 * @param {Object} processorEvents Object to collect processor generated events to displayin the view.
 */
export function process(start, end, nowToScanStart, ticksToMsMultiplier, offset, processorEvents) {
	processors.forEach(processor => {
		processor.process(start, end, nowToScanStart, ticksToMsMultiplier, offset, processorEvents);
	});
	processMIDIClock(start, end, nowToScanStart, ticksToMsMultiplier, offset, processorEvents);
}

export function setup() {
	addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Go through all connection data and connect the processors
 * that are,'t connected yet.
 * @param {Object} state App state.
 */
function connectProcessors(state) {
	state.connections.allIds.forEach(connectionId => {
		const connection = state.connections.byId[connectionId];
		const sourceProcessor = processors.find(processor => processor.getId() === connection.sourceProcessorId);
		const destinationProcessor = processors.find(processor => processor.getId() === connection.destinationProcessorId);
		if (!sourceProcessor.getDestinations().includes(destinationProcessor)) {
			sourceProcessor.connect(destinationProcessor);
		}
	});
}

/**
 * Create a new processor in the network.
 * @param {Object} state App state.
 */
function createProcessors(state) {
	for (let id of state.processors.allIds) {
		const processorData = state.processors.byId[id];
		const isExists = processors.find(processor => processor.getId() === id);
		if (!isExists) {
			const module = getProcessorData(processorData.type, 'processor');
			const processor = module.createProcessor(processorData);
			processors.push(processor);
		}
	};
	connectProcessors(state);
	reorderProcessors(state);
}

/**
 * Delete processors.
 * @param {Object} state App state.
 */
function deleteProcessors(state) {
	for (let i = processors.length - 1, n = 0; i >= n; i--) {
		const processor = processors[i];
		
		// search for the processor in the state
		const processorData = state.processors.allIds.find(processorId => processorId === processor.getId());

		// remove processor if it doesn't exist in the state
		if (!processorData) {
			if (processor.terminate instanceof Function) {
				processor.terminate();
			}
			processors.splice(i, 1);
		}
	}
}

/**
 * Go through all processor outputs and check if 
 * they still exist in the state. If not, disconnect them.
 * 
 * TODO: allow for processors with multiple inputs or outputs.
 * @param {Object} state App state.
 */
function disconnectProcessors(state) {
	processors.forEach(sourceProcessor => {
		if (sourceProcessor.getDestinations instanceof Function) {
			const destinationProcessors = sourceProcessor.getDestinations();
			destinationProcessors.forEach(destinationProcessor => {
				let exists = false;
				state.connections.allIds.forEach(connectionId => {
					const connection = state.connections.byId[connectionId];
					if (connection.sourceProcessorId === sourceProcessor.getId() &&
						connection.destinationProcessorId === destinationProcessor.getId()) {
						exists = true;
					}
				});
				if (!exists) {
					sourceProcessor.disconnect(destinationProcessor);
				}
			});
		}
	});
}

/**
 * Handle state changes.
 * @param {Object} e Custom store event.
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
    case actions.CREATE_PROJECT:
			disconnectProcessors(state);
			deleteProcessors(state);
			createProcessors(state);
			break;

    case actions.ADD_PROCESSOR:
			createProcessors(state);
			break;

    case actions.DELETE_PROCESSOR:
			disconnectProcessors(state);
			deleteProcessors(state);
			reorderProcessors(state);
			break;

    case actions.CREATE_CONNECTION:
			connectProcessors(state);
			reorderProcessors(state);
			break;

    case actions.DISCONNECT_PROCESSORS:
			disconnectProcessors(state);
			reorderProcessors(state);
			break;
  }
}

/**
 * Reorder the processors according to their order in the state.
 * @param {Object} state, App state.
 */
function reorderProcessors(state) {
	processors = state.processors.allIds.map(processorId => {
		return processors.find(processor => processor.getId() === processorId);
	});
}
