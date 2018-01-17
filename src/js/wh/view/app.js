import createSettingsPanel from './settings';
import addWindowResize from './windowresize';

/**
 * Main application view.
 */
export default function createAppView(specs, my) {
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
                    settingsViews.splice(i, 0, createSettingsPanel(data));
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
    
    that = addWindowResize(specs, my);
    
    init();
    
    that.renderLayout = renderLayout;
    // that.createSettingsView = createSettingsView;
    that.deleteSettingsView = deleteSettingsView;
    that.updateControl = updateControl;
    that.showPanel = showPanel;
    return that;
}
