/**
 * A Track contains 16 Steps with playback data.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {
    
    /**
     * @description Create a step sequencer track object.
     * @param {object} specs.data Track setup data.
     * @param {Number} specs.channel Channel (and instrument) on which this note is played.
     */
    function createTrack(specs) {
        var that,
            steps = [],
            lengthInTicks = 4 * WH.conf.getPPQN(),

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
                var localStart = start % lengthInTicks,
                    localEnd = localStart + (end - start),
                    i = 0,
                    n = steps.length,
                    step,
                    stepStart;

                // if the track restarts within the current time span, 
                // scan the bit at the start of the next loop as well
                var secondEnd = 0;
                if (localEnd > lengthInTicks) {
                    var secondStart = 0;
                    secondEnd = localEnd - lengthInTicks;
                }

                // get the events
                for (i; i < n; i++) {
                    step = steps[i];
                    if (step) {
                        stepStart = step.getStart();
                        if (localStart <= stepStart && stepStart <= localEnd) {
                            // add new step with time relative to time span
                            playbackQueue.push(step.cloneWithChangedStart(absoluteStart + (stepStart - localStart)));
                        }
                        if (secondEnd && secondStart <= stepStart && stepStart <= secondEnd) {
                            // add new event with time relative to time span
                            playbackQueue.push(step.cloneWithChangedStart(absoluteStart + (stepStart - secondStart)));
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
             * @return {Array} Array of objects with all data per channel and rack.
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
            };
        
        that = {};
        
        // create the step objects from the data
        for (var i = 0; i < specs.data.steps.length; i++) {
            var d = specs.data.steps[i];
            steps.push( WH.createStep({
                pitch: d.pitch, 
                velocity: d.velocity, 
                start: d.start, 
                duration: d.duration, 
                channel: specs.channel, 
                index: i
            }));
        }
        
        that.scanEventsInTimeSpan = scanEventsInTimeSpan;
        that.getSteps = getSteps;
        that.getData = getData;
        return that;
    }
    
    WH.createTrack = createTrack;

})(WH);
