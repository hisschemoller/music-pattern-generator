/**
 * Preferences settings view.
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    function createPreferencesView(specs) {
        var that,
            preferencesEl = document.querySelector('.prefs'),
            midiInputsEl = document.querySelector('.prefs__inputs'),
            midiOutputsEl = document.querySelector('.prefs__outputs'),
            midiPortViews = [],
            
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
        
        that.createMIDIPortView = createMIDIPortView;
        that.deleteMIDIPortView = deleteMIDIPortView;
        that.toggle = toggle;
        return that;
    }

    ns.createPreferencesView = createPreferencesView;

})(WH);
