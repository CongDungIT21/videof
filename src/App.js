import './App.css';
import { connect } from 'react-redux';
import { useEffect } from 'react'
import firebaseRef, { db, userName } from './server/firebase';
import { child, onValue, push, ref, onDisconnect, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import {
  setMainStream,
  addParticipant,
  removeParticipant,
  setUser,
  updateParticipant,
} from './store/actionCreate'
import MainScreen from './components/MainScreen/MainScreen';


function App(props) {
  const connectedRef = ref(db, ".info/connected");
  const participantRef = child(firebaseRef, "participants");

  const getUserStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    return localStream;
  };

  useEffect(() => {
    const fetchData = async () => {
      const stream = await getUserStream();
      stream.getVideoTracks()[0].enabled = false; //should blank off the screen (just sending a black image). Ideal for muting the camera.Same behavior can be seen with webrtc in chrome
      props.setMainStream(stream);// Khởi tạo stream với đầu vào là 1 stream dầu ra là state có stream đó

      onValue(connectedRef, (snap) => {
        if(snap.val()) {
          const defaultPreference = {
            audio: true,
            video: false,
            screen: false,
          };
    
          const userStatusRef = push(participantRef, {
            userName,
            preferences: defaultPreference,
          }); 

          props.setUser({
            [userStatusRef.key]: { name: userName, ...defaultPreference },
          });

          onDisconnect(userStatusRef).remove()
          .then(function() {
            console.log("Remove succeeded.")
          })
          .catch(function(error) {
            console.log("Remove failed: " + error.message)
          });   
        }
      });
    }
    fetchData();
  }, [])
  
  const isUserSet = !!props.user;
  const isStreamSet = !!props.stream;

  useEffect(() => {
    if (isStreamSet && isUserSet) {
      onChildAdded(participantRef, (snap) => {
        const preferenceUpdateEvent = child(child(participantRef, snap.key), "preferences")
        onChildChanged(preferenceUpdateEvent, (preferenceSnap) => {
          props.updateParticipant({
            [snap.key]: {
              [preferenceSnap.key]: preferenceSnap.val(),
            },
          });        
        });
        const { userName: name, preferences = {} } = snap.val();
        props.addParticipant({
          [snap.key]: {
            name,
            ...preferences,
          },
        });      
      })

      onChildRemoved(participantRef, (snap) => {
        props.removeParticipant(snap.key);
      })
    }
  }, [isStreamSet, isUserSet])

  return (
    <div className="App">
      <MainScreen />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    user: state.currentUser
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    addParticipant: (user) => dispatch(addParticipant(user)),
    removeParticipant:  (userId) => dispatch(removeParticipant(userId)),
    updateParticipant:  (user) => dispatch(updateParticipant(user)),
    setUser: (user) => dispatch(setUser(user))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
