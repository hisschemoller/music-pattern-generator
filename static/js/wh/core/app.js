/**
 * App stores UI state that's rendered in AppView.
 */
window.WH = window.WH || {};

(function (WH) {
    
    function createApp(specs, my) {
        let that,
            appView = specs.appView,
            transport = specs.transport,
            panelStates = {
                help: false
            },
            
            togglePanel = function(panelID, isVisible) {
                console.log(panelID, isVisible);
                if (typeof panelStates[panelID] == 'boolean') {
                    panelStates[panelID] = isVisible;
                    appView.showPanel(panelStates[panelID]);
                }
            },
            
            updateTransport = function(property, value) {
                switch(property) {
                    case 'bpm':
                        transport.setBPM(value);
                        break;
                    case 'play':
                        transport.toggleStartStop();
                        break;
                }
            },
            
            transportUpdated = function(property, value) {
                appView.updateControl(property, value);
            };
        
        that = specs.that || {};
        
        that.togglePanel = togglePanel;
        that.updateTransport = updateTransport;
        that.transportUpdated = transportUpdated;
        return that;
    }

    WH.createApp = createApp;

})(WH);