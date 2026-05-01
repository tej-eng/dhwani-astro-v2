import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  chatData: [],
  chatStatusCode: null,
  activeRequest:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("activeRequest")) || null
      : null,
};

const sendRequestSlice = createSlice({
  name: "send_request_chat",
  initialState,
  reducers: {
    sendChatRequest: (state) => {
      state.loading = true;
      state.chatStatusCode = 0;
    },

    sendChatReqAdd: (state, action) => {
      state.loading = false;
      state.chatStatusCode = 200;
      state.chatData = action.payload;
    },

    sendChatReqFail: (state) => {
      state.loading = false;
      state.chatStatusCode = 400;
    },

    resetCode: (state) => {
      state.chatStatusCode = null;
    },

    // ✅ STORE + PERSIST
    setActiveRequest: (state, action) => {
      state.activeRequest = action.payload;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "activeRequest",
          JSON.stringify(action.payload)
        );
      }
    },

    // ✅ CLEAR + REMOVE
    clearActiveRequest: (state) => {
      state.activeRequest = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("activeRequest");
      }
    },
  },
});

export const {
  sendChatRequest,
  sendChatReqAdd,
  sendChatReqFail,
  resetCode,
  setActiveRequest,
  clearActiveRequest,
} = sendRequestSlice.actions;

export default sendRequestSlice.reducer;