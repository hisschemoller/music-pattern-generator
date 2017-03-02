/**
 * Functionality for parameters that are controllable by external MIDI CC values.
 * Also includes functionality for MIDI learn mode.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createRemoteParameter(specs, my) {
        var that,
            remoteStateChangeCallback,
            remoteProps = {
                portId: null,
                channel: null,
                controller: null
            },
            
            setRemoteState = function(state, callback) {
                if (remoteStateChangeCallback) {
                    remoteStateChangeCallback(state, callback);
                }
            },
            
            setRemoteStateCallback = function(callback) {
                remoteStateChangeCallback = callback;
            },
            
            setRemoteProperty = function(key, value) {
                if (remoteProps.hasOwnProperty(key)) {
                    remoteProps[key] = value;
                }
            },
            
            getRemoteProperty = function(key) {
                if (remoteProps.hasOwnProperty(key)) {
                    return remoteProps[key];
                }
            };
        
        that = specs.that || {};
        
        that.setRemoteState = setRemoteState;
        that.setRemoteStateCallback = setRemoteStateCallback;
        that.setRemoteProperty = setRemoteProperty;
        that.getRemoteProperty = getRemoteProperty;
        return that;
    }

ns.createRemoteParameter = createRemoteParameter;

})(WH);
