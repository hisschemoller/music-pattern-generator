/**
 * Preferences settings view.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {

    function createPreferencesView(specs) {
        var that,
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
                preferences.setViewCallback(updateControl);

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
                        console.log(themeStyles.color);
                        console.log(themeStyles.getPropertyValue('--text-color'));
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
            },

            /**
             * Toggle to show or hide the preferences panel.
             * @param  {Boolean} isVisible True to show the preferences.
             */
            toggle = function(isVisible) {
                preferencesEl.dataset.show = isVisible;
            };

        that = specs.that;

        init();

        that.createMIDIPortView = createMIDIPortView;
        that.deleteMIDIPortView = deleteMIDIPortView;
        that.toggle = toggle;
        return that;
    }

    ns.createPreferencesView = createPreferencesView;

})(WH);
