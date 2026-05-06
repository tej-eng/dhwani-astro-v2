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

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    console.log("📞 CALL PAGE MOUNTED, ROOM ID:", roomId);

    // =========================
    // DEBUG ALL EVENTS
    // =========================
    activeSocket.onAny((event, ...args) => {
      console.log("📡 SOCKET EVENT:", event, args);
    });

    // =========================
    // CREATE PEER CONNECTION
    // =========================
    const createPeer = async () => {
      if (pc.current) return; // prevent duplicate

      console.log("📞 Creating Peer Connection");

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
        console.error("❌ Microphone access denied:", err);
        return;
      }

      pc.current.ontrack = (event) => {
        console.log("📞 Remote stream received");
        remoteAudio.current.srcObject = event.streams[0];
      };

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("📞 Sending ICE Candidate");

          activeSocket.emit("ice-candidate", {
            room_id: roomId,
            candidate: event.candidate,
          });
        }
      };
    };

    // =========================
    // SOCKET LISTENERS (REGISTER FIRST)
    // =========================

    activeSocket.on("peer_joined", async () => {
      console.log("📞 Peer joined → creating offer");

      await createPeer();

      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      activeSocket.emit("offer", {
        room_id: roomId,
        offer,
      });
    });

    activeSocket.on("offer", async ({ offer }) => {
      console.log("📞 Received offer");

      await createPeer();

      await pc.current.setRemoteDescription(offer);

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      activeSocket.emit("answer", {
        room_id: roomId,
        answer,
      });
    });

    activeSocket.on("answer", async ({ answer }) => {
      console.log("📞 Received answer");

      if (!pc.current) return;

      await pc.current.setRemoteDescription(answer);
    });

    activeSocket.on("ice-candidate", async ({ candidate }) => {
      if (!pc.current) return;

      try {
        await pc.current.addIceCandidate(candidate);
        console.log("📞 ICE Candidate added");
      } catch (err) {
        console.error("❌ Error adding ICE candidate:", err);
      }
    });

    // =========================
    // JOIN ROOM (AFTER LISTENERS)
    // =========================
    console.log("📞 Joining call room:", roomId);

    activeSocket.emit("join_call", { roomId });

    // =========================
    // CLEANUP
    // =========================
    return () => {
      console.log("🧹 Cleaning up call page");

      activeSocket.offAny();
      activeSocket.off("peer_joined");
      activeSocket.off("offer");
      activeSocket.off("answer");
      activeSocket.off("ice-candidate");

      if (pc.current) {
        pc.current.close();
        pc.current = null;
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold">📞 Calling...</h2>
      <audio ref={remoteAudio} autoPlay />
    </div>
  );
}