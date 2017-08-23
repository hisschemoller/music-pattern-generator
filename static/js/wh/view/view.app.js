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
            panelsEl = document.querySelector('.panels'),
            helpEl = document.querySelector('.help'),
            prefsEl = document.querySelector('.prefs'),
            editEl = document.querySelector('.edit'),
            editContentEl = document.querySelector('.edit .panel__content'),
            remoteEl = document.querySelector('.remote'),
            settingsViews = [],
            panelHeaderHeight,
            
            init = function() {
                var style = getComputedStyle(document.body);
                panelHeaderHeight = parseInt(style.getPropertyValue('--header-height'), 10);
                
                window.addEventListener('resize', renderLayout, false);
                renderLayout();
            },
            
            /**
             * Create settings controls view for a processor.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            createSettingsView = function(processor) {
                var settingsView = ns.createSettingsView({
                    midiNetwork: midiNetwork,
                    processor: processor,
                    parentEl: editContentEl
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
            
            renderLayout = function() {
                const panelsHeight = panelsEl.clientHeight,
                    prefsHeight = prefsEl.querySelector('.panel__content').clientHeight,
                    remoteHeight = remoteEl.querySelector('.panel__content').clientHeight;
                console.log(panelsHeight, prefsHeight, remoteHeight);
            },
            
            toggleEdit = function(isVisible) {
                editEl.dataset.show = isVisible;
                renderLayout();
            },
            
            toggleHelp = function(isVisible) {
                helpEl.dataset.show = isVisible;
                renderLayout();
            },
            
            togglePreferences = function(isVisible) {
                prefsEl.dataset.show = isVisible;
                renderLayout();
            },
            
            toggleRemote = function(isVisible) {
                remoteEl.dataset.show = isVisible;
                renderLayout();
            };
        
        that = specs.that || {};
        
        init();
        
        that.createSettingsView = createSettingsView;
        that.deleteSettingsView = deleteSettingsView;
        that.toggleEdit = toggleEdit;
        that.toggleHelp = toggleHelp;
        that.togglePreferences = togglePreferences;
        that.toggleRemote = toggleRemote;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
