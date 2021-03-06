import firebaseRef from "./firebase";
import { store } from "../index";
import { child, update, push, onChildAdded, set } from "firebase/database";

const participantRef = child(firebaseRef, "participants");

const updatePreference = (useId, preference) => {
    const currentParticipantRef = child(child(participantRef, useId), "preferences");
    setTimeout(() => {
        update(currentParticipantRef, preference);
    })
}

const createOffer = async (peerConnection, receiverId, createId) => {
    const currentParticipantRef = child(participantRef, receiverId);
    
    //???
    peerConnection.onicecandidate = (event) => {
        event.candidate && push(child(currentParticipantRef, "offerCandidates"), {
            ...event.candidate.toJSON(), userId: createId
        })
    }

    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
        userId: createId,
    };

    // await currentParticipantRef.child("offers").push().set({ offer });bb
    await set(push(child(currentParticipantRef, "offers")), {offer});
}


const createAnswer = async (otherUserId, userId) => {
    const pc = store.getState().participants[otherUserId].peerConnection;
    const participantRef1 = child(participantRef, otherUserId);
    pc.onicecandidate = (event) => {
      // event.candidate &&
      //   participantRef1
      //     .child("answerCandidates")
      //     .push({ ...event.candidate.toJSON(), userId: userId });
      event.candidate && push(child(participantRef1, "answerCandidates"), { ...event.candidate.toJSON(), userId: userId });
    };
  
    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);
  
    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
      userId: userId,
    };
  
    // await participantRef1.child("answers").push().set({ answer });
    await set(push(child(participantRef1, "answers")), {answer});
  };


const initializeListensers = async (userId) => {
    // const currentUserRef = participantRef.child(userId);
    const currentUserRef = child(participantRef, userId);// ref c???a ng d??ng hi???n t???i
  
    //Khi c?? 1 ng?????i m???i k??? n???i t???t c??? ng?????i d??ng tr?????c s??? nh???n ??c th??m 1 offer b??n trong offers
    onChildAdded(child(currentUserRef, "offers"), async (snapshot) => {// th??m offers
        const data = snapshot.val();
        console.log("data", data);
        if (data?.offer) {
          const pc = store.getState().participants[data.offer.userId].peerConnection;// RTCPeer connection
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));// M?? t??? phi??n k???t n???i
          await createAnswer(data.offer.userId, userId);//tr??? l???i
        }
      });

      
    onChildAdded(child(currentUserRef, "offerCandidates"), (snapshot) => {
      const data = snapshot.val();
      if (data.userId) {
        const pc = store.getState().participants[data.userId].peerConnection;
        console.log("store.getState().participants[data.userId]", store.getState().participants[data.userId]);
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  
    //Nh???n c??u tr??? l???i
    onChildAdded(child(currentUserRef, "answers"), (snapshot) => {
      const data = snapshot.val();
      if (data?.answer) {
        const pc =
          store.getState().participants[data.answer.userId].peerConnection;
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });
  
    onChildAdded(child(currentUserRef, "answerCandidates"), (snapshot) => {
      const data = snapshot.val();
      if (data.userId) {
        const pc = store.getState().participants[data.userId].peerConnection;
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  };


export {createOffer, initializeListensers, updatePreference}