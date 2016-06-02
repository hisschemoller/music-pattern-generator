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
    var clock = WH.core.createInternalClock(),
        patternsModel = WH.epg.createPatternsModel();
    
    patternsModel.createPattern({
        duration: // 8 beats vertaald in ms
    });
    clock.setCallback(patternsModel.onClock);
    clock.start();
});
