/**
 * Unchangeable application configuration settings.
 * 
 * Config saves the ports settings of all ports 
 * that have ever been connected.
 */
export const PPQN = 480;

export const TWO_PI = Math.PI * 2;

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
    state.ports.allIds.forEach(statePortId => {
      let portExistsInConfig = false;
      config.ports.allIds.forEach(configPortId => {
        if (configPortId === statePortId) {
          portExistsInConfig = true;

          // update port if it exists
          const configPort = config.ports.byId[configPortId];
          const statePort = state.ports.byId[statePortId];
          configPort.syncEnabled = statePort.syncEnabled;
          configPort.remoteEnabled = statePort.remoteEnabled;
          configPort.networkEnabled = statePort.networkEnabled;
        }
      });

      // add port if it doesn't exist yet
      if (!portExistsInConfig) {
        config.ports.allIds.push(statePortId);
        config.ports.byId[statePortId] = state.ports.byId[statePortId]
      }
    });
    data.ports = config.ports;
  } else {
    data.ports = state.ports;
  }

  localStorage.setItem(name, JSON.stringify(data));
}
