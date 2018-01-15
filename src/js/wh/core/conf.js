/**
 * Unchangeable application configuration settings.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {

    /**
     * @constructor
     */
    function createConf() {

        var that = {},
            patternCount = 16,
            trackCount = 4,
            patternDurationInBeats = 4,
            stepsPerBeat = 4,
            ppqn = 480;

        that.getPatternCount = function() {
            return patternCount;
        };

        that.getTrackCount = function() {
            return trackCount;
        };

        that.getPatternDurationInBeats = function() {
            return patternDurationInBeats;
        };

        that.getStepsPerBeat = function() {
            return stepsPerBeat;
        };

        that.getStepCount = function() {
            return patternDurationInBeats * stepsPerBeat;
        };
        
        that.getPPQN = function() {
            return ppqn;
        };
        
        return that;
    }
    
    /** 
     * Singleton
     */
    WH.conf = createConf();
})(WH);
