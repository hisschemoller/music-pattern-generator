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
            transportOrigin = 0,
            playbackQueue = [],
            
            scanEvents = function(scanStart, scanEnd) {
                var scanStartTimeline = sec2tick((scanStart - transportOrigin) / 1000);
                var scanEndTimeline = sec2tick((scanEnd - transportOrigin) / 1000);
                // console.log(scanStartTimeline.toFixed(2), scanEndTimeline.toFixed(2), transportOrigin);
                // arrangement.scanEvents(scanStartTimeline, scanEndTimeline, playbackQueue);
                if (playbackQueue.length) {
                    var n = playbackQueue.length;
                    for (var i = 0; i < n; i++) {
                        var step = playbackQueue[i];2
                        step.setStartMidi(tick2sec(step.getStart() * 1000) + transportOrigin);
                        step.setDurationMidi(tick2sec(step.getDuration() * 1000) + transportOrigin);
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
            
            setTransportOrigin = function(origin) {
                transportOrigin = origin;
            },
            
            setAudioContextOffset = function(acCurrentTime) {
                audioContextOffset = performance.now() - (acCurrentTime * 1000);
            };
        
        my = my || {};
        my.scanEvents = scanEvents;
        my.setTransportOrigin = setTransportOrigin;
        
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
                    // console.log(scanStart.toFixed(2), scanEnd.toFixed(2), origin);
                    my.scanEvents(scanStart, scanEnd);
                }
            },
            
            setScanRange = function (start) {
                scanStart = start;
                scanEnd =  scanStart + lookAhead;
                needsScan = true;
            },
            
            setOrigin = function(newOrigin) {
                loopStart = loopStart - origin + newOrigin;
                loopEnd = loopEnd - origin + newOrigin;
                origin = newOrigin;
                my.setTransportOrigin(newOrigin);
            },
            
            run = function() {
                if (isRunning) {
                    position = performance.now();
                    if (isLooping && position < loopEnd && scanStart < loopEnd && scanEnd > loopEnd) {
                        setOrigin(origin + (loopEnd - loopStart));
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
                loopStart = origin + position;
            },
            
            setLoopEnd = function (position) {
                loopEnd = origin + position;
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
                            setLoopStart(1500);
                            setLoopEnd(2500);
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
