/**
 * Unchangeable application configuration settings.
 * 
 * Config saves the ports settings of all ports 
 * that have ever been connected.
 */
export const PPQN = 480;

/**
 * The processors available in the processors directory.
 */
export const processorTypes = {
  epg: { name: 'Euclidean'},
  euclidfx: { name: 'Euclid FX'},
  output: { name: 'Output'},
};

const name = 'config';

export function getConfig() {
  const data = localStorage.getItem(name)
  return data ? JSON.parse(data) : {};
}

export function setConfig(state) {
  const config = getConfig();
  let data = {
    theme: state.theme
  };

  if (config && config.ports) {
      
    // update the existing config with new data from the current state
    const ports = config.ports;
    state.ports.allIds.forEach(statePortID => {
      let portExistsInConfig = false;
      config.ports.allIds.forEach(configPortID => {
        if (configPortID === statePortID) {
          portExistsInConfig = true;

          // update port if it exists
          const configPort = config.ports.byId[configPortID];
          const statePort = state.ports.byId[statePortID];
          configPort.syncEnabled = statePort.syncEnabled;
          configPort.remoteEnabled = statePort.remoteEnabled;
          configPort.networkEnabled = statePort.networkEnabled;
        }
      });

      // add port if it doesn't exist yet
      if (!portExistsInConfig) {
        config.ports.allIds.push(statePortID);
        config.ports.byId[statePortID] = state.ports.byId[statePortID]
      }
    });
    data.ports = config.ports;
  } else {
    data.ports = state.ports;
  }

  localStorage.setItem(name, JSON.stringify(data));
} 