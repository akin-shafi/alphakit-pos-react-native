import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { BASE_URL } from "../config/api";

export const WS_EVENTS = {
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_UPDATED: "ORDER_UPDATED",
  ORDER_PAID: "ORDER_PAID",
  ORDER_VOIDED: "ORDER_VOIDED",
  ORDER_PREP_UPDATE: "ORDER_PREP_UPDATE",
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private businessId: string | number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(businessId: string | number) {
    this.businessId = businessId;
    const token = await AsyncStorage.getItem("accessToken");
    
    if (!token) {
      console.warn("[WS] No token found, cannot connect");
      return;
    }

    const wsUrl = BASE_URL.replace("http", "ws") + "/ws/kds";
    
    console.log(`[WS] Connecting to ${wsUrl}`);
    
    this.socket = new WebSocket(wsUrl, ["Bearer", token]);

    this.socket.onopen = () => {
      console.log("[WS] Connected");
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS] Message received:", data.type);
        DeviceEventEmitter.emit(data.type, data.data);
      } catch (e) {
        console.error("[WS] Failed to parse message", e);
      }
    };

    this.socket.onerror = (e) => {
      console.error("[WS] Error:", e);
    };

    this.socket.onclose = (e) => {
      console.log("[WS] Closed:", e.reason);
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WS] Reconnecting attempt ${this.reconnectAttempts}...`);
      setTimeout(() => {
        if (this.businessId) this.connect(this.businessId);
      }, 5000);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default new WebSocketService();
