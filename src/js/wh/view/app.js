import createSettingsPanel from './settings';
import addWindowResize from './windowresize';

/**
 * Main application view.
 */
export default function createAppView(specs, my) {
    var that,
        store = specs.store,
        rootEl = document.querySelector('#app'),
        panelsEl = document.querySelector('.panels'),
        libraryEl = document.querySelector('.library'),
        helpEl = document.querySelector('.help'),
        prefsEl = document.querySelector('.prefs'),
        editEl = document.querySelector('.edit'),
        editContentEl = document.querySelector('.edit .panel__content'),
        remoteEl = document.querySelector('.remote'),
        settingsViews = [],
        panelHeaderHeight,
        resetKeyCombo = [],
        controls = {
            new: {
                type: 'checkbox',
                input: document.querySelector('#file-new')    
            },
            import: {
                type: 'checkbox',
                input: document.querySelector('#file-import')    
            },
            export: {
                type: 'checkbox',
                input: document.querySelector('#file-export')    
            },
            play: {
                type: 'checkbox',
                input: document.getElementById('play-check')
            },
            bpm: {
                type: 'number',
                input: document.getElementById('bpm-number')
            },
            library: {
                type: 'checkbox',
                input: document.getElementById('library-check')
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
            controls.new.input.addEventListener('click', function(e) {
                store.dispatch(store.getActions().newProject());
            });
            controls.import.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().importProject(e.target.files[0]));
            });
            controls.export.input.addEventListener('click', function(e) {
                store.dispatch(store.getActions().exportProject());
            });
            controls.play.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().setTransport('toggle'));
            });
            controls.bpm.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().setTempo(controls.bpm.input.value));
            });
            controls.remote.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().toggleMIDILearnMode());
            });
            controls.library.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().togglePanel('library'));
            });
            controls.prefs.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().togglePanel('preferences'));
            });
            controls.edit.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().togglePanel('settings'));
            });
            controls.connections.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().toggleConnectMode());
            });
            controls.help.input.addEventListener('change', function(e) {
                store.dispatch(store.getActions().togglePanel('help'));
            });
            
            document.addEventListener('keyup', function(e) {
                switch (e.keyCode) {
                    case 32:
                        // don't toggle play while typing space key in a text field.
                        if (!(e.target.tagName.toLowerCase() == 'input' && e.target.getAttribute('type') == 'text')) {
                            store.dispatch(store.getActions().setTransport('toggle'));
                        }
                        break;
                }
                e.keyCode = [];
            });

            document.addEventListener('keydown', e => {
                switch (e.keyCode) {
                    case 82:
                    case 83:
                    case 84:
                        // clear all data on key combination 'rst' (reset)
                        resetKeyCombo.push(e.keyCode);
                        if (resetKeyCombo.indexOf(82) > -1 && resetKeyCombo.indexOf(83) > -1 && resetKeyCombo.indexOf(84) > -1) {
                            localStorage.clear();
                            store.dispatch(store.getActions().newProject());
                        }
                        break;
                }
            });

            document.addEventListener(store.STATE_CHANGE, (e) => {
                switch (e.detail.action.type) {
                    case e.detail.actions.CREATE_PROJECT:
                        setProject(e.detail.state);
                        showPanels(e.detail.state);
                        controls.bpm.input.value = e.detail.state.bpm;
                        break;
                    
                    case e.detail.actions.ADD_PROCESSOR:
                        createSettingsViews(e.detail.state);
                        renderLayout();
                        break;
                    
                    case e.detail.actions.DELETE_PROCESSOR:
                        deleteSettingsView(e.detail.action.id);
                        showPanels(e.detail.state);
                        renderLayout();
                        break;

                    case e.detail.actions.SET_TRANSPORT:
                        controls.play.input.checked = e.detail.state.transport === 'play';
                        break;

                    case e.detail.actions.SET_TEMPO:
                        controls.bpm.input.value = e.detail.state.bpm;
                        break;
                    
                    case e.detail.actions.SELECT_PROCESSOR:
                    case e.detail.actions.TOGGLE_MIDI_LEARN_MODE:
                    case e.detail.actions.TOGGLE_PANEL:
                        showPanels(e.detail.state);
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
            state.processors.allIds.forEach((id, i) => {
                const processorData = state.processors.byId[id];
                if (!settingsViews[i] || (id !== settingsViews[i].getID())) {
                    const template = require(`html-loader!../processors/${processorData.type}/settings.html`);
                    settingsViews.splice(i, 0, createSettingsPanel({
                        data: processorData,
                        store: store,
                        parentEl: editContentEl,
                        template: template,
                        isSelected: state.selectedID === processorData.id
                    }));
                }
            });
        },
        
        /**
         * Delete settings controls view for a processor.
         * @param  {String} id MIDI processor ID.
         */
        deleteSettingsView = function(id) {
            var n = settingsViews.length;
            while (--n >= 0) {
                if (settingsViews[n].getID() === id) {
                    settingsViews[n].terminate();
                    settingsViews.splice(n, 1);
                    return false;
                }
            }
        },

        setProject = function(state) {
            var n = settingsViews.length;
            while (--n >= 0) {
                deleteSettingsView(settingsViews[n].getID());
            }
            createSettingsViews(state);
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
        
        showPanels = function(state) {
            helpEl.dataset.show = state.showHelpPanel;
            controls.help.input.checked = state.showHelpPanel;

            prefsEl.dataset.show = state.showPreferencesPanel;
            controls.prefs.input.checked  = state.showPreferencesPanel;

            remoteEl.dataset.show = state.learnModeActive;
            controls.remote.input.checked = state.learnModeActive;

            editEl.dataset.show = state.showSettingsPanel;
            controls.edit.input.checked = state.showSettingsPanel;

            libraryEl.dataset.show = state.showLibraryPanel;
            controls.library.input.checked = state.showLibraryPanel;

            controls.connections.input.checked = state.connectModeActive;
            
            renderLayout();
        };
    
    my = my || {};
    
    that = addWindowResize(specs, my);
    
    init();
    
    return that;
}
