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
            world = specs.world,
            
            addProcessor = function(type, specs) {
                var processor = midiNetwork.createProcessor(type, specs);
                appView.createSettingsView(processor);
                switch (type) {
                    case 'epg':
                        ns.createWorldEPGView({
                            processor: processor,
                            object3d: world.createObject(type, processor)
                        });
                        break;
                }
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
