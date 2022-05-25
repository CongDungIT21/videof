import {
    SET_MAIN_STREAM,
    ADD_PARTICIPANT,
    REMOVE_PARTICIPANT,
    UPDATE_PARTICIPANT,
    SET_USER,
    UPDATE_USER
} from './actionTypes'

const addParticipant = (user) => {
    return {
        type: ADD_PARTICIPANT,
        payload: {
            newUser: user
        }
    }
}

const removeParticipant = (userId) => {
    return {
        type: REMOVE_PARTICIPANT,
        payload: {
            id: userId,
        }
    }
}


const updateParticipant = (user) => {
    return {
        type: UPDATE_PARTICIPANT,
        payload: {
            newUser: user
        }
    }
}

const setUser = (user) => {
    return {
        type: SET_USER,
        payload: {
            currentUser: user,
        }
    }
}

const setMainStream = (stream) => {
    return {
        type: SET_MAIN_STREAM,
        payload: {
            mainStream: stream
        }
    }
}

const updateUser = (user) => {
    return {
      type: UPDATE_USER,
      payload: {
        currentUser: user,
      },
    };
  };

export {
    updateUser,
    setMainStream,
    addParticipant,
    removeParticipant,
    updateParticipant,
    setUser
}