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
    var arrangement = {},
        epgCanvas = {},
        epgControls = {},
        epgModel = {}, 
        epgPreferences = {},
        epgSettings = {},
        file = {},
        midi = {},
        midiNetwork = {},
        transport = {};
        
    WH.pubSub = WH.createPubSub();
    
    // Add functionality to the modules and inject dependencies.
    WH.createArrangement({
        that: arrangement
    });
    WH.createEPGCanvas({
        that: epgCanvas,
        epgModel: epgModel
    });
    WH.createEPGControls({
        that: epgControls,
        transport: transport
    });
    WH.createEPGModel({
        that: epgModel,
        arrangement: arrangement,
        epgCanvas: epgCanvas,
        epgSettings: epgSettings,
        file: file,
        midi: midi,
        transport: transport
    });
    WH.createEPGPreferences({
        that: epgPreferences,
        midi: midi
    });
    WH.epg.createEPGSettings({
        that: epgSettings,
        epgModel: epgModel
    });
    WH.createFile({
        that: file,
        arrangement: arrangement,
        epgModel: epgModel,
        midi: midi,
        transport: transport
    });
    WH.createMIDI({
        that: midi,
        epgControls: epgControls,
        epgModel: epgModel,
        epgPreferences: epgPreferences,
        midiNetwork: midiNetwork,
        transport: transport
    });
    WH.createMIDINetwork({
        that: midiNetwork
    });
    WH.createTransport({
        that: transport,
        arrangement: arrangement,
        epgModel: epgModel
    });
    
    // initialise
    midi.enable();
    epgCanvas.setup();
    file.setup();
    transport.run();
});
