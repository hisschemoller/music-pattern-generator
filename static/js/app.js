/**
 * @description Euclidean Pattern Generator
 * @author Wouter Hisschemöller
 * @version 0.0.0
 */

'use strict';

/**
 * Application startup.
 */
$(function() {
    
    // Create all objects that will be the modules of the app.
    var arrangement = {},
        patterns = {}, 
        patternCanvas = {},
        patternSettings = {},
        transport {};
    
    // Add functionality to the modules and inject dependencies.
    WH.core.createTransport({
        that: transport,
        arrangement: arrangement,
        patternCanvas: patternCanvas
    });
    WH.epg.createPatterns({
        that: patterns,
        transport: transport
    });
    
    // temporary setup
    patterns.createPattern();
    clock.setCallback(patterns.onClock);
    clock.start();
});
hkccc8 
