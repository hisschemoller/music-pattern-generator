/**
 * Main application view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createAppView(specs, my) {
        var that,
            rootEl = document.getElementById('app'),
            settingsEl = document.getElementById('settings'),
            midiInputsEl = document.querySelector('.prefs__inputs'),
            midiOutputsEl = document.querySelector('.prefs__outputs'),
            settingsViews = [],
            midiPortViews = [],
            
            /**
             * Create settings controls view for a processor.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            createSettingsView = function(processor) {
                var settingsView = ns.createSettingsView({
                    processor: processor,
                    parentEl: settingsEl
                });
                settingsViews.push(settingsView);
            },
            
            /**
             * Delete settings controls view for a processor.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            deleteSettingsView = function(processor) {
                var n = settingsViews.length;
                while (--n >= 0) {
                    if (settingsViews[n].hasProcessor(processor)) {
                        settingsViews[n].terminate();
                        settingsViews.splice(n, 1);
                        return false;
                    }
                }
            },
            
            /**
             * Create view for a MIDI input ou output processor.
             * @param  {Object} processor MIDI processor for a MIDI input or output.
             */
            createMIDIPortView = function(processor) {
                var view;
                switch (processor.getType()) {
                    case 'input':
                        view = ns.createMIDIInputView({
                            processor: processor,
                            parentEl: midiInputsEl
                        });
                        break;
                    case 'output':
                        view = ns.createMIDIOutputView({
                            processor: processor,
                            parentEl: midiOutputsEl
                        });
                        break;
                }
                midiPortViews.push(view);
            },
            
            /**
             * Delete view for a MIDI input ou output processor.
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
        
        that = specs.that || {};
        
        that.createSettingsView = createSettingsView;
        that.deleteSettingsView = deleteSettingsView;
        that.createMIDIPortView = createMIDIPortView;
        that.deleteMIDIPortView = deleteMIDIPortView;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
