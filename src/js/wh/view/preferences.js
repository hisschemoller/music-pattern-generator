/**
 * Preferences settings view.
 */
export default function createPreferencesView(specs) {
    var that,
        store = specs.store,
        canvasView = specs.canvasView,
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
        createMIDIPortView = function(isInput, port) {
            var view;
            if (isInput) {
                view = ns.createMIDIInputView({
                    parentEl: midiInputsEl,
                    port: port
                });
            } else {
                view = ns.createMIDIOutputView({
                    parentEl: midiOutputsEl,
                    port: port
                });
            }
            midiPortViews.push(view);
        },

        /**
         * Delete view for a MIDI input or output processor.
         * @param  {Object} processor MIDI processor for a MIDI input or output.
         */
        deleteMIDIPortView = function(processor) {
            var n = midiPortViews.length;
            while (--n >= 0) {
                if (midiPortViews[n].hasProcessor(processor)) {
                    midiPortViews[n].terminate();
                    midiPortViews.splice(n, 1);
                    return false;
                }
            }
        };

    that = specs.that;

    init();

    that.createMIDIPortView = createMIDIPortView;
    that.deleteMIDIPortView = deleteMIDIPortView;
    return that;
}
