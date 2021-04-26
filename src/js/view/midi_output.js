import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Output processor view.
 */
export default function createMIDIOutputView(data) {

	const { getId, remoteEl, syncEl, terminate } = createMIDIBaseView(data);

	/**
	 * This initialise function is called after the base view's initialise function,
	 * so properties of the base view are available.
	 */
	const initialise = function() {
		syncEl.dataset.disabled = 'true';
		syncEl.querySelector('input').setAttribute('disabled', 'disabled');
		remoteEl.dataset.disabled = 'true';
		remoteEl.querySelector('input').setAttribute('disabled', 'disabled');
	};
	
	initialise();

	return {
		getId,
		terminate,
	};
}
