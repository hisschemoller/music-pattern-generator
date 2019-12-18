import { dispatch, getActions, getState, STATE_CHANGE, } from '../state/store.js';
import createRemoteItemView from './remote_item.js';

/**
 * Group within overview list of all assigned MIDI controller assignments.
 * The items are grouped by processor.
 */
export default function createRemoteGroupView(data, that = {}, my = {}) {
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
			setName(state.processors.byId[processorID].params.byId.name.value);
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
					if (action.processorID === processorID && 
						action.paramKey === 'name') {
						setName(state.processors.byId[processorID].params.byId.name.value);
					}
					break;
			}
		},

		/**
		 * Update list to contain all assignments.
		 */
		updateViews = function(state) {
			state.processors.byId[processorID].params.allIds.forEach(paramKey => {
				
				// search assignment for this parameter
				let assignment;
				state.assignments.allIds.forEach(assignID => {
					const assign = state.assignments.byId[assignID];
					if (assign.processorID === processorID && assign.paramKey === paramKey) {
						assignment = assign;
					}
				});

				// create or delete the parameter's view
				const view = views.byId[paramKey];
				if (assignment && !view) {
					const param = state.processors.byId[processorID].params.byId[paramKey];
					addView(paramKey, param.label, assignment.remoteChannel, assignment.remoteCC);
				} else if (!assignment && view) {
					removeView(paramKey);
				}
			});

			// show group if there are assignments
			el.dataset.hasAssignments = (views.allIds.length > 0);
		},

		addView = function(paramKey, paramLabel, remoteChannel, remoteCC) {
			views.byId[paramKey] = createRemoteItemView({
				paramKey,
				paramLabel,
				processorID,
				remoteChannel,
				remoteCC,
				parentEl: listEl
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
		 * @param {String} name Processor's name.
		 */
		setName = function(name) {
			el.querySelector('.remote__group-header-label').innerHTML = name;
		};
    
    initialize();
    
    that.terminate = terminate;
    that.updateViews = updateViews;
    return that;
}
