/**
 * 
 */
export default function createMIDINetworkConnections(specs, my) {
    var that,
        app = specs.app,
        canvasView = specs.canvasView,
        isConnectModeEnabled = false,
        
        /**
         * Enter or leave application connect mode.
         * @param  {Boolean} isEnabled True to enable connect mode.
         */
        toggleConnections = function(isEnabled) {
            isConnectModeEnabled = isEnabled;
            canvasView.toggleConnectMode(isConnectModeEnabled);
            app.appUpdated('connections', isConnectModeEnabled);
        };
    
    my = my || {};
    
    that = specs.that || {};
    
    that.toggleConnections = toggleConnections;
    return that;
}
