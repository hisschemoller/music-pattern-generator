import createMIDIInputView from './midi_input';
import createMIDIOutputView from './midi_output';

/**
 * Preferences settings view.
 */
export default function createPreferencesView(specs) {
    var that,
        store = specs.store,
        preferencesEl = document.querySelector('.prefs'),
        midiInputsEl = document.querySelector('.prefs__inputs'),
        midiOutputsEl = document.querySelector('.prefs__outputs'),
        midiPortViews = [],
        controls = {
            darkTheme: {
                type: 'checkbox',
                input: document.querySelector('.prefs__dark-theme')
            }
        },

        init = function() {
            controls.darkTheme.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().setTheme(e.target.checked));
            });

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.SET_PREFERENCES:
                    case e.detail.actions.SET_THEME:
                        updateControl('dark-theme', e.detail.state.preferences.isDarkTheme);
                        break;
                    
                    case e.detail.actions.MIDI_PORT_CHANGE:
                        updateMIDIPortViews(e.detail.state.ports);
                        break;
                }
            });
        },

        /**
         * Callback function to update one of the controls after if the
         * preference's state changed.
         * @param {String} key Key that indicates the control.
         * @param {Boolean} value Value of the control.
         */
        updateControl = function(key, value) {
            switch (key) {
                case 'dark-theme':
                    controls.darkTheme.input.checked = value;
                    break;
            }
        },

        /**
         * Update lists of ports after a change.
         * @param {Array} ports MIDI port objects.
         */
        updateMIDIPortViews = function(ports) {
            ports.allIds.forEach(id => {
                const port = ports.byId[id];
                let view = midiPortViews.find(view => port.id === view.getID());
                if (view && port.state === 'disconnected') {
                    view.terminate();
                    midiPortViews.splice(midiPortViews.findIndex(view => port.id === view.getID()), 1);
                }
                if (!view && port.state === 'connected') {
                    let createFunction, parentEl;
                    if (port.type === 'input') {
                        createFunction = createMIDIInputView;
                        parentEl = midiInputsEl;
                    } else {
                        createFunction = createMIDIOutputView;
                        parentEl = midiOutputsEl;
                    }
                    midiPortViews.push(createFunction({
                        store: store,
                        id: port.id,
                        name: port.name,
                        parentEl: parentEl,
                        isInput: port.type === 'input'
                    }));
                }
            });
        };

    that = specs.that;

    init();

    return that;
}
