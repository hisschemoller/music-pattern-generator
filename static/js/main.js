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
        arrangement = {},
        // epgCanvas = {},
        epgControls = {},
        // epgModel = {}, 
        epgPreferences = {},
        // epgSettings = {},
        file = {},
        midi = {},
        midiNetwork = {},
        transport = {},
        world = {};
        
    WH.pubSub = WH.createPubSub();
    
    // Add functionality to the modules and inject dependencies.
    WH.createAppView({
        that: appView
    });
    WH.createArrangement({
        that: arrangement
    });
    // WH.createEPGCanvas({
    //     that: epgCanvas,
    //     epgModel: epgModel
    // });
    WH.createEPGControls({
        that: epgControls,
        transport: transport
    });
    // WH.createEPGModel({
    //     that: epgModel,
    //     arrangement: arrangement,
    //     // epgCanvas: epgCanvas,
    //     epgSettings: epgSettings,
    //     file: file,
    //     midi: midi,
    //     transport: transport
    // });
    WH.createEPGPreferences({
        that: epgPreferences,
        midi: midi
    });
    // WH.epg.createEPGSettings({
    //     that: epgSettings,
    //     // epgModel: epgModel
    // });
    WH.createFile({
        that: file,
        arrangement: arrangement,
        // epgModel: epgModel,
        midi: midi,
        transport: transport
    });
    WH.createMIDI({
        that: midi,
        app: app,
        epgControls: epgControls,
        epgPreferences: epgPreferences,
        transport: transport
    });
    WH.createMIDINetwork({
        that: midiNetwork,
        appView: appView,
        world: world
    });
    WH.createTransport({
        that: transport,
        midiNetwork: midiNetwork,
        world: world
        // arrangement: arrangement,
        // epgModel: epgModel
    });
    WH.createWorld({
        that: world
    });
    
    // initialise
    midi.enable();
    world.setup();
    file.setup();
    transport.run();
});
