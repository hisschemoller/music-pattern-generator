import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Input processor view.
 */
export default function createMIDIInputView(data, that = {}, my = {}) {
			
	/**
	 * This init function is called after the base view's initialise function,
	 * so properties of on 'my' are available.
	 */
	const init = function() {
		my.networkEl.dataset.disabled = 'true';
		my.networkEl.querySelector('input').setAttribute('disabled', 'disabled');
	};
	
	that = createMIDIBaseView(data, that, my);
	
	init();

	return that;
}
