window.WH = window.WH || {};

(function (ns) {
    
    function createSequencer (specs, my) {
        var that,
            arrangement = specs.arrangement,
            epgModel = specs.epgModel, 
            ppqn = 480,
            bpm = 120,
            lastBpm = bpm,
            tickInMilliseconds,
            audioContextOffset = 0,
            timelineOffset = 0,
            transportOrigin = 0,
            playbackQueue = [],
            
            scanEvents = function(scanStart, scanEnd) {
                var scanStartTimeline = msec2tick((scanStart - transportOrigin));
                var scanEndTimeline = msec2tick((scanEnd - transportOrigin));
                playbackQueue.length = 0;
                arrangement.scanEvents(scanStartTimeline, scanEndTimeline, playbackQueue);
                if (playbackQueue.length) {
                    var n = playbackQueue.length;
                    for (var i = 0; i < n; i++) {
                        var step = playbackQueue[i];
                        step.setStartMidi(tick2msec(step.getStartAbs()) + transportOrigin);
                        step.setDurationMidi(tick2msec(step.getDuration()));
                        step.setStartAudioContext((tick2msec(step.getStartAbs()) / 1000) + audioContextOffset);
                        step.setDurationAudioContext(tick2msec(step.getDuration()) / 1000);
                    }
                    epgModel.onTransportScan(playbackQueue);
                }
            },
            
            updateView = function(position) {
                epgModel.onTransportRun(msec2tick(position - transportOrigin));
            },
            
            msec2tick = function (sec) {
                return sec / tickInMilliseconds;
            },
            
            tick2msec = function (tick) {
                return tick * tickInMilliseconds;
            }
            
            setBPM = function(newBpm) {
                bpm = (newBpm || 120);
                var beatInMilliseconds = 60000.0 / bpm;
                tickInMilliseconds = beatInMilliseconds / ppqn;
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
        my.updateView = updateView;
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
                    my.updateView(position);
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
            };
            
        my = my || {};
        my.setLoopByFactor = setLoopByFactor;
        
        that = createSequencer(specs, my);
        
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
