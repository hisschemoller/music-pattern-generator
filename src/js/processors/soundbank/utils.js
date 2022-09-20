const numVoices = 32;
const banks = {
  allIds: [],
  byId: {},
};
const voices = [];
let voiceIndex = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Create empty banks in which to load audio files.
 * Voices are shared between all Soundbank processors.
 */
function createBanks(banksData) {
  if (banks.allIds.length === 0) {
    for (const [bankId, bankSoundData] of Object.entries(banksData)) {
      banks.allIds.push(bankId);
      banks.byId[bankId] = {
        allIds: [],
        byId: {},
      };
    }
  }
}

/**
 * Create reusable voices that can play sounds. 
 * Voices are shared between all Soundbank processors.
 */
function createVoices() {
  while (voices.length < numVoices) {
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);

    voices.push({
      isPlaying: false,
      gain,
      source: null,
    });
  }
}

/**
 * Set up the voices and banks.
 * @param {Array} banksData The processor's banks parameter.
 */
export function setupAudio(banksData) {
  if (voices.length === 0) {
    createVoices();
  }
  if (banks.allIds.length === 0) {
    createBanks(banksData);
  }
}

/**
 * Load all samples of a bank and store them in buffers.
 * @param {Array} banksData The processor's banks parameter.
 */
export function loadSoundBankFiles(bankId, bankSoundData) {
  const bank = banks.byId[bankId];
  if (bank.allIds.length === 0) {
    bankSoundData.forEach(async (soundData) => {
      const { value } = soundData;
      bank.allIds.push(value);
      bank.byId[value] = {
        buffer: null,
      };
      if (value.length > 0) {
        const response = await fetch(`audio/${value}`);
        if (response.status === 200) {
          const arrayBuffer = await response.arrayBuffer();
          audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
            bank.byId[value].buffer = audioBuffer;
          });
        }
      }
    });
  }
}

/**
 * Play a sound.
 * @param {Number} nowToStartInSecs Playback start time.
 * @param {String} bankId ID of the selected soundbank.
 * @param {Number} channel MIDI channel.
 * @param {Number} pitch MIDI pitch.
 * @param {Number} velocity MIDI velocity.
 */
export function playSound(nowToStartInSecs, bankId, channel, pitch, velocity) {
  const soundId = banks.byId[bankId].allIds[(channel - 1)];
  const startTime = audioCtx.currentTime + Math.max(0, nowToStartInSecs);
  const voice = voices[voiceIndex];
  voiceIndex = ++voiceIndex % numVoices;

  if (voice.isPlaying) {
    voice.source.stop();
  }

  voice.isPlaying = true;
  voice.gain.gain.setValueAtTime(velocity / 127, startTime);
  voice.source = audioCtx.createBufferSource();
  voice.source.buffer = banks.byId[bankId].byId[soundId].buffer;
  voice.source.playbackRate.setValueAtTime(2 ** ((pitch - 60) / 12), startTime);
  voice.source.connect(voice.gain);
  voice.source.start(startTime);
  voice.source.onended = function() {
    voice.isPlaying = false;
  }
}

/**
 * When the transport playback is toggled, check if the audiocontext is running.
 * On Safari it needs to be resumed after a user gesture.
 */
export function resumeAudio() {
  if (audioCtx.state !== 'running') {
    audioCtx.resume();
  }
}
