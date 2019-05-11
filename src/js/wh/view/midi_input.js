import createMIDIBaseView from './midi_base.js';

/**
 * MIDI Input processor view.
 */
export default function createMIDIInputView(specs, my) {
    var that,
        
        /**
         * This init function is called after the base view's initialise function,
         * so properties of on 'my' are available.
         */
        init = function() {
            my.networkEl.dataset.disabled = 'true';
            my.networkEl.querySelector('input').setAttribute('disabled', 'disabled');
            my.syncEl.dataset.disabled = 'true';
            my.syncEl.querySelector('input').setAttribute('disabled', 'disabled');
        };
        
    my = my || {};
    
    that = createMIDIBaseView(specs, my);
    
    init();

    return that;
}
