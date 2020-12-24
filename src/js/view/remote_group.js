import { dispatch, getActions, getState, STATE_CHANGE, } from '../state/store.js';
import createRemoteItemView from './remote_item.js';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(data) {
	const { parentEl, processorId, state, } = data;

  let el,
		listEl,
		views = {
			byId: {},
			allIds: []
		};
		
	const initialize = function() {

			// create the DOM element.
			const template = document.querySelector('#template-remote-group');
			const clone = template.content.cloneNode(true);
			el = clone.firstElementChild;
			parentEl.appendChild(el);
			
			listEl = el.querySelector('.remote__group-list');

			setName(state);
			updateViews(state);

			document.addEventListener(STATE_CHANGE, handleStateChange);
		},
		
		/**
		 * Called before this view is deleted.
		 */
		terminate = function() {
			document.removeEventListener(STATE_CHANGE, handleStateChange);

			views.allIds.forEach(id => {
				views.byId[id].terminate();
			});

			parentEl.removeChild(el);
			views = null;
		},

		/**
		 * Handle state changes.
		 * @param {Object} e 
		 */
		handleStateChange = function(e) {
			const { state, action, actions, } = e.detail;
			switch (action.type) {
				case actions.CHANGE_PARAMETER:
					if (action.processorId === processorId && action.paramKey === 'name') {
						setName(state);
					}
					break;
			}
		},

		/**
		 * Update list to contain all assignments.
		 */
		updateViews = function(state) {
			const { assignments, processors, } = state;
			if (processorId === 'snapshots') {
				
				// delete views not in the assignments anymore
				for (let i = views.allIds.length - 1; i >= 0; i--) {
					const viewId = views.allIds[i];
					const assignment = assignments.allIds.find(assignId => {
						const { paramKey, processorId } = assignments.byId[assignId]; 
						return processorId === 'snapshots' && paramKey === viewId;
					});
					if (!assignment) {
						removeView(viewId);
					}
				}

				// create views for new assignments
				assignments.allIds.forEach(assignId => {
					const { paramKey, processorId, remoteType, remoteChannel, remoteValue } = assignments.byId[assignId];
					if (processorId === 'snapshots' && !views.allIds.includes(paramKey)) {
						const label = `Snapshot ${parseInt(paramKey, 10) + 1}`;
						addView(paramKey, label, remoteType, remoteChannel, remoteValue);
					}
				});

				// order the list by snapshot number
				views.allIds.sort();
				views.allIds.forEach(viewId => views.byId[viewId].reAttach());
			} else {

				// a processor
				processors.byId[processorId].params.allIds.forEach(paramKey => {
				
					// search assignment for this parameter
					const assignmentId = assignments.allIds.find(assignId => {
						const { paramKey: key, processorId : id } = assignments.byId[assignId];
						return id === processorId && key === paramKey;
					});
					const assignment = assignments.byId[assignmentId];
	
					// create or delete the parameter's view
					const view = views.byId[paramKey];
					if (assignment && !view) {
						const { remoteType, remoteChannel, remoteValue } = assignment;
						const { label } = processors.byId[processorId].params.byId[paramKey];
						addView(paramKey, label, remoteType, remoteChannel, remoteValue);
					} else if (!assignment && view) {
						removeView(paramKey);
					}
				});
			}

			// show group if there are assignments
			el.dataset.hasAssignments = (views.allIds.length > 0);
		},

		/** 
		 * Add a view for a newly created assignment.
		 * @param {String} paramKey The assigned processor parameter key.
		 * @param {String} paramLabel The parameter's label to display.
		 * @param {String} remoteType The assignment's MIDI event type: 'note_on' or 'cc'.
		 * @param {Number} remoteChannel The assignment's MIDI channel.
		 * @param {Number} remoteValue The assignment's MIDI CC number or pitch value.
		 */
		addView = function(paramKey, paramLabel, remoteType, remoteChannel, remoteValue) {
			views.byId[paramKey] = createRemoteItemView({
				paramKey,
				paramLabel,
				processorId,
				remoteType,
				remoteChannel,
				remoteValue,
				parentEl: listEl,
			});
			views.allIds.push(paramKey);
		},

		/** 
		 * Remove the view of a parameter that was unassigned.
		 * @param {String} paramKey The assigned processor parameter key.
		 */
		removeView = function(paramKey) {
			views.byId[paramKey].terminate();
			delete views.byId[paramKey];
			views.allIds.splice(views.allIds.indexOf(paramKey), 1);
		},
		
		/**
		 * Set the group's header to the processor's name.
		 * @param {Object} state Application state.
		 */
		setName = function(state) {
			const name = processorId === 'snapshots' ? 'Snapshots' : state.processors.byId[processorId].params.byId.name.value;
			el.querySelector('.remote__group-header-label').innerHTML = name;
		};
    
	initialize();

	return {
		terminate,
		updateViews,
	};
}
