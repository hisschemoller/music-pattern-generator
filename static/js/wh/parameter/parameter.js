/**
 * Processor settings view.
 * @namespace WH
 */

window.WH = window.WH || {};

(function (ns) {
    
    function createParameter(specs) {
        var that,
            value = specs.value,
            defaultValue = specs.defaultValue,
            changedCallbacks = [],
		          
            /**
             * Call all callbacks if the parameter's value changed.
             * @param {Number|String|Boolean} oldValue Value before change.
             */
        	function valueChanged(oldValue) {
        		if (oldValue == value) {
                    return;
                }
                try {
        			for each (var callback in changedCallbacks) {
                        callback(that, oldValue, value);
                    }	
        		} catch(err) {
        			Console.error('Make sure callbacks have the following signature: (parameter, oldValue, newValue)');
        		}
        	}
		
        	/**
        	 * Adds a callback function, invoked on value changed.
        	 * @param {Function} callback The function, that will be invoked on value changed.
        	 */
        	function addChangedCallback(callback) {
        		changedCallbacks.push(callback);
        	},

    		/**
    		 * Removes a callback function.
    		 * @param {Function} callback The function that will be removed.
    		 */
    		function removeChangedCallback(callback) {
    			var index = changedCallbacks.indexOf(callback);
    			if (index > -1) {
                    changedCallbacks.splice(index, 1);
                }
    		},
		
        	/**
        	 * Reset value to its initial default value
        	 */
        	function reset() {
        		setValue(defaultValue);
        	}

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
    		function setValueNormalized(normalizedValue) {
    			var oldValue = value;
    			value = mapping.map(normalizedValue);
    			valueChanged(oldValue);
    		},

        	/**
        	 * Returns the current normalized value of the parameter between 0 and 1.
        	 */
        	function getValueNormalized() {
        		return mapping.mapInverse(value);
        	};
        
        that = specs.that || {};
        
        that.addChangedCallback = addChangedCallback;
        that.removeChangedCallback = removeChangedCallback;
        that.reset = reset;
        that.setValue = setValue;
        that.getValue = getValue;
        that.setValueNormalized = setValueNormalized;
        that.getValueNormalized = getValueNormalized;
        return that;
    };

    ns.createParameter = createParameter;

})(WH);
