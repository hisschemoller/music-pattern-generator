/**
 * @description Starts, stops, pauses playback.
 * 
 * Time
 * There are three time measurements used in this app:
 * 1. Real time, 
 *      
 * 2. Audio Context time, 
 *      time since AudioContext started, used to schedule audio events.
 * 3. Transport time, 
 *      position of the Transport playhead, used to 
 * 
 * @var now {ms} Transport playhead position.
 * @var absOrigin {ms} Transport play start in real time.
 * 
 * Unix epoch,                page    AudioContext   Transport        now,
 * 01-01-1970 00:00:00 UTC    load    created        start            the present
 *  |                          |       |              |                | 
 *  |--------------------------|-------|-------//-----|--------//------|
 *  
 *  |------------------------------------------------------------------> Date.now()
 *  |------------------------------------------------------------------> absNow
 *                             |---------------------------------------> performance.now()
 *                                     |-------------------------------> AudioContext.currentTime
 *                                                    |----------------> now
 *                             |-------absOrigin------|
 * 
 * @namespace WH
 */

window.WH = window.WH || {};
window.WH.core = window.WH.core || {};

(function (ns) {
    
    /**
     * @description Creates a transport object.
     */
    function createTransport(specs) {
        var that,
            arrangement = specs.arrangement,
            epgModel = specs.epgModel,
            isRunning = false,
            isLoop = false,
            now = 0,
            absLastNow = now,
            absOrigin = 0,
            loopStart = 0,
            loopEnd = 0,
            bpm = 120,
            lastBpm = bpm,
            tickInSeconds = 0,
            playbackQueue = [],
            needsScan = true,
            lookAhead = 0,
            scanStart = 0,
            scanEnd = lookAhead,
            
            /**
             * Converts tick to second based on transport tempo.
             * @param  {Number} tick Tick (atomic musical time unit)
             * @return {Number} Time in seconds.
             */
            tick2sec = function (tick) {
                return tick * tickInSeconds;
            },

            /**
             * Converts second to tick based on transport tempo.
             * @param  {Number} sec Time in seconds.
             * @return {Number} Time in ticks.
             */
            sec2tick = function (sec) {
                return sec / tickInSeconds;
            },
            
            /**
             * 
             */
            flushPlaybackQueue = function() {
                playbackQueue.length = 0;
            },
            
            /**
             * Sets current playhead position by seconds (audioContext).
             * @param {number} position Position in seconds 
             */
            setPlayheadPosition = function(position) {
                now = position;
                absOrigin = (performance.now() / 1000) - now; // WH.core.getNow() - now;
            },

            /**
             * Scan events in time range and advance playhead in each pattern.
             */
            scheduleNotesInScanRange = function () {
                if (needsScan) {
                    needsScan = false;

                    // fill playbackQueue with arrangement events 
                    arrangement.scanEvents(sec2tick(scanStart), sec2tick(scanEnd), playbackQueue);

                    if (playbackQueue.length) {
                        // adjust event timing
                        var start, 
                            step,
                            i = 0;
                        for (i; i < playbackQueue.length; i++) {
                            step = playbackQueue[i];
                            start = absOrigin + tick2sec(step.getStart());
                            step.setAbsStart(start);
                            step.setAbsEnd(start + tick2sec(step.getDuration()));
                        }

                        // play the events with sound generating plugin instruments
                        // WH.studio.playEvents(playbackQueue);
                        // WH.View.onSequencerEvents(playbackQueue);
                        epgModel.onTransportScan(playbackQueue);
                    }
                }   
            },

            /**
             * Move the scan range of scan forward by runner.
             */
            advanceScanRange = function () {
                // Advances the scan range to the next block, if the scan end point is
                // close enough (< 16.7ms) to playhead.
                if (scanEnd - now < 0.0167) {
                    scanStart = scanEnd;
                    scanEnd = scanStart + lookAhead;
                    needsScan = true;
                }
            },
            
            /**
             * Reset the scan range based on current playhead position.
             */
            resetScanRange = function () {
                scanStart = now;
                scanEnd =  scanStart + lookAhead;
                needsScan = true;
            },
            
            /**
             * Runs the transport (update every 16.7ms).
             */
            run = function () {
                if (isRunning) {
                    // add time elapsed to now_t by checking now_ac
                    var absNow = performance.now() / 1000; // WH.core.getNow();
                    now += (absNow - absLastNow);
                    absLastNow = absNow;
                    // scan notes in range
                    scheduleNotesInScanRange();
                    // update view
                    epgModel.onTransportRun(sec2tick(scanStart));
                    // advance when transport is running
                    advanceScanRange();
                    // flush played notes
                    flushPlaybackQueue();
                    // check loop flag
                    if (isLoop) {
                        if (loopEnd - (now + lookAhead) < 0) {
                            setPlayheadPosition(loopStart - (loopEnd - now));
                        }
                    }
                }
                // schedule next step
                requestAnimationFrame(run.bind(this));
            },

            /**
             * Starts playback.
             */
            start = function () {
                // Arrange time references.
                var absNow = (performance.now() / 1000) - now; // WH.core.getNow();
                absOrigin = absNow - now;
                absLastNow = absNow;
                // Reset scan range.
                resetScanRange();
                // Transport is running.
                isRunning = true;
            },

            /**
             * Pauses current playback.
             */
            pause = function () {
                isRunning = false;
                flushPlaybackQueue();
            },

            /**
             * Sets playhead position by tick.
             * @param {Number} tick Playhead position in ticks.
             */
            setNow = function (tick) {
                setPlayheadPosition(tick2sec(tick));
                resetScanRange();
            },

            /**
             * Rewinds playhead to the beginning.
             */
            rewind = function () {
                setPlayheadPosition(0.0);
            },

            /**
             * Sets loop start position by tick.
             * @param {Number} tick Loop start in tick.
             */
            setLoopStart = function (tick) {
                loopStart = tick2sec(tick);
            },

            /**
             * Sets loop end position by tick.
             * @param {Number} tick Loop end in tick.
             */
            setLoopEnd = function (tick) {
                loopEnd = tick2sec(tick);
            },

            /**
             * Returns loop start by tick.
             * @return {Number}
             */
            getLoopStart = function () {
                return sec2tick(loopStart);
            },

            /**
             * Returns loop end by tick.
             * @return {Number}
             */
            getLoopEnd = function () {
                return sec2tick(loopEnd);
            },

            /**
             * Toggles or sets loop status.
             * @param  {Boolean|undefined} bool Loop state. If undefined, it toggles the current state.
             */
            toggleLoop = function (bool) {
                if (bool === undefined) {
                    isLoop = !isLoop;
                } else {
                    isLoop = !!bool;
                }
            },

            /**
             * Sets transport BPM.
             * @param {Number} BPM Beat per minute.
             */
            setBPM = function (newBpm) {
                // calculates change factor
                bpm = (newBpm || 120);
                var factor = lastBpm / bpm;
                lastBpm = bpm;
                // recalcualte beat in seconds, tick in seconds
                var beatInSeconds = 60.0 / bpm;
                tickInSeconds = beatInSeconds / WH.conf.getPPQN();
                // lookahead is 16 ticks (1/128th note)
                lookAhead = tickInSeconds * 16;
                // update time references based on tempo change
                now *= factor;
                loopStart *= factor;
                loopEnd *= factor;
                absOrigin = (performance.now() / 1000) - now; // WH.core.getNow() - now;
            },

            /**
             * Returns current BPM.
             * @return {Number}
             */
            getBPM = function () {
                return bpm;
            };
        
        that = specs.that;
        
        setBPM(bpm);
        run();
        
        that.start = start;
        that.setBPM = setBPM;
        that.getBPM = getBPM;
        return that;
    }
    
    ns.createTransport = createTransport;

})(WH.core);
