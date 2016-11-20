/**
 * A Step contains data for a single sound to be player.
 * It extends Note.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {
    
    /**
     * @description Create a step sequencer step object.
     * @param {Number} specs.pitch MIDI pitch.
     * @param {Number} specs.velocity MIDI velocity.
     * @param {Number} specs.start Local start time within the track, in ticks.
     * @param {Number} specs.duration Note durtion in tick.
     * @param {Number} specs.getTrackIndex Track on which this note is played.
     * @param {Number} specs.index Index of this step within the track.
     */
    function createStep(specs) {
        var that,
            pitch = specs.pitch || 60,
            velocity = specs.velocity || 0,
            start = specs.start || 0,
            duration = specs.duration || 1,
            trackIndex = specs.trackIndex || 0,
            index = specs.index,
            startAbs = specs.startAbs || 0,
            startMidi = 0,
            durationMidi = 0,
            startAudioContext = 0,
            durationAudioContext = 0,
            startDelay = 0,
            
            /**
             * Create clone of this step with optional changed start time.
             * @param {Number} startTime Start time in tick.
             * @return {Step} Clone of this Step.
             */
            cloneWithAbsStart = function(startTime) {
                startTime = startTime || start;
                return WH.createStep({
                    pitch: pitch, 
                    velocity: velocity, 
                    start: start, 
                    startAbs: startTime,
                    duration: duration, 
                    trackIndex: trackIndex, 
                    index: index
                });
            },
            
            getPitch = function() {
                return pitch;
            },
            
            getVelocity = function() {
                return velocity;
            },
            
            getStart = function() {
                return start;
            },
            
            getStartAbs = function() {
                return startAbs;
            },
            
            getDuration = function() {
                return duration;
            },
            
            setTrackIndex = function(index) {
                trackIndex = index;
            },
            
            getTrackIndex = function() {
                return trackIndex;
            },
            
            getIndex = function() {
                return index;
            },

            /**
             * Set start time in MIDI timestamp.
             * @param {Number} start Start time in milliseconds since document load.
             */
            setStartMidi = function(start) {
                startMidi = start;
            },
            
            getStartMidi = function() {
                return startMidi;
            },

            /**
             * Set duration in milliseconds.
             * @param {Number} duration Duration in milliseconds.
             */
            setDurationMidi = function(duration) {
                durationMidi = duration;
            },
            
            getDurationMidi = function() {
                return durationMidi;
            },

            /**
             * Set start time in AudioContext timestamp.
             * @param {Number} start Start time in seconds since AudioContext creation.
             */
            setStartAudioContext = function(start) {
                startAudioContext = start;
            },
            
            getStartAudioContext = function() {
                return startAudioContext;
            },

            /**
             * Set duration in seconds.
             * @param {Number} duration Duration in seconds.
             */
            setDurationAudioContext = function(duration) {
                durationAudioContext = duration;
            },
            
            getDurationAudioContext = function() {
                return durationAudioContext;
            },

            /**
             * Set delay before note start in milliseconds.
             * @param {Number} duration Delay in milliseconds.
             */
            setStartDelay = function(delay) {
                startDelay = delay;
            },
            
            getStartDelay = function() {
                return startDelay;
            },

            /**
             * Get all settings that should be saved with a project.
             * @return {Object} All Step properties to save.
             */
            getData = function() {
                return {
                    trackIndex: trackIndex,
                    pitch: pitch,
                    velocity: velocity,
                    start: start,
                    duration: duration
                };
            };
        
        var that = {};
        
        that.cloneWithAbsStart = cloneWithAbsStart;
        that.getPitch = getPitch;
        that.getVelocity = getVelocity;
        that.getStart = getStart;
        that.getDuration = getDuration;
        that.setTrackIndex = setTrackIndex;
        that.getTrackIndex = getTrackIndex;
        that.getIndex = getIndex;
        that.getStartAbs = getStartAbs;
        that.setStartMidi = setStartMidi;
        that.getStartMidi = getStartMidi;
        that.setDurationMidi = setDurationMidi;
        that.getDurationMidi = getDurationMidi;
        that.setStartAudioContext = setStartAudioContext;
        that.getStartAudioContext = getStartAudioContext;
        that.setDurationAudioContext = setDurationAudioContext;
        that.getDurationAudioContext = getDurationAudioContext;
        that.setStartDelay = setStartDelay;
        that.getStartDelay = getStartDelay;
        that.getData = getData;
        return that;
    }
    
    WH.createStep = createStep;
})(WH);
