/**
 * Saves state to - or restores it from localstorage.
 * Saves state to file, opens external files.
 * 
 * @namespace WH
 */
window.WH = window.WH || {};

(function (ns) {
    
    /**
     * @description Creates a transport object.
     */
    function createFile(specs) {
        var that,
            arrangement = specs.arrangement,
            epgModel = specs.epgModel,
            transport = specs.transport,
            projectName = 'project',

            /**
             * Autosave file if true.
             * @type {Boolean}
             */
            autoSaveEnabled = true,
            
            /**
             * Create data to setup a new empty project.
             */
            createNew = function() {
                var patternCount = WH.conf.getPatternCount(),
                    data = {
                        bpm: 120,
                        racks: [],
                        arrangement: {
                            patterns: [],
                            song: {}
                        }
                    },
                    i;
                
                for (i = 0; i < patternCount; i++) {
                    data.arrangement.patterns.push({tracks: []});
                }
                
                arrangement.setData(data.arrangement);
                transport.setBPM(data.bpm);
            },

            /**
             * Load project from localStorage.
             * @return {Boolean} True if a project was found in localstorage.
             */
            loadFromStorage = function() {
                var data = localStorage.getItem(projectName);
                if (data) {
                    data = JSON.parse(data);    
                    transport.setBPM(data.bpm);
                    epgModel.setData(data.epgmodel);
                    arrangement.setData(data.arrangement);
                } else {
                    console.error('No data in LocalStorage with name "' + projectName + '"."');
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
                var data = {
                    bpm: transport.getBPM(),
                    epgmodel: epgModel.getData(),
                    arrangement: arrangement.getData()
                }
                
                localStorage.setItem(projectName, JSON.stringify(data));
            };
        
        that = specs.that;
        
        that.createNew = createNew;
        that.loadFromStorage = loadFromStorage;
        that.autoSave = autoSave;
        that.save = save;
        return that;
    }
    
    ns.createFile = createFile;

})(WH);
