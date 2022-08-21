import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Input processor view.
 */
export default function createMIDIInputView(data) {

	const { getId, networkEl, terminate } = createMIDIBaseView(data);
	
	const initialise = function() {
		networkEl.dataset.disabled = 'true';
		networkEl.querySelector('input').setAttribute('disabled', 'disabled');
	};
	
	initialise();

	return {
		getId,
		getIsInput: () => true,
		terminate,
	};
}
