import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';

/**
 * MIDI input or output port processor view.
 */
export default function createMIDIBaseView(data, that = {}, my = {}) {
  const { id, isInput, name, networkEnabled, parentEl, port, remoteEnabled, syncEnabled, } = data;
        
	const initialize = function() {

		// find template, add clone to midi ports list
		const template = document.querySelector('#template-midi-port');
		const clone = template.content.cloneNode(true);
		my.el = clone.firstElementChild;
		parentEl.appendChild(my.el);
		
		// set data-connected="true" to make the element visible
		my.el.dataset.connected = true;
		
		// show label
		my.el.querySelector('.midi-port__label').innerHTML = name;
		
		// find checkboxes
		my.networkEl = my.el.querySelector('.midi-port__network');
		my.syncEl = my.el.querySelector('.midi-port__sync');
		my.remoteEl = my.el.querySelector('.midi-port__remote');
		
		// set checkboxes
		my.networkEl.querySelector('[type=checkbox]').checked = networkEnabled;
		my.syncEl.querySelector('[type=checkbox]').checked = syncEnabled;
		my.remoteEl.querySelector('[type=checkbox]').checked = remoteEnabled;
		
		// add DOM event listeners
		my.networkEl.addEventListener('change', function(e) {
			if (!e.currentTarget.dataset.disabled) {
				dispatch(getActions().toggleMIDIPreference(my.id, 'networkEnabled'));
			}
		});
		my.syncEl.addEventListener('change', function(e) {
			if (!e.currentTarget.dataset.disabled) {
				dispatch(getActions().toggleMIDIPreference(my.id, 'syncEnabled'));
			}
		});
		my.remoteEl.addEventListener('change', function(e) {
			if (!e.currentTarget.dataset.disabled) {
				dispatch(getActions().toggleMIDIPreference(my.id, 'remoteEnabled'));
			}
		});

		// listen to state updates
		document.addEventListener(STATE_CHANGE, e => {
			const { state, action, actions, } = e.detail;
			switch (action.type) {

				case actions.TOGGLE_MIDI_PREFERENCE:
				case actions.CREATE_PROJECT:
					const port = state.ports.byId[my.id];  
					if (port) {
						my.networkEl.querySelector('[type=checkbox]').checked = port.networkEnabled;
						my.syncEl.querySelector('[type=checkbox]').checked = port.syncEnabled;
						my.remoteEl.querySelector('[type=checkbox]').checked = port.remoteEnabled;
					} else {
						console.log(`MIDI port with id ${my.id} not found.`);
					}
					break;
				}
			});
		},

		/**
		 * Called before this view is deleted.
		 */
		terminate = function() {
			if (my.el && parentEl) {
				parentEl.removeChild(my.el);
			}
		},

		getID = function() {
			return my.id;
		};
	
	my.isInput = isInput;
	my.id = id;
	my.el;
	my.networkEl;
	my.syncEl;
	my.remoteEl;
	
	initialize();
	
	that.terminate = terminate;
	that.getID = getID;
	return that;
}
