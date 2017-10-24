/**
 * Utilities
 * Mouse or touch event detection.
 */
window.WH = window.WH || {};

(function (WH) {

    function createUtil() {

        var that = {};
        
        that.isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
        
        /**
         * Type of events to use, touch or mouse
         * @type {String}
         */
        that.eventType = {
            start: that.isTouchDevice ? 'touchstart' : 'mousedown',
            end: that.isTouchDevice ? 'touchend' : 'mouseup',
            click: that.isTouchDevice ? 'touchend' : 'click',
            move: that.isTouchDevice ? 'touchmove' : 'mousemove',
        };
        
        return that;
    }
    
    /** 
     * Singleton
     */
    WH.util = createUtil();
})(WH);
