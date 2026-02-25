import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import apiClient from "./ApiClient";

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Register for push notifications and get the token
   */
  registerForPushNotificationsAsync: async () => {
    let token: string | undefined;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.warn("Failed to get push token for push notification!");
        return;
      }

      try {
        // Get the token
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Push Token Registered:", token);

        if (token) {
          // Send token to backend
          await NotificationService.sendTokenToBackend(token);
        }
      } catch (e) {
        console.error("Error getting push token", e);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  },

  /**
   * Send the device token to our backend
   */
  sendTokenToBackend: async (token: string) => {
    try {
      await apiClient.post("/notifications/tokens", {
        token: token,
        device_type: Platform.OS,
      });
      console.log("Token sent to backend successfully");
    } catch (e) {
      console.error("Failed to send token to backend", e);
    }
  },

  /**
   * Listener for foreground notifications
   */
  addNotificationListener: (callback: (notification: Notifications.Notification) => void) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Listener for when a user interacts with a notification (taps it)
   */
  addNotificationResponseListener: (callback: (response: Notifications.NotificationResponse) => void) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
