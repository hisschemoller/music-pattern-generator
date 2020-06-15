

const buffers = {
  allIds: [],
  byId: {},
};
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function initAudioFiles(samplesData) {
  if (buffers.allIds.length === 0) {
    samplesData.forEach(data => {
      if (data.value.endsWith('.wav')) {
        buffers.allIds.push(data.value);
        buffers.byId[data.value] = {
          buffer: null,
        };

        fetch(`audio/${data.value}`).then(response => {
          if (response.status === 200) {
            response.arrayBuffer().then(arrayBuffer => {
              audioCtx.decodeAudioData(arrayBuffer).then((audioBuffer) => {
                buffers.byId[data.value].buffer = audioBuffer;
              });
            })
          }
        });
      }
    });
  }
}