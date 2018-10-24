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

import createActions from './wh/state/actions';
import createReducers from './wh/state/reducers';
import createStore from './wh/state/store';

import createAppView from './wh/view/app';
// import createCanvasView from './wh/view/canvas';
import createCanvas3d from './wh/webgl/canvas';
import createDialog from './wh/view/dialog';
import createLibraryView from './wh/view/library';
import createMIDI from './wh/midi/midi';
import createMIDINetwork from './wh/midi/network';
import createPreferencesView from './wh/view/preferences';
import createRemoteView from './wh/view/remote';
import createTransport from './wh/core/transport';

import { showDialog } from './wh/view/dialog';


/**
 * Application startup.
 */
document.addEventListener('DOMContentLoaded', function(e) {

    // Create all objects that will be the modules of the app.
    var appView = {},
        canvasView = {},
        dialog = {},
        libraryView = {},
        midi = {},
        midiNetwork = {},
        preferencesView = {},
        remoteView = {},
        transport = {};
    
    const store = createStore({
        actions: createActions(),
        reducers: createReducers()
    });

    // Add functionality to the modules and inject dependencies.
    createAppView({ 
        that: appView, 
        store 
    });
    createCanvas3d({ 
        that: canvasView, 
        store 
    });
    createDialog({
        that: dialog,
    });
    createLibraryView({ 
        that: libraryView, 
        store 
    });
    createMIDI({ 
        that: midi, 
        store 
    });
    createMIDINetwork({
        that: midiNetwork,
        store
    });
    createPreferencesView({ 
        that: preferencesView, 
        store 
    });
    createRemoteView({
        that: remoteView,
        store
    });
    createTransport({ 
        that: transport, 
        store, 
        canvasView, 
        midiNetwork 
    });

    // scan installed processors
    store.dispatch(store.getActions().rescanTypes());

    // initialise
    midi.connect()
        .then(() => {
            store.persist();
            transport.run();
        })
        .catch(errorMsg => {
            showDialog('MIDI access failure', `The app can't initialise because it failed to access the computer's MIDI ports. If you view the app in a browser, please check if it supports the Web MIDI API.<br>Error message: ${errorMsg}`);
        });
});
