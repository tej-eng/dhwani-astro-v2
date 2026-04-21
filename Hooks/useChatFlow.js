"use client";

import { generateAstroSnapshot } from "@/lib/getSnapShot";
import { getPanchang } from "@/src/services/panchangService";
import { useAIStore } from "@/src/store/aiStore";
import { delay } from "@/utils/delay";

export const useChatFlow = () => {
  const { step, setStep, setUserData, userData } = useAIStore();
  const addMessage = useAIStore((state) => state.addMessage);

  const startChat = async () => {
    const { messages, initialized, setInitialized } = useAIStore.getState();

    // ✅ agar pehle se chat hai → resume
    if (messages.length > 0) {
      addMessage({
        type: "bot",
        text: "👋 Welcome back! Aap apni previous chat continue kar sakte hain",
      });
      return;
    }

    // ✅ first time only
    if (initialized) return;
    setInitialized(true);

    addMessage({ type: "bot", text: "🙏 Namaste!" });

    await delay(600);
    addMessage({
      type: "bot",
      text: "✨ Dhwani Astro me aapka swagat hai",
    });

    await delay(800);
    addMessage({
      type: "bot",
      text: "🔮 Aaj ka Panchang dekhte hain...",
    });

    const panchang = await getPanchang();

    await delay(800);
    addMessage({ type: "panchang", data: panchang });

    const snapshot = generateAstroSnapshot(panchang);

    await delay(1000);
    addMessage({ type: "snapshot", data: snapshot });

    addMessage({
      type: "bot",
      text: "Ye general reading hai 🔮\nAgar aap apni personal kundli based prediction chahte hain, to main personalize kar sakta hoon 🔍",
    });

    await delay(600);
    addMessage({
      type: "options",
      options: ["Yes, Personalize"],
    });
  };

  const handleUserInput = async (input) => {
    const { messages } = useAIStore.getState();
     const aiData = userData?.aiData;
    const cleanInput = input.trim();
    addMessage({ type: "user", text: input });

    // if (messages.length > 0) {
    //   addMessage({
    //     type: "bot",
    //     text: "👋 Welcome back! Aap apni previous chat continue kar sakte hain",
    //   });
    // }

    // ✅ PERSONALIZE START
    if (cleanInput === "Yes, Personalize") {
      setStep("ASK_NAME");

      await delay(400);
      addMessage({
        type: "bot",
        text: "Great choice 😊\nMain aapki kundli deeply analyze karunga 🔮",
      });

      await delay(700);
      addMessage({
        type: "bot",
        text: "Iske liye mujhe kuch basic details chahiye hongi\n(ye sirf accurate prediction ke liye use hoti hain 🔐)",
      });

      await delay(700);
      addMessage({
        type: "bot",
        text: "Chaliye shuru karte hain 👇\nSabse pehle, aapka naam kya hai?",
      });

      return;
    }

    // ✅ GET REMEDY (FIXED + NORMALIZED)
    if (cleanInput === "Get Remedy") {
      const { userData } = useAIStore.getState();
    const aiData = userData?.aiData;

      if (!aiData || !aiData.solutions || aiData.solutions.length === 0) {
        addMessage({
          type: "bot",
          text: "⚠️ Remedies abhi available nahi hain. Expert se baat karein.",
        });

        await delay(300);

        addMessage({
          type: "options",
          options: ["Talk to Expert"],
        });

        return;
      }

  const formatted = aiData.solutions.map((s, i) => ({
  name: s.trim(),
  price: i === 0 ? 499 : 899,
}));

      // emotional + cards (tera logic preserved)
      addMessage({
        type: "bot",
        text: `⚠️ Yeh problem ignore karna future me risky ho sakta hai

Lekin tension mat lijiye 🙏  
Main aapke liye best solutions lekar aaya hoon 👇`,
      });

      await delay(500);

      addMessage({
        type: "remedyCards",
        data: formatted,
      });

      await delay(400);

      addMessage({
        type: "options",
        options: ["Add to Cart", "Talk to Expert"],
      });

      return;
    }

    // ✅ ADD TO CART
    if (cleanInput === "Add to Cart") {
      addMessage({
        type: "bot",
        text: `🛒 Aapka selection cart me add ho gaya hai

👉 Ab aap secure payment karke process start kar sakte hain`,
      });

      await delay(400);

      addMessage({
        type: "checkoutCard",
        data: {
          total: "₹499",
          items: ["Mangal Shanti Puja"],
        },
      });

      await delay(400);

      addMessage({
        type: "options",
        options: ["Proceed to Payment"],
      });

      return;
    }

    // ✅ PAYMENT
    if (cleanInput === "Proceed to Payment") {
      addMessage({
        type: "bot",
        text: `🔐 Redirecting to secure payment...

Payment complete hone ke baad:
✔ Puja initiate hogi  
✔ Aapko confirmation milega  
✔ Astrologer guidance milegi`,
      });

      return;
    }

    // ✅ TALK TO EXPERT
    if (cleanInput === "Talk to Expert") {
const { userData } = useAIStore.getState();
      const problem = aiData?.problems?.[0]?.title || "General";

      addMessage({
        type: "bot",
        text: `🔮 Maine aapka case analyze kiya hai

Aapke liye best expert recommend kar raha hoon 👇`,
      });

      await delay(400);

      addMessage({
        type: "astroCard",
        data: {
          name: "Acharya Rahul Sharma",
          specialty: problem.includes("career")
            ? "Career Specialist"
            : problem.includes("love")
              ? "Love Specialist"
              : "General Expert",
          price: "₹20/min",
          rating: "4.8 ⭐",
        },
      });

      await delay(400);

      addMessage({
        type: "options",
        options: ["Start Chat", "Start Call"],
      });

      return;
    }

    // ✅ STEP FLOW ONLY
    if (step === "ASK_DOB") {
      addMessage({
        type: "bot",
        text: "👍 Nice! Aapka zodiac sign calculate ho raha hai...",
      });
    }

    switch (step) {
      case "ASK_NAME":
        setUserData({ name: input });
        setStep("ASK_DOB");

        await delay(500);
        addMessage({
          type: "bot",
          text: "Aapki date of birth kya hai? 📅\n(Yeh aapki life pattern samajhne ke liye important hai)",
        });
        break;

      case "ASK_DOB":
        setUserData({ dob: input });
        setStep("ASK_TOB");

        await delay(500);
        addMessage({
          type: "bot",
          text: "Aapka birth time kya hai? ⏳\n(Exact time se planets ki position calculate hoti hai)",
        });
        break;

      case "ASK_TOB":
        setUserData({ tob: input });
        setStep("ASK_PLACE");

        await delay(500);
        addMessage({
          type: "bot",
          text: "Birth place batayein 📍\n(Location se kundli ki accuracy aur improve hoti hai)",
        });
        break;

      case "ASK_PLACE":
        setUserData({ place: input });
        setStep("GENERATE");

        await delay(1000);
        addMessage({
          type: "bot",
          text: "✨ Sab details mil gayi\nMain ab aapki kundli process kar raha hoon...",
        });

        await delay(800);
        addMessage({
          type: "bot",
          text: "🪐 Planetary alignment check ho raha hai...",
        });

        await delay(800);
        addMessage({
          type: "bot",
          text: "🔮 Insights generate ho rahe hain...",
        });

 const res = await fetch("http://localhost:5000/api/ai-analysis", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...userData, place: input }),
});

