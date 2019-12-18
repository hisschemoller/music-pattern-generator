import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

/**
 * View for a parameter that's linked to a remote MIDI controller.
 * The items are grouped by processor.
 */
export default function createRemoteItemView(data, that = {}, my = {}) {
	const { paramKey, paramLabel, parentEl, processorID, remoteChannel, remoteCC, } = data;
	
	let el;
			
	const initialize = function() {

			// create the DOM element.
			let template = document.querySelector('#template-remote-item');
			let clone = template.content.cloneNode(true);
			el = clone.firstElementChild;
			el.querySelector('.remote__item-label').innerHTML = paramLabel;
			el.querySelector('.remote__item-channel').innerHTML = remoteChannel;
			el.querySelector('.remote__item-control').innerHTML = remoteCC;
			parentEl.appendChild(el);
			
			// add DOM event listeners
			el.querySelector('.remote__item-delete').addEventListener('click', onUnregisterClick);
		},
		
		/**
		 * Called before this view is deleted.
		 */
		terminate = function() {
			el.querySelector('.remote__item-delete').removeEventListener('click', onUnregisterClick);
			parentEl.removeChild(el);
		},
		
		/**
		 * Unassign button click handler.
		 * @param  {Object} e Click event object.
		 */
		onUnregisterClick = function(e) {
			dispatch(getActions().unassignExternalControl(processorID, paramKey));
		},
		
		/**
		 * State of the parameter in the assignment process changed,
		 * the element will show this visually.
		 * @param {String} state New state of the parameter.
		 * @param {Function} callback Not used here.
		 */
		changeRemoteState = function(state, callback) {
			switch (state) {
				case 'assigned':
					// TODO: normale tekst
					break;
				case 'inactive':
					// TODO: tekst grijs of zoiets
					break;
			}
		};
    
    initialize();

    that.terminate = terminate;
    return that;
}
