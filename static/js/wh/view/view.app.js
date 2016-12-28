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
            
            addSettingsView = function(settingsView) {
                settingsViews.push(settingsView);
            };
        
        that = specs.that || {};
        
        that.addSettingsView = addSettingsView;
        return that;
    };

    ns.createAppView = createAppView;

})(WH);
