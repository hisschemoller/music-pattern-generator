/**
 * Base parameter functionality.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createBaseParameter(specs, my) {
        var that,
            value = specs.value || specs.default,
            defaultValue = specs.default,
            changedCallbacks = [],
		    
            /**
             * Call all callbacks if the parameter's value changed.
             * @param {Number|String|Boolean|Array} oldValue Value before change.
             */
        	valueChanged = function(oldValue) {
        		if (oldValue == value) {
                    return;
                }
                var n = changedCallbacks.length;
    			for (var i = 0; i < n; i++) {
                    changedCallbacks[i](that, oldValue, value);
                }
        	},
		
        	/**
        	 * Adds a callback function, invoked on value changed.
        	 * @param {Function} callback The function, that will be invoked on value changed.
        	 */
        	addChangedCallback = function(callback) {
        		changedCallbacks.push(callback);
        	},

    		/**
    		 * Removes a callback function.
    		 * @param {Function} callback The function that will be removed.
    		 */
    		removeChangedCallback = function(callback) {
    			var index = changedCallbacks.indexOf(callback);
    			if (index > -1) {
                    changedCallbacks.splice(index, 1);
                }
    		},
		
        	/**
        	 * Reset value to its initial default value
        	 */
        	reset = function() {
        		setValue(defaultValue);
        	},

        	/**
        	 * Sets the current value of the parameter.
        	 * If changed, inform all callbacks.
        	 */
            setValue = function(newValue) {
                var oldValue = value;
                value = newValue;
                valueChanged(oldValue);
            },
		
    		/**
    		 * Returns the current value of the parameter
    		 */
            getValue = function() {
                return value;
            },
		
    		/**
    		 * Sets the current value of the parameter
    		 * by passing a normalized value between 0 and 1.
    		 * If changed, inform all callbacks.
    		 * @param normalizedValue A normalized value between 0 and 1.
    		 */
    		setValueNormalized = function(normalizedValue) {
    			var oldValue = value;
    			value = my.deNormalize(normalizedValue);
    			valueChanged(oldValue);
    		},

        	/**
        	 * Returns the current normalized value of the parameter between 0 and 1.
        	 */
        	getValueNormalized = function() {
        		return my.normalize(value);
        	},
            
            getProperty = function(key) {
                if (my.hasOwnProperty(key)) {
                    return my[key];
                }
            };
            
        my = my || {};
        my.type = specs.type;
        my.label = specs.label;
        my.key = specs.key;
        my.isMidiControllable = specs.isMidiControllable;
        
        that = specs.that || {};
        if (my.isMidiControllable) {
            that = ns.createRemoteParameter(specs, my);
        }
        
        that.addChangedCallback = addChangedCallback;
        that.removeChangedCallback = removeChangedCallback;
        that.reset = reset;
        that.setValue = setValue;
        that.getValue = getValue;
        that.setValueNormalized = setValueNormalized;
        that.getValueNormalized = getValueNormalized;
        that.getProperty = getProperty;
        return that;
    };

    ns.createBaseParameter = createBaseParameter;

})(WH);
