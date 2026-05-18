"use client";

import { useEffect, useRef, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SocketContext from "@/app/context/socketContext";
import Image from "next/image";

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
  // const [isSpeaker, setIsSpeaker] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(10));

  // voice waves
  useEffect(() => {
    if (!remoteAudio.current?.srcObject) return;

    const audioContext = new AudioContext();

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 64;

    const source = audioContext.createMediaStreamSource(
      remoteAudio.current.srcObject,
    );

    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);

      const normalized = Array.from(dataArray)
        .slice(0, 20)
        .map((v) => Math.max(10, v / 2));

      setWaveHeights(normalized);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      audioContext.close();
    };
  }, [remoteAudio.current?.srcObject]);

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
      cleanup();
      router.push("/");
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

  // call status time
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
    const stored = localStorage.getItem(`call_request_${roomId}`);

    // if (!stored) {
    //   console.log("No call request found");
    //   return;
    // }

    const data = JSON.parse(stored);

    socket.emit("call_ended_by_user", {
      room_id: roomId,
      astro_id: data?.astro_id,
    });

    cleanup();

    router.push("/");
  };

  // =========================
  // TOGGLE Speaker & MUTE
  // =========================
  // const toggleSpeaker = () => {
  //   if (!localStream.current) return;

  //   localStream.current.getAudioTracks().forEach((track) => {
  //     track.enabled = !track.enabled;

  //     console.log("🎤 Track enabled:", track.enabled);
  //   });

  //   setIsSpeaker(!isSpeaker);
  // };

  // mute

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

  // format time
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

  const astroData = JSON.parse(localStorage.getItem("activeRequest"));
  return (
    <div className="w-full  flex items-center justify-center h-screen p-5 bg-purple-50">
      <div className="flex flex-col w-[80%]  rounded-3xl shadow-xl items-center justify-between py-10    h-full bg-gray-900 text-white">
        <div className="flex items-center gap-3">
          <img
            src="/ds-img/a.jpg"
            alt={astroData?.astrologer?.name}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />

          <h2 className="text-xl">{astroData?.astrologer?.name}</h2>
        </div>
        <div className="flex flex-col items-center ">
          <h2 className="text-2xl mb-4">📞 Call Status</h2>

          <p className="mb-6 text-lg">{callStatus}</p>

          {callStatus === "Connected" && (
            <p className="mb-6 text-lg">
              Time Left : {formatTime(remainingTime)}
            </p>
          )}

          <div className="flex items-end justify-center gap-1 h-20 mt-4">
            {waveHeights.map((height, index) => (
              <div
                key={index}
                className="w-2 bg-green-400 rounded-full transition-all duration-75"
                style={{
                  height: `${height}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* REMOTE AUDIO */}
        <audio ref={remoteAudio} autoPlay playsInline />

        <div className="flex gap-6  w-full items-center justify-center   ">
          {/* <button
            onClick={toggleSpeaker}
            className="w-20 h-20 border border-gray-300 rounded-full flex items-center justify-center shadow-2xl"
           >
            {isSpeaker ? (
              <svg width={35} height={35} viewBox="0 0 640 640">
                <path
                  fill="rgb(255, 255, 255)"
                  d="M533.6 96.5C523.3 88.1 508.2 89.7 499.8 100C491.4 110.3 493 125.4 503.3 133.8C557.5 177.8 592 244.8 592 320C592 395.2 557.5 462.2 503.3 506.3C493 514.7 491.5 529.8 499.8 540.1C508.1 550.4 523.3 551.9 533.6 543.6C598.5 490.7 640 410.2 640 320C640 229.8 598.5 149.2 533.6 96.5zM473.1 171C462.8 162.6 447.7 164.2 439.3 174.5C430.9 184.8 432.5 199.9 442.8 208.3C475.3 234.7 496 274.9 496 320C496 365.1 475.3 405.3 442.8 431.8C432.5 440.2 431 455.3 439.3 465.6C447.6 475.9 462.8 477.4 473.1 469.1C516.3 433.9 544 380.2 544 320.1C544 260 516.3 206.3 473.1 171.1zM412.6 245.5C402.3 237.1 387.2 238.7 378.8 249C370.4 259.3 372 274.4 382.3 282.8C393.1 291.6 400 305 400 320C400 335 393.1 348.4 382.3 357.3C372 365.7 370.5 380.8 378.8 391.1C387.1 401.4 402.3 402.9 412.6 394.6C434.1 376.9 448 350.1 448 320C448 289.9 434.1 263.1 412.6 245.5zM80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416z"
                />
              </svg>
            ) : (
              <svg width={35} height={35} viewBox="0 0 640 640">
                <path
                  fill="rgb(255, 255, 255)"
                  d="M80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416zM399 239C389.6 248.4 389.6 263.6 399 272.9L446 319.9L399 366.9C389.6 376.3 389.6 391.5 399 400.8C408.4 410.1 423.6 410.2 432.9 400.8L479.9 353.8L526.9 400.8C536.3 410.2 551.5 410.2 560.8 400.8C570.1 391.4 570.2 376.2 560.8 366.9L513.8 319.9L560.8 272.9C570.2 263.5 570.2 248.3 560.8 239C551.4 229.7 536.2 229.6 526.9 239L479.9 286L432.9 239C423.5 229.6 408.3 229.6 399 239z"
                />
              </svg>
            )}
          </button> */}
          {/* MUTE */}
          <button
            onClick={toggleMute}
            className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            {isMuted ? (
              <svg width={35} height={35} viewBox="0 0 640 640">
                <path
                  fill="rgb(255, 255, 255)"
                  d="M320 64C267 64 224 107 224 160L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 160C416 107 373 64 320 64zM176 248C176 234.7 165.3 224 152 224C138.7 224 128 234.7 128 248L128 288C128 385.9 201.3 466.7 296 478.5L296 528L248 528C234.7 528 224 538.7 224 552C224 565.3 234.7 576 248 576L392 576C405.3 576 416 565.3 416 552C416 538.7 405.3 528 392 528L344 528L344 478.5C438.7 466.7 512 385.9 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 367.5 399.5 432 320 432C240.5 432 176 367.5 176 288L176 248z"
                />
              </svg>
            ) : (
              <svg width={35} height={35} viewBox="0 0 640 640">
                <path
                  fill="rgb(255, 255, 255)"
                  d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L456.7 422.8C490.9 388.2 512 340.6 512 288L512 248C512 234.7 501.3 224 488 224C474.7 224 464 234.7 464 248L464 288C464 327.3 448.3 362.9 422.7 388.9L388.8 355C405.6 337.7 416 314 416 288L416 160C416 107 373 64 320 64C267 64 224 107 224 160L224 190.2L73 39.2zM371.3 473.1L329.9 431.7C326.6 431.9 323.4 432 320.1 432C240.6 432 176.1 367.5 176.1 288L176.1 277.8L132.5 234.2C129.7 238.1 128.1 242.9 128.1 248L128.1 288C128.1 385.9 201.4 466.7 296.1 478.5L296.1 528L248.1 528C234.8 528 224.1 538.7 224.1 552C224.1 565.3 234.8 576 248.1 576L392.1 576C405.4 576 416.1 565.3 416.1 552C416.1 538.7 405.4 528 392.1 528L344.1 528L344.1 478.5C353.4 477.3 362.5 475.5 371.4 473.1z"
                />
              </svg>
            )}
          </button>

          {/* END CALL */}
          <button
            onClick={handleEndCall}
            className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl"
          >
            <svg width={35} height={35} viewBox="0 0 640 640">
              <path
                fill="rgb(255, 255, 255)"
                d="M567 39.1C576.4 29.7 591.6 29.7 600.9 39.1C610.2 48.5 610.3 63.7 600.9 73L73 601.1C63.6 610.5 48.4 610.5 39.1 601.1C29.8 591.7 29.7 576.5 39.1 567.2L173.5 432.6C121.2 374.5 83.6 302.8 66.8 223.4C50.7 147.1 105.9 84.6 170.5 66.9L176 65.4C195.7 60 216.3 70.1 224.1 88.9L264.6 186.2C271.5 202.7 266.7 221.8 252.8 233.2L208.7 269.3C221.6 297.8 238.3 324.1 258.2 347.8L567 39.1zM416.6 573.1C353.6 559.7 295.3 533.3 244.9 496.8L329.8 412C342 420.2 354.8 427.6 368.1 434.2L406.7 387C418 373.1 437.1 368.4 453.7 375.2L551 415.8C569.8 423.6 579.9 444.2 574.5 463.9L573 469.4C555.4 534 492.8 589.2 416.6 573.1z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
