window.WH = window.WH || {};

(function (ns) {
    
    function createSequencer (specs, my) {
        var that,
            
            scanEvents = function(scanStart, scanEnd) {
                console.log(scanStart.toFixed(2), scanEnd.toFixed(2));
            };
        
        my = my || {};
        my.scanEvents = scanEvents;
        
        that = specs.that || {};
        
        return that;
    }
    
    function createTransport(specs, my) {
        var that,
            scanStart = 0,
            scanEnd = 0;
            lookAhead = 0.2,
            loopStart = 0,
            loopEnd = 0;
            isRunning = false,
            isLooping = false,
            needsScan = false,
            
            scheduleNotesInScanRange = function () {
                if (needsScan) {
                    needsScan = false;
                    my.scanEvents(scanStart, scanEnd);
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
                    if (isLooping && loopEnd < scanEnd + lookAhead) {
                        // Inaccurate: playback jumps 
                        // from just before loopEnd to just before loopStart, 
                        // but that shouldn't be a problem if lookAhead is small
                        setScanRange(loopStart + loopEnd - scanEnd - lookAhead);
                    } else {
                        if (scanEnd - now < 0.0167) {
                            setScanRange(scanEnd);
                        }
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
            
            setLoopStart = function (position) {
                loopStart = position;
            },
            
            setLoopEnd = function (position) {
                loopEnd = position;
            },
            
            setLoop = function (isEnabled, startPosition, endPosition) {
                isLooping = isEnabled;
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
                        case 52: // 4
                            setLoopStart(1.5);
                            setLoopEnd(2.5);
                            setLoop(true);
                            break;
                    }
                });
            };
            
        my = my || {};
        
        that = createSequencer(specs, my);
        
        initDOMEvents();
        run();
        
        that.start = start;
        that.pause = pause;
        that.rewind = rewind;
        that.setLoopStart = setLoopStart;
        that.setLoopEnd = setLoopEnd;
        that.setLoop = setLoop;
        return that;
    };
    
    ns.createTransport = createTransport;

})(WH);
