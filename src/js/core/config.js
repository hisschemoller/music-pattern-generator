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
  const { ports: statePorts, theme } = state;
  const config = getConfig();
  const data = { theme };

  if (config && config.ports) {
      
    // update the existing config with new data from the current state
    const { ports: configPorts } = config;
    statePorts.allIds.forEach(statePortId => {
      let portExistsInConfig = false;
      configPorts.allIds.forEach(configPortId => {
        if (configPortId === statePortId) {
          portExistsInConfig = true;

          // update port if it exists
          const configPort = configPorts.byId[configPortId];
          const statePort = statePorts.byId[statePortId];
          configPort.syncEnabled = statePort.syncEnabled;
          configPort.remoteEnabled = statePort.remoteEnabled;
          configPort.networkEnabled = statePort.networkEnabled;
        }
      });

      // add port if it doesn't exist yet
      if (!portExistsInConfig) {
        configPorts.allIds.push(statePortId);
        configPorts.byId[statePortId] = statePorts.byId[statePortId]
      }
    });
    data.ports = configPorts;
  } else {
    data.ports = statePorts;
  }

  localStorage.setItem(name, JSON.stringify(data));
}
