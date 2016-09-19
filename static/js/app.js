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
        epgModel = {}, 
        epgSettings = {},
        transport = {},
        file = {};
    
    // Add functionality to the modules and inject dependencies.
    WH.createArrangement({
        that: arrangement
    });
    WH.core.createTransport({
        that: transport,
        arrangement: arrangement,
        epgModel: epgModel
    });
    WH.createEPGModel({
        that: epgModel,
        arrangement: arrangement,
        transport: transport,
        epgCanvas: epgCanvas,
        epgSettings: epgSettings,
        file: file
    });
    WH.createEPGCanvas({
        that: epgCanvas,
        epgModel: epgModel
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
    
    // initialise
    epgCanvas.setup();
    file.createNew();
    transport.start();
});
