"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";

export default function CallPage() {
  const { roomId } = useParams();

  const router = useRouter();

  const { socket, connectSocket } =
    useContext(SocketContext);

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
  const [callStatus, setCallStatus] =
    useState("Connecting...");

  const [isMuted, setIsMuted] =
    useState(false);

  // =========================
  // USE EFFECT
  // =========================
  useEffect(() => {
    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    if (!activeSocket) return;

    console.log(
      "📞 CALL PAGE MOUNTED:",
      roomId
    );

    // =========================
    // CREATE PEER
    // =========================
    const createPeer = async () => {
      if (pc.current) {
        console.log(
          "⚠️ Reusing existing peer"
        );

        return;
      }

      console.log(
        "🟢 Creating RTCPeerConnection"
      );

      pc.current = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },

          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential:
              "openrelayproject",
          },

          {
            urls:
              "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential:
              "openrelayproject",
          },
        ],
      });

      // =========================
      // CONNECTION STATES
      // =========================

      pc.current.onconnectionstatechange =
        () => {
          console.log(
            "🟢 connectionState:",
            pc.current.connectionState
          );
        };

      pc.current.oniceconnectionstatechange =
        () => {
          console.log(
            "🧊 iceConnectionState:",
            pc.current
              .iceConnectionState
          );
        };

      pc.current.onsignalingstatechange =
        () => {
          console.log(
            "📶 signalingState:",
            pc.current.signalingState
          );
        };

      // =========================
      // GET USER MEDIA
      // =========================

      try {
        localStream.current =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            }
          );

        console.log(
          "🎤 Local stream:",
          localStream.current
        );

        const tracks =
          localStream.current.getAudioTracks();

        console.log(
          "🎤 Audio tracks:",
          tracks
        );

        tracks.forEach((track) => {
          console.log(
            "🎤 Track enabled:",
            track.enabled
          );

          console.log(
            "🎤 Track muted:",
            track.muted
          );

          console.log(
            "🎤 Track readyState:",
            track.readyState
          );

          // =========================
          // ADD TRACK
          // =========================

          const sender =
            pc.current.addTrack(
              track,
              localStream.current
            );

          console.log(
            "➕ Track added:",
            track.kind
          );

          console.log(
            "🎤 Sender:",
            sender
          );
        });

        // =========================
        // VERIFY SENDERS
        // =========================

        setTimeout(() => {
          const senders =
            pc.current?.getSenders() || [];

          senders.forEach((sender) => {
            console.log(
              "🎤 sender track:",
              sender.track
            );

            console.log(
              "🎤 sender enabled:",
              sender.track?.enabled
            );

            console.log(
              "🎤 sender readyState:",
              sender.track?.readyState
            );
          });
        }, 3000);
      } catch (err) {
        console.error(
          "❌ Mic error:",
          err
        );

        return;
      }

      // =========================
      // REMOTE TRACK
      // =========================

      pc.current.ontrack = async (
        event
      ) => {
        console.log(
          "🎧 Remote track received"
        );

        const remoteStream =
          event.streams[0];

        console.log(
          "🎵 Remote audio tracks:",
          remoteStream.getAudioTracks()
        );

        if (remoteAudio.current) {
          remoteAudio.current.srcObject =
            remoteStream;

          remoteAudio.current.volume = 1;

          remoteAudio.current.muted = false;

          try {
            await remoteAudio.current.play();

            console.log(
              "🔊 Remote audio playing"
            );
          } catch (err) {
            console.error(
              "❌ Audio autoplay blocked:",
              err
            );
          }
        }

        setCallStatus("Connected");
      };

      // =========================
      // ICE CANDIDATES
      // =========================

      pc.current.onicecandidate = (
        event
      ) => {
        if (event.candidate) {
          console.log(
            "📡 Sending ICE candidate:",
            event.candidate.candidate
          );

          activeSocket.emit(
            "ice-candidate",
            {
              room_id: roomId,
              candidate:
                event.candidate,
            }
          );
        }
      };

      // =========================
      // AUDIO STATS
      // =========================

      statsIntervalRef.current =
        setInterval(async () => {
          if (!pc.current) return;

          const stats =
            await pc.current.getStats();

          stats.forEach((report) => {
            // =========================
            // OUTBOUND AUDIO
            // =========================

            if (
              report.type ===
                "outbound-rtp" &&
              report.kind === "audio"
            ) {
              console.log(
                "🎤 packetsSent:",
                report.packetsSent
              );

              console.log(
                "🎤 bytesSent:",
                report.bytesSent
              );
            }

            // =========================
            // INBOUND AUDIO
            // =========================

            if (
              report.type ===
                "inbound-rtp" &&
              report.kind === "audio"
            ) {
              console.log(
                "🎵 packetsReceived:",
                report.packetsReceived
              );

              console.log(
                "🎵 bytesReceived:",
                report.bytesReceived
              );
            }
          });
        }, 3000);
    };

    // =========================
    // PEER JOINED
    // =========================

    activeSocket.on(
      "peer_joined",
      async () => {
        console.log(
          "📞 peer_joined RECEIVED"
        );

        setCallStatus("Ringing...");

        await createPeer();

        // WAIT TRACK INIT
        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        console.log(
          "📡 Senders:",
          pc.current.getSenders()
        );

        // =========================
        // CREATE OFFER
        // =========================

        const offer =
          await pc.current.createOffer({
            offerToReceiveAudio: true,
          });

        await pc.current.setLocalDescription(
          offer
        );

        console.log(
          "✅ Local description set"
        );

        console.log("📞 Sending offer");

        activeSocket.emit("offer", {
          room_id: roomId,
          offer,
        });
      }
    );

    // =========================
    // ANSWER
    // =========================

    activeSocket.on(
      "answer",
      async ({ answer }) => {
        console.log(
          "📞 Answer received"
        );

        if (!pc.current) return;

        await pc.current.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        console.log(
          "✅ Remote description set"
        );

        setCallStatus("Connected");
      }
    );

    // =========================
    // ICE RECEIVED
    // =========================

    activeSocket.on(
      "ice-candidate",
      async ({ candidate }) => {
        console.log(
          "📞 ICE candidate received"
        );

        try {
          if (
            candidate &&
            pc.current
          ) {
            await pc.current.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );

            console.log(
              "✅ ICE candidate added"
            );
          }
        } catch (err) {
          console.error(
            "❌ ICE error:",
            err
          );
        }
      }
    );

    // =========================
    // CALL ENDED
    // =========================

    activeSocket.on(
      "call_ended_by_astrologer",
      () => {
        console.log(
          "📞 Call ended by astrologer"
        );

        handleEndCall();
      }
    );

    // =========================
    // JOIN ROOM
    // =========================

    console.log(
      "📞 Joining room:",
      roomId
    );

    activeSocket.emit("join_call", {
      roomId,
    });

    // =========================
    // CLEANUP
    // =========================

    return () => {
      console.log(
        "📞 Cleaning up call"
      );

      activeSocket.off(
        "peer_joined"
      );

      activeSocket.off("answer");

      activeSocket.off(
        "ice-candidate"
      );

      activeSocket.off(
        "call_ended_by_astrologer"
      );

      cleanup();
    };
  }, []);

  // =========================
  // END CALL
  // =========================
  const handleEndCall = () => {
    socket.emit(
      "call_ended_by_user",
      {
        room_id: roomId,
      }
    );

    cleanup();

    router.push("/");
  };

  // =========================
  // TOGGLE MUTE
  // =========================
  const toggleMute = () => {
    if (!localStream.current) return;

    localStream.current
      .getAudioTracks()
      .forEach((track) => {
        track.enabled =
          !track.enabled;

        console.log(
          "🎤 Track enabled:",
          track.enabled
        );
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
      clearInterval(
        statsIntervalRef.current
      );

      statsIntervalRef.current =
        null;
    }

    // CLOSE PEER
    if (pc.current) {
      pc.current.close();

      pc.current = null;
    }

    // STOP TRACKS
    if (localStream.current) {
      localStream.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStream.current = null;
    }

    // CLEAR AUDIO
    if (remoteAudio.current) {
      remoteAudio.current.pause();

      remoteAudio.current.srcObject =
        null;
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="text-2xl mb-4">
        📞 Call Status
      </h2>

      <p className="mb-6 text-lg">
        {callStatus}
      </p>

      {/* REMOTE AUDIO */}
      <audio
        ref={remoteAudio}
        autoPlay
        playsInline
      />

      <div className="flex gap-4">
        {/* MUTE */}
        <button
          onClick={toggleMute}
          className="px-4 py-2 bg-yellow-500 rounded"
        >
          {isMuted
            ? "Unmute"
            : "Mute"}
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