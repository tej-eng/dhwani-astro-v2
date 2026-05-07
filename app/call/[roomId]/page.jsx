"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";

export default function CallPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { socket, connectSocket } = useContext(SocketContext);

  const pc = useRef(null);
  const remoteAudio = useRef(null);
  const localStream = useRef(null);

  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isMuted, setIsMuted] = useState(false);

 useEffect(() => {
  let activeSocket = socket;

  if (!activeSocket?.connected) {
    activeSocket = connectSocket();
  }

  if (!activeSocket) return;

  console.log("📞 CALL PAGE MOUNTED:", roomId);

  // =========================
  // CREATE PEER CONNECTION
  // =========================
  const createPeer = async () => {
    if (pc.current) return;

    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      localStream.current.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream.current);
      });
    } catch (err) {
      console.error("Mic error:", err);
      return;
    }

    pc.current.ontrack = (event) => {
      console.log("📞 Remote track received");

      if (remoteAudio.current) {
        remoteAudio.current.srcObject = event.streams[0];
      }

      setCallStatus("Connected");
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📞 Sending ICE candidate");

        activeSocket.emit("ice-candidate", {
          room_id: roomId,
          candidate: event.candidate,
        });
      }
    };
  };

  // =========================
  // SOCKET EVENTS
  // =========================

  activeSocket.on("peer_joined", async () => {
    console.log("📞 peer_joined RECEIVED");

    setCallStatus("Ringing...");

    await createPeer();

    const offer = await pc.current.createOffer();

    await pc.current.setLocalDescription(offer);

    console.log("📞 Sending offer");

    activeSocket.emit("offer", {
      room_id: roomId,
      offer,
    });
  });

  activeSocket.on("answer", async ({ answer }) => {
    console.log("📞 Answer received");

    if (!pc.current) return;

    await pc.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );

    setCallStatus("Connected");
  });

  activeSocket.on("ice-candidate", async ({ candidate }) => {
    console.log("📞 ICE candidate received");

    try {
      if (candidate && pc.current) {
        await pc.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (err) {
      console.error("ICE error:", err);
    }
  });

  activeSocket.on("call_ended_by_astrologer", () => {
    console.log("📞 Call ended by astrologer");
    handleEndCall();
  });

  // =========================
  // JOIN ROOM ONLY ONCE
  // =========================

  console.log("📞 Joining room:", roomId);

  activeSocket.emit("join_call", { roomId });

  // =========================
  // CLEANUP
  // =========================

  return () => {
    console.log("📞 Cleaning up call");

    activeSocket.off("peer_joined");
    activeSocket.off("answer");
    activeSocket.off("ice-candidate");
    activeSocket.off("call_ended_by_astrologer");

    cleanup();
  };
}, []);

  // =========================
  // END CALL
  // =========================
  const handleEndCall = () => {
    socket.emit("call_ended_by_user", { room_id: roomId });
    cleanup();
    router.push("/"); // redirect
  };

  // =========================
  // MUTE
  // =========================
  const toggleMute = () => {
    if (!localStream.current) return;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted(!isMuted);
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanup = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="text-2xl mb-4">📞 Call Status</h2>

      <p className="mb-6 text-lg">{callStatus}</p>

      <audio ref={remoteAudio} autoPlay />

      <div className="flex gap-4">
        <button
          onClick={toggleMute}
          className="px-4 py-2 bg-yellow-500 rounded"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={handleEndCall}
          className="px-4 py-2 bg-red-600 rounded"
        >
          End Call
        </button>
      </div>
    </div>
  );
}