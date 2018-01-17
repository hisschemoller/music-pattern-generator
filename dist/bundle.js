/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createBaseParameter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__remote__ = __webpack_require__(15);


/**
 * Base parameter functionality.
 */
function createBaseParameter(specs, my) {
    var that,
        defaultValue = specs.default,
        changedCallbacks = [],
        
        /**
         * Call all callbacks if the parameter's value changed.
         * @param {Number|String|Boolean|Array} oldValue Value before change.
         */
        valueChanged = function(oldValue) {
            if (oldValue == my.props.value) {
                return;
            }
            
            for (var i = 0, n = changedCallbacks.length; i < n; i++) {
                changedCallbacks[i](that, oldValue, my.props.value);
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
         * Reset value to its initial default value.
         */
        reset = function() {
            setValue(defaultValue);
        },

        /**
         * Sets the current value of the parameter.
         * If changed, inform all callbacks.
         */
        setValue = function(newValue) {
            var oldValue = my.props.value;
            my.props.value = newValue;
            valueChanged(oldValue);
        },
    
        /**
         * Returns the current value of the parameter.
         * @return {*} Parameter value.
         */
        getValue = function() {
            return my.props.value;
        },
    
        /**
         * Sets the current value of the parameter
         * by passing a normalized value between 0 and 1.
         * If changed, inform all callbacks.
         * @param normalizedValue A normalized value between 0 and 1.
         */
        setValueNormalized = function(normalizedValue) {
            var oldValue = my.props.value;
            my.props.value = my.deNormalize(normalizedValue);
            valueChanged(oldValue);
        },

        /**
         * Returns the current normalized value of the parameter between 0 and 1.
         * @return {Number} Normalized value.
         */
        getValueNormalized = function() {
            return my.normalize(my.props.value);
        },
        
        /**
         * Get a property's value.
         * @param  {String} key Property name.
         * @return {*} Property value.
         */
        getProperty = function(key) {
            let propValue;
            if (my.hasOwnProperty(key)) {
                propValue =  my[key];
            } else if (my.props.hasOwnProperty(key)) {
                propValue =  my.props[key];
            }
            return propValue;
        },
        
        /**
         * Restore processor from data object.
         * @param {Object} data Preferences data object.
         */
        setData = function(data) {
            for (var key in my.props) {
                if (my.props.hasOwnProperty(key)) {
                    my.props[key] = data.props[key];
                }
            }
            // use setValue to trigger callbacks
            my.props.value = defaultValue;
            setValue(data.props.value);
        }, 
        
        /**
         * Write parameter properties to data object.
         * @return {Object} Data object.
         */
        getData = function() {
            var data = {
                props: my.props
            };
            return data;
        };
        
    my = my || {};
    my.props = {
        value: specs.value || specs.default,
    };
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
    that.setData = setData;
    that.getData = getData;
    return that;
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Utilities
 * Mouse or touch event detection.
 */
const util = ( function() {
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

    /**
     * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     */
    const createUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    return {
        isTouchDevice: isTouchDevice,
        eventType: eventType,
        createUUID: createUUID
    }
})();
/* harmony export (immutable) */ __webpack_exports__["a"] = util;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = addWindowResize;
/**
 * Window resize listener functionality.
 * Add callback functions that will be called on window resize,
 * but debounced to not be called more that every so many milliseconds.
 */
var debouncedFunction,
    callbacks = [],
    delay = 250,
    
    /**
     * Returns a function, that, as long as it continues to be invoked, 
     * will not be triggered. The function will be called after it 
     * stops being called for N milliseconds. If `immediate` is passed, 
     * trigger the function on the leading edge, instead of the trailing.
     * @see https://davidwalsh.name/javascript-debounce-function
     * @param  {Function} func Function to call after delay.
     * @param  {Number} wait Milliseconds to wait before next call.
     * @param  {Boolean} immediate True to not wait.
     */
    debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

function addWindowResize(specs, my) {
    var that,
        
        /**
         * Add callback function to be called on debounced resize.
         * @param  {Function} callback Callback function.
         */
        addWindowResizeCallback = function(callback) {
            callbacks.push(callback);
            if (!debouncedFunction) {
                debouncedFunction = debounce(function() {
                    callbacks.forEach(function(callbackFunction) {
                        callbackFunction();
                    });
                }, delay);
                window.addEventListener('resize', debouncedFunction);
            }
        };
    
    my = my || {};
    my.addWindowResizeCallback = addWindowResizeCallback;
    
    that = specs.that || {};
    
    return that;
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__wh_core_app__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__wh_core_file__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__wh_core_transport__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__wh_midi_midi__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__wh_midi_network__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__wh_midi_remote__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__wh_midi_sync__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__wh_state_actions__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__wh_state_reducers__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__wh_state_store__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__wh_view_app__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__wh_view_canvas__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__wh_view_preferences__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__wh_view_remote__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__wh_view_file__ = __webpack_require__(43);
/**
    Euclidean Pattern Generator
    Copyright (C) 2017, 2018  Wouter Hisschemoller

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

















/**
 * Application startup.
 */
document.addEventListener('DOMContentLoaded', function(e) {

    // Create all objects that will be the modules of the app.
    var app = {},
        appView = {},
        canvasView = {},
        file = {},
        fileView = {},
        midi = {},
        midiNetwork = {},
        midiRemote = {},
        midiSync = {},
        preferencesView = {},
        remoteView = {},
        transport = {};
    
    const store = Object(__WEBPACK_IMPORTED_MODULE_9__wh_state_store__["a" /* default */])({
        actions: Object(__WEBPACK_IMPORTED_MODULE_7__wh_state_actions__["a" /* default */])(),
        reducers: Object(__WEBPACK_IMPORTED_MODULE_8__wh_state_reducers__["a" /* default */])()
    });

    // Add functionality to the modules and inject dependencies.
    Object(__WEBPACK_IMPORTED_MODULE_0__wh_core_app__["a" /* default */])({
        that: app,
        appView: appView,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        transport: transport
    });
    Object(__WEBPACK_IMPORTED_MODULE_10__wh_view_app__["a" /* default */])({
        that: appView,
        store: store,
        app: app,
        midiNetwork: midiNetwork
    });
    Object(__WEBPACK_IMPORTED_MODULE_11__wh_view_canvas__["a" /* default */])({
        that: canvasView,
        store: store
    });
    Object(__WEBPACK_IMPORTED_MODULE_12__wh_view_preferences__["a" /* default */])({
        that: preferencesView,
        store: store,
        canvasView: canvasView
    });
    Object(__WEBPACK_IMPORTED_MODULE_13__wh_view_remote__["a" /* default */])({
        that: remoteView,
        appView: appView,
        midiRemote: midiRemote
    });
    Object(__WEBPACK_IMPORTED_MODULE_1__wh_core_file__["a" /* default */])({
        that: file,
        store: store,
        midi: midi,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        transport: transport
    });
    Object(__WEBPACK_IMPORTED_MODULE_14__wh_view_file__["a" /* default */])({
        that: fileView,
        file: file
    });
    Object(__WEBPACK_IMPORTED_MODULE_3__wh_midi_midi__["a" /* default */])({
        that: midi,
        preferencesView: preferencesView,
        midiNetwork: midiNetwork,
        midiRemote: midiRemote,
        midiSync: midiSync
    });
    Object(__WEBPACK_IMPORTED_MODULE_5__wh_midi_remote__["a" /* default */])({
        that: midiRemote,
        app: app,
        remoteView: remoteView
    });
    Object(__WEBPACK_IMPORTED_MODULE_6__wh_midi_sync__["a" /* default */])({
        that: midiSync,
        transport: transport
    });
    Object(__WEBPACK_IMPORTED_MODULE_4__wh_midi_network__["a" /* default */])({
        that: midiNetwork,
        store: store,
        app: app,
        appView: appView,
        canvasView: canvasView,
        midiRemote: midiRemote,
        preferencesView: preferencesView
    });
    Object(__WEBPACK_IMPORTED_MODULE_2__wh_core_transport__["a" /* default */])({
        that: transport,
        app: app,
        canvasView: canvasView,
        midiNetwork: midiNetwork
    });

    // initialise
    midi.connect()
        .then(file.loadLocalStorage)
        .then(transport.run);
});


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createApp;
/**
 * App stores UI state that's rendered in AppView.
 */
function createApp(specs, my) {
    let that,
        appView = specs.appView,
        midiNetwork = specs.midiNetwork,
        midiRemote = specs.midiRemote,
        transport = specs.transport,
        panelStates = {
            help: false,
            preferences: false,
            remote: false,
            settings: false
        },
        
        togglePanel = function(panelID, isVisible) {
            if (typeof panelStates[panelID] == 'boolean') {
                panelStates[panelID] = isVisible;
                appView.showPanel(panelID, panelStates[panelID]);
            }
        },
        
        updateApp = function(property, value) {
            switch(property) {
                case 'bpm':
                    transport.setBPM(value);
                    break;
                case 'play':
                    transport.toggleStartStop();
                    break;
                case 'remote':
                    midiRemote.toggleMidiLearn(value);
                    break;
                case 'connections':
                    midiNetwork.toggleConnections(value);
                    break;
            }
        },
        
        appUpdated = function(property, value) {
            appView.updateControl(property, value);
        };
    
    that = specs.that || {};
    
    that.togglePanel = togglePanel;
    that.updateApp = updateApp;
    that.appUpdated = appUpdated;
    return that;
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createFile;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__filexml__ = __webpack_require__(6);


/**
 * Saves state to - or restores it from localstorage.
 * Saves state to file, opens external files.
 */
function createFile(specs, my) {
    var that,
        store = specs.store,
        midi = specs.midi,
        midiNetwork = specs.midiNetwork,
        midiRemote = specs.midiRemote,
        transport = specs.transport,
        projectName = 'project',
        preferencesName = 'preferences',
        resetKeyCombo = {},

        /**
         * Autosave file if true.
         * @type {Boolean}
         */
        autoSaveEnabled = true,

        init = function() {
            window.addEventListener('beforeunload', onBeforeUnload);
            
            // key combo r + s + t resets the stored project and preferences.
            document.addEventListener('keydown', function(e) {
                resetKeyCombo[e.keyCode] = true;
                if (Object.keys(resetKeyCombo).length == 3 && resetKeyCombo[82] && resetKeyCombo[83] && resetKeyCombo[84]) {
                    localStorage.clear();
                    setup();
                }
            });
            document.addEventListener('keyup', function(e) {
                resetKeyCombo = {};
            });
        },

        /**
         * Setup on application start.
         */
        loadLocalStorage = function() {
            return new Promise((resolve, reject) => {
                loadPreferences();
                if (!loadProjectFromStorage()) {
                    createNew();
                }
                resolve();
            });
        },

        /**
         * Get the stored preferences, if any.
         */
        loadPreferences = function() {
            var data = localStorage.getItem(preferencesName);
            store.dispatch(store.getActions().setPreferences(data));
            // if (data) {
            //     data = JSON.parse(data);
            //     midi.setData(data.midi);
            //     preferences.setData(data.preferences);
            // } else {
            //     midi.setData();
            //     preferences.setData();
            //     console.log('No data in LocalStorage with name "' + preferencesName + '".');
            // }
        },

        /**
         * Save application preferences to localStorage.
         * @param {Object} data Object with preferences data to save.
         */
        savePreferences = function() {
            const data = store.getState().preferences;
            localStorage.setItem(preferencesName, JSON.stringify(data));
        },

        /**
         * Create new empty default project.
         * Clear all settings and set default values..
         */
        createNew = function() {
            // setData();
            store.dispatch(store.getActions().setProject());
        },

        /**
         * Load project from localStorage.
         * @return {Boolean} True if a project was found in localstorage.
         */
        loadProjectFromStorage = function() {
            let data = localStorage.getItem(projectName);
            if (data) {
                store.dispatch(store.getActions().setProject(JSON.parse(data)));
                // data = JSON.parse(data);
                // setData(data);
            } else {
                console.log(`No data in LocalStorage with name "${projectName}".`);
                return false;
            }
            return true;
        },

        /**
         * Save project if autoSave is enabled.
         */
        autoSave = function() {
            if (autoSaveEnabled) {
                save();
            }
        },

        /**
         * Collect all project data and save it in localStorage.
         */
        save = function() {
            let data = getData();
            localStorage.setItem(projectName, JSON.stringify(data));
        },

        /**
         * Save the preferences when the page unloads.
         */
        onBeforeUnload = function(e) {
            savePreferences();
            autoSave();
        },

        /**
         * Collect project data to save.
         * @return {Object} Project data.
         */
        getData = function() {
            return {
                bpm: transport.getBPM(),
                network: midiNetwork.getData(),
                remote: midiRemote.getData()
            };
        },

        /**
         * Restore project from data object.
         *
         * Order is important:
         * 1. MIDI devices have already been detected and input and output objects created.
         * 2. midi.setData() restores state of the input and output objects. As a result:
         *   2a. Input ports are added to the remote object for external control.
         *   2b. Input ports are added to the sync object for external sync.
         *   2c. Output ports are added to the network which creates output processors for them.
         * 3. network.setData restores the processors. And:
         *   3a. Registers the processor with the remote object so they can be controlled.
         *   3b. Restores the output processor IDs, to identify the for connections.
         *   3c. Restores all connections between processors.
         * 4. midiRemote.setData() restores all assignments from MIDI inputs to processor parameters.
         *
         * @param {Object} data Project data.
         */
        setData = function(data) {
            console.log(data);
            data = data || {};
            transport.setBPM(data.bpm);
            midiNetwork.setData(data.network);
            midiRemote.setData(data.remote);
        },

        /**
         * Import project data from filesystem JSON file.
         * @param {Object} file File object.
         */
        importFile = function(file) {
            let fileReader = new FileReader();
            // closure to capture the file information
            fileReader.onload = (function(f) {
                return function(e) {
                    let isJSON = true
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data) {
                            setData(data);
                        }
                    } catch(errorMessage) {
                        console.log(errorMessage);
                        isJSON = false;
                    }
                    if (!isJSON) {
                        // try if it's a legacy xml file
                        const legacyData = my.convertLegacyFile(e.target.result);
                        if (legacyData) {
                            setData(legacyData);
                        }
                    }
                };
            })(file);
            fileReader.readAsText(file);
        },

        /**
         * Export project data to filesystem JSON file.
         */
        exportFile = function() {
            let jsonString = JSON.stringify(getData()),
                blob = new Blob([jsonString], {type: 'application/json'}),
                a = document.createElement('a');
            a.download = 'epg.json';
            a.href = URL.createObjectURL(blob);
            a.click();
        };
    
    my = my || {};

    that = Object(__WEBPACK_IMPORTED_MODULE_0__filexml__["a" /* default */])(specs, my);
    
    init();

    that.loadLocalStorage = loadLocalStorage;
    that.createNew = createNew;
    that.autoSave = autoSave;
    that.save = save;
    that.importFile = importFile;
    that.exportFile = exportFile;
    return that;
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = addXMLFileParser;
/**
 * 
 */
function addXMLFileParser(specs, my) {

    let that;
    
    const convertLegacyFile = function(xmlString) {
            const xmlData = parseXML(xmlString),
                data = convertData(xmlData);
            return data;
        },
        
        convertData = function(src) {
            const dest = {
                bpm: src.project.tempo,
                midi: {
                    inputs: [],
                    outputs: []
                },
                network: {
                    processors: []
                },
                remote: []
            };
            for (let i = 0, n = src.project.patterns.pattern.length; i < n; i++) {
                const pattern = src.project.patterns.pattern[i];
                const processor = {
                    type: 'epg',
                    id: pattern.id,
                    steps: {
                        props: {
                            value: parseInt(pattern.events.steps, 10),
                            min: 0,
                            max: 64
                        }
                    },
                    pulses: {
                        props: {
                            value: parseInt(pattern.events.notes, 10),
                            min: 0,
                            max: parseInt(pattern.events.steps, 10)
                        }
                    },
                    rotation: {
                        props: {
                            value: parseInt(pattern.events.rotation, 10),
                            min: 0,
                            max: parseInt(pattern.events.steps, 10) - 1
                        }
                    },
                    channel_out: {
                        props: {
                            value: parseInt(pattern.midi_out.channel, 10) + 1,
                            min: 1,
                            max: 16
                        }
                    },
                    pitch_out: {
                        props: {
                            value: parseInt(pattern.midi_out.pitch, 10),
                            min: 0,
                            max: 127
                        }
                    },
                    velocity_out: {
                        props: {
                            value: parseInt(pattern.midi_out.velocity, 10),
                            min: 0,
                            max: 127
                        }
                    },
                    rate: {
                        props: {
                            value: (1 / parseInt(pattern.settings.quantization, 10)) * 4
                        }
                    },
                    is_triplets: {
                        props: {
                            value: false
                        }
                    },
                    note_length: {
                        props: {
                            // Old noteLength is in pulses where PPQN is 24, 
                            // so for example 6 is a sixteenth note length,
                            // 96 is one 4/4 measure.
                            value: convertNoteLength(parseInt(pattern.settings.notelength, 10))
                        }
                    },
                    is_mute: {
                        props: {
                            value: pattern.settings.mute == 'true'
                        }
                    },
                    name: {
                        props: {
                            value: pattern.name['#text']
                        }
                    },
                    position2d: {
                        props: {
                            value: {
                                x: parseInt(pattern.location.x, 10) + 100,
                                y: parseInt(pattern.location.y, 10) + 100
                            }
                        }
                    },
                    destinations: []
                };
                dest.network.processors.push(processor);
            };
            return dest;
        },
        
        /**
         * Old noteLength is in pulses where PPQN is 24, 
         * so for example 6 is a sixteenth note length,
         * 96 is one 4/4 measure.
         * @param  {Number} oldLength Note length in pulses.
         * @return {Number} New note length in fraction of a beat.
         */
        convertNoteLength = function(oldLength) {
            let newNoteLength;
            if (oldLength == 96) {
                newNoteLength = 4;
            } else if (oldLength >= 48) {
                newNoteLength = 2;
            } else if (oldLength >= 24) {
                newNoteLength = 1;
            } else if (oldLength >= 12) {
                newNoteLength = 0.5;
            } else if (oldLength >= 6) {
                newNoteLength = 0.25;
            } else {
                newNoteLength = 0.125;
            }
            return newNoteLength;
        },
        
        /**
         * Parse XML string to Javascript object.
         * @see https://stackoverflow.com/questions/4200913/xml-to-javascript-object
         * @param  {String} xmlString XML data as string.
         * @param  {[type]} arrayTags [description]
         * @return {Object} Javascript object created from XML.
         */
        parseXML = function(xml, arrayTags) {
            var dom = null;
            if (window.DOMParser) {
                dom = (new DOMParser()).parseFromString(xml, "text/xml");
            } else if (window.ActiveXObject) {
                dom = new ActiveXObject('Microsoft.XMLDOM');
                dom.async = false;
                if (!dom.loadXML(xml)) {
                    throw dom.parseError.reason + " " + dom.parseError.srcText;
                }
            } else {
                throw "cannot parse xml string!";
            }

            function isArray(o) {
                return Object.prototype.toString.apply(o) === '[object Array]';
            }

            function parseNode(xmlNode, result) {
                if (xmlNode.nodeName == "#text" || xmlNode.nodeName == '#cdata-section') {
                    var v = xmlNode.nodeValue;
                    if (v.trim()) {
                       result['#text'] = v;
                    }
                    return;
                }

                var jsonNode = {};
                var existing = result[xmlNode.nodeName];
                if(existing) {
                    if(!isArray(existing)) {
                        result[xmlNode.nodeName] = [existing, jsonNode];
                    } else {
                        result[xmlNode.nodeName].push(jsonNode);
                    }
                } else {
                    if(arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) {
                        result[xmlNode.nodeName] = [jsonNode];
                    } else {
                        result[xmlNode.nodeName] = jsonNode;
                    }
                }

                if(xmlNode.attributes) {
                    var length = xmlNode.attributes.length;
                    for(var i = 0; i < length; i++) {
                        var attribute = xmlNode.attributes[i];
                        jsonNode[attribute.nodeName] = attribute.nodeValue;
                    }
                }

                var length = xmlNode.childNodes.length;
                for(var i = 0; i < length; i++) {
                    parseNode(xmlNode.childNodes[i], jsonNode);
                }
            }

            var result = {};
            if(dom.childNodes.length) {
                parseNode(dom.childNodes[0], result);
            }

            return result;
        };
    
    my = my || {};
    my.convertLegacyFile = convertLegacyFile;
    
    that = specs.that;
    
    return that;
}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createSequencer */
/* harmony export (immutable) */ __webpack_exports__["a"] = createTransport;
/**
 * Timing, transport and sequencing functionality.
 * Divided in two sets of functionality, Transport and Sequencer.
 * 
 * Unix epoch,                page    AudioContext   Transport        now,
 * 01-01-1970 00:00:00 UTC    load    created        start            the present
 *  |                          |       |              |                | 
 *  |--------------------------|-------|-------//-----|--------//------|
 *  
 *  |------------------------------------------------------------------> Date.now()
 *                             |---------------------------------------> performance.now()
 *                                     |-------------------------------> AudioContext.currentTime
 */

// window.WH = window.WH || {};

// (function (ns) {
    
/**
 * @description Creates sequencer functionality.
 * Takes time from transport to get music events from arrangement and
 * drives components that process music events.
 * @param {Object} specs External specifications.
 * @param {Object} my Internally shared properties.
 */
function createSequencer (specs, my) {
    var that,
        app = specs.app,
        canvasView = specs.canvasView,
        midiNetwork = specs.midiNetwork,
        ppqn = 480,
        bpm = 120,
        lastBpm = bpm,
        tickInMilliseconds,
        audioContextOffset = 0,
        timelineOffset = 0,
        playbackQueue = [],
        renderThrottleCounter = 0,
        
        /**
         * Scan the arrangement for events and send them to concerned components.
         * @param {Number} scanStart Start in ms of timespan to scan.
         * @param {Number} scanEnd End in ms of timespan to scan.
         * @param {Number} nowToScanStart Duration from now until start time in ms.
         * @param {Number} offset Position of transport playhead in ms.
         */
        scanEvents = function(scanStart, scanEnd, nowToScanStart, offset) {
            var scanStartTimeline = msec2tick(scanStart),
                scanEndTimeline = msec2tick(scanEnd);
            midiNetwork.process(scanStartTimeline, scanEndTimeline, msec2tick(nowToScanStart), tickInMilliseconds, msec2tick(offset));
        },
        
        /**
         * Use Timing's requestAnimationFrame as clock for view updates.
         * @param {Number} position Timing position, equal to performance.now(). 
         */
        updateView = function(position) {
            if (renderThrottleCounter % 2 === 0) {
                midiNetwork.render(msec2tick(position));
                canvasView.draw();
            }
            renderThrottleCounter++;
        },
        
        /**
         * Convert milliseconds to ticks.
         */
        msec2tick = function (sec) {
            return sec / tickInMilliseconds;
        },
        
        /**
         * Convert ticks to milliseconds.
         */
        tick2msec = function (tick) {
            return tick * tickInMilliseconds;
        },
        
        /**
         * Set Beats Per Minute.
         * @param {Number} newBpm New value for BPM.
         */
        setBPM = function(newBpm = 120) {
            bpm = newBpm;
            var beatInMilliseconds = 60000.0 / bpm;
            tickInMilliseconds = beatInMilliseconds / ppqn;
            // calculate change factor
            var factor = lastBpm / bpm;
            my.setLoopByFactor(factor);
            app.appUpdated('bpm', bpm);
        },
        
        /**
         * Get Beats Per Minute of the project.
         * @return [Number] Beats Per Minute.
         */
        getBPM = function() {
            return bpm;
        },
        
        /**
         * Set difference between AudioContext.currentTime and performance.now.
         * Used to convert timing for AudioContext playback.
         * @param {Number} acCurrentTime Timestamp in seconds.
         */
        setAudioContextOffset = function(acCurrentTime) {
            audioContextOffset = performance.now() - (acCurrentTime * 1000);
        };
    
    my = my || {};
    my.scanEvents = scanEvents;
    my.updateView = updateView;
    
    that = specs.that || {};
    
    setBPM(bpm);
    
    that.setBPM = setBPM;
    that.getBPM = getBPM;
    that.setAudioContextOffset = setAudioContextOffset;
    return that;
}

/**
 * Functionality to add synchronisation to external MIDI clock.
 * MIDI clock sends clock events at 24 ppqn.
 * @see https://en.wikipedia.org/wiki/MIDI_beat_clock
 * 
 * The MIDI 'start' and 'stop' events just start and stop the transport.
 * The MIDI 'clock' event adjusts the BPM tempo.
 * 
 * BPM is calculated with the time difference between clock event timestamps.
 */
function createExternalClock (specs, my) {
    var that,
        isEnabled = false,
        midiInput,
        prevBPM = 0,
        prevTimestamp = 0,
        updateTimeout,
        
        /**
         * Enable synchronisation to external MIDI clock.
         * @param {Boolean} isEnabled True to synchronise to external MIDI clock.
         * @param {Object} midiInputPort MIDI input port.
         */
        setExternalClockEnabled = function(isEnabled, midiInputPort) {
            if (isEnabled) {
                midiInput = midiInputPort;
                midiInput.addListener('start', 1, onStart);
                midiInput.addListener('stop', 1, onStop);
                midiInput.addListener('clock', 1, onClock);
            } else {
                if (midiInput) {
                    midiInput.removeListener('start', onStart);
                    midiInput.removeListener('stop', onStop);
                    midiInput.removeListener('clock', onClock);
                }
                midiInput = null;
            }
        },
        
        /**
         * Start transport.
         */
        onStart = function() {
            that.start();
        },
        
        /**
         * Stop transport.
         */
        onStop = function() {
            that.pause();
            that.rewind();
        },
        
        /**
         * Convert events at 24 ppqn to BPM, suppress jitter from unstable clocks.
         * @param {Object} e Event from WebMIDI.js.
         */
        onClock = function(e) {
            if (prevTimestamp > 0) {
                var newBPM = 60000 / ((e.timestamp - prevTimestamp) * 24);
                var bpm = prevBPM ? ((prevBPM * 23) + newBPM) / 24 : newBPM;
                prevBPM = bpm;
                bpm = bpm.toFixed(1);
                if (bpm != that.getBPM()) {
                    updateTempo(bpm);
                }
            }
            prevTimestamp = e.timestamp;
        },
        
        /**
         * Update tempo no more than once every 500ms.
         * @param {Number} bpm The new changed BPM.
         */
        updateTempo = function(bpm) {
            if (!updateTimeout) {
                that.setBPM(bpm);
                updateTimeout = setTimeout(function() {
                    updateTimeout = 0;
                }, 500);
            }
        };
    
    that = specs.that || {};
    
    that.setExternalClockEnabled = setExternalClockEnabled;
    return that;
}

/**
 * @description Creates transport timing functionality.
 * Time is always measured in milliseconds since document load.
 * The timer can be started, stopped, rewound to zero and looped.
 * It defines a scan range that is just ahead of the play position
 * and that is meant to be used to scan for events to play.
 * @param {Object} specs Options.
 * @param {Object} my Properties shared between the functionalities of the object.
 */
function createTransport(specs, my) {
    var that,
        app = specs.app,
        position = 0,
        origin = 0,
        scanStart = 0,
        scanEnd = 0,
        lookAhead = 200,
        loopStart = 0,
        loopEnd = 0,
        isRunning = false,
        isLooping = false,
        needsScan = false,
        
        /**
         * Set the scan range.
         * @param {Number} start Start timestamp of scan range.
         */
        setScanRange = function (start) {
            scanStart = start;
            scanEnd =  scanStart + lookAhead;
            needsScan = true;
        },
        
        /**
         * Updated the playhead position by adjusting the timeline origin.
         * @param {Number} newOrigin Timeline origin timestamp.
         */
        setOrigin = function(newOrigin) {
            loopStart = loopStart - origin + newOrigin;
            loopEnd = loopEnd - origin + newOrigin;
            origin = newOrigin;
        },
        
        /**
         * Timer using requestAnimationFrame that updates the transport timing.
         */
        run = function() {
            if (isRunning) {
                position = performance.now();
                if (isLooping && position < loopEnd && scanStart < loopEnd && scanEnd > loopEnd) {
                    setOrigin(origin + (loopEnd - loopStart));
                }
                if (scanEnd - position < 16.7) {
                    setScanRange(scanEnd);
                }
                if (needsScan) {
                    needsScan = false;
                    my.scanEvents(scanStart - origin, scanEnd - origin, scanStart - position, position - origin);
                }
            }
            my.updateView(position - origin);
            requestAnimationFrame(run);
        },
        
        /**
         * Start the timer.
         */
        start = function() {
            var offset = position - origin;
            position = performance.now();
            setOrigin(position - offset);
            setScanRange(position);
            isRunning = true;
            app.appUpdated('play', isRunning);
        },
        
        /**
         * Pause the timer.
         */
        pause = function () {
            isRunning = false;
            app.appUpdated('play', isRunning);
        },
        
        /**
         * Rewind the timer to timeline start.
         */
        rewind = function () {
            position = performance.now();
            setOrigin(position);
            setScanRange(position);
        },
        
        /**
         * Toggle between stop and play.
         */
        toggleStartStop = function() {
            if (isRunning) {
                pause();
            } else {
                rewind();
                start();
            }
        },
        
        /**
         * Set loop startpoint.
         * @param {Number} position Loop start timestamp.
         */
        setLoopStart = function (position) {
            loopStart = origin + position;
        },
        
        /**
         * Set loop endpoint.
         * @param {Number} position Loop end timestamp.
         */
        setLoopEnd = function (position) {
            loopEnd = origin + position;
        },
        
        /**
         * Set loop mode.
         * @param {Boolean} isEnabled True to enable looping.
         * @param {Number} position Loop start timestamp.
         * @param {Number} position Loop end timestamp.
         */
        setLoop = function (isEnabled, startPosition, endPosition) {
            isLooping = isEnabled;
        },
        
        /**
         * Change loop points by a factor if the tempo changes.
         * @param {number} factor Time points multiplier.
         */
        setLoopByFactor = function(factor) {
            setLoopStart(loopStart * factor);
            setLoopEnd(loopEnd * factor);
        };
        
    my = my || {};
    my.setLoopByFactor = setLoopByFactor;
    
    that = createSequencer(specs, my);
    that = createExternalClock(specs, my);
    
    that.start = start;
    that.pause = pause;
    that.rewind = rewind;
    that.toggleStartStop = toggleStartStop
    that.run = run;
    that.setLoopStart = setLoopStart;
    that.setLoopEnd = setLoopEnd;
    that.setLoop = setLoop;
    return that;
};
    
//     ns.createTransport = createTransport;

// })(WH);


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDI;
/**
 * Handles connection with soft- and hardware MIDI devices.
 */
function createMIDI(specs) {
    var that,
        preferencesView = specs.preferencesView,
        midiNetwork = specs.midiNetwork,
        midiRemote = specs.midiRemote,
        midiSync = specs.midiSync,
        transport = specs.transport,
        midiAccess,
        inputs = [],
        outputs = [],
        dataFromStorage,

        connect = function() {
            return new Promise((resolve, reject) => {
                requestAccess(resolve, onAccessFailure, false);
            });
        },

        /**
         * Request system for access to MIDI ports.
         * @param {function} successCallback
         * @param {function} failureCallback
         * @param {boolean} sysex True if sysex data must be included.
         */
        requestAccess = function(successCallback, failureCallback, sysex) {
            if (navigator.requestMIDIAccess) {
                navigator.requestMIDIAccess({
                    sysex: !!sysex
                }).then(function(_midiAccess) {
                    if (!_midiAccess.inputs.size && !_midiAccess.outputs.size) {
                        failureCallback('No MIDI devices found on this system.');
                    } else {
                        midiAccess = _midiAccess;
                        successCallback(_midiAccess);
                    }
                }, function() {
                    failureCallback('RequestMIDIAccess failed.');
                });
            } else {
                failureCallback('Web MIDI API not available.');
            }
        },

        /**
         * MIDI access request failed.
         * @param {String} errorMessage
         */
        onAccessFailure = function(errorMessage) {
            console.log(errorMessage);
        },

        /**
         * MIDI access request succeeded.
         * @param {Object} midiAccessObj MidiAccess object.
         */
        // onAccessSuccess = function(midiAccessObj) {
        //     console.log('MIDI enabled.');
        //     midiAccess = midiAccessObj;
        //     var inputs = midiAccess.inputs.values();
        //     var outputs = midiAccess.outputs.values();
            
        //     for (var port = inputs.next(); port && !port.done; port = inputs.next()) {
        //         createInput(port.value);
        //     }
            
        //     for (var port = outputs.next(); port && !port.done; port = outputs.next()) {
        //         createOutput(port.value);
        //     }
            
        //     restorePortSettings();

        //     midiAccess.onstatechange = onAccessStateChange;
        // },

        /**
         * MIDIAccess object statechange handler.
         * If the change is the addition of a new port, create a port module.
         * This handles MIDI devices that are connected after the app initialisation.
         * Disconnected or reconnected ports are handled by the port modules.
         * @param {Object} e MIDIConnectionEvent object.
         */
        onAccessStateChange = function(e) {
            let ports = (e.port.type == 'input') ? inputs : outputs,
                exists = false,
                n = ports.length;

            while (--n >= 0 && exists == false) {
                exists = (e.port.id == ports[n].getID());
            }

            if (!exists) {
                if (e.port.type == 'input') {
                    createInput(e.port);
                } else {
                    createOutput(e.port);
                }
            }
        },
        
        /**
         * Create a MIDI input model and view.
         * @param  {Object} midiPort MIDIInput module.
         */
        createInput = function(midiPort) {
            console.log('MIDI input port:', midiPort.name + ' (' + midiPort.manufacturer + ')', midiPort.id);
            var input = ns.createMIDIPortInput({
                midiPort: midiPort,
                network: midiNetwork,
                sync: midiSync,
                remote: midiRemote
            });
            // create a view for this port in the preferences panel
            preferencesView.createMIDIPortView(true, input);
            // store port
            inputs.push(input);
            // port initialisation last
            input.setup();
        },
        
        /**
         * Create a MIDI output model and view.
         * @param  {Object} midiPort MIDIOutput module.
         */
        createOutput = function(midiPort) {
            console.log('MIDI output port:', midiPort.name + ' (' + midiPort.manufacturer + ')', midiPort.id);
            var output = ns.createMIDIPortOutput({
                midiPort: midiPort,
                network: midiNetwork,
                sync: midiSync,
                remote: midiRemote
            });
            // create a view for this port in the preferences panel
            preferencesView.createMIDIPortView(false, output);
            // store port
            outputs.push(output);
            // port initialisation last
            output.setup();
        },
        
        /**
         * Restore settings at initialisation.
         * If port settings data from localStorage and 
         * access to MIDI ports exists, restore port settings.
         */
        restorePortSettings = function() {
            if (midiAccess && dataFromStorage) {
                const data = dataFromStorage;
                
                if (data.inputs) {
                    let inputData;
                    for (let i = 0, n = data.inputs.length; i < n; i++) {
                        inputData = data.inputs[i];
                        // find the input port by MIDIInput ID
                        for (let j = 0, nn = inputs.length; j < nn; j++) {
                            if (inputData.midiPortID == inputs[j].getID()) {
                                inputs[j].setData(inputData);
                            }
                        }
                    }
                }
                
                if (data.outputs) {
                    let outputData;
                    for (let i = 0, n = data.outputs.length; i < n; i++) {
                        outputData = data.outputs[i];
                        // find the output port by MIDIOutput ID
                        for (let j = 0, nn = outputs.length; j < nn; j++) {
                            if (outputData.midiPortID == outputs[j].getID()) {
                                outputs[j].setData(outputData);
                            }
                        }
                    }
                }
            }
        },
        
        clearPortSettings = function() {
            inputs.forEach(function(input) {
                input.setData();
            });
            outputs.forEach(function(output) {
                output.setData();
            });
        },

        /**
         * Restore MIDI port object settings from data object.
         * @param {Object} data Preferences data object.
         */
        setData = function(data = {}) {
            dataFromStorage = data;
            clearPortSettings();
            restorePortSettings();
        },

        /**
         * Write MIDI port object settings to data object.
         * @return {Object} MIDI port object data.
         */
        getData = function() {
            const data = {
                inputs: [],
                outputs: []
            };
            
            for (let i = 0, n = inputs.length; i < n; i++) {
                data.inputs.push(inputs[i].getData());
            }
            
            for (let i = 0, n = outputs.length; i < n; i++) {
                data.outputs.push(outputs[i].getData());
            }
            
            return data;
        };

    that = specs.that;

    that.connect = connect;
    that.setData = setData;
    that.getData = getData;
    return that;
}


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDINetwork;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__networkconnections__ = __webpack_require__(10);


/**
 * Manages the graph of midi processors.
 */
function createMIDINetwork(specs, my) {
    var that,
        store = specs.store,
        app = specs.app,
        appView = specs.appView,
        canvasView = specs.canvasView,
        midiRemote = specs.midiRemote,
        preferencesView = specs.preferencesView,
        processors = [],
        numProcessors = 0,
        numInputProcessors = 0,
        connections = [],

        init = function() {
            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CREATE_PROCESSOR:
                        createProcessor(e.detail.state.processors);
                        break;
                }
            });
        },

        /**
         * Create a new processor in the network.
         * @param {Array} state Array of all processor data.
         */
        createProcessor = function(state) {
            state.forEach((data, i) => {
                if (!processors[i] || (data.id !== processors[i].getID())) {
                    const module = __webpack_require__(11)(`./${data.type}/processor`);
                    const processor = module.createProcessor(data);
                    processors.splice(i, 0, processor);
                }
            });

            
            
            
            return;


            // if (midiProcessors[specs.type]) {
            //     specs = specs || {};
            //     specs.that = {};
            //     specs.id = specs.id || specs.type + performance.now() + '_' + Math.random();
            //     var processor = midiProcessors[specs.type].createProcessor(specs);

            //     // insert the processor at the right position
            //     switch (specs.type) {
            //         case 'input':
            //             processors.unshift(processor);
            //             numInputProcessors++;
            //             break;
            //         case 'output':
            //             processors.push(processor);
            //             break;
            //         default:
            //             processors.splice(numInputProcessors, 0, processor);
            //     }

            //     console.log('Create processor ' + processor.getType() + ' (id ' + processor.getID() + ')');
            //     numProcessors = processors.length;
                
            //     setProcessorDefaultName(processor);

            //     // create the views for the processor
            //     switch (specs.type) {
            //         case 'input':
            //             break;
            //         case 'output':
            //             canvasView.createProcessorView(processor);
            //             break;
            //         case 'epg':
            //             appView.createSettingsView(processor);
            //             canvasView.createProcessorView(processor);
            //             midiRemote.registerProcessor(processor);
            //             selectProcessor(processor);
            //             // canvasView.markDirty();
            //             break;
            //     }
            // } else {
            //     console.error('No MIDI processor found of type: ', specs.type);
            // }
            
            // return processor;
        },

        /**
         * Delete a processor.
         * @param {String} processor Processor to delete.
         */
        deleteProcessor = function(processor) {
            // find the processor
            var processor;
            for (var i = 0; i < numProcessors; i++) {
                if (processors[i] === processor) {
                    processor = processors[i];
                    break;
                }
            }
            
            if (processor) {
                console.log('Delete processor ' + processor.getType() + ' (id ' + processor.getID() + ')');
                
                // disconnect other processors that have this processor as destination
                for (var i = 0; i < numProcessors; i++) {
                    if (typeof processors[i].disconnect === 'function') {
                        disconnectProcessors(processors[i], processor);
                    }
                }
                
                // delete the views for the processor
                switch (processor.getType()) {
                    case 'input':
                        numInputProcessors--;
                        break;
                    case 'output':
                        canvasView.deleteProcessorView(processor);
                        break;
                    case 'epg':
                        appView.deleteSettingsView(processor);
                        canvasView.deleteProcessorView(processor);
                        midiRemote.unregisterProcessor(processor);
                        break;
                }

                // disconnect this processor from its destinations
                if (typeof processor.disconnect === 'function') {
                    const destinationProcessors = processor.getDestinations();
                    for (let i = 0, n = destinationProcessors.length; i < n; i++) {
                        disconnectProcessors(processor, destinationProcessors[i]);
                    }
                }
                
                selectNextProcessor(processor);
                
                if (typeof processor.terminate === 'function') {
                    processor.terminate();
                }
                
                processors.splice(processors.indexOf(processor), 1);
                numProcessors = processors.length;
            }
        },

        /**
         * Select a processor.
         * @param  {Object} processor Processor to select.
         */
        selectProcessor = function(processor) {
            app.togglePanel('settings', processor != null);
            app.appUpdated('settings', processor != null);
            for (var i = 0; i < numProcessors; i++) {
                var proc = processors[i];
                if (typeof proc.setSelected == 'function') {
                    proc.setSelected(proc === processor);
                }
            }
        },

        /**
         * Select the next processor from the given.
         * @param  {Object} processor Processor to select.
         */
        selectNextProcessor = function(processor) {
            let processorIndex = processors.indexOf(processor),
                nextIndex,
                nextProcessor,
                isNextProcessor;
            for (let i = 1, n = processors.length; i <= n; i++) {
                nextIndex = (processorIndex + i) % n;
                nextProcessor = processors[nextIndex];
                if (nextProcessor.getType() !== 'input' && nextProcessor.getType() !== 'output' && nextProcessor !== processor) {
                    isNextProcessor = true;
                    selectProcessor(nextProcessor);
                    break;
                }
            }
            
            if (!isNextProcessor) {
                selectProcessor(null);
            }
        },
        
        connectProcessors = function(sourceProcessor, destinationProcessor) {
            if (!sourceProcessor.getDestinations().includes(destinationProcessor)) {
                sourceProcessor.connect(destinationProcessor);
            }
        },
        
        disconnectProcessors = function(sourceProcessor, destinationProcessor) {
            if (sourceProcessor.getDestinations().includes(destinationProcessor)) {
                sourceProcessor.disconnect(destinationProcessor);
            }
        },
        
        /**
         * Set default processor name.
         * @param {Object} processor Processor to name.
         */
        setProcessorDefaultName = function(processor) {
            let name, number, spaceIndex, 
                highestNumber = 0,
                staticName = 'Processor';
            for (let i = 0; i < numProcessors; i++) {
                name = processors[i].getParamValue('name');
                if (name && name.indexOf(staticName) == 0) {
                    spaceIndex = name.lastIndexOf(' ');
                    if (spaceIndex != -1) {
                        number = parseInt(name.substr(spaceIndex), 10);
                        if (!isNaN(number)) {
                            highestNumber = Math.max(highestNumber, number);
                        }
                    }
                }
            }
            processor.setParamValue('name', 'Processor ' + (highestNumber + 1));
        },

        /**
         * Let all processors process their data.
         * @param {Number} start Start time in ticks of timespan to process.
         * @param {Number} end End time in ticks of timespan to process.
         * @param {Number} nowToScanStart Duration from now until start time in ticks.
         * @param {Number} ticksToMsMultiplier Ticks to ms. conversion multiplier.
         * @param {Number} offset Position of transport playhead in ticks.
         */
        process = function(start, end, nowToScanStart, ticksToMsMultiplier, offset) {
            for (var i = 0; i < numProcessors; i++) {
                processors[i].process(start, end, nowToScanStart, ticksToMsMultiplier, offset);
            }
        },

        /**
         * Update view. At requestAnimationFrame speed.
         * @param  {Number} position Transport playback position in ticks.
         */
        render = function(position) {
            for (var i = 0; i < numProcessors; i++) {
                if (processors[i].render) {
                    processors[i].render(position);
                }
            }
        },

        /**
         * Clear the whole network.
         * Remove all processors except the inputs and outputs.
         * Remove all the connections.
         */
        clear = function() {
            let type,
                n = numProcessors;
            while (--n >= 0) {
                type = processors[n].getType();
                if (type !== 'input' && type !== 'output') {
                    deleteProcessor(processors[n]);
                }
            }
        },

        /**
         * Restore network from data object.
         * @param {Object} data Preferences data object.
         */
        setData = function(data = {}) {
            // clear all old data
            clear();
            
            if (!data.processors || data.processors.length == 0) {
                return;
            }
            
            // create the processors
            data.processors.forEach(function(item) {
                // don't create MIDI inputs and outputs yet
                if (item.type !== 'input' && item.type !== 'output') {
                    createProcessor({
                        type: item.type,
                        id: item.id
                    }, true);
                }
            });

            // find midi processors created for the detected midi ports,
            // match them with the saved midi processor data,
            // by comparing the midi port ids
            // then give the matched processors the processor id from the saved data
            // so that connections to input and output processors can be restored
            var pdata = data.processors,
                n = pdata.length,
                procType,
                numProcessors = processors.length;
            for (var i = 0; i < n; i++) {
                if (pdata[i].type === 'input' || pdata[i].type === 'output') {
                    for (var j = 0; j < numProcessors; j++) {
                        procType = processors[j].getType();
                        if (procType === 'input' || procType === 'output') {
                            if (pdata[i].midiPortID === processors[j].getPort().id) {
                                processors[j].setID(pdata[i].id);
                            }
                        }
                    }
                }
            }

            // restore state of the processor
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < numProcessors; j++) {
                    if (pdata[i].id === processors[j].getID()) {
                        processors[j].setData(pdata[i]);
                    }
                }
            }

            // connect the processors
            var sourceProcessor, numDestinations, destinationIDs;
            for (var i = 0; i < n; i++) {
                destinationIDs = pdata[i].destinations;
                if (destinationIDs && destinationIDs.length) {
                    // find source processor
                    sourceProcessor = null;
                    for (var j = 0; j < numProcessors; j++) {
                        if (pdata[i].id === processors[j].getID()) {
                            sourceProcessor = processors[j];
                        }
                    }

                    // find destination processor(s)
                    if (sourceProcessor) {
                        numDestinations = destinationIDs.length;
                        for (var j = 0; j < numDestinations; j++) {
                            for (var k = 0; k < numProcessors; k++) {
                                if (destinationIDs[j] == processors[k].getID()) {
                                    connectProcessors(sourceProcessor, processors[k]);
                                    console.log('Connect ' + sourceProcessor.getType() + ' to ' + processors[k].getType());
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
         * Write network settings to data object.
         * @return {Object} Data to store.
         */
        getData = function() {
            // collect data from all processors
            var processor,
                procData = [];
            for (var i = 0; i < numProcessors; i++) {
                procData.push(processors[i].getData());
            }

            return {
                processors: procData
            };
        };

    my = my || {};

    that = Object(__WEBPACK_IMPORTED_MODULE_0__networkconnections__["a" /* default */])(specs, my);

    init();

    that.createProcessor = createProcessor;
    that.deleteProcessor = deleteProcessor;
    that.selectProcessor = selectProcessor;
    that.connectProcessors = connectProcessors;
    that.disconnectProcessors = disconnectProcessors;
    that.process = process;
    that.render = render;
    that.clear = clear;
    that.setData = setData;
    that.getData = getData;
    return that;
}


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDINetworkConnections;
/**
 * 
 */
function createMIDINetworkConnections(specs, my) {
    var that,
        app = specs.app,
        canvasView = specs.canvasView,
        isConnectModeEnabled = false,
        
        /**
         * Enter or leave application connect mode.
         * @param  {Boolean} isEnabled True to enable connect mode.
         */
        toggleConnections = function(isEnabled) {
            isConnectModeEnabled = isEnabled;
            canvasView.toggleConnectMode(isConnectModeEnabled);
            app.appUpdated('connections', isConnectModeEnabled);
        };
    
    my = my || {};
    
    that = specs.that || {};
    
    that.toggleConnections = toggleConnections;
    return that;
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./epg/processor": 12,
	"./example/processor": 22
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 11;

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["createProcessor"] = createProcessor;
/* harmony export (immutable) */ __webpack_exports__["getType"] = getType;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__midi_processorbase__ = __webpack_require__(13);
 

function createProcessor(specs, my) {
    let that;

    const initialize = function() {},

        terminate = function() {},

        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {},
        
        render = function(pos) {};

    my = my || {};
    my.info = {
        inputs: 0,
        outputs: 1
    };
    
    that = Object(__WEBPACK_IMPORTED_MODULE_0__midi_processorbase__["a" /* default */])(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    that.render = render;
    return that;
}

function getType() {
    return 'epg';
}

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDIProcessorBase;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__parameter_boolean__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__parameter_integer__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__parameter_itemized__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__parameter_string__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__parameter_vector2d__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__connectorin__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__connectorout__ = __webpack_require__(21);








/**
 * Base functionality for all MIDI processors.
 */
function createMIDIProcessorBase(specs, my) {
    var that,
        type = specs.type,
        id = specs.id,
        
        /**
         * Create parameters from an object of parameter specifications.
         * @param  {Object} paramSpecs Definitions of all the processor's parameters. 
         */
        defineParams = function(paramSpecs) {
            for (var key in paramSpecs) {
                paramSpecs[key].key = key;
                switch(paramSpecs[key].type) {
                    case 'integer':
                        my.params[key] = Object(__WEBPACK_IMPORTED_MODULE_1__parameter_integer__["a" /* default */])(paramSpecs[key]);
                        break;
                    case 'boolean':
                        my.params[key] = Object(__WEBPACK_IMPORTED_MODULE_0__parameter_boolean__["a" /* default */])(paramSpecs[key]);
                        break;
                    case 'itemized':
                        my.params[key] = Object(__WEBPACK_IMPORTED_MODULE_2__parameter_itemized__["a" /* default */])(paramSpecs[key]);
                        break;
                    case 'string':
                        my.params[key] = Object(__WEBPACK_IMPORTED_MODULE_3__parameter_string__["a" /* default */])(paramSpecs[key]);
                        break;
                    case 'vector2d':
                        my.params[key] = Object(__WEBPACK_IMPORTED_MODULE_4__parameter_vector2d__["a" /* default */])(paramSpecs[key]);
                        break;
                }
                my.params[key].addChangedCallback(paramChangedCallback);
            }
            initParams();
        },
        
        /**
         * Set all parameter values from specs.
         */
        initParams = function() {
            for (var key in my.params) {
                if (my.params.hasOwnProperty(key)) {
                    if (specs[key]) {
                        my.params[key].setValue(specs[key]);
                    }
                }
            }
        },
        
        /**
         * Called by the processor's parameters if their value is changed.
         */
        paramChangedCallback = function(parameter, oldValue, newValue) {
            // call the plugin's handler for this parameter
            my['$' + parameter.getProperty('key')](newValue);
        },
        
        setParamValue = function(key, value) {
            if (my.params.hasOwnProperty(key)) {
                my.params[key].setValue(value);
            }
        },
        
        getParamValue = function(key) {
            if (my.params.hasOwnProperty(key)) {
                return my.params[key].getValue();
            }
        },
        
        getParameters = function() {
            return my.params;
        },
        
        hasParameter = function(param) {
            for (var key in my.params) {
                if (my.params.hasOwnProperty(key)) {
                    if (my.params[key] === param) {
                        return true;
                    }
                }
            }
            return false;
        },
        
        /**
         * General processor info.
         * @return {Object} Processor properties info.
         */
        getInfo = function() {
            return my.info;
        },
        
        getType = function() {
            return type;
        },
        
        setID = function(newId) {
            id = newId;
        },
        
        getID = function() {
            return id;
        },
        
        /**
         * Restore processor from data object.
         * @param {Object} data Preferences data object.
         */
        setData = function(data) {
            for (var key in my.params) {
                if (my.params.hasOwnProperty(key)) {
                    my.params[key].setData(data[key]);
                }
            }
        }, 
        
        /**
         * Write processor settings to data object.
         */
        getData = function() {
            var data = {};
            data.type = type;
            data.id = id;
            
            // parameters
            for (var key in my.params) {
                if (my.params.hasOwnProperty(key)) {
                    data[key] = my.params[key].getData();
                }
            }
            
            // connections
            if (typeof my.getDestinationsData == 'function') {
                my.getDestinationsData(data);
            }
            
            // processor specific data
            if (typeof my.getProcessorSpecificData == 'function') {
                my.getProcessorSpecificData(data);
            }
            return data;
        };
    
    my = my || {};
    my.params = my.param || {};
    my.defineParams = defineParams;
    
    that = specs.that || {};
    if (my.info.inputs == 1) {
        that = Object(__WEBPACK_IMPORTED_MODULE_5__connectorin__["a" /* default */])(specs, my);
    }
    if (my.info.outputs == 1) {
        that = Object(__WEBPACK_IMPORTED_MODULE_6__connectorout__["a" /* default */])(specs, my);
    }
    
    that.setParamValue = setParamValue;
    that.getParamValue = getParamValue;
    that.getParameters = getParameters;
    that.hasParameter = hasParameter;
    that.getInfo = getInfo;
    that.getType = getType;
    that.setID = setID;
    that.getID = getID;
    that.setData = setData;
    that.getData = getData;
    
    return that;
}


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createBooleanParameter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base__ = __webpack_require__(0);


/**
 * Parameter for Boolean values.
 */
function createBooleanParameter(specs, my) {
    var that,
        
        normalize = function(value) {
            return value ? 1 : 0;
        },
        
        deNormalize = function(normalizedValue) {
            return normalizedValue > .5;
        };
    
    my = my || {};
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = Object(__WEBPACK_IMPORTED_MODULE_0__base__["a" /* default */])(specs, my);
    
    return that;
}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export default */
/**
 * Functionality for parameters that are controllable by external MIDI CC values.
 * Also includes functionality for MIDI learn mode.
 */
function createRemoteParameter(specs, my) {
    var that,
        remoteStateChangeCallbacks = [],
        
        /**
         * Set the remote state of the parameter.
         * This calls the setting view associated with this parameter, so that
         * it goes into learn mode or shows it's selected or assigned.
         * @param {String} state Remote assignment state, for example 'selected' or 'assigned'
         * @param {Function} callback Function to call when in learn mode (ugly, improve some day)
         */
        setRemoteState = function(state, callback) {
            for (var i = 0, n = remoteStateChangeCallbacks.length; i < n; i++) {
                remoteStateChangeCallbacks[i](state, callback);
            }
        },
        
        /**
         * Add a callback function to update the remote overlay on the
         * parameter's setting view, so that the setting view can go
         * into learn mode, or show that it's selected or assigned.
         * It also updates the remote view entries of assigned parameters.
         * @param {Function} callback Callback function.
         */
        addRemoteStateCallback = function(callback) {
            remoteStateChangeCallbacks.push(callback);
        },

        /**
         * Removes a callback function.
         * @param {Function} callback The function that will be removed.
         */
        removeRemoteStateCallback = function(callback) {
            var index = remoteStateChangeCallbacks.indexOf(callback);
            if (index > -1) {
                remoteStateChangeCallbacks.splice(index, 1);
            }
        },
        
        setRemoteProperty = function(key, value) {
            if (my.remoteProps.hasOwnProperty(key)) {
                my.remoteProps[key] = value;
            }
        },
        
        getRemoteProperty = function(key) {
            if (my.remoteProps.hasOwnProperty(key)) {
                return my.remoteProps[key];
            }
        },
        
        getRemoteData = function() {
            return my.remoteProps;
        };
    
    my = my || {};
    my.remoteProps = {
        channel: null,
        controller: null
    };
    
    that = specs.that || {};
    
    that.setRemoteState = setRemoteState;
    that.addRemoteStateCallback = addRemoteStateCallback;
    that.removeRemoteStateCallback = removeRemoteStateCallback;
    that.setRemoteProperty = setRemoteProperty;
    that.getRemoteProperty = getRemoteProperty;
    that.getRemoteData = getRemoteData;
    return that;
}


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createIntegerParameter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base__ = __webpack_require__(0);


/**
 * Parameter for integer values between a minimum and maximum.
 */
function createIntegerParameter(specs, my) {
    var that,
        changedMaxCallbacks = [],
        
        init = function() {
            my.props.min = specs.min;
            my.props.max = specs.max;
        },
        
        /**
         * Convert value to number between 0 and 1.
         * @param  {Number} value Parameter's value.
         * @return {Number} Normalised value between 0 and 1.
         */
        normalize = function(value) {
            return (value - my.props.min) / (my.props.max - my.props.min);
        },
        
        /**
         * Get value from number between 0 and 1.
         * @param  {Number} normalizedValue Normalised value between 0 and 1.
         * @return {Number} Parameter's value.
         */
        deNormalize = function(normalizedValue) {
            return Math.round(my.props.min + normalizedValue * (my.props.max - my.props.min));
        },
        
        /**
         * Set a new maximum value.
         * This happens to EPG pulses and rotation when steps change.
         * @param {Number} newMax The new Maximum value for this parameter.
         */
        setMax = function(newMax) {
            my.props.max = newMax;
            var n = changedMaxCallbacks.length;
            for (var i = 0; i < n; i++) {
                changedMaxCallbacks[i](my.props.max);
            }
        },
    
        /**
         * Adds a max callback function.
         * @param {Function} callback The function, that will be invoked on max value changed.
         */
        addChangedMaxCallback = function(callback) {
            changedMaxCallbacks.push(callback);
        },

        /**
         * Removes a max callback function.
         * @param {Function} callback The function that will be removed.
         */
        removeChangedMaxCallback = function(callback) {
            var index = changedMaxCallbacks.indexOf(callback);
            if (index > -1) {
                changedMaxCallbacks.splice(index, 1);
            }
        };
    
    my = my || {};
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = Object(__WEBPACK_IMPORTED_MODULE_0__base__["a" /* default */])(specs, my);
    
    init();
    
    that.setMax = setMax;
    that.addChangedMaxCallback = addChangedMaxCallback;
    that.removeChangedMaxCallback = removeChangedMaxCallback;
    return that;
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createItemizedParameter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base__ = __webpack_require__(0);


/**
 * Parameter for integer values between an minimum and maximum.
 */
function createItemizedParameter(specs, my) {
    var that,
        
        normalize = function(value) {
            return (value - my.min) / (my.max - my.min);
        },
        
        deNormalize = function(normalizedValue) {
            if (normalizedValue == 1) {
                return values[my.model[my.model.length - 1].value];
            }
            return my.model[Math.floor(normalizedValue * my.model.length)].value;
        },
        
        getModel = function() {
            return my.model;
        };
    
    my = my || {};
    my.model = specs.model;
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = Object(__WEBPACK_IMPORTED_MODULE_0__base__["a" /* default */])(specs, my);
    
    that.getModel = getModel;
    return that;
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createStringParameter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base__ = __webpack_require__(0);


/**
 * Parameter for String values.
 */
function createStringParameter(specs, my) {
    var that,
        
        normalize = function(value) {
            return value ? 1 : 0;
        },
        
        deNormalize = function(normalizedValue) {
            return value;
        };
    
    my = my || {};
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = Object(__WEBPACK_IMPORTED_MODULE_0__base__["a" /* default */])(specs, my);
    
    return that;
}


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createVector2DParameter;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__base__ = __webpack_require__(0);


/**
 * Parameter for Boolean values.
 */
function createVector2DParameter(specs, my) {
    var that,
        
        normalize = function(value) {
            return value ? 1 : 0;
        },
        
        deNormalize = function(normalizedValue) {
            return value;
        };
    
    my = my || {};
    my.normalize = normalize;
    my.deNormalize = deNormalize;
    
    that = Object(__WEBPACK_IMPORTED_MODULE_0__base__["a" /* default */])(specs, my);
    
    return that;
}


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDIConnectorIn;
/**
 * MIDI network processor in connector.
 */
function createMIDIConnectorIn(specs, my) {
    var that,
        sources = [],
        numSources = 0,
        
        /**
         * Collects data from all processors this input is connected to.
         * @return {Array} MIDI event data from all connected processors.
         */
        getInputData = function() {
            var outputData = [], 
                data = [];
            for (var i = 0; i < numSources; i++) {
                data = sources[i].getOutputData();
                outputData = outputData.concat(data);
                data.length = 0;
            }
            return outputData;
        },
        
        /**
         * Connect a processor as source for this processor.
         * @param  {Object} processor Network MIDI processor.
         */
        addConnection = function(processor) {
            sources.push(processor);
            numSources = sources.length;
            console.log('Connect ' + processor.getType() + ' (id ' + processor.getID() + ') to ' + that.getType() + ' (id ' + that.getID() + ')');
        },
        
        /**
         * Remove a processor as source for this processor.
         * @param  {Object} processor Network MIDI processor.
         */
        removeConnection = function(processor) {
            var n = sources.length;
            while (--n >= 0) {
                if (processor === sources[n]) {
                    sources.splice(n, 1);
                    numSources = sources.length;
                    console.log('Disconnect ' + processor.getType() + ' (id ' + processor.getID() + ') from ' + that.getType() + ' (id ' + that.getID() + ')');
                    break;
                }
            }
        },
        
        /**
         * Get number of connections.
         * Used by the output port module to determine if 
         * @return {Number} Number of connections to this output processor.
         */
        hasInputConnections = function() {
            return numSources > 0;
        };
    
    my = my || {};
    my.getInputData = getInputData;

    that = specs.that || {};
    that.addConnection = addConnection;
    that.removeConnection = removeConnection;
    that.hasInputConnections = hasInputConnections;
    return that;
}


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDIConnectorOut;
/**
 * MIDI network processor out connector.
 */
function createMIDIConnectorOut(specs, my) {
    var that,
        outputData = [],
        destinations = [],
        
        /**
         * Set output data that is the result of this processor's processing.
         * It will be collected by the processors attached to this output.
         * @param {Object} eventData MIDI event data.
         */
        setOutputData = function(eventData) {
            outputData.push(eventData);
        },
        
        /**
         * Public function for processors connected to this output to
         * collect the data this processor's process function has produced.
         * @return {Object} MIDI event data.
         */
        getOutputData = function() {
            return outputData;
        },
        
        /**
         * Connect this processor's output to another processor's input.
         * @param  {Object} processor Processor to connect to.
         */
        connect = function(processor) {
            var isConnected = false,
                n = destinations.length;
            for (var i = 0; i < n; i++) {
                if (processor === destinations[i]) {
                    isConnected = true;
                    break;
                }
            }
            if (!isConnected) {
                processor.addConnection(that);
                destinations.push(processor);
            }
        },
        
        /**
         * Disconnect this processor's output from another processor's input.
         * @param  {Object} processor Processor to disconnect from, or undefined to remove all.
         */
        disconnect = function(processor) {
            var n = destinations.length;
            while (--n >= 0) {
                if (!processor || (processor && processor === destinations[n])) {
                    destinations[n].removeConnection(that);
                    destinations.splice(n, 1);
                }
            }
        },
        
        /**
         * Get destination processors.
         * Used to draw the connection cables on canvas.
         * @return {Array} Processors this output connects to.
         */
        getDestinations = function() {
            return destinations;
        },
        
        /**
         * The destinations are the processors this output is connected to.
         * This function collects the ID's of these processors and adds them
         * to a data object that can be stored.
         * So this project and its processor connections can be restored.
         * @param  {Object} data Project data object.
         */
        getDestinationsData = function(data) {
            data.destinations = [];
            var n = destinations.length;
            for (var i = 0; i < n; i++) {
                data.destinations.push(destinations[i].getID());
            }
        };
    
    my = my || {};
    my.setOutputData = setOutputData;
    my.getDestinationsData = getDestinationsData;

    that = specs.that || {};
    
    that.getDestinations = getDestinations;
    that.getOutputData = getOutputData;
    that.connect = connect;
    that.disconnect = disconnect;
    return that;
}


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["createMIDIProcessor"] = createMIDIProcessor;
/* harmony export (immutable) */ __webpack_exports__["getType"] = getType;
function createMIDIProcessor(specs) {
    let that;

    const initialize = function() {
            console.log(midiProcessors);
        },

        terminate = function() {},

        process = function(scanStart, scanEnd, nowToScanStart, ticksToMsMultiplier, offset) {},

    that = createMIDIProcessorBase(specs, my);

    initialize();

    that.terminate = terminate;
    that.process = process;
    that.render = render;
    return that;
}

function getType() {
    return 'example';
}

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDIRemote;
/**
 * MIDIRemote assigns MIDI Continuous Controllers to processor parameters.
 *
 * If a CC is assigned and that CC was already assigned, the old assignment is removed.
 * If a parameter is assigned and it is then reassigned to a different CC, the old assignment is removed.
 */
function createMIDIRemote(specs) {
    var that,
        app = specs.app,
        remoteView = specs.remoteView,
        midiInputs = [],
        assignments = [],
        paramLookup = {},
        selectedParameter,
        isInLearnMode = false,
        processors = [],
        midiMessageListener,

        init = function() {
            midiMessageListener = onMIDIMessage;
        },

        /**
         * Add a MIDI Input port only if it doesn't yet exist.
         * The port is the module created in midi.port.input.js,
         * not a Web MIDI API MIDIInput.
         * @param {Object} midiInputPort MIDI input port module.
         */
        addMidiInput = function(midiInputPort) {
            var midiInputPortID = midiInputPort.getID(),
                existingMidiInputPort = getMIDIInputByID(midiInputPortID);

            if (!existingMidiInputPort) {
                // store reference to midiInputPort module
                midiInputs.push(midiInputPort);
            }
            
            // subscribe to receive messages from this MIDI input
            midiInputPort.addMIDIMessageListener(midiMessageListener);
        },

        /**
         * Remove a MIDI input port from being a remote source.
         * @param {Object} midiInputPort MIDI input port object.
         */
        removeMidiInput = function(midiInputPort) {
            // unsubscribe from receiving messages from this MIDI input
            midiInputPort.removeMIDIMessageListener(midiMessageListener);
        },
        
        /**
         * Find midiInputPort from list of added inputs by ID.
         * @param {String} midiInputPortID [description]
         * @return {Object|undefined} MidiInputPort object or undefined if not found.
         */
        getMIDIInputByID = function(midiInputPortID) {
            for (var i = 0, n = midiInputs.length; i < n; i++) {
                if (midiInputs[i].getID() === midiInputPortID) {
                    return midiInputs[i];
                }
            }
        },

        /**
         * Eventlistener for incoming MIDI messages.
         * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIMessageEvent
         * @param  {Object} e MIDIMessageEvent event.
         */
        onMIDIMessage = function(e) {
            // only continuous controller message, 0xB == 11
            if (e.data[0] >> 4 === 0xB) {
                var channel = (e.data[0] & 0xf) + 1,
                    params = paramLookup[channel + '_' + e.data[1]];
                if (params) {
                    for (let i = 0, n = params.length; i < n; i++) {
                        params[i].setValueNormalized(e.data[2] / 127);
                    }
                }
            }
        },

        /**
         * Listener for MIDI events in case the app is in MIDI learn mode.
         * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIMessageEvent
         * @param  {Object} e MIDIMessageEvent event.
         */
        onMIDILearnMessage = function(e) {
            if (selectedParameter) {
                if (e.data[0] >> 4 === 0xB) {
                    var channel = (e.data[0] & 0xf) + 1,
                        controller = e.data[1];
                    assignParameter(selectedParameter, channel, controller);
                    deselectParameter();
                }
            }
        },

        /**
         * Toggle MIDI learn mode, so incoming MIDI messages are used to
         * assign a selected parameter to the incoming message type.
         * @param {Boolean} isEnabled True to enable MIDI learn mode.
         */
        toggleMidiLearn = function(isEnabled) {
            isInLearnMode = isEnabled;
            deselectParameter();
            app.appUpdated('remote', isInLearnMode);

            // set learn mode on all parameters
            for (var i = 0; i < processors.length; i++) {
                setProcessorLearnMode(processors[i]);
            }

            // midi listener switches with learn mode
            var oldMidimessageListener;
            if (isInLearnMode) {
                oldMidimessageListener = onMIDIMessage;
                midiMessageListener = onMIDILearnMessage;
            } else {
                oldMidimessageListener = onMIDILearnMessage;
                midiMessageListener = onMIDIMessage;
            }

            // set listener on all midi ports
            let midiInput;
            for (var i = 0, n = midiInputs.length; i < n; i++) {
                midiInput = midiInputs[i];
                if (midiInput.getConnected()) {
                    midiInput.removeMIDIMessageListener(oldMidimessageListener);
                    midiInput.addMIDIMessageListener(midiMessageListener);
                }
            }
        },
        
        /**
         * Set remote state of a processor's remote capable parameters.
         * @param {Object} processor Processor to enter or exit learn mode.
         */
        setProcessorLearnMode = function(processor) {
            var remoteState = isInLearnMode ? 'enter' : 'exit';
            for (var i = 0; i < processor.params.length; i++) {
                processor.params[i].setRemoteState(remoteState, selectParameter);
            }
        },

        /**
         * Set a parameter as selected to be assigned.
         * @param {Object} param Processor parameter.
         */
        selectParameter = function(param) {
            if (selectedParameter) {
                deselectParameter();
            }
            selectedParameter = param;
            selectedParameter.setRemoteState('selected');
        },

        /**
         * Unselect the selected parameter so it can't be assigned anymore.
         */
        deselectParameter = function() {
            if (selectedParameter) {
                selectedParameter.setRemoteState('deselected');
                selectedParameter = null;
            }
        },

        /**
         * Assign a MIDI controller to a parameter.
         * @param  {Object} param Processor parameter to be assigned a MIDI control.
         * @param  {Number} channel MIDI channel.
         * @param  {Number} controller MIDI CC number.
         */
        assignParameter = function(param, channel, controller) {
            // find if this parameter is already assigned
            let n = assignments.length;
            while (--n >= 0) {
                var a = assignments[n];
                if (a.param == param) {
                    if (a.channel == channel && a.controller == controller) {
                        // the parameter is assigned to this channel / cc,
                        // don't assign it again
                        return;
                    } else {
                        // the parameter is assigned to another channel / cc,
                        // first remove that assignment
                        unassingParameter(param);
                    }
                }
            }
            
            // add the assignment to the model
            assignments.push({
                param: param,
                channel: channel,
                controller: controller
            });
            
            // create lookup for this MIDI controller
            if (!paramLookup[channel + '_' + controller]) {
                paramLookup[channel + '_' + controller] = [];
            }
            // add parameter to the lookup table
            paramLookup[channel + '_' + controller].push(param);

            // update the parameter
            param.setRemoteProperty('channel', channel);
            param.setRemoteProperty('controller', controller);
            param.setRemoteState('assigned');

            // add parameter to the view
            remoteView.addParameter(param);
        },

        /**
         * Unassign a parameter from being MIDI controlled.
         * @param  {Object} param Processor parameter to be unassigned.
         */
        unassingParameter = function(param) {
            var portId = param.getRemoteProperty('portId'),
                channel = param.getRemoteProperty('channel'),
                controller = param.getRemoteProperty('controller'),
                midiInput = getMIDIInputByID(portId);
                
            // remove the assignment from the model
            var n = assignments.length;
            while (--n >= 0) {
                var a = assignments[n];
                if (a.param == param && a.channel == channel && a.controller == controller) {
                    assignments.splice(n, 1);
                    break;
                }
            }
            
            // remove parameter from the lookup table;
            var params = paramLookup[channel + '_' + controller];
            if (params) {
                if (params.length == 1) {
                    // remove whole array if this is the only parameter
                    delete paramLookup[channel + '_ ' + controller];
                } else {
                    // remove parameter from array
                    var n = params.length;
                    while (--n >= 0) {
                        if (params[n] == param) {
                            params.splice(n, 1);
                        } 
                    }
                }
            }

            // update the parameter
            param.setRemoteProperty('channel', null);
            param.setRemoteProperty('controller', null);
            param.setRemoteState('unassigned');

            // remove parameter from the view
            remoteView.removeParameter(param);
        },
        
        /**
         * Register a processor of which parameters might be remote controlled.
         * @param {Object} processor Network processor.
         */
        registerProcessor = function(processor) {
            var params = processor.getParameters(),
                controllableParams = [],
                processorObject = {};

            // create array of all controllable parameters of the processor
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    if (params[key].getProperty('isMidiControllable') === true) {
                        controllableParams.push(params[key]);
                    }
                }
            }

            if (controllableParams.length) {
                // add data to processors list
                processorObject.processor = processor;
                processorObject.params = controllableParams;
                processors.push(processorObject);
                // update view
                remoteView.createRemoteGroup(processor);
            }
            
            // set processor's parameters in learn mode, if necessary
            if (isInLearnMode) {
                setProcessorLearnMode(processorObject);
            }
        },
        
        /**
         * Unregister a processor of which parameters might be remote controlled.
         * @param {Object} processor Network processor.
         */
        unregisterProcessor = function(processor) {
            var n = processors.length;
            while (--n >= 0) {
                if (processors[n].processor === processor) {
                    // remove data from processors list
                    processors.splice(n, 1);
                    // update view
                    remoteView.deleteRemoteGroup(processor);
                }
            }
        },

        /**
         * Clear all assignments.
         * Unassign all parameters.
         * Unregister all processors.
         */
        clear = function() {
            // unassign all parameters
            for (let key in paramLookup) {
                if (paramLookup.hasOwnProperty(key)) {
                    paramLookup[key].forEach(function(param) {
                        unassingParameter(param);
                    });
                }
            }
            paramLookup = {};
            
            // unregister all processors
            processors.forEach(function(processor) {
                unregisterProcessor(processor);
            });
        },

        /**
         * Restore assigned parameters from data object.
         * @param {Object} data  data object.
         */
        setData = function(data = []) {
            // clear all old data
            clear();
            
            // set new data
            let item;
            for (let i = 0, n = data.length; i < n; i++) {
                item = data[i];
                // find processor
                let processorID = item.processorID;
                let n = processors.length;
                while (--n >= 0) {
                    if (processors[n].processor.getID() == processorID) {
                        // processor found, find parameter
                        let params = processors[n].params,
                            m = params.length;
                        while (--m >= 0) {
                            if (params[m].getProperty('key') == item.paramKey) {
                                // found parameter, assign to remote controller
                                let channel = item.paramRemoteData.channel,
                                    controller = item.paramRemoteData.controller;
                                assignParameter(params[m], channel, controller)
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        },

        /**
         * Write assigned parameters to data object.
         * Data object structure:
         * data: [{}]
         * @return {Object} Contains port and parameter data.
         */
        getData = function() {
            // loop through midi ports lookup
            let param, processorID, data = [];
            for (let key in paramLookup) {
                if (paramLookup.hasOwnProperty(key)) {
                    params = paramLookup[key];
                    // loop through all parameters assigned to this channel and cc
                    for (let i = 0, n = params.length; i < n; i++) {
                        param = params[i];
                        // find processor for the parameter to get its id
                        processorID = null;
                        let n = processors.length;
                        while (--n >= 0) {
                            let m = processors[n].params.length;
                            while (--m >= 0) {
                                if (param === processors[n].params[m]) {
                                    processorID = processors[n].processor.getID();
                                    break;
                                }
                            }
                        }
                        data.push({
                            processorID: processorID,
                            paramKey: param.getProperty('key'),
                            paramRemoteData: param.getRemoteData()
                        });
                    }
                }
            }
            return data;
        };

    that = specs.that;

    init();

    that.addMidiInput = addMidiInput;
    that.removeMidiInput = removeMidiInput;
    that.toggleMidiLearn = toggleMidiLearn;
    that.unassingParameter = unassingParameter;
    that.registerProcessor = registerProcessor;
    that.unregisterProcessor = unregisterProcessor;
    that.clear = clear;
    that.setData = setData;
    that.getData = getData;
    return that;
}


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createMIDISync;
/**
 * MIDISync listens to incoming sync data.
 * 11111000 timing clock
 * 11111010 start
 * 11111011 continue
 * 11111100 stop
 */
function createMIDISync(specs) {
    var that,
        transport = specs.transport,
        midiInputs = [],

        /**
         * Add a MIDI Input port only if it doesn't yet exist.
         * The port is the object created in midi.port.input.js,
         * not a Web MIDI API MIDIInput.
         * @param {Object} midiInputPort MIDI input port object.
         */
        addMidiInput = function(midiInputPort) {
            var exists = false,
                midiInputPortID = midiInputPort.getID();
            for (var i = 0, n = midiInputs.length; i < n; i++) {
                if (midiInputs[i].getID() === midiInputPortID) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                // keep reference to midiInputPort
                midiInputs.push(midiInputPort);

                // subscribe to receive messages from this MIDI input
                midiInputPort.addMIDIMessageListener(onMIDIMessage);
            }
        },

        /**
         * Remove a MIDI input port from being a remote source.
         * @param {Object} midiInputPort MIDI input port object.
         */
        removeMidiInput = function(midiInputPort) {
            for (var i = 0, n = midiInputs.length; i < n; i++) {
                if (midiInputs[i] === midiInputPort) {
                    midiInputs.splice(i, 1);
                    // unsubscribe from receiving messages from the MIDI input.
                    midiInputPort.removeMIDIMessageListener(onMIDIMessage);
                    // and we're done
                    break;
                }
            }
        },

        /**
         * Eventlistener for incoming MIDI messages.
         * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIMessageEvent
         * @see https://www.midi.org/specifications/item/table-1-summary-of-midi-message
         * @param  {Object} e MIDIMessageEvent event.
         */
        onMIDIMessage = function(e) {
            // data[1] and data[2] are undefined,
            // for e.data[0] & 0xf:
            //  8 = clock, 248 (11110000 | 00000100)
            // 10 = start
            // 11 = continue
            // 12 = stop
            switch (e.data[0]) {
                case 248:
                    break;
                case 250:
                    transport.rewind();
                    transport.start();
                    break;
                case 251:
                    transport.start();
                    break;
                case 252:
                    transport.pause();
                    break;
            }
        };

    that = specs.that;

    that.addMidiInput = addMidiInput;
    that.removeMidiInput = removeMidiInput;
    return that;
}


/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createActions;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_util__ = __webpack_require__(1);


function createActions(specs = {}, my = {}) {
    const SET_PREFERENCES = 'SET_PREFERENCES';
    const SET_PROJECT = 'SET_PROJECT';
    const SET_THEME = 'SET_THEME';
    const CREATE_PROCESSOR = 'CREATE_PROCESSOR';

    return {
        SET_PREFERENCES: SET_PREFERENCES,
        setPreferences: (data) => {
            return { type: SET_PREFERENCES, data: data };
        },

        SET_PROJECT: SET_PROJECT,
        setProject: (data) => {
            return { type: SET_PROJECT, data: data };
        },

        SET_THEME: SET_THEME,
        setTheme: (value) => {
            return { type: SET_THEME, data: value };
        },

        CREATE_PROCESSOR: CREATE_PROCESSOR,
        createProcessor: (data) => {
            const config = __webpack_require__(26)(`./${data.type}/config.json`);
            return { type: CREATE_PROCESSOR, data: Object.assign(data, config, {
                id: `${data.type}_${__WEBPACK_IMPORTED_MODULE_0__core_util__["a" /* util */].createUUID()}`
            })};
        }
    };
}


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./epg/config.json": 27,
	"./example/config.json": 28
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 26;

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = {"name":"Euclidean","inputs":0,"outputs":1}

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = {"info":{"name":"","version":"0.0.0"},"params":{}}

/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createReducers;

function createReducers(specs = {}, my = {}) {

    const initialState = {
            bpm: 120,
            processors: [],
            preferences: {
                isDarkTheme: false
            },
            remote: {}
        },
        
        reduce = function(state = initialState, action = {}, actions) {
            let newState;
            switch(action.type) {

                case actions.SET_PREFERENCES:
                    newState = Object.assign({}, state);
                    newState.preferences.isDarkTheme = action.data ? action.data.isDarkTheme : false;
                    return newState;

                case actions.SET_PROJECT:
                    return Object.assign({}, state, {
                        bpm: action.data.bpm || initialState.bpm,
                        network: action.data.network || initialState.network,
                        remote: action.data.remote || initialState.remote
                    });

                case actions.SET_THEME:
                    return Object.assign({}, state, {
                        preferences: {
                            isDarkTheme: action.data || false
                        }
                    });

                case actions.CREATE_PROCESSOR:
                    newState = Object.assign({}, state);
                    const numInputProcessors = newState.processors.filter((item) => item.type === 'input').length;
                    // array index depends on processor type
                    switch (action.data.type) {
                        case 'input':
                            newState.processors.unshift(action.data);
                            numInputProcessors++;
                            break;
                        case 'output':
                            newState.processors.push(action.data);
                            break;
                        default:
                            newState.processors.splice(numInputProcessors, 0, action.data);
                    }
                    return newState;
                
                default:
                    return state;
            }
        };
    
    return {
        reduce: reduce
    }
}


/***/ }),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createStore;

function createStore(specs = {}, my = {}) {
    const STATE_CHANGE = 'STATE_CHANGE';

    let that = {},
        actions = specs.actions,
        reducers = specs.reducers,
        currentState,
        
        dispatch = (action) => {
            // thunk or not
            if (typeof action === 'function') {
                
            } else {

            }
            currentState = reducers.reduce(currentState, action, actions);
            document.dispatchEvent(new CustomEvent(STATE_CHANGE, { detail: {
                state: currentState,
                action: action,
                actions: actions
            }}));
        },
        
        getActions = () => {
            return actions;
        },
        
        getState = () => {
            return currentState;
        };

    that = specs.that || {};
    
    that.STATE_CHANGE = STATE_CHANGE;
    that.dispatch = dispatch;
    that.getActions = getActions;
    that.getState = getState;
    return that;
}


/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createAppView;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__settings__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__windowresize__ = __webpack_require__(2);



/**
 * Main application view.
 */
function createAppView(specs, my) {
    var that,
        store = specs.store,
        app = specs.app,
        midiNetwork = specs.midiNetwork,
        rootEl = document.querySelector('#app'),
        panelsEl = document.querySelector('.panels'),
        helpEl = document.querySelector('.help'),
        prefsEl = document.querySelector('.prefs'),
        editEl = document.querySelector('.edit'),
        editContentEl = document.querySelector('.edit .panel__content'),
        remoteEl = document.querySelector('.remote'),
        settingsViews = [],
        panelHeaderHeight,
        controls = {
            play: {
                type: 'checkbox',
                input: document.getElementById('play-check')
            },
            bpm: {
                type: 'number',
                input: document.getElementById('bpm-number')
            },
            remote: {
                type: 'checkbox',
                input: document.getElementById('learn-check')
            },
            prefs: {
                type: 'checkbox',
                input: document.getElementById('prefs-check')
            },
            edit: {
                type: 'checkbox',
                input: document.getElementById('edit-check')
            },
            connections: {
                type: 'checkbox',
                input: document.getElementById('connections-check')
            },
            help: {
                type: 'checkbox',
                input: document.getElementById('help-check')
            }
        },
        
        init = function() {
            controls.play.input.addEventListener('change', function(e) {
                app.updateApp('play');
            });
            controls.bpm.input.addEventListener('change', function(e) {
                app.updateApp('bpm', e.target.value);
            });
            controls.remote.input.addEventListener('change', function(e) {
                app.updateApp('remote', e.target.checked);
                app.togglePanel('remote', e.target.checked);
            });
            controls.prefs.input.addEventListener('change', function(e) {
                app.togglePanel('preferences', e.target.checked);
            });
            controls.edit.input.addEventListener('change', function(e) {
                app.togglePanel('settings', e.target.checked);
            });
            controls.connections.input.addEventListener('change', function(e) {
                app.updateApp('connections', e.target.checked);
            });
            controls.help.input.addEventListener('change', function(e) {
                app.togglePanel('help', e.target.checked);
            });
            
            document.addEventListener('keyup', function(e) {
                switch (e.keyCode) {
                    case 32:
                        // don't toggle play while typing space key in a text field.
                        if (e.target.tagName.toLowerCase() == 'input' && e.target.getAttribute('type') == 'text') {
                            return;
                        }
                        app.updateApp('play');
                        break;
                }
            });

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.SET_PREFERENCES:
                    case e.detail.actions.SET_THEME:
                        rootEl.dataset.theme = e.detail.state.preferences.isDarkTheme ? 'dark' : '';
                        break;
                    
                    case e.detail.actions.CREATE_PROCESSOR:
                        createSettingsViews(e.detail.state.processors);
                        break;
                }
            });
            
            // get panel header height from CSS.
            var style = getComputedStyle(document.body);
            panelHeaderHeight = parseInt(style.getPropertyValue('--header-height'), 10);
            
            my.addWindowResizeCallback(renderLayout);
            renderLayout();
        },

        /**
         * Create settings controls view for a processor.
         * @param  {Object} processor MIDI processor to control with the settings.
         */
        createSettingsViews = function(state) {
            state.forEach((data, i) => {
                if (!settingsViews[i] || (data.id !== settingsViews[i].getID())) {
                    settingsViews.splice(i, 0, Object(__WEBPACK_IMPORTED_MODULE_0__settings__["a" /* default */])(data));
                }
            });
        },

        // createSettingsView = function(processor) {
        //     var settingsView = createSettingsView({
        //         midiNetwork: midiNetwork,
        //         processor: processor,
        //         parentEl: editContentEl
        //     });
        //     settingsViews.push(settingsView);
        // },
        
        /**
         * Delete settings controls view for a processor.
         * @param  {Object} processor MIDI processor to control with the settings.
         */
        deleteSettingsView = function(processor) {
            var n = settingsViews.length;
            while (--n >= 0) {
                if (settingsViews[n].hasProcessor(processor)) {
                    settingsViews[n].terminate();
                    settingsViews.splice(n, 1);
                    return false;
                }
            }
        },
        
        renderLayout = function(leftColumn = true, rightColumn = true) {
            if (leftColumn) {
                renderColumnLayout(prefsEl, remoteEl, false);
            }
            if (rightColumn) {
                renderColumnLayout(helpEl, editEl, true);
            }
        },
        
        renderColumnLayout = function(topEl, btmEl, isRightColumn) {
            const totalHeight = panelsEl.clientHeight,
                columnWidth = document.querySelector('.panels__right').clientWidth,
                topWidth = topEl.clientWidth,
                btmWidth = btmEl.clientWidth,
                isTopVisible = topEl.dataset.show == 'true',
                isBtmVisible = btmEl.dataset.show == 'true',
                topViewportEl = topEl.querySelector('.panel__viewport'),
                btmViewportEl = btmEl.querySelector('.panel__viewport');
            
            let topHeight, btmHeight, topContentHeight, btmContentHeight;
            
            // reset heights before measuring them
            topViewportEl.style.height = 'auto';
            btmViewportEl.style.height = 'auto';
            
            topHeight = topEl.clientHeight,
            btmHeight = btmEl.clientHeight,
            topContentHeight = topEl.querySelector('.panel__content').clientHeight,
            btmContentHeight = btmEl.querySelector('.panel__content').clientHeight;
            
            if (isRightColumn && (topWidth + btmWidth < columnWidth)) {
                if (topContentHeight + panelHeaderHeight > totalHeight) {
                    topViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                } else {
                    topViewportEl.style.height = 'auto';
                }
                if (btmContentHeight + panelHeaderHeight > totalHeight) {
                    btmViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                } else {
                    btmViewportEl.style.height = 'auto';
                }
            } else {
                if (isTopVisible && isBtmVisible) {
                    let combinedHeight = topContentHeight + btmContentHeight + (panelHeaderHeight * 2);
                    if (combinedHeight > totalHeight) {
                        if (topContentHeight + panelHeaderHeight < totalHeight / 2) {
                            topViewportEl.style.height = prefsEl.topContentHeight + 'px';
                            btmViewportEl.style.height = (totalHeight - topContentHeight - (panelHeaderHeight * 2)) + 'px';
                        } else if (btmContentHeight + panelHeaderHeight < totalHeight / 2) {
                            topViewportEl.style.height = (totalHeight - btmContentHeight - (panelHeaderHeight * 2)) + 'px';
                            btmViewportEl.style.height = remoteEl.topContentHeight + 'px';
                        } else {
                            topViewportEl.style.height = ((totalHeight / 2) - panelHeaderHeight) + 'px';
                            btmViewportEl.style.height = ((totalHeight / 2) - panelHeaderHeight) + 'px';
                        }
                    } else {
                        topViewportEl.style.height = 'auto';
                        btmViewportEl.style.height = 'auto';
                    }
                } else if (isTopVisible) {
                    if (topContentHeight + panelHeaderHeight > totalHeight) {
                        topViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                    } else {
                        topViewportEl.style.height = 'auto';
                    }
                } else if (isBtmVisible) {
                    if (btmContentHeight + panelHeaderHeight > totalHeight) {
                        btmViewportEl.style.height = totalHeight - panelHeaderHeight + 'px';
                    } else {
                        btmViewportEl.style.height = 'auto';
                    }
                }
            }
        },
        
        updateControl = function(property, value) {
            switch(property) {
                case 'bpm':
                    controls.bpm.input.value = value;
                    break;
                case 'play':
                    controls.play.input.checked = value;
                    break;
                case 'remote':
                    controls.remote.input.checked = value;
                    break;
                case 'settings':
                    controls.edit.input.checked = value;
                    break;
                case 'connections':
                    controls.connections.input.checked = value;
                    break;
                default:
                    console.error('Unknown updateControl property:', property);
            }
        },
        
        showPanel = function(panelID, isVisible) {
            switch (panelID) {
                case 'help':
                    helpEl.dataset.show = isVisible;
                    break;
                case 'preferences':
                    prefsEl.dataset.show = isVisible;
                    break;
                case 'remote':
                    remoteEl.dataset.show = isVisible;
                    break;
                case 'settings':
                    editEl.dataset.show = isVisible;
                    break;
                default:
                    console.error('Panel ID ', panelID, 'not found.');
                    return;
            }
            
            renderLayout();
        };
    
    my = my || {};
    
    that = Object(__WEBPACK_IMPORTED_MODULE_1__windowresize__["a" /* default */])(specs, my);
    
    init();
    
    that.renderLayout = renderLayout;
    // that.createSettingsView = createSettingsView;
    that.deleteSettingsView = deleteSettingsView;
    that.updateControl = updateControl;
    that.showPanel = showPanel;
    return that;
}


/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createSettingsPanel;
/**
 * Processor settings view.
 */
function createSettingsPanel(specs, my) {
    var that,
        // midiNetwork = specs.midiNetwork,
        // processor = specs.processor,
        settingViews = [],
        el,
        
        initialize = function() {
            el = __webpack_require__(33)(`./${specs.type}/settings.html`);

            console.log(specs.id);
            console.log(el);

            return;


            const params = processor.getParameters();
            // let template = document.querySelector('#template-settings-' + processor.getType());
            let clone = template.content.cloneNode(true);
            el = clone.firstElementChild;
            
            if (typeof processor.addSelectCallback === 'function') {
                processor.addSelectCallback(show);
            }
            
            // loop through all processor parameters and add setting view if required
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    // only create setting if there's a container element for it in the settings panel
                    var settingContainerEl = el.querySelector('.' + key);
                    if (settingContainerEl) {
                        var param = params[key],
                            settingView = {},
                            settingViewSpecs = {
                                that: settingView,
                                param: param,
                                containerEl: settingContainerEl
                            };
                        // create the setting view based on the parameter type
                        switch (param.getProperty('type')) {
                            case 'integer':
                                settingView = ns.createIntegerSettingView(settingViewSpecs);
                                break;
                            case 'boolean':
                                settingView = ns.createBooleanSettingView(settingViewSpecs);
                                break;
                            case 'itemized':
                                settingView = ns.createItemizedSettingView(settingViewSpecs);
                                break;
                            case 'string':
                                settingView = ns.createStringSettingView(settingViewSpecs);
                                break;
                        }
                        // add view to list for future reference
                        settingViews.push(settingView);
                    }
                }
            }
            
            // default delete button of the settings panel
            if (el) {
                el.querySelector('.settings__delete').addEventListener('click', function(e) {
                    e.preventDefault();
                    midiNetwork.deleteProcessor(processor);
                });
            }
        },
        
        /**
         * Called before this view is deleted.
         */
        terminate = function() {
            if (el && parentEl) {
                show(false);
            }
        },
        
        /**
         * Show settings if the processor is selected, else remove.
         * @param {Boolean} isSelected True if selected.
         */
        show = function(isSelected)  {
            if (isSelected) {
                parentEl.appendChild(el);
            } else if (el.parentNode === parentEl) {
                parentEl.removeChild(el);
            }
        },
        
        /**
         * Check if this view is for a certain processor.
         * @param  {Object} proc MIDI processor object.
         * @return {Boolean} True if the processors match.
         */
        // hasProcessor = function(proc) {
        //     return proc === processor;
        // },
        
        getID = function() {
            return specs.id;
        };
    
    that = specs.that || {};
    
    initialize();
    
    that.terminate = terminate;
    // that.hasProcessor = hasProcessor;
    that.getID = getID;
    return that;
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./epg/settings.html": 34,
	"./example/settings.html": 35
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 33;

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = "<div class=\"settings settings--epg\">\n    <form>\n        <div class=\"panel__header panel__header--sub\">\n            <span class=\"header__label\">Euclidean Rhythm</span>\n        </div>\n        <fieldset class=\"settings__fieldset\">\n            <div class=\"settings__row steps\"></div>\n            <div class=\"settings__row pulses\"></div>\n            <div class=\"settings__row rotation\"></div>\n        </fieldset>\n        <div class=\"panel__header panel__header--sub\">\n            <span class=\"header__label\">Playback</span>\n        </div>\n        <fieldset class=\"settings__fieldset\">\n            <div class=\"settings__row rate\"></div>\n            <div class=\"settings__row note_length\"></div>\n            <div class=\"settings__row is_triplets\"></div>\n            <div class=\"settings__row is_mute\"></div>\n        </fieldset>\n        <div class=\"panel__header panel__header--sub\">\n            <span class=\"header__label\">MIDI Out</span>\n        </div>\n        <fieldset class=\"settings__fieldset\">\n            <div class=\"settings__row channel_out\"></div>\n            <div class=\"settings__row pitch_out\"></div>\n            <div class=\"settings__row velocity_out\"></div>\n        </fieldset>\n        <div class=\"panel__header panel__header--sub\">\n            <span class=\"header__label\">Other</span>\n        </div>\n        <fieldset class=\"settings__fieldset\">\n            <div class=\"settings__row name\"></div>\n            <span class=\"setting__label-text\"></span>\n            <button type=\"button\" class=\"settings__delete btn\">Delete</button>\n        </fieldset>\n    </form>\n</div>";

/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = "";

/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createCanvasView;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_util__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__windowresize__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__canvasprocessors__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__canvasconnections__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tweenjs_tween_js__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tweenjs_tween_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__tweenjs_tween_js__);






/**
 * Graphic 2D view of the processor network.
 *
 * CanvasView draws the graphics for all processors.
 * DynamicCanvas shows all elements that update each requestAnimationFrame.
 * StaticCanvas shows all elements that update only infrequently.
 * 
 * Each processor has its own view.
 * When a change happens to a processor that 
 * requires the static canvas to be redrawn:
 * - The processor's view receives a callback from a changed parameter.
 * - The view redraws its static graphics on an off-screen canvas.
 * - The view sets a dirty flag on the canvasView (this).
 * - The canvasView receives the next draw request.
 * - It clears the staticCanvas.
 * - It draws each view's off-screen canvas on the staticCanvas.
 * - It clears the dirty flag.
 */
function createCanvasView(specs, my) {
    var that,
        store = specs.store,
        // midiNetwork = specs.midiNetwork,
        rootEl,
        staticCanvas,
        dynamicCanvas,
        staticCtx,
        dynamicCtx,
        isDirty = false,
        doubleClickCounter = 0,
        doubleClickDelay = 300,
        doubleClickTimer,
        dragObjectType, // 'background|processor|connection'
        
        init = function() {
            rootEl = document.querySelector('.canvas-container');
            staticCanvas = document.querySelector('.canvas-static');
            dynamicCanvas = document.querySelector('.canvas-dynamic');
            staticCtx = staticCanvas.getContext('2d');
            dynamicCtx = dynamicCanvas.getContext('2d');
            
            rootEl.addEventListener(__WEBPACK_IMPORTED_MODULE_0__core_util__["a" /* util */].eventType.click, onClick);
            rootEl.addEventListener(__WEBPACK_IMPORTED_MODULE_0__core_util__["a" /* util */].eventType.start, onTouchStart);
            rootEl.addEventListener(__WEBPACK_IMPORTED_MODULE_0__core_util__["a" /* util */].eventType.move, dragMove);
            rootEl.addEventListener(__WEBPACK_IMPORTED_MODULE_0__core_util__["a" /* util */].eventType.end, dragEnd);

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.SET_PREFERENCES:
                    case e.detail.actions.SET_THEME:
                        const themeName = e.detail.state.preferences.isDarkTheme ? 'dark' : '';
                        setTheme(themeName);
                        break;
                }
            });
            
            my.addWindowResizeCallback(onWindowResize);
            onWindowResize();
        },
        
        /**
         * Window resize event handler.
         */
        onWindowResize = function() {
            staticCanvas.width = rootEl.clientWidth;
            staticCanvas.height = rootEl.clientHeight;
            dynamicCanvas.width = rootEl.clientWidth;
            dynamicCanvas.height = rootEl.clientHeight;
            my.canvasRect = dynamicCanvas.getBoundingClientRect();
            markDirty();
        },
        
        /**
         * Separate click and doubleclick.
         * @see http://stackoverflow.com/questions/6330431/jquery-bind-double-click-and-single-click-separately
         */
        onClick = function(e) {
            // separate click from doubleclick
            doubleClickCounter ++;
            if (doubleClickCounter == 1) {
                doubleClickTimer = setTimeout(function() {
                    doubleClickCounter = 0;
                    // implement single click behaviour here
                    onClick();
                }, doubleClickDelay);
            } else {
                clearTimeout(doubleClickTimer);
                doubleClickCounter = 0;
                // implement double click behaviour here
                onDoubleClick(e);
            }
        },
        
        /**
         * Handler for the custom doubleclick event detection.
         * Create a new pattern at the location of the doubleclick.
         */
        onDoubleClick = function(e) {
            // create a new processor
            store.dispatch(store.getActions().createProcessor({
                type: 'epg',
                position2d: {
                    x: e.clientX - my.canvasRect.left + window.scrollX,
                    y: e.clientY - my.canvasRect.top + window.scrollY
                }
            }));
            // midiNetwork.createProcessor({
            //     type: 'epg',
            //     position2d: {
            //         x: e.clientX - my.canvasRect.left + window.scrollX,
            //         y: e.clientY - my.canvasRect.top + window.scrollY
            //     }
            // });
        },
        
        /**
         * Select the object under the mouse.
         * Start dragging the object.
         */
        onTouchStart = function(e) {
            let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                canvasY = e.clientY - my.canvasRect.top + window.scrollY;
            
            if (my.isConnectMode && my.intersectsOutConnector(canvasX, canvasY)) {
                dragObjectType = 'connection';
            } else if (my.intersectsProcessor(canvasX, canvasY)) {
                dragObjectType = 'processor';
            } else {
                dragObjectType = 'background';
            }
        },
        
        /**
         * Drag a view.
         * @param  {Object} e Event.
         */
        dragMove = function(e) {
            e.preventDefault();
            
            if (dragObjectType) {
                let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                    canvasY = e.clientY - my.canvasRect.top + window.scrollY;
                
                switch (dragObjectType) {
                    case 'connection':
                        my.dragMoveConnection(canvasX, canvasY);
                        break;
                    case 'processor':
                        my.dragSelectedProcessor(canvasX, canvasY);
                        my.updateConnectorsInfo();
                        my.drawOfflineCanvas();
                        break;
                    case 'background':
                        my.dragAllProcessors(canvasX, canvasY);
                        my.updateConnectorsInfo();
                        my.drawOfflineCanvas();
                        break;
                }
                
                my.markDirty();
            }
        },
        
        /**
         * Dragging 3D object ended.
         * @param  {Object} e Event.
         */
        dragEnd = function(e) {
            e.preventDefault();
            
            if (dragObjectType) {
                dragMove(e);
                let canvasX = e.clientX - my.canvasRect.left + window.scrollX,
                    canvasY = e.clientY - my.canvasRect.top + window.scrollY;
                switch (dragObjectType) {
                    case 'connection':
                        my.intersectsInConnector(canvasX, canvasY);
                        break;
                    case 'processor':
                        break;
                    case 'background':
                        break;
                }
                dragObjectType = null;
                my.markDirty();
            }
        },
        
        /**
         * Set the theme colours of the processor canvas views.
         * @param {String} theme Theme name, 'dark' or ''.
         */
        setTheme = function(theme) {
            // possibly have to set theme data attribute first
            var themeStyles = window.getComputedStyle(document.querySelector('[data-theme]'));

            my.theme = {
                colorHigh: themeStyles.getPropertyValue('--text-color'),
                colorMid: themeStyles.getPropertyValue('--border-color'),
                colorLow: themeStyles.getPropertyValue('--panel-bg-color')
            };
            my.setThemeOnViews();
            my.setThemeOnConnections();
            my.markDirty();
        },
        
        /**
         * Set a flag to indicate the static canvas should be redrawn.
         */
        markDirty = function() {
            isDirty = true;
        },
        
        /**
         * Update any tween animations that are going on and
         * redraw the canvases if needed.
         */
        draw = function() {
            __WEBPACK_IMPORTED_MODULE_4__tweenjs_tween_js___default.a.update();
            let i,
                views = my.getProcessorViews(),
                n = views.length;
            if (isDirty) {
                isDirty = false;
                staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                dynamicCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
                my.addConnectionsToCanvas(staticCtx);
                for (i = 0; i < n; i++) {
                    views[i].addToStaticView(staticCtx);
                }
            }
            
            for (i = 0; i < n; i++) {
                views[i].clearFromDynamicView(dynamicCtx);
            }
            for (i = 0; i < n; i++) {
                views[i].addToDynamicView(dynamicCtx);
            }
        };
        
    my = my || {};
    my.theme;
    my.canvasRect,
    my.markDirty = markDirty;
    
    that = Object(__WEBPACK_IMPORTED_MODULE_1__windowresize__["a" /* default */])(specs, my);
    that = Object(__WEBPACK_IMPORTED_MODULE_2__canvasprocessors__["a" /* default */])(specs, my);
    that = Object(__WEBPACK_IMPORTED_MODULE_3__canvasconnections__["a" /* default */])(specs, my);
    
    init();
    
    that.setTheme = setTheme;
    that.draw = draw;
    return that;
}


/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createCanvasProcessorsView;
/**
 * Manages the canvas views of the processors in the network.
 * - Processor view lifecycle.
 * - Processor view user interaction, itersection with (mouse) point.
 * - Processor view dragging.
 * - Processor view theme changes.
 */
function createCanvasProcessorsView(specs, my) {
    var that,
        midiNetwork = specs.midiNetwork,
        views = [],
        numViews = 0,
        selectedView,
        connectionSourceProcessor,
        dragOffsetX,
        dragOffsetY,
        
        /**
         * Create canvas 2D object if it exists for the type.
         * @param  {Object} processor MIDI processor for which the 3D object will be a view.
         */
        createProcessorView = function(processor) {
            let view,
                specs = {
                    processor: processor,
                    canvasDirtyCallback: my.markDirty
                };
            
            switch (processor.getType()) {
                case 'epg':
                    view = WH.midiProcessors[processor.getType()].createCanvasView(specs);
                    break;
                case 'output':
                    specs.initialPosition = {x: my.canvasRect.width / 2, y: my.canvasRect.height - 70};
                    view = WH.midiProcessors[processor.getType()].createCanvasView(specs);
                    break;
            }
            
            views.push(view);
            numViews = views.length;
            
            // set theme on the new view
            if (my.theme && typeof view.setTheme == 'function') {
                view.setTheme(my.theme);
            }
            
            my.updateConnectorsInfo();
        },
        
        /**
         * Delete canvas 2D object when the processor is deleted.
         * @param  {Object} processor MIDI processor for which the 3D object will be a view.
         */
        deleteProcessorView = function(processor) {
            let i = numViews;
            while (--i >= 0) {
                if (views[i].getProcessor() === processor) {
                    views[i].terminate();
                    views.splice(i, 1);
                    numViews = views.length;
                    my.updateConnectorsInfo();
                    my.markDirty();
                    return;
                }
            }
        },
        
        /**
         * Check and handle intersection of point with view.
         * @param  {Number} x Canvas X coordinate.
         * @param  {Number} y Canvas Y coordinate.
         * @return {Boolean} True if intersects.
         */
        intersectsProcessor = function(x, y) {
            let isIntersect = false;
            dragOffsetX = x;
            dragOffsetY = y;
            for (let i = numViews - 1; i >= 0; i--) {
                if (views[i].intersectsWithPoint(x, y, 'processor')) {
                    isIntersect = true;
                    selectedView = views[i];
                    // select the found view's processor
                    midiNetwork.selectProcessor(selectedView.getProcessor());
                    // start dragging the view's graphic
                    let position2d = selectedView.getPosition2d();
                    dragOffsetX = x - position2d.x;
                    dragOffsetY = y - position2d.y;
                    break;
                }
            }
            return isIntersect;
        },
        
        intersectsInConnector = function(x, y) {
            for (let i = 0; i < numViews; i++) {
                if (views[i].intersectsWithPoint(x, y, 'inconnector')) {
                    const destinationProcessor = views[i].getProcessor();
                    midiNetwork.connectProcessors(connectionSourceProcessor, destinationProcessor);
                    break;
                }
            }
            my.dragEndConnection();
        },
        
        intersectsOutConnector = function(x, y) {
            for (let i = 0; i < numViews; i++) {
                if (views[i].intersectsWithPoint(x, y, 'outconnector')) {
                    connectionSourceProcessor = views[i].getProcessor();
                    my.dragStartConnection(views[i], x, y);
                    return true;
                }
            }
            return false;
        },
        
        dragSelectedProcessor = function(x, y) {
            selectedView.setPosition2d({
                x: x - dragOffsetX,
                y: y - dragOffsetY
            });
        },
        
        dragAllProcessors = function(x, y) {
            // drag background, so all views
            let newX = x - dragOffsetX,
                newY = y - dragOffsetY;
            dragOffsetX = x;
            dragOffsetY = y;
            for (let i = 0, view, position2d; i < numViews; i++) {
                view = views[i];
                position2d = view.getPosition2d();
                view.setPosition2d({
                    x: position2d.x + newX,
                    y: position2d.y + newY
                });
            }
        },
        
        getProcessorViews = function() {
            return views;
        },
        
        /**
         * Update all processor views with changed theme.
         */
        setThemeOnViews = function() {
            for (let i = 0, n = views.length; i < n; i++) {
                if (views[i].setTheme instanceof Function) {
                    views[i].setTheme(my.theme);
                }
            }
        };

    my = my || {};
    my.intersectsProcessor = intersectsProcessor;
    my.intersectsInConnector = intersectsInConnector;
    my.intersectsOutConnector = intersectsOutConnector;
    my.dragSelectedProcessor = dragSelectedProcessor;
    my.dragAllProcessors = dragAllProcessors;
    my.getProcessorViews = getProcessorViews;
    my.setThemeOnViews = setThemeOnViews;
    
    that = specs.that || {};
    
    that.createProcessorView = createProcessorView;
    that.deleteProcessorView = deleteProcessorView;
    return that;
}
            

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createCanvasConnectionsView;
/**
 * Canvas processor connector input and output points,
 * cables between the processor connectors,
 * Delete circles halfway the cables.
 */
function createCanvasConnectionsView(specs, my) {
    var that,
        rootEl,
        connectCanvas,
        connectCtx,
        offlineCanvas,
        offlineCtx,
        inConnectors,
        outConnectors,
        connections,
        dragData = {
            isDragging: false,
            startPoint: {x: 0, y: 0},
            endPoint: {x: 0, y: 0},
            lineColor: '#ccc',
            lineWidth: 1,
            lineWidthActive: 2
        },
    
        init = function() {
            rootEl = document.querySelector('.canvas-container');
            connectCanvas = document.querySelector('.canvas-connect');
            connectCtx = connectCanvas.getContext('2d');
            offlineCanvas = document.createElement('canvas');
            offlineCtx = offlineCanvas.getContext('2d');
            
            my.addWindowResizeCallback(onResize);
            onResize();
        },
        
        onResize = function() {
            connectCanvas.width = rootEl.clientWidth;
            connectCanvas.height = rootEl.clientHeight;
            offlineCanvas.width = rootEl.clientWidth;
            offlineCanvas.height = rootEl.clientHeight;
        },
        
        /**
         * Enter or leave application connect mode.
         * @param {Boolean} isEnabled True to enable connect mode.
         */
        toggleConnectMode = function(isEnabled) {
            my.isConnectMode = isEnabled
            
            // show the canvas
            connectCanvas.dataset.show = isEnabled;
            
            drawOfflineCanvas();
            drawConnectCanvas();
            my.markDirty();
        },
        
        dragStartConnection = function(processorView, x, y) {
            dragData.isDragging = true;
            dragData.startPoint = processorView.getOutConnectorPoint();
            dragData.endPoint = {x: x, y: y};
            drawOfflineCanvas();
        },
        
        dragMoveConnection = function(x, y) {
            dragData.endPoint = {x: x, y: y};
            drawOfflineCanvas();
        },
        
        dragEndConnection = function() {
            dragData.isDragging = false;
            drawOfflineCanvas();
        },
        
        setThemeOnConnections = function() {
            dragData.lineColor = my.theme.colorHigh || '#333';
            drawOfflineCanvas();
            drawConnectCanvas();
        },
        
        updateConnectorsInfo = function() {
            // clear the old info
            inConnectors = {};
            outConnectors = {};
            
            // loop over all processor views to collect current info
            const views = my.getProcessorViews(),
                n = views.length; 
            for (let i = 0, view, processor, viewInfo, viewPos, graphic; i < n; i++) {
                view = views[i];
                processor = view.getProcessor();
                viewInfo = processor.getInfo();
                viewPos = view.getPosition2d();
                if (viewInfo.inputs == 1) {
                    inConnectors[processor.getID()] = {
                        point: view.getInConnectorPoint(),
                        graphic: view.getInConnectorGraphic()
                    }
                }
                if (viewInfo.outputs == 1) {
                    outConnectors[processor.getID()] = {
                        point: view.getOutConnectorPoint(),
                        graphic: view.getOutConnectorGraphic()
                    }
                }
            }
            
            if (my.isConnectMode) {
                drawConnectCanvas();
            }
        },
        
        /**
         * All connection lines are drawn on the offline canvas,
         * This happens when processors are created, deleted or moved,
         * or when Connect Mode is entered or exited.
         */
        drawOfflineCanvas = function() {
            // clear the canvas
            offlineCtx.clearRect(0, 0, offlineCanvas.width, offlineCanvas.height);
            
            // clear the old info
            connections = [];
            
            const lineWidth = my.isConnectMode ? dragData.lineWidthActive : dragData.lineWidth;
            
            // show cables
            const views = my.getProcessorViews(),
                n = views.length; 
            let processor, sourceID, destinationID, destinations, numDestinations;
            offlineCtx.lineWidth = lineWidth;
            offlineCtx.strokeStyle = dragData.lineColor;
            offlineCtx.beginPath();
            for (let i = 0; i < n; i++) {
                processor = views[i].getProcessor();
                sourceID = processor.getID();
                destinations = processor.getDestinations instanceof Function ? processor.getDestinations() : [],
                numDestinations = destinations.length;
                for (let j = 0; j < numDestinations; j++) {
                    destinationID = destinations[j].getID();
                    let selectPoint = drawCable(outConnectors[sourceID].point, inConnectors[destinationID].point);
                    connections.push({
                        sourceProcessor: processor,
                        destinationProcessor: destinations[j],
                        selectPoint: selectPoint
                    });
                }
            }
            
            // cable currently being dragged
            if (dragData.isDragging) {
                drawCable(dragData.startPoint, dragData.endPoint);
            }
            
            offlineCtx.stroke();
        },
        
        /**
         * Draw a processor connection cable.
         * @param  {Object} startPoint {x, y} start coordinate.
         * @param  {Object} endPoint   {x, y} end coordinate.
         */
        drawCable = function(startPoint, endPoint) {
            // line
            const distance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2)),
                tension = distance / 2,
                cp1x = startPoint.x,
                cp1y = startPoint.y + tension,
                cp2x = endPoint.x,
                cp2y = endPoint.y + tension;
            offlineCtx.moveTo(startPoint.x, startPoint.y);
            offlineCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
            
            // endpoint
            const radius = 5;
            offlineCtx.moveTo(endPoint.x + radius, endPoint.y);
            offlineCtx.arc(endPoint.x, endPoint.y, radius, 0, Math.PI * 2, true);
            
            // select circle
            let selectPoint = null;
            if (my.isConnectMode) {
                return drawCableSelectPoint(startPoint.x, startPoint.y, cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y);
            }
            
            return selectPoint;
        },
        
        /**
         * Draw select button halfway the bezier curved cable.
         * @see https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript
         * @param  {[type]} ax [description]
         * @param  {[type]} ay [description]
         * @param  {[type]} bx [description]
         * @param  {[type]} by [description]
         * @param  {[type]} cx [description]
         * @param  {[type]} cy [description]
         * @param  {[type]} dx [description]
         * @param  {[type]} dy [description]
         * @return {[type]}    [description]
         */
        drawCableSelectPoint = function(ax, ay, bx, by, cx, cy, dx, dy) {
            const t = 0.5, // halfway the cable
                b0t = Math.pow(1 - t, 3),
                b1t = 3 * t * Math.pow(1 - t, 2),
                b2t = 3 * Math.pow(t, 2) * (1 - t),
                b3t = Math.pow(t, 3),
                pxt = (b0t * ax) + (b1t * bx) + (b2t * cx) + (b3t * dx),
                pyt = (b0t * ay) + (b1t * by) + (b2t * cy) + (b3t * dy),
                radius = 10;
            
            offlineCtx.moveTo(pxt + radius, pyt);
            offlineCtx.arc(pxt, pyt, radius, 0, Math.PI * 2, true);
            
            return {
                x: pxt,
                y: pyt
            };
        },
        
        addConnectionsToCanvas = function(ctx) {
            ctx.drawImage(offlineCanvas, 0, 0);
            if (my.isConnectMode) {
                ctx.drawImage(connectCanvas, 0, 0);
            }
        },
        
        /**
         * Draw connector circles and currently dragged line on connectCanvas.
         */
        drawConnectCanvas = function() {
            connectCtx.clearRect(0, 0, connectCanvas.width, connectCanvas.height);
            
            if (my.isConnectMode) {
                // show inputs and outputs
                let graphic;
                for (id in inConnectors) {
                    if (inConnectors.hasOwnProperty(id)) {
                        graphic = inConnectors[id].graphic;
                        connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                    }
                }
                for (id in outConnectors) {
                    if (outConnectors.hasOwnProperty(id)) {
                        graphic = outConnectors[id].graphic;
                        connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
                    }
                }
            }
        };
        
        // drawConnections = function() {
        //     connectCtx.clearRect(0, 0, connectCanvas.width, connectCanvas.height);
        //     
        //     // show inputs and outputs
        //     inConnectors = {};
        //     outConnectors = {};
        //     const views = my.getProcessorViews(),
        //         n = views.length; 
        //     for (let i = 0, view, processor, viewInfo, viewPos, graphic; i < n; i++) {
        //         view = views[i];
        //         processor = view.getProcessor();
        //         viewInfo = processor.getInfo();
        //         viewPos = view.getPosition2d();
        //         if (viewInfo.inputs == 1) {
        //             graphic = view.getInConnectorGraphic();
        //             connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
        //             inConnectors[processor.getID()] = view.getInConnectorPoint();
        //         }
        //         if (viewInfo.outputs == 1) {
        //             graphic = view.getOutConnectorGraphic();
        //             connectCtx.drawImage(graphic.canvas, graphic.x, graphic.y);
        //             outConnectors[processor.getID()] = view.getOutConnectorPoint();
        //         }
        //     }
        //     
        //     // show cables
        //     let processor, sourceID, destinationID, destinations, numDestinations;
        //     for (let i = 0; i < n; i++) {
        //         processor = views[i].getProcessor();
        //         sourceID = processor.getID();
        //         destinations = processor.getDestinations instanceof Function ? processor.getDestinations() : [],
        //         numDestinations = destinations.length;
        //         for (let j = 0; j < numDestinations; j++) {
        //             destinationID = destinations[j].getID();
        //             drawCable(outConnectors[sourceID], inConnectors[destinationID]);
        //         }
        //     }
        //     
        //     // cable currently being dragged
        //     if (dragData.isDragging) {
        //         drawCable(dragData.startPoint, dragData.endPoint);
        //     }
        // };

    my = my || {};
    my.isConnectMode = false,
    my.dragStartConnection = dragStartConnection;
    my.dragMoveConnection = dragMoveConnection;
    my.dragEndConnection = dragEndConnection;
    my.setThemeOnConnections = setThemeOnConnections;
    my.updateConnectorsInfo = updateConnectorsInfo;
    my.drawOfflineCanvas = drawOfflineCanvas;
    my.addConnectionsToCanvas = addConnectionsToCanvas;
    
    that = specs.that || {};
    
    init();
    
    that.toggleConnectMode = toggleConnectMode;
    return that;
}


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time, preserve) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : TWEEN.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time) || preserve) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
	TWEEN.now = function () {
		var time = process.hrtime();

		// Convert [seconds, nanoseconds] to milliseconds.
		return time[0] * 1000 + time[1] / 1000000;
	};
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
         window.performance !== undefined &&
		 window.performance.now !== undefined) {
	// This must be bound, because directly assigning this function
	// leads to an invocation exception in Chrome.
	TWEEN.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
	TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
	TWEEN.now = function () {
		return new Date().getTime();
	};
}


TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _repeatDelayTime;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	this.to = function (properties, duration) {

		_valuesEnd = properties;

		if (duration !== undefined) {
			_duration = duration;
		}

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : TWEEN.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_object[property] === undefined) {
				continue;
			}

			// Save the starting value.
			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object, _object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.end = function () {

		this.update(_startTime + _duration);
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.repeatDelay = function (amount) {

		_repeatDelayTime = amount;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object, _object);
			}

			_onStartCallbackFired = true;
		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end);
					} else {
						end = parseFloat(end);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property]);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				if (_repeatDelayTime !== undefined) {
					_startTime = time + _repeatDelayTime;
				} else {
					_startTime = time + _delayTime;
				}

				return true;

			} else {

				if (_onCompleteCallback !== null) {

					_onCompleteCallback.call(_object, _object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

		},

		Out: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			k *= 2;

			if (k < 1) {
				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (true) {

		// AMD
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return TWEEN;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(40)))

/***/ }),
/* 40 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createPreferencesView;
/**
 * Preferences settings view.
 */
function createPreferencesView(specs) {
    var that,
        store = specs.store,
        canvasView = specs.canvasView,
        preferencesEl = document.querySelector('.prefs'),
        midiInputsEl = document.querySelector('.prefs__inputs'),
        midiOutputsEl = document.querySelector('.prefs__outputs'),
        midiPortViews = [],
        controls = {
            darkTheme: {
                type: 'checkbox',
                input: document.querySelector('.prefs__dark-theme')
            }
        },

        init = function() {
            controls.darkTheme.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().setTheme(e.target.checked));
            });

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.SET_PREFERENCES:
                    case e.detail.actions.SET_THEME:
                        updateControl('dark-theme', e.detail.state.preferences.isDarkTheme);
                        break;
                }
            });
        },

        /**
         * Callback function to update one of the controls after if the
         * preference's state changed.
         * @param {String} key Key that indicates the control.
         * @param {Boolean} value Value of the control.
         */
        updateControl = function(key, value) {
            switch (key) {
                case 'dark-theme':
                    controls.darkTheme.input.checked = value;
                    break;
            }
        },

        /**
         * Create view for a MIDI input or output port.
         * @param {Boolean} isInput True if the port in an input.
         * @param {Object} port MIDI port object.
         */
        createMIDIPortView = function(isInput, port) {
            var view;
            if (isInput) {
                view = ns.createMIDIInputView({
                    parentEl: midiInputsEl,
                    port: port
                });
            } else {
                view = ns.createMIDIOutputView({
                    parentEl: midiOutputsEl,
                    port: port
                });
            }
            midiPortViews.push(view);
        },

        /**
         * Delete view for a MIDI input or output processor.
         * @param  {Object} processor MIDI processor for a MIDI input or output.
         */
        deleteMIDIPortView = function(processor) {
            var n = midiPortViews.length;
            while (--n >= 0) {
                if (midiPortViews[n].hasProcessor(processor)) {
                    midiPortViews[n].terminate();
                    midiPortViews.splice(n, 1);
                    return false;
                }
            }
        };

    that = specs.that;

    init();

    that.createMIDIPortView = createMIDIPortView;
    that.deleteMIDIPortView = deleteMIDIPortView;
    return that;
}


