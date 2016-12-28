/**
 * Main app.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createApp(specs, my) {
        var that,
            appView = specs.appView,
            midiNetwork = specs.midiNetwork,
            
            addProcessor = function(type, specs) {
                var processor = midiNetwork.createProcessor(type, specs);
                var settingsView = ns.createSettingsView({
                    processor: processor
                });
                appView.addSettingsView(settingsView);
            },
            
            removeProcessor = function() {
                // remove processor from midiNetwork
                // remove settingsView from appView
            };
        
        that = specs.that || {};
        
        that.addProcessor = addProcessor;
        return that;
    };

    ns.createApp = createApp;

})(WH);
