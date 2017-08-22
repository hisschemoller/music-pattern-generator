/**
 * Main application view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createAppView(specs, my) {
        var that,
            midiNetwork = specs.midiNetwork,
            rootEl = document.querySelector('#app'),
            helpEl = document.querySelector('.help'),
            prefsEl = document.querySelector('.prefs'),
            settingsEl = document.querySelector('.settings'),
            remoteEl = document.querySelector('.remote'),
            settingsViews = [],
            
            /**
             * Create settings controls view for a processor.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            createSettingsView = function(processor) {
                var settingsView = ns.createSettingsView({
                    midiNetwork: midiNetwork,
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
            
            toggleHelp = function(isVisible) {
                helpEl.dataset.show = isVisible;;
            },
            
            togglePreferences = function(isVisible) {
                prefsEl.dataset.show = isVisible;;
            },
            
            toggleRemote = function(isVisible) {
                remoteEl.dataset.show = isVisible;;
            },
            
            toggleSettings = function(isVisible) {
                settingsEl.dataset.show = isVisible;;
            };
        
        that = specs.that || {};
        
        that.createSettingsView = createSettingsView;
        that.deleteSettingsView = deleteSettingsView;
        that.toggleHelp = toggleHelp;
        that.togglePreferences = togglePreferences;
        that.toggleRemote = toggleRemote;
        that.toggleSettings = toggleSettings;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
