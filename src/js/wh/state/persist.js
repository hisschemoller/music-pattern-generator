/**
 * Persist splits the state in a project part and a configuration part.
 * Both are stored when the app quits and loaded when it starts up.
 * 
 * The project part is saved to localstorage.
 * 
 * Configuration is saved in localStorage in the browser,
 * or in a file system's appication data directory in the Electron app.
 * @see https://codeburst.io/how-to-store-user-data-in-electron-3ba6bf66bc1e
 * 
 * @param {Object} store Store functionality object.
 */
export default function persist(store) {
    const projectName = 'project',
        configName = 'config';

    window.addEventListener('beforeunload', e => {
        const state = store.getState();

        const projectState = { ...state };
        delete projectState.ports;
        delete projectState.theme;
        localStorage.setItem(projectName, JSON.stringify(projectState));

        const configState = {
            ports: state.ports,
            theme: state.theme
        };
        localStorage.setItem(configName, JSON.stringify(configState));
    });

    
    const projectData = localStorage.getItem(projectName);
    const configData = localStorage.getItem(configName);
    
    const projectState = projectData ? JSON.parse(projectData) : {};
    const configState = configData ? JSON.parse(configData) : {};
    
    const data = { ...projectState, ...configState };
    
    if (data) {
        store.dispatch(store.getActions().setProject(data));
    }
}