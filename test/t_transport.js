window.WH = window.WH || {};

(function (ns) {
    
    function createSequencer (specs, my) {
        var that,
            arrangement = specs.arrangement,
            ppqn = 480,
            bpm = 120,
            lastBpm = bpm,
            tickInSeconds,
            playbackQueue = [],
            
            scanEvents = function(scanStart, scanEnd) {
                var i, n;
                // arrangement.scanEvents(sec2tick(scanStart), sec2tick(scanEnd), playbackQueue);
                if (playbackQueue.length) {
                    n = playbackQueue.length;
                    for (i = 0; i < n; i++) {
                        step = playbackQueue[i];
                        
                    }
                }
                
                // var now = performance.now() / 1000;
                // console.log(scanStart - now, scanEnd - now);
                // console.log(scanStart.toFixed(2), scanEnd.toFixed(2));
                    // , sec2tick(scanStart).toFixed(2), sec2tick(scanEnd).toFixed(2));
            },
            
            setBPM = function(newBpm) {
                bpm = (newBpm || 120);
                var beatInSeconds = 60.0 / bpm;
                tickInSeconds = beatInSeconds / ppqn;
                // calculate change factor
                var factor = lastBpm / bpm;
                my.setLoopByFactor(factor);
            },
            
            sec2tick = function (sec) {
                return sec / tickInSeconds;
            };
        
        my = my || {};
        my.scanEvents = scanEvents;
        
        that = specs.that || {};
        
        setBPM(bpm);
        
        that.setBPM = setBPM;
        return that;
    }
    
    function createTransport(specs, my) {
        var that,
            position = 0,
            origin = 0,
            scanStart = 0,
            scanEnd = 0;
            lookAhead = 200,
            loopStart = 0,
            loopEnd = 0,
            playheadOrigin = 0,
            playheadPosition = 0,
            isRunning = false,
            isLooping = false,
            needsScan = false,
            
            scheduleNotesInScanRange = function () {
                if (needsScan) {
                    needsScan = false;
                    // console.log((scanStart).toFixed(2), (scanEnd).toFixed(2), origin);
                    console.log((scanStart - origin).toFixed(2), (scanEnd - origin).toFixed(2), origin);
                    my.scanEvents(scanStart - origin, scanEnd - origin);
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
                    position = performance.now();
                    if (isLooping && loopEnd < scanEnd + lookAhead) {
                        // Inaccurate: playback jumps 
                        // from just before loopEnd to just before loopStart, 
                        // but that shouldn't be a problem if lookAhead is small
                        setScanRange(loopStart + loopEnd - scanEnd - lookAhead);
                    } else {
                        if (scanEnd - position < 16.7) {
                            setScanRange(scanEnd);
                        }
                    }
                }
                requestAnimationFrame(run);
            },
            
            start = function() {
                var offset = position - origin;
                position = performance.now();
                origin = position - offset;
                setScanRange(position);
                isRunning = true;
            },
            
            pause = function () {
                isRunning = false;
            },
            
            rewind = function () {
                position = performance.now();
                origin = position;
                setScanRange(position);
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
            
            setLoopByFactor = function(factor) {
                setLoopStart(loopStart * factor);
                setLoopEnd(loopEnd * factor);
            },
            
            initDOMEvents = function() {
                document.addEventListener('keydown', function(e) {
                    switch (e.keyCode) {
                        case 49: // 1
                            console.log('start');
                            start();
                            break;
                        case 50: // 2
                            console.log('pause');
                            pause();
                            break;
                        case 51: // 3
                            console.log('stop');
                            pause();
                            rewind();
                            break;
                        case 52: // 4
                            console.log('loop');
                            setLoopStart(1.5);
                            setLoopEnd(2.5);
                            setLoop(true);
                            break;
                    }
                });
            };
            
        my = my || {};
        my.setLoopByFactor = setLoopByFactor;
        
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
