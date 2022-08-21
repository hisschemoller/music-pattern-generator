import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Output processor view.
 */
export default function createMIDIOutputView(data) {

	const { getId, remoteEl, terminate } = createMIDIBaseView(data);

	/**
	 * This initialise function is called after the base view's initialise function,
	 * so properties of the base view are available.
	 */
	const initialise = function() {
		remoteEl.dataset.disabled = 'true';
		remoteEl.querySelector('input').setAttribute('disabled', 'disabled');
	};
	
	initialise();

	return {
		getId,
		getIsInput: () => false,
		terminate,
	};
}
