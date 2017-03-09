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
            settingsViews = [],
            
            /**
             * Create settings controls view for a processor.
             * @param  {String} type Type of processor for which to create the view.
             * @param  {Object} processor MIDI processor to control with the settings.
             */
            createSettingsView = function(type, processor) {
                switch (type) {
                    case 'epg':
                        var settingsView = ns.createSettingsView({
                            type: type,
                            processor: processor,
                            parentEl: settingsEl
                        });
                        settingsViews.push(settingsView);
                        break;
                        
                    case 'input':
                    case 'output':
                        
                        break;
                }
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
            };
            
            // toggleMidiLearnMode = function(isLearnMode, addParamCallback) {
            //     var n = settingsViews.length;
            //     while (--n >= 0) {
            //         settingsViews[n].toggleLearnMode(isLearnMode, addParamCallback);
            //     }
            // };
        
        that = specs.that || {};
        
        that.createSettingsView = createSettingsView;
        that.deleteSettingsView = deleteSettingsView;
        // that.toggleMidiLearnMode = toggleMidiLearnMode;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