// ✅ direct JSON parse
const data = await res.json();

console.log("AI DATA FRONTEND:", data);

// error handling
if (!res.ok || data.error) {
  addMessage({
    type: "bot",
    text: "⚠️ AI service temporarily unavailable. Try again.",
  });
  return;
}

// ✅ store correctly
setUserData((prev) => ({
  ...prev,
  aiData: data,
}));

        await delay(1000);
        setStep("OPTIONS");

        addMessage({
          type: "bot",
          text: `🔮 Your Kundli Insights

💼 Career:
- ${data.career?.join("\n- ") || "No data"}

❤️ Love:
- ${data.love?.join("\n- ") || "No data"}

💰 Finance:
- ${data.finance?.join("\n- ") || "No data"}`,
        });

        if (data.problems?.length) {
          const p = data.problems[0];
          addMessage({
            type: "bot",
            text: `⚠️ Mujhe lagta hai aapke chart me ${p.title} hai

${p.description}

Kya aap iska solution dekhna chahenge?`,
          });
        }

        if (data.doshas?.length) {
          addMessage({
            type: "bot",
            text: `🧿 ${data.doshas[0].name}

Impact:
${data.doshas[0].impact.join("\n")}`,
          });
        }

        if (data.solutions?.length) {
          addMessage({
            type: "bot",
            text: `🪔 Suggested Remedies:

${data.solutions.map((s) => `- ${s}`).join("\n")}`,
          });
        }

        await delay(800);

        addMessage({
          type: "bot",
          text: `🔮 Main aapko hamare expert astrologer se connect kar sakta hoon

Woh aapki kundli ka detailed analysis karke:
✔ Exact upay batayenge  
✔ Personalized puja suggest karenge  
✔ Life problems ka solution denge  

Kya aap expert se baat karna chahenge?`,
        });

        await delay(400);

        addMessage({
          type: "options",
          options: ["Talk to Expert", "Get Remedy"],
        });

        break;
    }
  };

  return { startChat, handleUserInput };
};
