/**
  Music Pattern Generator
  Copyright (C) 2017 - 2019  Wouter Hisschemoller

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

import createActions from './state/actions.js';
import createReducers from './state/reducers.js';
import { dispatch, getActions, getState, persist } from './state/store.js';

import createAppView from './view/app.js';
// import createCanvasView from './view/canvas.js';
import createCanvas3d from './webgl/canvas3d.js';
import createDialog from './view/dialog.js';
import createLibraryView from './view/library.js';
import createMIDI from './midi/midi.js';
import createMIDINetwork from './midi/network.js';
import createPreferencesView from './view/preferences.js';
import createRemoteView from './view/remote.js';
import createTransport from './core/transport.js';

import { showDialog } from './view/dialog.js';

async function main() {
  persist();
}

main();

/**
 * Application startup.
 */
// function init() {
//     // Create all objects that will be the modules of the app.
//     var appView = {},
//         canvasView = {},
//         dialog = {},
//         libraryView = {},
//         midi = {},
//         midiNetwork = {},
//         preferencesView = {},
//         remoteView = {},
//         transport = {};
    
//     const store = createStore({
//         actions: createActions(),
//         reducers: createReducers()
//     });

//     // Add functionality to the modules and inject dependencies.
//     createAppView({ 
//         that: appView, 
//         store 
//     });
//     createCanvas3d({ 
//         that: canvasView, 
//         store 
//     });
//     createDialog({
//         that: dialog,
//     });
//     createLibraryView({ 
//         that: libraryView, 
//         store 
//     });
//     createMIDI({ 
//         that: midi, 
//         store 
//     });
//     createMIDINetwork({
//         that: midiNetwork,
//         store
//     });
//     createPreferencesView({ 
//         that: preferencesView, 
//         store 
//     });
//     createRemoteView({
//         that: remoteView,
//         store
//     });
//     createTransport({ 
//         that: transport, 
//         store, 
//         canvasView, 
//         midiNetwork 
//     });

//     // scan installed processors
//     store.dispatch(store.getActions().rescanTypes());

//     // initialise
//     midi.connect()
//         .then(() => {
//             store.persist();
//             transport.run();
//         })
//         .catch(errorMsg => {
//             showDialog('No MIDI available', `The app was unable to find any MIDI ports. This is usually because the browser doesn't support Web MIDI. Check current browser support at <a href="https://caniuse.com/#search=midi" target="_blank">Can I Use</a>.<br><br>Error message:<br>${errorMsg}`);
//         });
// }

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOMContentLoaded');
//     init();
// });
