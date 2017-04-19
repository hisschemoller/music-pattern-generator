/**
 * @description Euclidean Pattern Generator
 * @author Wouter Hisschemöller
 * @version 0.0.0
 */

'use strict';

/**
 * Application startup.
 */
document.addEventListener('DOMContentLoaded', function(e) {
    
    // Create all objects that will be the modules of the app.
    var appView = {},
        canvasView = {},
        controlsView = {},
        fileView = {},
        preferencesView = {},
        remoteView = {},
        file = {},
        midi = {},
        midiRemote = {},
        midiNetwork = {},
        transport = {};
        
    WH.pubSub = WH.createPubSub();
    
    // Add functionality to the modules and inject dependencies.
    WH.createAppView({
        that: appView
    });
    WH.createCanvasView({
        that: canvasView,
        midiNetwork: midiNetwork
    });
    WH.createControlsView({
        that: controlsView,
        midiRemote: midiRemote,
        transport: transport
    });
    WH.createPreferencesView({
        that: preferencesView,
        midi: midi
    });
    WH.createRemoteView({
        that: remoteView,
        midiRemote: midiRemote
    });
    WH.createFile({
        that: file,
        midi: midi,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        transport: transport
    });
    WH.createFileView({
        that: fileView,
        file: file
    });
    WH.createMIDI({
        that: midi,
        app: app,
        controlsView: controlsView,
        preferencesView: preferencesView,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        transport: transport
    });
    WH.createMIDIRemote({
        that: midiRemote,
        remoteView: remoteView
    });
    WH.createMIDINetwork({
        that: midiNetwork,
        appView: appView,
        canvasView: canvasView,
        midiRemote: midiRemote
    });
    WH.createTransport({
        that: transport,
        canvasView: canvasView,
        midiNetwork: midiNetwork
    });
    
    // initialise
    midi.setup();
    file.setup();
    transport.run();
});
