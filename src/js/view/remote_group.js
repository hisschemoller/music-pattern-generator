import { dispatch, getActions, getState, STATE_CHANGE, } from '../state/store.js';
import createRemoteItemView from './remote_item.js';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(data) {
	const { parentEl, processorID, } = data;

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

			const state = getState();
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
					if (action.processorID === processorID && action.paramKey === 'name') {
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
			if (processorID === 'snapshots') {
				
				// delete views not in the assignments anymore
				for (let i = views.allIds.length - 1; i >= 0; i--) {
					const viewId = views.allIds[i];
					const assignment = assignments.allIds.find(assignID => {
						const { paramKey, processorID } = assignments.byId[assignID]; 
						return processorID === 'snapshots' && paramKey === viewId;
					});
					if (!assignment) {
						removeView(viewId);
					}
				}

				// create views for new assignments
				assignments.allIds.forEach(assignID => {
					const { paramKey, processorID, remoteType, remoteChannel, remoteValue } = assignments.byId[assignID];
					if (processorID === 'snapshots' && !views.allIds.includes(paramKey)) {
						const label = `Snapshot ${parseInt(paramKey, 10) + 1}`;
						addView(paramKey, label, remoteType, remoteChannel, remoteValue);
					}
				});
			} else {

				// a processor
				processors.byId[processorID].params.allIds.forEach(paramKey => {
				
					// search assignment for this parameter
					const assignmentID = assignments.allIds.find(assignID => {
						const { paramKey: key, processorID : id } = assignments.byId[assignID];
						return id === processorID && key === paramKey;
					});
					const assignment = assignments.byId[assignmentID];
	
					// create or delete the parameter's view
					const view = views.byId[paramKey];
					if (assignment && !view) {
						const { remoteType, remoteChannel, remoteValue } = assignment;
						const { label } = processors.byId[processorID].params.byId[paramKey];
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
				processorID,
				remoteType,
				remoteChannel,
				remoteValue,
				parentEl: listEl,
			});
			views.allIds.push(paramKey);
		},

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
			const name = processorID === 'snapshots' ? 'Snapshots' : state.processors.byId[processorID].params.byId.name.value;
			el.querySelector('.remote__group-header-label').innerHTML = name;
		};
    
	initialize();

	return {
		terminate,
		updateViews,
	};
}
