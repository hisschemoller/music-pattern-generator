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
        transport: transport,
        epgCanvas: epgCanvas,
        epgSettings: epgSettings,
        file: file
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
        transport: transport
    });
    WH.createMidi({
        that: midi
    });
    WH.createTransport({
        that: transport,
        arrangement: arrangement,
        epgModel: epgModel
    });
    
    // initialise
    epgCanvas.setup();
    file.createNew();
    midi.enable();
    transport.run();
});
