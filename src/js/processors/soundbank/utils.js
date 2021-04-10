const numVoices = 32;
const banks = {
  allIds: [],
  byId: {},
};
const voices = [];
let voiceIndex = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
 * Load all samples and store them in buffers.
 * @param {Array} samplesData
 */
export function initAudioFiles(banksData) {
  if (banks.allIds.length === 0) {
    createVoices();
    for (const [bankId, bankSoundData] of Object.entries(banksData)) {
      banks.allIds.push(bankId);
      banks.byId[bankId] = {
        allIds: [],
        byId: {},
      };
      bankSoundData.forEach(soundData => {
        const { value } = soundData;
        banks.byId[bankId].allIds.push(value);
        banks.byId[bankId].byId[value] = {
          buffer: null,
        };
        
        if (value.length > 0) {
          fetch(`audio/${value}`).then(response => {
            if (response.status === 200) {
              response.arrayBuffer().then(arrayBuffer => {
                audioCtx.decodeAudioData(arrayBuffer).then((audioBuffer) => {
                  banks.byId[bankId].byId[value].buffer = audioBuffer;
                });
              })
            }
          });
        }
      });
    }
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
