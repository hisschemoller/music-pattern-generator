import { dispatch, getActions, STATE_CHANGE, } from '../state/store.js';
import createRemoteGroupView from './remote_group.js';

const listEl = document.querySelector('.remote__list');
const groupViews = {
    byId: {},
    allIds: []
};

export function setup() {
  addEventListeners();
}

function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
}

function createRemoteGroups(state) {
	const { assignments, processors } = state;
	assignments.allIds.forEach(assignID => {
		const { processorID } = assignments.byId[assignID];
		if (!groupViews.byId[processorID] && processors.allIds.includes(processorID)) {
			createRemoteGroup(processors.byId[processorID]);
		}
	});
}

/**
 * Create a container view to hold assigned parameter views.
 * @param {Array} processors Processor list.
 */
function createRemoteGroup(processor) {
	if (!groupViews.byId[processor.id]) {
		groupViews.allIds.push(processor.id);
		groupViews.byId[processor.id] = createRemoteGroupView({
			processorID: processor.id,
			parentEl: listEl
		});
	}
}
        
/**
 * Delete a container view to hold assigned parameter views.
 * @param {Object} processor Processor with assignable parameters.
 */
function deleteRemoteGroups(processors) {
	let n = groupViews.allIds.length;
	for (let i = groupViews.allIds.length - 1; i >= 0; i--) {
		const id = groupViews.allIds[i];
		if (!processors || !processors.byId || !processors.byId[id]) {
			groupViews.allIds.splice(i, 1);
			groupViews.byId[id].terminate();
			delete groupViews.byId[id];
		}
	}
}

/**
 * Handle state changes.
 * @param {Object} e 
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {

		case actions.CREATE_PROJECT:
			deleteRemoteGroups();
			createRemoteGroups(state);
			break;

		case actions.ADD_PROCESSOR:
			createRemoteGroup(state.processors.byId[action.data.id]);
			break;
				
		case actions.DELETE_PROCESSOR:
			deleteRemoteGroups(state.processors);
			break;
		
		case actions.ASSIGN_EXTERNAL_CONTROL: {
				const { learnTargetProcessorID } = state;
				if (learnTargetProcessorID) {
					const groupView = groupViews.byId[learnTargetProcessorID];
					if (!groupView) {
						createRemoteGroups(state);
					} else {
						groupView.updateViews(state);
					}
				}
			}
			break;
		
		case actions.UNASSIGN_EXTERNAL_CONTROL:
			const groupView = groupViews.byId[action.processorID];
			const processor = state.processors.byId[state.learnTargetProcessorID];
			if (groupView && processor) {
				groupView.updateViews(state);
			}
			break;
  }
}

// /**
//  * Overview list of all assigned MIDI controller assignments.
//  */
// export default function createRemoteView(specs, my) {
//     var that,
//         store = specs.store,
//         listEl = document.querySelector('.remote__list'),
//         groupViews = {
//             byId: {},
//             allIds: []
//         },

//         init = function() {
//             document.addEventListener(store.STATE_CHANGE, (e) => {
//                 switch (action.type) {

//                     case actions.CREATE_PROJECT:
//                         deleteRemoteGroups();
//                         createRemoteGroups(state);
//                         break;

//                     case actions.ADD_PROCESSOR:
//                         createRemoteGroup(state.processors.byId[action.data.id]);
//                         break;
                        
//                     case actions.DELETE_PROCESSOR:
//                         deleteRemoteGroups(state.processors);
//                         break;
                    
//                     case actions.ASSIGN_EXTERNAL_CONTROL:
//                         if (state.learnTargetProcessorID) {
//                             const groupView = groupViews.byId[state.learnTargetProcessorID],
//                                 processor = state.processors.byId[state.learnTargetProcessorID];
//                             if (!groupView) {
//                                 createRemoteGroups(state);
//                             } else {
//                                 groupView.updateViews(state);
//                             }
//                         }
//                         break;
                    
//                     case actions.UNASSIGN_EXTERNAL_CONTROL:
//                         const groupView = groupViews.byId[action.processorID],
//                             processor = state.processors.byId[state.learnTargetProcessorID];
//                             if (groupView && processor) {
//                                 groupView.updateViews(state);
//                             }
//                         break;
//                 }
//             });
//         },

//         createRemoteGroups = function(state) {
//             state.assignments.allIds.forEach(assignID => {
//                 const assignment = state.assignments.byId[assignID];
//                 if (!groupViews.byId[assignment.processorID]) {
//                     createRemoteGroup(state.processors.byId[assignment.processorID]);
//                 }
//             });

//             // processors.allIds.forEach(id => {
//             //     if (!groupViews.byId[id]) {
//             //         const processor = processors.byId[id];
//             //         let hasAssignment = false;
//             //         processor.params.allIds.forEach(id => {
//             //             const param = processor.params.byId[id];
//             //             if (param.isMidiControllable && param.remoteChannel && param.remoteCC != null) {
//             //                 hasAssignment = true;
//             //             }
//             //         });
//             //         if (hasAssignment) {
//             //             createRemoteGroup(processor);
//             //         }
//             //     }
//             // });
//         },
        
//         /**
//          * Create a container view to hold assigned parameter views.
//          * @param {Array} processors Processor list.
//          */
//         createRemoteGroup = function(processor) {
//             if (!groupViews.byId[processor.id]) {
//                 groupViews.allIds.push(processor.id);
//                 groupViews.byId[processor.id] = createRemoteGroupView({
//                     store: store,
//                     processorID: processor.id,
//                     parentEl: listEl
//                 });
//             }
//         },
        
//         /**
//          * Delete a container view to hold assigned parameter views.
//          * @param {Object} processor Processor with assignable parameters.
//          */
//         deleteRemoteGroups = function(processors) {
//             let n = groupViews.allIds.length;
//             for (let i = groupViews.allIds.length - 1; i >= 0; i--) {
//                 const id = groupViews.allIds[i];
//                 if (!processors || !processors.byId || !processors.byId[id]) {
//                     groupViews.allIds.splice(i, 1);
//                     groupViews.byId[id].terminate();
//                     delete groupViews.byId[id];
//                 }
//             }
//         },
    
//     that = specs.that || {};

//     init();
    
//     return that;
// }
