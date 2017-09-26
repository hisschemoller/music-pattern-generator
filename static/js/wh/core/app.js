/**
 * App stores UI state that's rendered in AppView.
 */
window.WH = window.WH || {};

(function (WH) {
    
    function createApp(specs, my) {
        let that,
            appView = specs.appView,
            midiRemote = specs.midiRemote,
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
            
            updateApp = function(property, value) {
                switch(property) {
                    case 'bpm':
                        transport.setBPM(value);
                        break;
                    case 'play':
                        transport.toggleStartStop();
                        break;
                    case 'learn':
                        midiRemote.toggleMidiLearn(value);
                        break;
                }
            },
            
            appUpdated = function(property, value) {
                appView.updateControl(property, value);
            };
        
        that = specs.that || {};
        
        that.togglePanel = togglePanel;
        that.updateApp = updateApp;
        that.appUpdated = appUpdated;
        return that;
    }

    WH.createApp = createApp;

})(WH);