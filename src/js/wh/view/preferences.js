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
        // midiPortViews = [],
        midiInputsViews = [],
        midiOutputsViews = [],
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
                    
                    case e.detail.actions.ADD_MIDI_PORT:
                        createMIDIPortView(e.detail.state, e.detail.action.isInput);
                        break;
                    
                    case e.detail.actions.REMOVE_MIDI_PORT:
                        deleteMIDIPortView(e.detail.state, e.detail.action.isInput);
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
         * Create view for a MIDI input or output port.
         * @param {Boolean} isInput True if the port in an input.
         * @param {Object} port MIDI port object.
         */
        createMIDIPortView = function(state, isInput) {
            let data, views, createFunction, parentEl;
            if (isInput) {
                data = state.inputs;
                views = midiInputsViews;
                createFunction = createMIDIInputView;
                parentEl = midiInputsEl;
            } else {
                data = state.outputs;
                views = midiOutputsViews;
                createFunction = createMIDIOutputView;
                parentEl = midiOutputsEl;
            }

            for (let i = 0, n = data.length; i < n; i++) {
                let isFound = false;
                for (let j = 0, p = views.length; j < p; j++) {
                    if (data[i].id === views[j].getID()) {
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    let view = createFunction({
                        store: store,
                        id: data[i].id,
                        name: data[i].name,
                        parentEl: parentEl
                    });
                    views.splice(i, 0, view);
                }
            }

            // var view;
            // if (isInput) {
            //     view = ns.createMIDIInputView({
            //         parentEl: midiInputsEl,
            //         port: port
            //     });
            // } else {
            //     view = ns.createMIDIOutputView({
            //         parentEl: midiOutputsEl,
            //         port: port
            //     });
            // }
            // midiPortViews.push(view);
        },

        /**
         * Delete view for a MIDI input or output processor.
         * @param  {Object} processor MIDI processor for a MIDI input or output.
         */
        deleteMIDIPortView = function(state, isInput) {
            if (isInput) {
                data = state.inputs;
                views = midiInputsViews;
            } else {
                data = state.outputs;
                views = midiOutputsViews;
            }
            var n = views.length;
            while (--n >= 0) {
                let isFound = false;
                for (let i = 0, p = data.length; i < p; i++) {
                    if (data[i].id === views[n].getID()) {
                        isFound = true;
                        break
                    }
                }
                if (!isFound) {
                    views[n].terminate();
                    views.splice(n, 1);
                    return;
                }

                // if (midiPortViews[n].hasProcessor(processor)) {
                //     midiPortViews[n].terminate();
                //     midiPortViews.splice(n, 1);
                //     return false;
                // }
            }
        };

    that = specs.that;

    init();
    
    return that;
}
