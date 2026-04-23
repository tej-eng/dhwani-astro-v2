"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import SocketContext from "../context/socketContext";
import { AlertLoading } from "../common";
import Script from "next/script";
import { useDispatch } from "react-redux";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createReviewRequest } from "../redux/reducer/auth/reviewSlice";
import { debug } from "three/src/nodes/utils/DebugNode";
import { clearActiveRequest } from "../redux/reducer/chat/sendRequestSlice";

// ================= GRAPHQL =================
const GET_RECHARGE_PACKS = gql`
  query GetRechargePacks {
    getRechargePacks {
      data {
        id
        name
        description
        price
        talktime
      }
      totalCount
    }
  }
`;
const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      success
      message
    }
  }
`;

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      name
      gender
      user_status
    }
  }
`;

const GET_INTAKE_BY_ID = gql`
  query GetIntakeById($id: String!) {
    getIntakeById(id: $id) {
      id
      name
      gender
      dob
      btime
      birth_place
      occupation
    }
  }
`;

const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
    }
  }
`;
// ================= COMPONENT =================

const UserChat = ({
  room_Id,
  astro_Name,
  astro_Image,
  chattime,
  user_Id,
  astroid,
  astro_price,
  userIntakeId,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket, connectSocket } = useContext(SocketContext);

  const { data: userRes, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: user_Id },
    skip: !user_Id,
  });

  const { data: intakeRes, loading: intakeLoading } = useQuery(
    GET_INTAKE_BY_ID,
    {
      variables: { id: userIntakeId },
      skip: !userIntakeId,
    },
  );

  const { data: rechargeData, loading: rechargePackLoading } =
    useQuery(GET_RECHARGE_PACKS);

  const rechargePacks = rechargeData?.getRechargePacks?.data || [];

  const getintake = intakeRes?.getIntakeById;

  // ================= STATES =================

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "Astrologer",
      message:
        "Hey there! Welcome to Dhwani Astro 😊 Our consultant is checking your details...",
      time: "",
    },
  ]);

  const [typingStatus, setTypingStatus] = useState("");
  //const [timeLeft, setTimeLeft] = useState((chattime || 0) * 60);
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  const [showPopup, setShowPopup] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [completedChat, setCompletedChat] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [createReview, { loading: reviewLoading }] = useMutation(CREATE_REVIEW);
  const [user, setUser] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  //   const [queueData, setQueueData] = useState(null);
  // const [showQueuePopup, setShowQueuePopup] = useState(false);
  const [uploadImage] = useMutation(UPLOAD_IMAGE);

  const intervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  // Get user from localStorage safely (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : {});
    }
  }, []);

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Only images allowed");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result);
  };

  reader.readAsDataURL(file);
  setImageFile(file);
};
const uploadToServer = async (file) => {
  try {
    console.log("Selected file:", imageFile);
    console.log("Is File instance:", imageFile instanceof File);
    const res = await uploadImage({
      variables: { file },
    });

    return res.data.uploadImage.url;
  } catch (err) {
    toast.error("Upload failed");
    return null;
  }
};
  const customer_recharge = () => {
    if (!socket) return;
    socket.emit("customer_recharge", { room_id: room_Id });
  };

  const customer_recharge_fail = () => {
    if (!socket) return;
    socket.emit("customer_recharge_fail", { room_id: room_Id });
  };

  const customer_recharge_completed = (due_time) => {
    console.log("Emitting recharge completed with due_time:", due_time);
    if (!socket) return;
    console.log("Emitting customer_recharge_completed for room:", room_Id);
    socket.emit("customer_recharge_completed", {
      room_id: room_Id,
      due_time: due_time,
    });
  };
  // ================= RECHARGE FUNCTION =================
  const handleCheckout = async (amount, packId) => {
    try {
      customer_recharge();
      //  PAUSE TIMER

      setIsPaused(true);

      const res = await fetch("https://dhwaniastro.com/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const order = await res.json();

      if (order.error) {
        setIsPaused(false); //  resume if error
        return alert("Error creating order");
      }

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SNXjhTOgP1CIx0",
        amount: order.amount,
        currency: order.currency,
        name: "Dhwani Astro LLp",
        description: "Recharge Payment",
        order_id: order.id,

        handler: async function (response) {
          //  PAYMENT SUCCESS

          toast.success("Payment Successful ");

          //  Add time (based on pack)
          const selectedPack = rechargePacks.find((p) => p.id === packId);

          if (selectedPack) {
            const newTime = timeLeft + selectedPack.talktime * 60;
            console.log("New Time After Recharge:", newTime);
            customer_recharge_completed(newTime); // Send updated time to backend

            setTimeLeft(newTime); // Update local timer
          }

          //  RESUME TIMER
          setIsPaused(false);
        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
            customer_recharge_fail();
            //  USER CLOSED PAYMENT
            toast.error("Payment Cancelled");
            setIsPaused(false); // resume timer
          },
        },

        notes: {
          userId: user?.id ?? "guest",
          rechargePackId: packId,
        },

        theme: {
          color: "#fff49e",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      setIsPaused(false); // safety
      alert("Error: " + error.message);
    }
  };

const handleMessageChange = (e) => {
  const value = e.target.value;
  setMessage(value);

  if (!socket) return;

  // Emit typing = true
  socket.emit("typing", {
    room_id: room_Id,
    typing: true,
    user_name: user?.name || "User",
  });

  // Clear previous timeout
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  // Emit typing = false after 2 sec idle
  typingTimeoutRef.current = setTimeout(() => {
    socket.emit("typing", {
      room_id: room_Id,
      typing: false,
      user_name: user?.name || "User",
    });
  }, 2000);
};

  // ================= SOCKET =================
  const emitChatCompleted = () => {
    if (chatEnded) return; // prevent duplicate
    setChatEnded(true);

    if (!socket) return;

    socket.emit("chatCompleted", {
      room_id: room_Id,
      astroId: astroid,
      userId: user_Id,
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinChat", {
      username: "customer",
      room_id: room_Id,
      joinpersonid: user_Id,
    });

   socket.on("receive_message", (data) => {
  setMessages((prev) => [
    ...prev,
    {
      sender: data.sender,
      message: data.message,
      image: data.image || null,
      replyTo: data.replyTo || null,
      time: data.time,
    },
  ]);
});

    socket.on("typing", (data) => {
      setTypingStatus(data.typing ? `${data.user_name} typing...` : "");
    });
    //  socket.on("queue_position", (data) => {
    //    console.log("Queue Data:", data);
    //    setQueueData(data); // { position: 3, waitTime: 120 }
    //    setShowQueuePopup(true);
    // });
    //  Leave Chat
    socket.on("leave_chat", (data) => {
      if (data.roomId === room_Id) {
        setLeaveMessage("Chat ended by astrologer");
        setShowPopup(true);

        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    });

    //  Completed Chat
    socket.on("chatCompleted", (data) => {
      if (data.roomId === room_Id) {
        setLeaveMessage("Chat completed successfully");
        setShowReviewPopup(true);

        setTimeout(() => {
          router.push("/chat-with-astrologer");
        }, 4000);
      }
    });

    //  User Disconnected
    socket.on("user_disconnected", () => {
      setLeaveMessage("User disconnected");
      setShowPopup(true);

      setTimeout(() => {
        router.push("/user/chat-history");
      }, 3000);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("leave_chat");
      socket.off("chatCompleted");
      socket.off("user_disconnected");
       if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
    };
  }, [socket, room_Id, user_Id]);

  // ================= TIMER =================

  useEffect(() => {
    if (!socket) return;

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (isPaused) return prev;

        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          socket.emit("chatCompleted", {
            room_id: room_Id,
            astroId: astroid,
            userId: user_Id,
          });

          setShowReviewPopup(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket, isPaused]);

  // ================= SEND MESSAGE =================

 const sendMessage = async () => {
  if (!message.trim() && !imageFile) return;

  socket.emit("typing", {
    room_id: room_Id,
    typing: false,
    user_name: user?.name || "User",
  });

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  const msg_id = crypto.randomUUID();

  let imageUrl = null;

  // Upload image FIRST (if exists)
  if (imageFile) {
    imageUrl = await uploadToServer(imageFile);
    if (!imageUrl) {
      toast.error("Image upload failed");
      return;
    }
  }

  const newMessage = {
    room_id: room_Id,
    msg_id,
    sender_id: user?.id,
    received_id: astroid,
    sender: "user",
    message: message.trim(),
    image: imageUrl, 
    replyTo: replyTo
      ? {
          sender: replyTo.sender,
          message: replyTo.message,
          image: replyTo.image || null,
        }
      : null,
    time: new Date().toISOString(),
  };

  socket.emit("send_message", newMessage);

  setMessages((prev) => [...prev, newMessage]);

  // reset
  setMessage("");
  setImageFile(null);
  setImagePreview(null);
  setReplyTo(null);
};

  // ================= REVIEW =================

  const handleSubmitReview = async () => {
    try {
      emitChatCompleted();

      await createReview({
        variables: {
          input: {
            astro_id: String(astroid),
            review_id: String(room_Id),
            star: rating,
            comment: reviewComment,
            user_name: getintake?.name || "",
            astro_name: astro_Name,
          },
        },
      });

      toast.success("Review submitted successfully");

      setShowReviewPopup(false);
      dispatch(clearActiveRequest());

      setTimeout(() => {
        router.push("/chat-with-astrologer");
      }, 1000);
    } catch (error) {
      console.error("Review error:", error);
      toast.error("Failed to submit review");
    }
  };

  const isLoading = userLoading || intakeLoading;

  // ================= UI =================

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto border text-black rounded-xl shadow-lg overflow-hidden bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src={`/ds-img/${astro_Image}`}
            width={45}
            height={45}
            alt="astro"
            className="rounded-full object-cover border"
          />
          <div>
            <div className="font-semibold text-sm">{astro_Name}</div>
            <div className="text-xs text-green-300">
              {typingStatus || "Online"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm bg-black/30 px-3 py-1 rounded-full">
            ⏱ {formatTime(timeLeft)}s
          </div>

          <button
            onClick={() => {
              setShowReviewPopup(true);
            }}
            className="bg-red-500 px-3 py-1 rounded text-sm"
          >
            End
          </button>
        </div>
      </div>
      {/* =================  RECHARGE SECTION ================= */}
      {timeLeft <= 60 && (
        <div className="bg-yellow-100 px-4 py-3">
          <p className="text-center text-red-500 text-xs font-semibold mb-2">
            Your time is running low. Recharge now
          </p>

          {rechargePackLoading ? (
            <p className="text-center text-xs">Loading packs...</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {rechargePacks.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handleCheckout(pack.price, pack.id)}
                  id={pack.id}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg flex flex-col items-center text-xs"
                >
                  <span>₹ {pack.price}</span>
                  <span>{pack.talktime} min</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
     {/* CHAT */}
<div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-gray-50">
  {messages.map((msg, i) => (
    <div
      key={i}
      onMouseEnter={() => setHoveredIndex(i)}
      onMouseLeave={() => setHoveredIndex(null)}
      className={`flex ${
        msg.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="relative px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow bg-white">

        {/*  REPLY CONTEXT */}
        {msg.replyTo && (
          <div className="bg-gray-100 border-l-4 border-purple-500 p-2 mb-1 text-xs">
            <strong>{msg.replyTo.sender}</strong>:{" "}
            {msg.replyTo.message?.slice(0, 40)}
            {msg.replyTo.image && (
              <img
                src={msg.replyTo.image}
                className="w-10 h-10 mt-1 rounded"
              />
            )}
          </div>
        )}

        {/* MESSAGE TEXT */}
        {msg.message && <div>{msg.message}</div>}

        {/* IMAGE DISPLAY */}
        {msg.image && (
          <img
            src={msg.image}
            alt="chat-img"
            className="mt-2 w-32 h-32 rounded-lg object-cover"
          />
        )}

        {/* TIME */}
        {msg.time && (
          <div className="text-[10px] text-gray-400 mt-1 text-right">
            {msg.time}
          </div>
        )}

        {/*  REPLY BUTTON (hover) */}
        {hoveredIndex === i && (
          <button
            onClick={() => setReplyTo(msg)}
            className="absolute -left-10 top-2 text-xs bg-gray-200 px-2 py-1 rounded"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  ))}
