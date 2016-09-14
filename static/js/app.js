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
        epgModel = {}, 
        epgSettings = {},
        canvas3d = {},
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
        canvas3d: canvas3d,
        epgSettings: epgSettings,
        file: file
    });
    WH.createCanvas3d({
        that: canvas3d,
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
    file.createNew();
    transport.start();
});
