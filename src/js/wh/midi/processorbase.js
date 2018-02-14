import createBooleanParameter from '../parameter/boolean';
import createIntegerParameter from '../parameter/integer';
import createItemizedParameter from '../parameter/itemized';
import createStringParameter from '../parameter/string';
import createVector2DParameter from '../parameter/vector2d';
import createMIDIConnectorIn from './connectorin';
import createMIDIConnectorOut from './connectorout';

/**
 * Base functionality for all MIDI processors.
 */
export default function createMIDIProcessorBase(specs, my) {
    var that,
        
        /**
         * Create parameters from an object of parameter specifications.
         * @param  {Object} paramSpecs Definitions of all the processor's parameters. 
         */
        // defineParams = function(paramSpecs) {
        //     for (var key in paramSpecs) {
        //         paramSpecs[key].key = key;
        //         switch(paramSpecs[key].type) {
        //             case 'integer':
        //                 my.params[key] = createIntegerParameter(paramSpecs[key]);
        //                 break;
        //             case 'boolean':
        //                 my.params[key] = createBooleanParameter(paramSpecs[key]);
        //                 break;
        //             case 'itemized':
        //                 my.params[key] = createItemizedParameter(paramSpecs[key]);
        //                 break;
        //             case 'string':
        //                 my.params[key] = createStringParameter(paramSpecs[key]);
        //                 break;
        //             case 'vector2d':
        //                 my.params[key] = createVector2DParameter(paramSpecs[key]);
        //                 break;
        //         }
        //         // my.params[key].addChangedCallback(paramChangedCallback);
        //     }
        //     initParams();
        // },
        
        /**
         * Set all parameter values from specs.
         */
        // initParams = function() {
        //     for (var key in my.params) {
        //         if (my.params.hasOwnProperty(key)) {
        //             if (specs[key]) {
        //                 my.params[key].setValue(specs[key]);
        //             }
        //         }
        //     }
        // },
        
        /**
         * Called by the processor's parameters if their value is changed.
         */
        // paramChangedCallback = function(parameter, oldValue, newValue) {
        //     // call the plugin's handler for this parameter
        //     my['$' + parameter.getProperty('key')](newValue);
        // },
        
        // setParamValue = function(key, value) {
        //     if (my.params.hasOwnProperty(key)) {
        //         my.params[key].setValue(value);
        //     }
        // },
        
        // getParamValue = function(key) {
        //     if (my.params.hasOwnProperty(key)) {
        //         return my.params[key].getValue();
        //     }
        // },
        
        // getParameters = function() {
        //     return my.params;
        // },
        
        // hasParameter = function(param) {
        //     for (var key in my.params) {
        //         if (my.params.hasOwnProperty(key)) {
        //             if (my.params[key] === param) {
        //                 return true;
        //             }
        //         }
        //     }
        //     return false;
        // },
        
        /**
         * General processor info.
         * @return {Object} Processor properties info.
         */
        // getInfo = function() {
        //     return my.info;
        // },
        
        getType = function() {
            return my.type;
        },
        
        // setID = function(newId) {
        //     id = newId;
        // },
        
        getID = function() {
            return my.id;
        };
        
        /**
         * Restore processor from data object.
         * @param {Object} data Preferences data object.
         */
        // setData = function(data) {
        //     for (var key in my.params) {
        //         if (my.params.hasOwnProperty(key)) {
        //             my.params[key].setData(data[key]);
        //         }
        //     }
        // }, 
        
        /**
         * Write processor settings to data object.
         */
        // getData = function() {
        //     var data = {};
        //     data.type = type;
        //     data.id = id;
            
        //     // parameters
        //     for (var key in my.params) {
        //         if (my.params.hasOwnProperty(key)) {
        //             data[key] = my.params[key].getData();
        //         }
        //     }
            
        //     // connections
        //     if (typeof my.getDestinationsData == 'function') {
        //         my.getDestinationsData(data);
        //     }
            
        //     // processor specific data
        //     if (typeof my.getProcessorSpecificData == 'function') {
        //         my.getProcessorSpecificData(data);
        //     }
        //     return data;
        // };
    
    my = my || {};
    my.type = specs.data.type,
    my.id = specs.data.id,
    my.params = specs.data.params;
    // my.defineParams = defineParams;
    
    that = specs.that || {};
    if (specs.data.inputs.allIds.length >= 1) {
        that = createMIDIConnectorIn(specs, my);
    }
    if (specs.data.outputs.allIds.length >= 1) {
        that = createMIDIConnectorOut(specs, my);
    }

    // defineParams(specs.params);
    
    // that.setParamValue = setParamValue;
    // that.getParamValue = getParamValue;
    // that.getParameters = getParameters;
    // that.hasParameter = hasParameter;
    // that.getInfo = getInfo;
    that.getType = getType;
    // that.setID = setID;
    that.getID = getID;
    // that.setData = setData;
    // that.getData = getData;
    
    return that;
}
