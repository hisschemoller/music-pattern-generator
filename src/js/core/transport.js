import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import { scanEvents, updateView, } from './sequencer.js';

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

const TIME_WINDOW = 16.7;
const LOOK_AHEAD = 200;
 
let position = 0,
	origin = 0,
	scanStart = 0,
	scanEnd = 0,
	lastBpm = 0,
	loopStart = 0,
	loopEnd = 0,
	wasRunning = false,
	isRunning = false,
	isLooping = false,
	needsScan = false;

/**
 * @description Creates transport timing functionality.
 * Time is always measured in milliseconds since document load.
 * The timer can be started, stopped, rewound to zero and looped.
 * It defines a scan range that is just ahead of the play position
 * and that is meant to be used to scan for events to play.
 */
export function setup() {
	addEventListeners();
	run();
}

function addEventListeners() {
	document.addEventListener(STATE_CHANGE, handleStateChanges);

	// not in NW.js because in that case rAF doesn't stop (--disable-raf-throttling)
	// @see https://stackoverflow.com/questions/31968355/detect-if-web-app-is-running-in-nwjs
	if (!(typeof require === 'function')) {

		// stop playback if the page is hidden, continue when visible
		document.addEventListener('visibilitychange', handleVisbilityChange);
	}
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
		case actions.SET_TRANSPORT:
			switch (state.transport) {
				case 'pause':
					pause();
					break;
				case 'play':
					rewind();
					start();
					break;
				case 'stop':
					pause();
					rewind();
					break;
			}
			break;

		case actions.CREATE_PROJECT:
		case actions.SET_TEMPO:
			setBPM(state.bpm);
			break;
	}
}

/**
 * Stop playback if the page is hidden, continue when visible.
 * @param {Object} e Custom store event.
 */
function handleVisbilityChange(e) {
	if (document.visibilityState === 'visible') {
		if (wasRunning) {
			start();
		}
	} else {
		wasRunning = isRunning;
		if (wasRunning) {
			pause();
		}
	}
}
        
/**
 * Pause the timer.
 */
function pause () {
	isRunning = false;
}
        
/**
 * Rewind the timer to timeline start.
 */
function rewind() {
	position = performance.now();
	setOrigin(position);
	setScanRange(position);
}
        
/**
 * Timer using requestAnimationFrame that updates the transport timing.
 */
function run() {
	if (isRunning) {
		position = performance.now();
		if (isLooping && position < loopEnd && scanStart < loopEnd && scanEnd > loopEnd) {
			setOrigin(origin + (loopEnd - loopStart));
		}
		if (scanEnd - position < TIME_WINDOW) {
			setScanRange(scanEnd);
		}
		if (needsScan) {
			needsScan = false;
			scanEvents(scanStart - origin, scanEnd - origin, scanStart - position, position - origin);
		}
	}
	updateView(position - origin);
	requestAnimationFrame(run);
}

/**
 * Set Beats Per Minute.
 * @param {Number} newBpm New value for BPM.
 */
function setBPM(newBpm = 120) {
  // calculate change factor
	const factor = lastBpm / newBpm;
	lastBpm = newBpm;
  setLoopByFactor(factor);
}
        
/**
 * Set loop mode.
 * @param {Boolean} isEnabled True to enable looping.
 * @param {Number} position Loop start timestamp.
 * @param {Number} position Loop end timestamp.
 */
function setLoop(isEnabled, startPosition, endPosition) {
	isLooping = isEnabled;
}
        
/**
 * Change loop points by a factor if the tempo changes.
 * @param {number} factor Time points multiplier.
 */
function setLoopByFactor(factor) {
	setLoopStart(loopStart * factor);
	setLoopEnd(loopEnd * factor);
}

/**
 * Set loop endpoint.
 * @param {Number} position Loop end timestamp.
 */
function setLoopEnd(position) {
	loopEnd = origin + position;
}
        
/**
 * Set loop startpoint.
 * @param {Number} position Loop start timestamp.
 */
function setLoopStart(position) {
	loopStart = origin + position;
}

/**
 * Updated the playhead position by adjusting the timeline origin.
 * @param {Number} newOrigin Timeline origin timestamp.
 */
function setOrigin(newOrigin) {
	loopStart = loopStart - origin + newOrigin;
	loopEnd = loopEnd - origin + newOrigin;
	origin = newOrigin;
}

/**
 * Set the scan range.
 * @param {Number} start Start timestamp of scan range.
 */
function setScanRange(start) {
	scanStart = start;
	scanEnd =  scanStart + LOOK_AHEAD;
	needsScan = true;
}
        
/**
 * Start the timer.
 */
function start() {
	const offset = position - origin;
	position = performance.now();
	setOrigin(position - offset);
	setScanRange(position);
	isRunning = true;
}
