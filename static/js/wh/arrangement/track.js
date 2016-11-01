/**
 * A Track contains 16 Steps with playback data.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {
    
    /**
     * @description Create a step sequencer track object.
     * @param {Array} specs.steps Array of step data objects.
     * @param {Number} specs.trackIndex Track on which this note is played.
     * @param {Number} specs.duration Duration of the track in ticks.
     */
    function createTrack(specs) {
        var that,
            steps = [],
            duration = 0,

            /**
             * Find events to be played within a time span
             * If the pattern is shorter than the sequence, the pattern will loop.
             * 
             * @param {Number} absoluteStart Absolute start ticks in Transport playback time.
             * @param {Number} start Start time in ticks.
             * @param {Number} end End time in ticks.
             * @param {Array} playbackQueue Events that happen within the time range.
             */
            scanEventsInTimeSpan = function (absoluteStart, start, end, playbackQueue) {

                // convert pattern time to track time
                var localStart = start % duration,
                    localEnd = localStart + (end - start),
                    i = 0,
                    n = steps.length,
                    step,
                    stepStart;

                // if the track restarts within the current time span, 
                // scan the bit at the start of the next loop as well
                var secondEnd = 0;
                if (localEnd > duration) {
                    var secondStart = 0;
                    secondEnd = localEnd - duration;
                }

                // get the events
                for (i; i < n; i++) {
                    step = steps[i];
                    if (step) {
                        stepStart = step.getStart();
                        if (localStart <= stepStart && stepStart <= localEnd) {
                            // add new step with time relative to time span
                            playbackQueue.push(step.cloneWithAbsStart(absoluteStart + (stepStart - localStart)));
                        }
                        if (secondEnd && secondStart <= stepStart && stepStart <= secondEnd) {
                            // add new event with time relative to time span
                            playbackQueue.push(step.cloneWithAbsStart(absoluteStart + (stepStart - secondStart)));
                        }
                    }
                }
            },

            /**
             * Get steps array.
             * @return {Array}  Array of Step objects.
             */
            getSteps = function() {
                return steps;
            },

            /**
             * Get all settings that should be saved with a project.
             * @return {Array} Array of objects with all data per track and rack.
             */
            getData = function() {
                var i = 0,
                    n = steps.length,
                    trackData = {
                        steps: []
                    };

                for (i; i < n; i++) {
                   trackData.steps.push(steps[i].getData());
                }

                return trackData;
            },
            
            /**
             * Update all the steps of the track and the length of the track.
             */
            setSteps = function(stepData, trackIndex, trackDuration) {
                duration = trackDuration ? trackDuration : 0;
                
                steps = [];
                if (stepData) {
                    for (var i = 0; i < stepData.length; i++) {
                        var d = stepData[i];
                        steps.push( WH.createStep({
                            pitch: d.pitch || 60, 
                            velocity: d.velocity || 0, 
                            start: d.start || 0, 
                            duration: d.duration || 1, 
                            trackIndex: trackIndex ? trackIndex : 0,
                            index: i
                        }));
                    }
                }
            },
            
            setIndex = function(index) {
                var i, n = steps.length;
                for (i = 0; i < n; i++) {
                    steps[i].setTrackIndex(index);
                }
            };
        
        that = {};
        
        setSteps(specs.steps, specs.trackIndex);
        
        that.scanEventsInTimeSpan = scanEventsInTimeSpan;
        that.getSteps = getSteps;
        that.setSteps = setSteps;
        that.getData = getData;
        that.setIndex = setIndex;
        return that;
    }
    
    WH.createTrack = createTrack;

})(WH);
