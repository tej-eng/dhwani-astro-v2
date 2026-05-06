"use client";

import { useEffect, useRef, useContext } from "react";
import { useParams } from "next/navigation";
import SocketContext from "@/app/context/socketContext";

export default function CallPage() {
  const { roomId } = useParams();
  const { socket, connectSocket } = useContext(SocketContext);

  const pc = useRef(null);
  const remoteAudio = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    let activeSocket = socket;
    if (!activeSocket?.connected) activeSocket = connectSocket();
     console.log("📞 CALL PAGE MOUNTED, ROOM ID join_call:", roomId);
    // ✅ JOIN ROOM (FIXED)
    activeSocket.emit("join_call", { roomId });

    // =========================
    // CREATE PEER CONNECTION
    // =========================
    const createPeer = async () => {
      console.log("📞 CREATING PEER CONNECTION");
      pc.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      localStream.current.getTracks().forEach(track => {
        pc.current.addTrack(track, localStream.current);
      });

      pc.current.ontrack = (event) => {
        remoteAudio.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        console.log("📞 ICE Candidate:", event.candidate);
        if (event.candidate) {
          activeSocket.emit("ice-candidate", {
            room_id: roomId,
            candidate: event.candidate
          });
        }
      };
    };

    // =========================
    // WHEN PEER JOINS → CREATE OFFER
    // =========================
    activeSocket.on("peer_joined", async () => {

      console.log("📞 Peer joined event received");
      console.log("Peer joined → creating offer");

      await createPeer();

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      activeSocket.emit("offer", {
        room_id: roomId,
        offer
      });
    });

    // =========================
    // RECEIVE OFFER (OTHER SIDE INITIATED)
    // =========================
    activeSocket.on("offer", async ({ offer }) => {
      console.log("Received offer");

      await createPeer();

      await pc.current.setRemoteDescription(offer);

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      activeSocket.emit("answer", {
        room_id: roomId,
        answer
      });
    });

    // =========================
    // RECEIVE ANSWER
    // =========================
    activeSocket.on("answer", async ({ answer }) => {
      console.log("Received answer");
      await pc.current.setRemoteDescription(answer);
    });

    // =========================
    // ICE CANDIDATES
    // =========================
    activeSocket.on("ice-candidate", async ({ candidate }) => {
      if (pc.current) {
        await pc.current.addIceCandidate(candidate);
      }
    });

    return () => {
      activeSocket.off("peer_joined");
      activeSocket.off("offer");
      activeSocket.off("answer");
      activeSocket.off("ice-candidate");

      if (pc.current) pc.current.close();
    };
  }, []);

  return (
    <div>
      <h2>Calling...</h2>
      <audio ref={remoteAudio} autoPlay />
    </div>
  );
}