/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createRemoteView;
/**
 * Overview list of all assigned MIDI controller assignments.
 */
function createRemoteView(specs, my) {
    var that,
        appView = specs.appView,
        midiRemote = specs.midiRemote,
        rootEl = document.querySelector('.remote'),
        listEl = document.querySelector('.remote__list'),
        groupViews = [],
        
        /**
         * Create a container view to hold assigned parameter views.
         * @param {Object} processor Processor with assignable parameters.
         */
        createRemoteGroup = function(processor) {
            var remoteGroupView = ns.createRemoteGroupView({
                processor: processor,
                parentEl: listEl
            });
            groupViews.push(remoteGroupView);
            appView.renderLayout();
        },
        
        /**
         * Delete a container view to hold assigned parameter views.
         * @param {Object} processor Processor with assignable parameters.
         */
        deleteRemoteGroup = function(processor) {
            var n = groupViews.length;
            while (--n >= 0) {
                if (groupViews[n].hasProcessor(processor)) {
                    groupViews[n].terminate();
                    groupViews.splice(n, 1);
                    appView.renderLayout();
                    return false;
                }
            }
        },
        
        /**
         * Add a parameter that is assigned.
         * @param  {Object} param Processor parameter.
         */
        addParameter = function(param) {
            var n = groupViews.length;
            while (--n >= 0) {
                if (groupViews[n].hasParameter(param)) {
                    groupViews[n].addParameter(param, midiRemote.unassingParameter);
                    appView.renderLayout();
                    return;
                }
            }
        },
        
        /**
         * Remove a parameter that isn't assigned anymore.
         * @param  {Object} param Processor parameter.
         */
        removeParameter = function(param) {
            var n = groupViews.length;
            while (--n >= 0) {
                if (groupViews[n].hasParameter(param)) {
                    groupViews[n].removeParameter(param);
                    appView.renderLayout();
                    return;
                }
            }
        };
    
    that = specs.that || {};
    
    that.createRemoteGroup = createRemoteGroup;
    that.deleteRemoteGroup = deleteRemoteGroup;
    that.addParameter = addParameter;
    that.removeParameter = removeParameter;
    return that;
}


/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createFileView;
/**
 * @description File handling view.
 * @author Wouter Hisschemöller
 * @version 0.0.0
 */
function createFileView(specs) {
    var that,
        file = specs.file,
        fileEl,
        
        init = function() {
            fileEl = document.querySelector('.file');
            fileEl.querySelector('.file__new').addEventListener('click', function(e) {
                file.createNew();
            });
            fileEl.querySelector('.file__import').addEventListener('change', function(e) {
                file.importFile(e.target.files[0]);
                this.value = null;
            });
            fileEl.querySelector('.file__export').addEventListener('click', function(e) {
                file.exportFile();
            });
        };
    
    that = specs.that;
    
    init();
    
    return that;
}


/***/ })
/******/ ]);