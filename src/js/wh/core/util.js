/**
 * Utilities
 * Mouse or touch event detection.
 */
export const util = ( function() {
    const isTouchDevice = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
    
    /**
     * Type of events to use, touch or mouse
     * @type {String}
     */
    const eventType = {
        start: isTouchDevice ? 'touchstart' : 'mousedown',
        end: isTouchDevice ? 'touchend' : 'mouseup',
        click: isTouchDevice ? 'touchend' : 'click',
        move: isTouchDevice ? 'touchmove' : 'mousemove',
    };

    return {
        isTouchDevice: isTouchDevice,
        eventType: eventType
    }
})();
