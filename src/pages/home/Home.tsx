/* eslint-disable no-console */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmailVerificationReminder from "../../components/auth/EmailVerificationReminder.tsx";
import { useAuthStore } from "../../store/auth.store.ts";
import { useChatWindowsStore } from "../../store/chatWindows.store";
import usePageStore from "../../store/page.store.ts";
import useUserStore from "../../store/user.store.ts";
import type { User } from "../../types/auth.ts";
import FloatingChatManager from "../chat/components/FloatingChatManager.tsx";

import ContentArea from "./components/ContentArea.tsx";
import MergedHeader from "./components/MergedHeader.tsx";
import TabNavigation from "./components/TabNavigation.tsx";

const Home = () => {
  const [activeTab, setActiveTab] = useState<
    "users" | "received" | "sent" | "friends"
  >("users");
  const [showEmailReminder, setShowEmailReminder] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setCurrentPage = usePageStore((state) => state.setCurrentPage);
  const resetCurrentUser = useUserStore((state) => state.resetCurrentUser);
  const { logout, checkAuth } = useAuthStore();
  const openChat = useChatWindowsStore((state) => state.openChat);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      // Always update currentUser when authUser changes (including after profile updates)
      console.log("Home: Updating currentUser from authUser");
      setCurrentUser(authUser);

      const { connectSocket } = useAuthStore.getState();
      connectSocket();
    } else if (!authUser && !currentUser) {
      console.log("Home: No user found, checking auth...");
      checkAuth();
    }
  }, [authUser, currentUser, setCurrentUser, checkAuth]);

  useEffect(() => {
    const displayUser = currentUser || authUser;
    if (displayUser && displayUser.email && !displayUser.isEmailVerified) {
      setShowEmailReminder(true);
    }
  }, [currentUser, authUser]);

  const displayUser = currentUser || authUser;

  if (isCheckingAuth && !authUser && !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FB406C]"></div>
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  if (!isCheckingAuth && !displayUser) {
    navigate("/");
    return null;
  }

  const handleLogout = async () => {
    try {
      console.log("Starting logout from Home component");

      await logout();

      resetCurrentUser();

      setCurrentPage("login");

      navigate("/", { replace: true });

      console.log("Logout completed from Home component");
    } catch (error) {
      console.error("Error during logout:", error);

      resetCurrentUser();
      setCurrentPage("login");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {displayUser && (
        <MergedHeader user={displayUser} onLogout={handleLogout} />
      )}

      <main className="p-6 flex-grow flex flex-col gap-6">
        {/* Email Verification Reminder */}
        {showEmailReminder &&
          displayUser &&
          displayUser.email &&
          !displayUser.isEmailVerified && (
            <EmailVerificationReminder
              email={displayUser.email}
              onClose={() => setShowEmailReminder(false)}
            />
          )}

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <ContentArea
          activeTab={activeTab}
          onUserClick={(user: User) => openChat(user)}
        />
      </main>

      <FloatingChatManager />
    </div>
  );
};

export default Home;
