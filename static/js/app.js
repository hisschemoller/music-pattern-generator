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
        patternCanvas: patternCanvas,
        patternSettings: patternSettings
    });
    WH.epg.createPatternCanvas({
        that: patternCanvas,
        patterns: patterns
    });
    WH.epg.createPatternSettings({
        that: patternSettings,
        patterns: patterns
    });
    
    // temporary setup
    arrangement.setData({
        patterns: [{
            tracks: []
        }],
        song: []
    });
    patterns.createPattern({
        steps: 16,
        pulses: 1,
        rotation: 3,
        canvasX: 10,
        canvasY: 10
    });
    patterns.createPattern({
        steps: 10,
        pulses: 3,
        canvasX: 10,
        canvasY: 20
    });
    patterns.createPattern({
        steps: 13,
        pulses: 3,
        canvasX: 10,
        canvasY: 30,
        name: 'test'
    });
    transport.setBPM(140);
    transport.start();
});
