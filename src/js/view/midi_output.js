import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Output processor view.
 */
export default function createMIDIOutputView(data, that = {}, my = {}) {
        
	/**
	 * This init function is called after the base view's initialise function,
	 * so properties of on 'my' are available.
	 */
	const init = function() {
		my.syncEl.dataset.disabled = 'true';
		my.syncEl.querySelector('input').setAttribute('disabled', 'disabled');
		my.remoteEl.dataset.disabled = 'true';
		my.remoteEl.querySelector('input').setAttribute('disabled', 'disabled');
	};
    
	that = createMIDIBaseView(data, that, my);
	
	init();

	return that;
}
