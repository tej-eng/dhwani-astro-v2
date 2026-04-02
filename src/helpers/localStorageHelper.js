export const localStorageHelper = {
  setItem(key, value) {
    if (typeof window === "undefined") return; // ✅ FIX

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // console.error("Error setting localStorage", error);
    }
  },

  getItem(key) {
    if (typeof window === "undefined") return null;
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  },

  removeItem(key) {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  },

  clear() {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (error) {}
  },

  setAuthCredentials(id, password) {
    if (typeof window === "undefined") return; 

    const credentials = btoa(`${id}:${password}`);
    this.setItem("authCredentials", credentials);
  },

  getAuthHeader() {
    const credentials = this.getItem("authCredentials");
    if (!credentials) return null;
    return `Basic ${credentials}`;
  },

  clearAuthCredentials() {
    this.removeItem("authCredentials");
  }
};