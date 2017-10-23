/**
 * 
 */

window.WH = window.WH || {};

(function (WH) {

    function createMIDINetworkConnections(specs, my) {
        var that,
            app = specs.app,
            
            toggleConnections = function(isEnabled) {
                app.appUpdated('connections', isEnabled);
            };
        
        my = my || {};
        
        that = specs.that || {};
        
        that.toggleConnections = toggleConnections;
        return that;
    };

    WH.createMIDINetworkConnections = createMIDINetworkConnections;

})(WH);

