/**
 * Load a JSON file with the list of all processors,
 * then preload all the processor's files
 * and store the results in the processors object.
 */

/**
 * Processors contains each processor's configuration, 
 * settings panel HTML and module.
 */
const processors = {};

/**
 * Data contains the parsed JSON.
 */
let data = null;

/**
 * Load the performers JSON file and each performer's files.
 */
export function preloadProcessors() {
  return new Promise((resolve, reject) => {
    fetch(`json/processors.json`)
      .then(response => response.json())
      .then(json => {
        data = json;
        return Promise.all(json.ids.map(id => {
          return Promise.all(json.files.map((file, index) => {
            switch (index) {
              case 0:
              case 1:
                return fetch(`js/processors/${id}/${file}`);
              default:
                return import(`../processors/${id}/${file}`);
            }
          }));
        }))
      .then(allResults => {
        return Promise.all(allResults.map(results => {
          return Promise.all(results.map((result, index) => {
            switch (index) {
              case 0:
                return result.json();
              case 1:
                return result.text();
              default:
                return result;
            }
          }))
        }))
      })
      .then(allResults => {
        allResults.forEach((results, index) => {
          processors[json.ids[index]] = {
            config: results[0],
            settings: results[1],
            object3d: results[2],
            object3dController: results[3],
            processor: results[4],
            settingsController: results[5],
            utils: results[6],
          };
        });
        console.log('Processor data preloaded.');
        resolve();
      });
    });
  });
}

/**
 * Provide a list of all processor types.
 * @returns {Array} Processor type strings.
 */
export function getProcessorTypes() {
  return data.ids;
}

/**
 * Get preloaded processor data.
 * @param {String} name Processor type.
 * @param {String} type Data type.
 */
export function getProcessorData(name, type) {
  if (processors[name] && processors[name][type]) {
    return processors[name][type];
  }
} 
