/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { Bell, X } from "lucide-react";
import React from "react";

import { useAuthStore } from "../../store/auth.store";
import { useChatWindowsStore } from "../../store/chatWindows.store";
import useChatStore from "../../store/messages.store";

const NotificationPanel: React.FC = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } =
    useAuthStore();
  const { openChats, openChat } = useChatWindowsStore();
  const { users, getUsers } = useChatStore();
  const [isOpen, setIsOpen] = React.useState(false);

  // Load users when component mounts
  React.useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter out notifications for users who have open chat windows
  const filteredNotifications = notifications.filter((notification) => {
    if (notification.type === "message" && notification.fromUser) {
      return !openChats.some(
        (chat) => chat.user._id === notification.fromUser?._id,
      );
    }
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    handleMarkAsRead(notification.id);

    // If it's a message or user online notification, open the chat window
    if (
      (notification.type === "message" ||
        notification.type === "user_online") &&
      notification.fromUser
    ) {
      // Try to find the user in the users store for more complete data
      const fullUser = users.find(
        (user) => user._id === notification.fromUser._id,
      );

      console.log("Notification fromUser:", notification.fromUser);
      console.log("Found fullUser:", fullUser);

      const userToOpen = fullUser || {
        _id: notification.fromUser._id,
        name: notification.fromUser.name,
        profile: notification.fromUser.profile,
      };

      console.log("Opening chat with user:", userToOpen);
      openChat(userToOpen);
      setIsOpen(false); // Close the notification panel
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex gap-2">
              {filteredNotifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {notification.type === "message" && (
                        <span className="text-blue-500">●</span>
                      )}
                      {notification.type === "user_online" && (
                        <span className="text-[#FB406C]">●</span>
                      )}
                      {notification.type === "user_offline" && (
                        <span className="text-red-500">●</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {notification.message}
                      </p>
                      {(notification.type === "message" ||
                        notification.type === "user_online") && (
                        <p className="text-xs text-blue-500 mt-1">
                          Click to open chat
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
