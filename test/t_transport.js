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
                console.log(scanStart, scanEnd);
                // arrangement.scanEvents(sec2tick(scanStart / 1000), sec2tick(scanEnd / 1000), playbackQueue);
                if (playbackQueue.length) {
                    n = playbackQueue.length;
                    for (i = 0; i < n; i++) {
                        step = playbackQueue[i];
                        // scanStart and scanEnd are in time since page load,
                        // for web audio (sperformance.now() - audioContext.currentTime) should be added
                        // and milliseconds converted to seconds
                        
                        // for web MIDI, time is milliseconds since document loaded
                    }
                }
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
                    scheduleNotesInScanRange();
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
