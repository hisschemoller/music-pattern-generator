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
                var settingsView = ns.createSettingsView({
                    type: type,
                    processor: processor
                });
                settingsViews.push(settingsView);
            };
        
        that = specs.that || {};
        
        that.createSettingsView = createSettingsView;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
