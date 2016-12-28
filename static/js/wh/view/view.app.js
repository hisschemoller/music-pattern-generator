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
            
            createSettingsView = function(processor) {
                var settingsView = ns.createSettingsView({
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
