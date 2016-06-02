/**
 * @description Internal clock source.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 * 
 * @namespace WH.core
 */
 
 window.WH = window.WH || {};
 window.WH.core = window.WH.core || {};

(function (ns) {

    function createInternalClock() {
        var that,
            isRunning = false,
            runTimeStart = 0,
            callback,
            callbackData = {
                runTimeDuration: 0
            },
            run = function() {
                if (isRunning) {
                    callbackData.runTimeDuration = Date.now() - runTimeStart;
                    callback(callbackData);
                }
                requestAnimationFrame(run.bind(this));
            },
            start = function() {
                if (typeof callback === 'function') {
                    runTimeStart = Date.now();
                    callbackData.runTimeDuration = 0;
                    isRunning = true;
                } else {
                    console.log('Internal clock can\'t run because there\'s no callback function defined.');
                }
            },
            stop = function() {
                isRunning = false;
            },
            /**
             * Set a callback function.
             * @param {Function} callbackFunction
             */
            setCallback = function(callbackFunction) {
                callback = callbackFunction;
            };
        
        that = {};
        
        run();
        
        that.start = start;
        that.stop = stop;
        that.setCallback = setCallback;
        return that;
    }
    
    ns.createInternalClock = createInternalClock;
    
})(WH.core);