</div>
{/*  REPLY PREVIEW */}
{replyTo && (
  <div className="px-3 py-2 bg-blue-100 border-l-4 border-blue-500 text-xs flex justify-between items-center">
    <div>
      Replying to <b>{replyTo.sender}</b>:{" "}
      {replyTo.message?.slice(0, 40)}
      {replyTo.image && (
        <img src={replyTo.image} className="w-8 h-8 inline ml-2 rounded" />
      )}
    </div>
    <button onClick={() => setReplyTo(null)}>✖</button>
  </div>
)}

{/*  IMAGE PREVIEW */}
{imagePreview && (
  <div className="px-3 py-2 flex items-center gap-2">
    <img
      src={imagePreview}
      className="w-16 h-16 object-cover rounded"
    />
    <button
      onClick={() => {
        setImagePreview(null);
        setImageFile(null);
      }}
      className="text-red-500"
    >
      Remove
    </button>
  </div>
)}

      {/* INPUT */}
<div className="flex gap-2 p-3 border-t items-center">

  {/* FILE INPUT */}
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    onChange={handleImageChange}
    className="hidden"
  />

  {/* ATTACH BUTTON */}
  <button
    onClick={() => fileInputRef.current.click()}
    className="text-purple-600"
  >
    📎
  </button>

  {/* TEXT INPUT */}
  <input
    value={message}
    onChange={handleMessageChange}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    }}
    className="flex-1 border px-3 py-2 rounded-full"
    placeholder="Type message..."
  />

  {/* SEND BUTTON */}
  <button
    onClick={sendMessage}
    className="bg-purple-700 text-white px-4 rounded-full"
  >
    Send
  </button>
</div>

      {/* POPUPS */}
      {showReviewPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6">
            <h2 className="text-xl text-center mb-4">Rate Your Experience</h2>

            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full border mb-3 p-2"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  emitChatCompleted();
                  setShowReviewPopup(false);
                  router.push("/user/chat-history");
                }}
                className="w-1/2 border py-2 rounded-lg"
              >
                Skip
              </button>

              <button
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                className="w-1/2 bg-purple-700 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {reviewLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertLoading show={isLoading} title="Loading..." />
    </div>
  );
};

export default UserChat;
