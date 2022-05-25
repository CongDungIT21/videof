import { SET_MAIN_STREAM, ADD_PARTICIPANT, REMOVE_PARTICIPANT, SET_USER, UPDATE_PARTICIPANT, UPDATE_USER } from './actionTypes';
import {createOffer, initializeListensers, updatePreference } from "../server/peerConnection"

let defaultUserState = {
    mainStream: null,
    currentUser: null,
    participants: {}
}

const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };


const generateColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

export const userReducer = (state = defaultUserState, action) => {
    switch (action.type) {
        case ADD_PARTICIPANT:
            {
            let payload = action.payload;
            if(!!state.currentUser && !!payload.newUser) {
                const currentUserId = Object.keys(state.currentUser)[0];
                const newUserId = Object.keys(payload.newUser)[0];  
                
                if (state.mainStream && currentUserId !== newUserId) {
                    payload.newUser = addConnection(
                      payload.newUser,
                      state.currentUser,
                      state.mainStream
                    );
                  }
                
                if (currentUserId === newUserId)
                    payload.newUser[newUserId].currentUser = true; //Thêm thuộc tính currentUser = true ở participants cú nó 
                payload.newUser[newUserId].avatarColor = generateColor();
                let participants = { ...state.participants, ...payload.newUser };
                state = { ...state, participants };
            }
            return state;
            }
        case REMOVE_PARTICIPANT:
            {
            let payload = action.payload;
            let participants = { ...state.participants };
            delete participants[payload.id];
            state = { ...state, participants };
            return state;
            }

        case UPDATE_PARTICIPANT:
            {
            let payload = action.payload;
            if(!!payload.newUser) {
                const newUserId = Object.keys(payload.newUser)[0];
            
                payload.newUser[newUserId] = {
                    ...state.participants[newUserId],
                    ...payload.newUser[newUserId],
                };
                let participants = { ...state.participants, ...payload.newUser };
                state = { ...state, participants };
            }
            return state;
            }

        case SET_USER:
            {
            let payload = action.payload;
            let participants = { ...state.participants};// lấy tất cả thành viên
            if(!!payload.currentUser) {
                const userId = Object.keys(payload.currentUser)[0];//Lấy id của người dùng
                payload.currentUser[userId].avatarColor = generateColor();
                initializeListensers(userId);
                state = { ...state, currentUser: { ...payload.currentUser }, participants };
            }
            return state;
            }
        
        case SET_MAIN_STREAM:
            {
                let payload = action.payload;
                state = {...state, ...payload};
                return state;
            }

        case UPDATE_USER:
            {
                let payload = action.payload;
                if(!!Object.keys(state.currentUser)) {
                    const userId = Object.keys(state.currentUser)[0];
                    updatePreference(userId, payload.currentUser);
                    state.currentUser[userId] = {
                      ...state.currentUser[userId],
                      ...payload.currentUser,
                    };
                    state = {
                      ...state,
                      currentUser: { ...state.currentUser },
                    };
                }
                return state;
            }
        default:
            return state;
    }
}

const addConnection = (newUser, currentUser, stream) => {
    const peerConnection = new RTCPeerConnection(servers);
    stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
    });

    if(!!Object.keys(newUser) && !!Object.keys(currentUser)){
        const newUserId = Object.keys(newUser)[0];
        const currentUserId = Object.keys(currentUser)[0];

        // vì currenctUseId luôn hiển thị đầu tiên
        const offerIds = [newUserId, currentUserId].sort((a, b) =>
        a.localeCompare(b)
        );
    
        newUser[newUserId].peerConnection = peerConnection;

        //offer[0] người nhận kết nối, offerp[1] người tạo kết nối
        if (offerIds[0] !== currentUserId)
            createOffer(peerConnection, offerIds[0], offerIds[1]);
    }
    return newUser;
}