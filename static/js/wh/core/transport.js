/**
 * Timing, transport and sequencing functionality.
 * Divided in two sets of functionality, Transport and Sequencer.
 * 
 * Unix epoch,                page    AudioContext   Transport        now,
 * 01-01-1970 00:00:00 UTC    load    created        start            the present
 *  |                          |       |              |                | 
 *  |--------------------------|-------|-------//-----|--------//------|
 *  
 *  |------------------------------------------------------------------> Date.now()
 *                             |---------------------------------------> performance.now()
 *                                     |-------------------------------> AudioContext.currentTime
 */

window.WH = window.WH || {};

(function (ns) {
    
    /**
     * @description Creates sequencer functionality.
     * Takes time from transport to get music events from arrangement and
     * drives components that process music events.
     * @param {Object} specs External specifications.
     * @param {Object} my Internally shared properties.
     */
    function createSequencer (specs, my) {
        var that,
            midiNetwork = specs.midiNetwork,
            // arrangement = specs.arrangement,
            // epgModel = specs.epgModel, 
            ppqn = 480,
            bpm = 120,
            lastBpm = bpm,
            tickInMilliseconds,
            audioContextOffset = 0,
            timelineOffset = 0,
            transportOrigin = 0,
            playbackQueue = [],
            
            /**
             * Scan the arrangement for events and send them to concerned components.
             * @param {Number} scanStart Start in ms of timespan to scan.
             * @param {Number} scanEnd End in ms of timespan to scan.
             */
            scanEvents = function(scanStart, scanEnd) {
                midiNetwork.process(scanStart, scanEnd);
                // var scanStartTimeline = msec2tick((scanStart - transportOrigin));
                // var scanEndTimeline = msec2tick((scanEnd - transportOrigin));
                // playbackQueue.length = 0;
                // arrangement.scanEvents(scanStartTimeline, scanEndTimeline, playbackQueue);
                // if (playbackQueue.length) {
                //     var n = playbackQueue.length;
                //     for (var i = 0; i < n; i++) {
                //         var step = playbackQueue[i];
                //         step.setStartMidi(tick2msec(step.getStartAbs()) + transportOrigin);
                //         step.setDurationMidi(tick2msec(step.getDuration()));
                //         step.setStartAudioContext((tick2msec(step.getStartAbs()) / 1000) + audioContextOffset);
                //         step.setDurationAudioContext(tick2msec(step.getDuration()) / 1000);
                //         step.setStartDelay(step.getStartMidi() - performance.now());
                //     }
                    // epgModel.onTransportScan(playbackQueue);
                // }
            },
            
            /**
             * Use Timing's requestAnimationFrame as clock for view updates.
             * @param {Number} position Timing position, equal to performance.now(). 
             */
            updateView = function(position) {
                // epgModel.onTransportRun(msec2tick(position - transportOrigin));
            },
            
            /**
             * Convert milliseconds to ticks.
             */
            msec2tick = function (sec) {
                return sec / tickInMilliseconds;
            },
            
            /**
             * Convert ticks to milliseconds.
             */
            tick2msec = function (tick) {
                return tick * tickInMilliseconds;
            }
            
            /**
             * Set Beats Per Minute.
             *  @param {Number} newBpm New value for BPM.
             */
            setBPM = function(newBpm) {
                bpm = (newBpm || 120);
                var beatInMilliseconds = 60000.0 / bpm;
                tickInMilliseconds = beatInMilliseconds / ppqn;
                // calculate change factor
                var factor = lastBpm / bpm;
                my.setLoopByFactor(factor);
                WH.pubSub.fire('transport.bpm', bpm);
            },
            
            getBPM = function() {
                return bpm;
            },
            
            /**
             * Set timestamp of transport start point in ms.
             * @param {Number} origin Timestamp in milliseconds.
             */
            setTransportOrigin = function(origin) {
                transportOrigin = origin;
            },
            
            /**
             * Set difference between AudioContext.currentTime and performance.now.
             * Used to convert timing for AudioContext playback.
             * @param {Number} acCurrentTime Timestamp in seconds.
             */
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
        that.getBPM = getBPM;
        that.setAudioContextOffset = setAudioContextOffset;
        return that;
    }
    
    /**
     * Functionality to add synchronisation to external MIDI clock.
     * MIDI clock sends clock events at 24 ppqn.
     * @see https://en.wikipedia.org/wiki/MIDI_beat_clock
     * 
     * The MIDI 'start' and 'stop' events just start and stop the transport.
     * The MIDI 'clock' event adjusts the BPM tempo.
     * 
     * BPM is calculated with the time difference between clock event timestamps.
     */
    function createExternalClock (specs, my) {
        var that,
            isEnabled = false,
            midiInput,
            prevBPM = 0,
            prevTimestamp = 0,
            updateTimeout,
            
            /**
             * Enable synchronisation to external MIDI clock.
             */
            setExternalClockEnabled = function(isEnabled, midiInputPort) {
                if (isEnabled) {
                    midiInput = midiInputPort;
                    midiInput.addListener('start', 1, onStart);
                    midiInput.addListener('stop', 1, onStop);
                    midiInput.addListener('clock', 1, onClock);
                } else {
                    if (midiInput) {
                        midiInput.removeListener('start', onStart);
                        midiInput.removeListener('stop', onStop);
                        midiInput.removeListener('clock', onClock);
                    }
                    midiInput = null;
                }
            },
            
            onStart = function(e) {
                that.start();
            },
            
            onStop = function(e) {
                that.pause();
                that.rewind();
            },
            
            /**
             * Convert events at 24 ppqn to BPM, suppress jitter from unstable clocks.
             * @param {Object} e Event from WebMIDI.js.
             */
            onClock = function(e) {
                if (prevTimestamp > 0) {
                    var newBPM = 60000 / ((e.timestamp - prevTimestamp) * 24);
                    var bpm = prevBPM ? ((prevBPM * 23) + newBPM) / 24 : newBPM;
                    prevBPM = bpm;
                    bpm = bpm.toFixed(1);
                    if (bpm != that.getBPM()) {
                        updateTempo(bpm);
                    }
                }
                prevTimestamp = e.timestamp;
            },
            
            /**
             * Update tempo no more than once every 500ms.
             * @param {Number} bpm The new changed BPM.
             */
            updateTempo = function(bpm) {
                if (!updateTimeout) {
                    that.setBPM(bpm);
                    updateTimeout = setTimeout(function() {
                        updateTimeout = 0;
                    }, 500);
                }
            };
        
        that = specs.that || {};
        
        that.setExternalClockEnabled = setExternalClockEnabled;
        return that;
    }
    
    /**
     * @description Creates transport timing functionality.
     * Time is always measured in milliseconds since document load.
     * The timer can be started, stopped, rewound to zero and looped.
     * It defines a scan range that is just ahead of the play position
     * and that is meant to be used to scan for events to play.
     * @param {Object} specs Options.
     * @param {Object} my Properties shared between the functionalities of the object.
     */
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
            
            /**
             * Set the scan range.
             * @param {Number} start Start timestamp of scan range.
             */
            setScanRange = function (start) {
                scanStart = start;
                scanEnd =  scanStart + lookAhead;
                needsScan = true;
            },
            
            /**
             * Updated the playhead position by adjusting the timeline origin.
             * @param {Number} newOrigin Timeline origin timestamp.
             */
            setOrigin = function(newOrigin) {
                loopStart = loopStart - origin + newOrigin;
                loopEnd = loopEnd - origin + newOrigin;
                origin = newOrigin;
                my.setTransportOrigin(newOrigin);
            },
            
            /**
             * Timer using requestAnimationFrame that updates the transport timing.
             */
            run = function() {
                if (isRunning) {
                    position = performance.now();
                    if (isLooping && position < loopEnd && scanStart < loopEnd && scanEnd > loopEnd) {
                        setOrigin(origin + (loopEnd - loopStart));
                    }
                    if (scanEnd - position < 16.7) {
                        setScanRange(scanEnd);
                    }
                    if (needsScan) {
                        needsScan = false;
                        my.scanEvents(scanStart, scanEnd);
                    }
                }
                my.updateView(position);
                requestAnimationFrame(run);
            },
            
            /**
             * Start the timer.
             */
            start = function() {
                var offset = position - origin;
                position = performance.now();
                setOrigin(position - offset);
                setScanRange(position);
                isRunning = true;
                WH.pubSub.fire('transport.start');
            },
            
            /**
             * Pause the timer.
             */
            pause = function () {
                isRunning = false;
                WH.pubSub.fire('transport.pause');
            },
            
            /**
             * Rewind the timer to timeline start.
             */
            rewind = function () {
                position = performance.now();
                setOrigin(position);
                setScanRange(position);
            },
            
            /**
             * Toggle between stop and play.
             */
            toggleStartStop = function() {
                if (isRunning) {
                    pause();
                    rewind();
                } else {
                    start();
                }
            },
            
            /**
             * Set loop startpoint.
             * @param {Number} position Loop start timestamp.
             */
            setLoopStart = function (position) {
                loopStart = origin + position;
            },
            
            /**
             * Set loop endpoint.
             * @param {Number} position Loop end timestamp.
             */
            setLoopEnd = function (position) {
                loopEnd = origin + position;
            },
            
            /**
             * Set loop mode.
             * @param {Boolean} isEnabled True to enable looping.
             * @param {Number} position Loop start timestamp.
             * @param {Number} position Loop end timestamp.
             */
            setLoop = function (isEnabled, startPosition, endPosition) {
                isLooping = isEnabled;
            },
            
            /**
             * Change loop points by a factor if the tempo changes.
             * @param {number} factor Time points multiplier.
             */
            setLoopByFactor = function(factor) {
                setLoopStart(loopStart * factor);
                setLoopEnd(loopEnd * factor);
            };
            
        my = my || {};
        my.setLoopByFactor = setLoopByFactor;
        
        that = createSequencer(specs, my);
        that = createExternalClock(specs, my);
        
        that.start = start;
        that.pause = pause;
        that.rewind = rewind;
        that.toggleStartStop = toggleStartStop
        that.run = run;
        that.setLoopStart = setLoopStart;
        that.setLoopEnd = setLoopEnd;
        that.setLoop = setLoop;
        return that;
    };
    
    ns.createTransport = createTransport;

})(WH);
