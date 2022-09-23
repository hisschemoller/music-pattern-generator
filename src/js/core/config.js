/**
 * Unchangeable application configuration settings.
 * 
 * Config saves the ports settings of all ports 
 * that have ever been connected.
 */
export const PPQN = 480;

export const TWO_PI = Math.PI * 2;

const NAME = 'config';

export function getConfig() {
  const data = localStorage.getItem(NAME)
  return data ? JSON.parse(data) : {};
}

/**
 * Store configuration in localStorage.
 * @param {statePorts} Object 
 * @param {stateThemeSetting} String  
 */
export function setConfig(statePorts, stateThemeSetting) {
  const config = getConfig();
  const newConfig = { themeSetting: stateThemeSetting ? stateThemeSetting : config.themeSetting };

  if (statePorts) {
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
      newConfig.ports = configPorts;
    } else {
      newConfig.ports = statePorts;
    }
  } else {
    newConfig.ports = config.ports;
  }

  localStorage.setItem(NAME, JSON.stringify(newConfig));
}
