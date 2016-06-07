/**
 * SongPart is a
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {

    /**
     * @description Create song part object.
     * @param {Object} specs
     * @param {Number} specs.patternIndex Index of the pattern to play.
     * @param {Number} specs.repeats Number of times the pattern is repeated.
     */
    function createSongPart(specs) {

        var that,
            patternIndex = specs.patternIndex,
            repeats = specs.repeats,
            absoluteStart = specs.absoluteStart,
            absoluteEnd = specs.absoluteEnd, // end tick of this part relative to song start

            /**
             * Get all settings that should be saved with a project.
             * @return {Object} Object with all songPart data to save.
             */
            getData = function() {
                return {
                    patternIndex: patternIndex,
                    repeats: repeats
                };
            },

            /**
             * Return the index of the pattern that this part plays.
             * @return {Number}
             */
            getPatternIndex = function() {
                return patternIndex;
            },

            /**
             * Return the number of times that this part repeats.
             * @return {Number}
             */
            getRepeats = function() {
                return repeats;
            },

            /**
             * Return the start tick of this part relative to song start
             * @return {Number}
             */
            getStart = function() {
                return absoluteStart;
            },

            /**
             * Return the end tick of this part relative to song start
             * @return {Number}
             */
            getEnd = function() {
                return absoluteEnd;
            };
            
            that = {};
            that.getData = getData;
            that.getPatternIndex = getPatternIndex;
            that.getRepeats = getRepeats;
            that.getStart = getStart;
            that.getEnd = getEnd;
            return that;
    };

    /**
     * Exports
     */
    WH.createSongPart = createSongPart;

})(WH);
