window.WH = window.WH || {};

(function (ns) {
    
    function createTransport(specs) {
        var that,
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
            
            setScanRange = function (start) {
                scanStart = start;
                scanEnd =  scanStart + lookAhead;
                needsScan = true;
            },
            
            run = function() {
                if (isRunning) {
                    scheduleNotesInScanRange();
                    var now = performance.now() / 1000;
                    if (scanEnd - now < 0.0167) {
                        setScanRange(scanEnd);
                    }
                }
                requestAnimationFrame(run);
            },
            
            start = function() {
                isRunning = true;
            },
            
            pause = function () {
                isRunning = false;
            },
            
            rewind = function () {
                setScanRange(0);
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
                        case 51: // 3
                            pause();
                            rewind();
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
