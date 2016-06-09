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
     * @param {Number} specs.start Start time in tick.
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
            absStart = 0,
            absEnd = 0,
            index = specs.index,
            
            /**
             * Create clone of this step with optional changed start time.
             * @param {Number} startTime Start time in tick.
             * @return {Step} Clone of this Step.
             */
            cloneWithChangedStart = function(startTime) {
                startTime = startTime || start;
                return WH.createStep({
                    pitch: pitch, 
                    velocity: velocity, 
                    start: startTime, 
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
            
            getDuration = function() {
                return duration;
            },
            
            getTrackIndex = function() {
                return trackIndex;
            },
            
            getIndex = function() {
                return index;
            },

            /**
             * Set absolute play start time in seconds since audio stream started.
             * @param {number} newAbsStart Start time in seconds.
             */
            setAbsStart = function(newAbsStart) {
                absStart = newAbsStart;
            },
            
            getAbsStart = function() {
                return absStart;
            },

            /**
             * Set absolute play end time in seconds since audio stream started.
             * @param {number} newAbsEnd End time in seconds.
             */
            setAbsEnd = function(newAbsEnd) {
                absEnd = newAbsEnd;
            },
            
            getAbsEnd = function() {
                return absEnd;
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
        
        that.cloneWithChangedStart = cloneWithChangedStart;
        that.getPitch = getPitch;
        that.getVelocity = getVelocity;
        that.getStart = getStart;
        that.getDuration = getDuration;
        that.getTrackIndex = getTrackIndex;
        that.getIndex = getIndex;
        that.setAbsStart = setAbsStart;
        that.getAbsStart = getAbsStart;
        that.setAbsEnd = setAbsEnd;
        that.getAbsEnd = getAbsEnd;
        that.getData = getData;
        return that;
    }
    
    WH.createStep = createStep;
})(WH);
