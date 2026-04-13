import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAIStore = create(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      step: "INIT",
      initialized: false, // 🔥 control first load

      userData: {
        name: "",
        dob: "",
        tob: "",
        place: "",
        aiData: null, // 🔥 ADD THIS (important)
      },

      // 🔄 Toggle Chat
      toggleChat: () =>
        set((state) => ({
          isOpen: !state.isOpen,
        })),

      // 💬 Add Message
      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      // 🧹 Clear Messages (FULL RESET)
      clearMessages: () =>
        set({
          messages: [],
          step: "INIT",
          initialized: false,
          userData: {
            name: "",
            dob: "",
            tob: "",
            place: "",
            aiData: null,
          },
        }),

      // 🧠 Step Control
      setStep: (step) => set({ step }),

      // 👤 User Data
      setUserData: (data) =>
        set((state) => ({
          userData: { ...state.userData, ...data },
        })),

      // 🚀 Init Control
      setInitialized: (val) => set({ initialized: val }),
    }),
    {
      name: "dhwani-ai-chat", // 🔥 localStorage key

      // 🔥 optional: only persist important data
      partialize: (state) => ({
        messages: state.messages,
        userData: state.userData,
        step: state.step,
        initialized: state.initialized,
      }),
    }
  )
);