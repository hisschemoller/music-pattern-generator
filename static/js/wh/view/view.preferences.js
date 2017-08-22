/**
 * Preferences settings view.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createPreferencesView(specs) {
        var that,
            canvasView = specs.canvasView,
            preferences = specs.preferences,
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
                preferences.addThemeCallback(updateControl);

                controls.darkTheme.input.addEventListener('change', function(e) {
                    preferences.enableDarkTheme(e.target.checked);
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
                        document.querySelector('#app').dataset.theme = value ? 'dark' : '';
                        var themeStyles = window.getComputedStyle(document.querySelector('[data-theme]'))
                        canvasView.setTheme({
                            colorHigh: themeStyles.getPropertyValue('--text-color'),
                            colorMid: themeStyles.getPropertyValue('--border-color'),
                            colorLow: themeStyles.getPropertyValue('--panel-bg-color')
                        });
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

    ns.createPreferencesView = createPreferencesView;

})(WH);
