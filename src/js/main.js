/**
  Music Pattern Generator
  Copyright (C) 2017 - 2022  Wouter Hisschemoller

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

import { dispatch, getActions, getState, persist, } from './state/store.js';
import { accessMidi, getMIDIAccessible, listenToMIDIPorts } from './midi/midi.js';
import { preloadProcessors } from './core/processor-loader.js';
import { setup as setupCanvas3d } from './webgl/canvas3d.js';
import { setup as setupConnections3d } from './webgl/connections3d.js';
import { setup as setupInteraction3d } from './webgl/interaction3d.js';
import { setup as setupControls } from './view/controls.js';
import { setup as setupDialog } from './view/dialog.js';
import { setup as setupLibrary } from './view/library.js';
import { setup as setupMidiClock } from './midi/midiclock.js';
import { setup as setupNetwork } from './midi/network.js';
import { setup as setupPanels } from './view/panels.js';
import { setup as setupPreferences } from './view/preferences.js';
import { setup as setupSnapshots } from './view/snapshots.js';
import { setup as setupRemote } from './view/remote.js';
import { setup as setupTransport } from './core/transport.js';
import { setup as setupSequencer } from './core/sequencer.js';

async function main() {
  await accessMidi().catch(console.log.bind(console));
  await preloadProcessors().catch(console.log.bind(console));

  setupControls();
  setupPanels();
  setupCanvas3d();
  setupConnections3d();
  setupInteraction3d();
  setupDialog();
  setupLibrary();
  setupMidiClock();
  setupNetwork();
  setupPreferences();
  setupSnapshots();
  setupRemote();
  setupTransport();
  setupSequencer();

  persist();
  if (getMIDIAccessible()) {
    listenToMIDIPorts();
  }
  dispatch(getActions().setProject(getState()));
}

main();
