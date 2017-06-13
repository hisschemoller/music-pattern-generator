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
        midiNetwork = {},
        midiRemote = {},
        midiSync = {},
        transport = {};

    // Add functionality to the modules and inject dependencies.
    WH.createAppView({
        that: appView,
        midiNetwork: midiNetwork
    });
    WH.createCanvasView({
        that: canvasView,
        midiNetwork: midiNetwork
    });
    WH.createControlsView({
        that: controlsView,
        midiRemote: midiRemote,
        preferencesView: preferencesView,
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
        midiSync: midiSync,
        transport: transport
    });
    WH.createMIDIRemote({
        that: midiRemote,
        remoteView: remoteView
    });
    WH.createMIDISync({
        that: midiSync
    });
    WH.createMIDINetwork({
        that: midiNetwork,
        appView: appView,
        canvasView: canvasView,
        midiRemote: midiRemote,
        preferencesView: preferencesView
    });
    WH.createTransport({
        that: transport,
        canvasView: canvasView,
        controlsView: controlsView,
        midiNetwork: midiNetwork
    });

    // initialise
    midi.setup();
    file.setup();
    transport.run();
});
