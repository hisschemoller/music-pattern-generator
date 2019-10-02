import createSettingsPanel from './settings.js';
import addWindowResize from './windowresize.js';

/**
 * Main application view.
 */
export default function createAppView(specs, my) {
  let that,
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

        // don't perform shortcuts while typing in a text input.
        if (!(e.target.tagName.toLowerCase() == 'input' && e.target.getAttribute('type') == 'text')) {
          switch (e.keyCode) {
            case 32: // space
              store.dispatch(store.getActions().setTransport('toggle'));
              break;
            
            case 83: // s
              console.log('state', store.getState());
              break;
          }
        }
        resetKeyCombo.length = 0;
      });

      document.addEventListener('keydown', e => {

        // don't perform shortcuts while typing in a text input.
        if (!(e.target.tagName.toLowerCase() == 'input' && e.target.getAttribute('type') == 'text')) {
          switch (e.keyCode) {
            case 82: // r
            case 83: // s
            case 84: // t
              // clear all data on key combination 'rst' (reset)
              resetKeyCombo.push(e.keyCode);
              if (resetKeyCombo.indexOf(82) > -1 && resetKeyCombo.indexOf(83) > -1 && resetKeyCombo.indexOf(84) > -1) {
                localStorage.clear();
                store.dispatch(store.getActions().newProject());
              }
              break;
          }
        }
      });

          document.addEventListener(store.STATE_CHANGE, e => {
            const { action, actions, state } = e.detail;
            switch (action.type) {
              
              case actions.CREATE_PROJECT:
                setProject(state);
                showPanels(state);
                controls.bpm.input.value = state.bpm;
                break;
              
              case actions.ADD_PROCESSOR:
                createSettingsViews(state);
                renderLayout();
                break;
              
              case actions.DELETE_PROCESSOR:
                deleteSettingsView(action.id);
                showPanels(state);
                selectSettingsView(state.selectedID);
                renderLayout();
                break;

              case actions.SET_TRANSPORT:
                controls.play.input.checked = state.transport === 'play';
                break;

              case actions.SET_TEMPO:
                controls.bpm.input.value = state.bpm;
                break;
              
              case actions.SELECT_PROCESSOR:
                selectSettingsView(action.id);
                // fallthrough intentional
              case actions.TOGGLE_MIDI_LEARN_MODE:
              case actions.TOGGLE_PANEL:
                showPanels(state);
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
      let exists = false;
      settingsViews.forEach(settingsView => {
        if (settingsView.getID() === id) {
          exists = true;
        }
      });
      if (!exists) {
        fetch(`js/wh/processors/${processorData.type}/settings.html`)
          .then(
            response => response.text(),
            error => console.log('An error occurred.', error)
          )
          .then(html => {
            settingsViews.splice(i, 0, createSettingsPanel({
              data: processorData,
              store: store,
              parentEl: editContentEl,
              template: html,
              isSelected: store.getState().selectedID === processorData.id
            }));
          });
      }
    });
  },
        
  /**
   * Delete settings controls view for a processor.
   * @param  {String} id MIDI processor ID.
   */
  deleteSettingsView = function(id) {
    settingsViews = settingsViews.reduce((accumulator, view) => {
      if (view.getID() === id) {
        view.terminate();
        return accumulator;
      }
      return [...accumulator, view];
    }, []);
  },

  /**
   * Show the settings controls view for a processor.
   * @param  {String} id MIDI processor ID.
   */
  selectSettingsView = function(id) {
    settingsViews.forEach(view => view.select(id));
  },

  /**
   * Set up a new project, create th esetting views.
   * @param  {Object} state App state object.
   */
  setProject = function(state) {
    var n = settingsViews.length;
    while (--n >= 0) {
      deleteSettingsView(settingsViews[n].getID());
    }
    createSettingsViews(state);
  },

  /**
   * Render the panels layout.
   * @param  {Boolean} leftColumn Render the left panel column.
   * @param  {Boolean} rightColumn Render the right panel column.
   */
  renderLayout = function(leftColumn = true, rightColumn = true) {
    if (leftColumn) {
      renderColumnLayout(prefsEl, remoteEl, false);
    }
    if (rightColumn) {
      renderColumnLayout(helpEl, editEl, true);
    }
  },

  /**
   * Render a column of the panels layout.
   * @param  {Object} topEl Bottom panel in the column.
   * @param  {Object} topEl Top panel in the column.
   * @param  {Boolean} isRightColumn True if the right column is being rendered.
   */  
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

    /**
     * Set panels visibility.
     * @param  {Object} state App state.
     */ 
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
