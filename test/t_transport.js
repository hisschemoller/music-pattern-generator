/*
Transport is in milliseconde sinds document load.
Arrangement is in ticks vanaf tijdlijn start.
Web MIDI verwacht een timestamp in milliseconde sinds document load.
Web Audio verwacht een timestamp in seconde sinds AudioContext creation.
Sequencer moet alles voor iedereen vertalen.
*/

window.WH = window.WH || {};

(function (ns) {
    
    function createSequencer (specs, my) {
        var that,
            arrangement = specs.arrangement,
            ppqn = 480,
            bpm = 120,
            lastBpm = bpm,
            tickInSeconds,
            audioContextOffset = 0,
            timelineOffset = 0,
            playbackQueue = [],
            
            scanEvents = function(scanStart, scanEnd) {
                var scanStartTimeline = sec2tick((scanStart - timelineOffset) / 1000);
                var scanEndTimeline = sec2tick((scanEnd - timelineOffset) / 1000);
                console.log(scanStartTimeline.toFixed(2), scanEndTimeline.toFixed(2), timelineOffset);
                // arrangement.scanEvents(scanStartTimeline, scanEndTimeline, playbackQueue);
                if (playbackQueue.length) {
                    var n = playbackQueue.length;
                    for (var i = 0; i < n; i++) {
                        var step = playbackQueue[i];
                        step.setStartMidi(tick2sec(step.getStart() * 1000) + timelineOffset);
                        step.setDurationMidi(tick2sec(step.getDuration() * 1000) + timelineOffset);
                    }
                }
            },
            
            sec2tick = function (sec) {
                return sec / tickInSeconds;
            },
            
            tick2sec = function (tick) {
                return tick * tickInSeconds;
            }
            
            setBPM = function(newBpm) {
                bpm = (newBpm || 120);
                var beatInSeconds = 60.0 / bpm;
                tickInSeconds = beatInSeconds / ppqn;
                // calculate change factor
                var factor = lastBpm / bpm;
                my.setLoopByFactor(factor);
            },
            
            setTimelineOffset = function(timelineOrigin) {
                timelineOffset = performance.now() - timelineOrigin;
            },
            
            setAudioContextOffset = function(acCurrentTime) {
                audioContextOffset = performance.now() - (acCurrentTime * 1000);
            };
        
        my = my || {};
        my.scanEvents = scanEvents;
        my.setTimelineOffset = setTimelineOffset;
        
        that = specs.that || {};
        
        setBPM(bpm);
        
        that.setBPM = setBPM;
        that.setAudioContextOffset = setAudioContextOffset;
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
            
            setOrigin = function(newOrigin) {
                origin = newOrigin;
                my.setTimelineOffset(origin);
            },
            
            run = function() {
                if (isRunning) {
                    position = performance.now();
                    if (isLooping && loopEnd < scanEnd + lookAhead) {
                        // Inaccurate: playback jumps 
                        // from just before loopEnd to just before loopStart, 
                        // but that shouldn't be a problem if lookAhead is small
                        var newScanStart = loopStart + loopEnd - scanEnd - lookAhead;
                        setOrigin(newScanStart);
                        setScanRange(newScanStart);
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
                setOrigin(position - offset);
                setScanRange(position);
                isRunning = true;
            },
            
            pause = function () {
                isRunning = false;
            },
            
            rewind = function () {
                position = performance.now();
                setOrigin(position);
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
