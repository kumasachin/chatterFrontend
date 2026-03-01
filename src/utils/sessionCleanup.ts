/**
 * Utility function to completely clear user session data
 * This ensures logout is thorough and prevents stale data
 */
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

export const clearUserSession = () => {
  console.log("Clearing complete user session...");

  // Clear localStorage
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user_preferences");
    localStorage.removeItem("chat_data");
  } catch (error) {
    console.warn("Error clearing localStorage:", error);
  }

  // Clear sessionStorage
  try {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("user_session");
    // Keep justLoggedOut flag for logout flow
    // sessionStorage.removeItem('justLoggedOut');
  } catch (error) {
    console.warn("Error clearing sessionStorage:", error);
  }

  // Clear memory storage
  try {
    delete (window as any).__auth_token;
    delete (window as any).__user_data;
  } catch (error) {
    console.warn("Error clearing memory storage:", error);
  }

  console.log("User session cleared completely");
};

export const isUserLoggedOut = (): boolean => {
  try {
    return sessionStorage.getItem("justLoggedOut") === "true";
  } catch {
    return false;
  }
};

export const setLogoutFlag = () => {
  try {
    sessionStorage.setItem("justLoggedOut", "true");
  } catch (error) {
    console.warn("Error setting logout flag:", error);
  }
};

export const clearLogoutFlag = () => {
  try {
    sessionStorage.removeItem("justLoggedOut");
  } catch (error) {
    console.warn("Error clearing logout flag:", error);
  }
};
