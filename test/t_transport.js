window.WH = window.WH || {};

(function (ns) {
    
    function createTransport(specs) {
        var that,
            playheadPosition = 0,
            scanStart = 0,
            scanEnd = 0;
            lookAhead = 0.2,
            isRunning = false,
            needsScan = false,
            
            scheduleNotesInScanRange = function () {
                if (needsScan) {
                    needsScan = false;
                    console.log(scanStart.toFixed(2), scanEnd.toFixed(2));
                }
            },
            
            run = function() {
                if (isRunning) {
                    var now = performance.now() / 1000;
                    if (scanEnd - now < 0.0167) {
                        scanStart = scanEnd;
                        scanEnd = scanStart + lookAhead;
                        needsScan = true;
                    }
                    scheduleNotesInScanRange();
                }
                requestAnimationFrame(run);
            },
            
            start = function() {
                isRunning = true;
            },
            
            pause = function () {
                isRunning = false;
            },
            
            initDOMEvents = function() {
                document.addEventListener('keydown', function(e) {
                    switch (e.keyCode) {
                        case 49: // 1
                            start();
                            break;
                        case 50: // 2
                            pause();
                            break;
                    }
                });
            };
        
        that = specs.that;
        
        initDOMEvents();
        run();
        
        that.start = start;
        return that;
    };
    
    ns.createTransport = createTransport;

})(WH);
