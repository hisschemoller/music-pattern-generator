import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import createRemoteGroupView from './remote_group.js';

const listEl = document.querySelector('.remote__list');
const groupViews = {
	byId: {},
	allIds: []
};

export function setup() {
  addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

/**
 * Create a group (sublist with header) for each processor that has assignments,
 * and for the snaphots if a snapshots is assigned.
 * @param {Object} state Application state.
 */
function createRemoteGroups(state) {
	const { assignments, processors } = state;
	assignments.allIds.forEach(assignID => {
		const { processorID } = assignments.byId[assignID];
		if (!groupViews.allIds.includes(processorID) && (processors.allIds.includes(processorID) || (processorID === 'snapshots'))) {
			const id = processorID === 'snapshots' ? 'snapshots' : processorID;
			createRemoteGroup(id, state);
		}
	});
}

/**
 * Create a container view to hold assigned parameter views.
 * @param {Array} id Processor ID or 'snapshots' in case of snapshot assignment.
 * @param {Object} state Application state.
 */
function createRemoteGroup(id, state) {
	if (!groupViews.byId[id]) {
		groupViews.allIds.push(id);
		groupViews.byId[id] = createRemoteGroupView({
			processorID: id,
			parentEl: listEl,
			state,
		});
	}
}

/**
 * Delete all groups if no processors argument is provided.
 * Else delete the groups of all processors not in the state anymore,
 * but not the 'snapshots'
 * @param {Object} processors Processors as stored in the state.
 */
function deleteRemoteGroups(processors = null) {
	if (!processors) {

		// delete everything
		for (let i = groupViews.allIds.length - 1; i >= 0; i--) {
			const id = groupViews.allIds[i];
			groupViews.allIds.splice(i, 1);
			groupViews.byId[id].terminate();
			delete groupViews.byId[id];
		}
	} else {

		// delete non-assigned processor groups, snapshots if none assigned 
		for (let i = groupViews.allIds.length - 1; i >= 0; i--) {
			const id = groupViews.allIds[i];
			if (!processors.allIds.includes(id) && id !== 'snapshots') {
				groupViews.allIds.splice(i, 1);
				groupViews.byId[id].terminate();
				delete groupViews.byId[id];
			}
		}
	}
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {

		case actions.CREATE_PROJECT:
			deleteRemoteGroups();
			createRemoteGroups(state);
			break;

		case actions.ADD_PROCESSOR:
			createRemoteGroup(action.data.id, state);
			break;
				
		case actions.DELETE_PROCESSOR:
			deleteRemoteGroups(state.processors);
			break;
		
		case actions.ASSIGN_EXTERNAL_CONTROL: {
				const { learnTargetProcessorID } = state;
				if (learnTargetProcessorID) {
					const groupView = groupViews.byId[learnTargetProcessorID];
					if (!groupView) {
						createRemoteGroups(state);
					} else {
						groupView.updateViews(state);
					}
				}
			}
			break;
		
		case actions.UNASSIGN_EXTERNAL_CONTROL:
			const groupView = groupViews.byId[action.processorID];
			const isProcessor = state.processors.allIds.includes(state.learnTargetProcessorID);
			const isSnapshot = state.learnTargetProcessorID === 'snapshots';
			if (groupView && (isProcessor || isSnapshot)) {
				groupView.updateViews(state);
			}
			break;
  }
}
