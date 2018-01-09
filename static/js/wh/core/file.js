/**
 * Saves state to - or restores it from localstorage.
 * Saves state to file, opens external files.
 *
 * @namespace WH
 */
window.WH = window.WH || {};

(function (WH) {

    /**
     * @description Creates a transport object.
     */
    function createFile(specs, my) {
        var that,
            store = specs.store,
            midi = specs.midi,
            midiNetwork = specs.midiNetwork,
            midiRemote = specs.midiRemote,
            preferences = specs.preferences,
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
                });
            },

            /**
             * Get the stored preferences, if any.
             */
            loadPreferences = function() {
                var data = localStorage.getItem(preferencesName) || {};
                store.dispatch(store.actions.setPreferences(data));
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
                var data = {
                    midi: midi.getData(),
                    preferences: preferences.getData()
                }
                localStorage.setItem(preferencesName, JSON.stringify(data));
            },

            /**
             * Create new empty default project.
             * Clear all settings and set default values..
             */
            createNew = function() {
                setData();
            },

            /**
             * Load project from localStorage.
             * @return {Boolean} True if a project was found in localstorage.
             */
            loadProjectFromStorage = function() {
                var data = localStorage.getItem(projectName);
                if (data) {
                    data = JSON.parse(data);
                    setData(data);
                } else {
                    console.log('No data in LocalStorage with name "' + projectName + '".');
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

        that = WH.addXMLFileParser(specs, my);
        
        init();

        that.loadLocalStorage = loadLocalStorage;
        that.createNew = createNew;
        that.autoSave = autoSave;
        that.save = save;
        that.importFile = importFile;
        that.exportFile = exportFile;
        return that;
    }

    WH.createFile = createFile;

})(WH);
