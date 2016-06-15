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
        transport = {};
    
    // Add functionality to the modules and inject dependencies.
    WH.createArrangement({
        that: arrangement
    });
    WH.core.createTransport({
        that: transport,
        arrangement: arrangement,
        patterns: patterns
    });
    WH.epg.createPatterns({
        that: patterns,
        arrangement: arrangement,
        transport: transport,
        patternCanvas: patternCanvas
    });
    WH.epg.createPatternCanvas({
        that: patternCanvas
    });
    
    // temporary setup
    arrangement.setData({
        patterns: [{
            tracks: []
        }],
        song: []
    });
    patterns.createPattern();
    patterns.createPattern({
        steps: 10,
        pulses: 3
    });
    patterns.createPattern({
        steps: 13,
        pulses: 3
    });
    transport.setBPM(120);
    transport.start();
});
