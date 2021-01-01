

const numVoices = 32;
const buffers = {
  allIds: [],
  byId: {},
};
const voices = [];
let voiceIndex = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Load all samples and store them in buffers.
 * @param {Array} samplesData
 */
export function initAudioFiles(samplesData) {
  if (buffers.allIds.length === 0) {
    createVoices();
    samplesData.forEach(data => {
      const { value } = data;
      buffers.allIds.push(value);
      buffers.byId[value] = {
        buffer: null,
      };

      fetch(`audio/${value}`).then(response => {
        if (response.status === 200) {
          response.arrayBuffer().then(arrayBuffer => {
            audioCtx.decodeAudioData(arrayBuffer).then((audioBuffer) => {
              buffers.byId[value].buffer = audioBuffer;
            });
          })
        }
      });
    });
  }
}

/**
 * Play a sound.
 * @param {Number} nowToStartInSecs Playback start time.
 * @param {String} bufferId ID of sample in audiobuffer to play.
 * @param {Number} pitch MIDI pitch.
 * @param {Number} velocity MIDI velocity.
 */
export function playSound(nowToStartInSecs, bufferId, pitch, velocity) {
  if (nowToStartInSecs < 0) {
    console.log('TODO: nowToStartInSecs should not be below 0: ', nowToStartInSecs);
  }
  const startTime = audioCtx.currentTime + Math.max(0, nowToStartInSecs);
  const voice = voices[voiceIndex];
  voiceIndex = ++voiceIndex % numVoices;

  if (voice.isPlaying) {
    console.log('isPlaying');
    voice.source.stop();
  }

  voice.isPlaying = true;
  voice.gain.gain.setValueAtTime(velocity / 127, startTime);
  voice.source = audioCtx.createBufferSource();
  voice.source.buffer = buffers.byId[bufferId].buffer;
  voice.source.playbackRate.setValueAtTime(2 ** ((pitch - 60) / 12), startTime);
  voice.source.connect(voice.gain);
  voice.source.start(startTime);
  voice.source.onended = function() {
    voice.isPlaying = false;
  }
}

/**
 * Create reusable voices that can play sounds.
 */
function createVoices() {
  for (let i = 0; i < numVoices; i++) {
    const gain = audioCtx.createGain();
    gain.connect(audioCtx.destination);

    voices.push({
      isPlaying: false,
      gain,
      source: null,
    });
  }
}
