import api from "./axios";

// Send OTP
export const sendOtp = async (phone, role) => {
  try {
    const { data } = await api.post("/auth/send-otp", { phone, role });
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Verify OTP
export const verifyOtp = async (phone, otp, role) => {
  try {
    const { data } = await api.post("/auth/verify-otp", { phone, otp, role });

    // Token handling
    const token = data.accessToken;
    if (token) {
      // Web fallback: store in localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("authToken", token);
      }

      // Send token to React Native WebView
      if (window.ReactNativeWebView && token) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "SET_TOKEN", token }));
      }
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};
export const getProfile = async () => {
  try {
    const { data } = await api.get("/auth/profile");
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};
export const deleteProfile = async (userId) => {
  try {
    const { data } = await api.delete(`/auth/delete/${userId}`);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};