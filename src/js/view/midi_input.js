import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Input processor view.
 */
export default function createMIDIInputView(data) {

	const { getId, networkEl, terminate } = createMIDIBaseView(data);
	/**
	 * This initialise function is called after the base view's initialise function,
	 * so properties of on 'my' are available.
	 */
	const initialise = function() {
		networkEl.dataset.disabled = 'true';
		networkEl.querySelector('input').setAttribute('disabled', 'disabled');
	};
	
	initialise();

	return {
		getId,
		terminate,
	};
}
