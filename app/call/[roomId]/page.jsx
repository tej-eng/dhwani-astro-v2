"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";

export default function CallPage() {
  const { roomId } = useParams();

  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);

  const { socket, connectSocket } = useContext(SocketContext);

  // =========================
  // REFS
  // =========================
  const pc = useRef(null);

  const remoteAudio = useRef(null);

  const localStream = useRef(null);

  const statsIntervalRef = useRef(null);

  // =========================
  // STATE
  // =========================
  const [callStatus, setCallStatus] = useState("Connecting...");

  const [isMuted, setIsMuted] = useState(false);

  // =========================
  // USE EFFECT
  // =========================
  useEffect(() => {
    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    if (!activeSocket) return;

    console.log("📞 CALL PAGE MOUNTED:", roomId);

    // =========================
    // CREATE PEER
    // =========================
    const createPeer = async () => {
      if (pc.current) {
        console.log("⚠️ Reusing existing peer");
        return pc.current;
      }

      console.log("🟢 Creating RTCPeerConnection");

      const iceConfig = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10, // Important
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      };

      pc.current = new RTCPeerConnection(iceConfig);

      // =========================
      // CONNECTION STATES (Enhanced Logging)
      // =========================
      pc.current.onconnectionstatechange = () => {
        console.log("🔥 Connection State:", pc.current.connectionState);
      };

      pc.current.oniceconnectionstatechange = () => {
        console.log("🧊 ICE Connection State:", pc.current.iceConnectionState);

        // Extra warning if failing
        if (
          ["failed", "disconnected"].includes(pc.current.iceConnectionState)
        ) {
          console.warn("⚠️ ICE Connection failing! Check network/TURN");
        }
      };

      pc.current.onsignalingstatechange = () => {
        console.log("📶 Signaling State:", pc.current.signalingState);
      };

      pc.current.onicegatheringstatechange = () => {
        console.log("🧊 ICE Gathering State:", pc.current.iceGatheringState);
      };

      // =========================
      // GET USER MEDIA
      // =========================
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000, // Optional: better quality
          },
        });

        console.log("🎤 Local stream acquired successfully");

        const tracks = localStream.current.getAudioTracks();
        tracks.forEach((track) => {
          console.log(
            `🎤 Track: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`,
          );

          const sender = pc.current.addTrack(track, localStream.current);
          console.log("➕ Audio track added to peer connection");
        });

        // Verify senders
        setTimeout(() => {
          const senders = pc.current?.getSenders() || [];
          console.log(`🎤 Total senders: ${senders.length}`);
          senders.forEach((sender, i) => {
            console.log(
              `Sender ${i}:`,
              sender.track?.kind,
              sender.track?.enabled,
            );
          });
        }, 1500);
      } catch (err) {
        console.error("❌ Microphone access error:", err);
        setCallStatus("Mic Error");
        return;
      }

      // =========================
      // REMOTE TRACK
      // =========================
      pc.current.ontrack = async (event) => {
        console.log("🎧 Remote track received");
        const remoteStream = event.streams[0];

        console.log(
          "🎵 Remote audio tracks count:",
          remoteStream.getAudioTracks().length,
        );

        if (remoteAudio.current) {
          remoteAudio.current.srcObject = remoteStream;
          remoteAudio.current.volume = 1.0;
          remoteAudio.current.muted = false;

          try {
            await remoteAudio.current.play();
            console.log("🔊 Remote audio playing successfully");
          } catch (err) {
            console.error("❌ Autoplay blocked:", err);
          }
        }
        setCallStatus("Connected");
      };

      // =========================
      // ICE CANDIDATES
      // =========================
      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(
            "📡 Sending ICE candidate:",
            event.candidate.candidate.substring(0, 80) + "...",
          );
          activeSocket.emit("ice-candidate", {
            room_id: roomId,
            candidate: event.candidate,
          });
        } else {
          console.log("🧊 All ICE candidates gathered");
        }
      };

      // =========================
      // AUDIO STATS (Improved)
      // =========================
      statsIntervalRef.current = setInterval(async () => {
        if (!pc.current) return;
        try {
          const stats = await pc.current.getStats();
          stats.forEach((report) => {
            if (report.type === "outbound-rtp" && report.kind === "audio") {
              console.log(
                `🎤 Outbound → packetsSent: ${report.packetsSent}, bytesSent: ${report.bytesSent}`,
              );
            }
            if (report.type === "inbound-rtp" && report.kind === "audio") {
              console.log(
                `🎵 Inbound  → packetsReceived: ${report.packetsReceived}, bytesReceived: ${report.bytesReceived}`,
              );
            }
          });
        } catch (e) {
          console.error("Stats error:", e);
        }
      }, 3000);
    };

    // =========================
    // PEER JOINED
    // =========================

    activeSocket.on("peer_joined", async () => {
      console.log("📞 peer_joined RECEIVED");

      setCallStatus("Ringing...");

      await createPeer();

      // WAIT TRACK INIT
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("📡 Senders:", pc.current.getSenders());

      // =========================
      // CREATE OFFER
      // =========================

      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
      });

      await pc.current.setLocalDescription(offer);

      console.log("✅ Local description set");

      console.log("📞 Sending offer");

      activeSocket.emit("offer", {
        room_id: roomId,
        offer,
      });
    });

    // =========================
    // ANSWER
    // =========================

    activeSocket.on("answer", async ({ answer }) => {
      console.log("📞 Answer received");

      if (!pc.current) return;

      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));

      console.log("✅ Remote description set");

      setCallStatus("Connected");
      const stored = localStorage.getItem("call_request");

      if (stored) {
        const data = JSON.parse(stored);

        // maximum_time = minutes
        const totalSeconds = Number(data.maximum_time || 0) * 60;

        setRemainingTime(totalSeconds);
      }
    });

    // =========================
    // ICE RECEIVED
    // =========================
    // =========================
    // ICE RECEIVED
    // =========================
    activeSocket.on("ice-candidate", async ({ candidate, room_id }) => {
      console.log("📞 ICE candidate received");

      if (!pc.current) {
        console.warn("⚠️ ICE received but no peer connection yet");
        return;
      }

      try {
        // Wait until remote description is set
        if (!pc.current.remoteDescription) {
          console.log(
            "⏳ Remote description not set yet, queuing ICE candidate",
          );
          // You can queue candidates if needed, but for now just wait a bit
          setTimeout(async () => {
            if (pc.current && pc.current.remoteDescription) {
              await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
              console.log("✅ Delayed ICE candidate added");
            }
          }, 800);
          return;
        }

        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ ICE candidate added successfully");
      } catch (err) {
        console.error("❌ ICE error:", err);
      }
    });

    // =========================
    // CALL ENDED
    // =========================

    activeSocket.on("call_ended_by_astrologer", () => {
      console.log("📞 Call ended by astrologer");

      handleEndCall();
    });

    // =========================
    // JOIN ROOM
    // =========================

    console.log("📞 Joining room:", roomId);

    activeSocket.emit("join_call", {
      roomId,
    });

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
  useEffect(() => {
    if (callStatus !== "Connected" || remainingTime <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);

          handleEndCall();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // =========================
  // END CALL
  // =========================
  const handleEndCall = () => {
    const stored = localStorage.getItem("call_request");

    if (!stored) {
      console.log("No call request found");
      return;
    }

    const data = JSON.parse(stored);

    socket.emit("call_ended_by_user", {
      room_id: roomId,
      astro_id: data?.astro_id,
    });

    cleanup();

    router.push("/");
  };

  // =========================
  // TOGGLE MUTE
  // =========================
  const toggleMute = () => {
    if (!localStream.current) return;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;

      console.log("🎤 Track enabled:", track.enabled);
    });

    setIsMuted(!isMuted);
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanup = () => {
    console.log("🧹 Cleanup called");

    // CLEAR STATS
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);

      statsIntervalRef.current = null;
    }

    // CLOSE PEER
    if (pc.current) {
      pc.current.close();

      pc.current = null;
    }

    // STOP TRACKS
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStream.current = null;
    }

    // CLEAR AUDIO
    if (remoteAudio.current) {
      remoteAudio.current.pause();

      remoteAudio.current.srcObject = null;
    }
    if (timerRef.current) {
   clearInterval(timerRef.current);
   }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  // =========================
  // UI
  // =========================
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="text-2xl mb-4">📞 Call Status</h2>

      <p className="mb-6 text-lg">{callStatus}</p>
      {callStatus === "Connected" && (
        <p className="text-3xl font-bold text-green-400 mb-6">
          ⏳ {formatTime(remainingTime)}
        </p>
      )}

      {/* REMOTE AUDIO */}
      <audio ref={remoteAudio} autoPlay playsInline />

      <div className="flex gap-4">
        {/* MUTE */}
        <button
          onClick={toggleMute}
          className="px-4 py-2 bg-yellow-500 rounded"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        {/* END CALL */}
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
