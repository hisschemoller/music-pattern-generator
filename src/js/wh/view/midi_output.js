import createMIDIBaseView from './midi_base';

/**
 * MIDI Output processor view.
 */
export default function createMIDIOutputView(specs, my) {
    var that,
        
        /**
         * This init function is called after the base view's initialise function,
         * so properties of on 'my' are available.
         */
        init = function() {
            my.syncEl.dataset.disabled = 'true';
            my.syncEl.querySelector('input').setAttribute('disabled', 'disabled');
            my.remoteEl.dataset.disabled = 'true';
            my.remoteEl.querySelector('input').setAttribute('disabled', 'disabled');
        };
        
    my = my || {};
    
    that = createMIDIBaseView(specs, my);
    
    init();

    return that;
}
