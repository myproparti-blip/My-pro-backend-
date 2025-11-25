import React, { useEffect, useState, useRef } from "react";
import {
  Platform,
  StatusBar,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Location from "expo-location";

const LAN_IP = "192.168.29.78"; // ⚠️ Make sure this matches your LAN IP
const LOCAL_URL = `http://localhost:3000`;
const LAN_URL = `http://${LAN_IP}:3000`;

export default function App() {
  // ✅ Properly typed refs
  const webViewRef = useRef<WebView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  // ✅ State
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [initialLocationSent, setInitialLocationSent] = useState(false);

  // ✅ Platform-based web URL
  const webUrl = Platform.OS === "web" ? LOCAL_URL : LAN_URL;

  // ✅ Start tracking when the app mounts
  useEffect(() => {
    if (Platform.OS !== "web") {
      startTracking();
    }
    return () => stopTracking();
  }, []);

  // ✅ Stop tracking location
  const stopTracking = () => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
      setTracking(false);
    }
  };

  // ✅ Start tracking with proper typing
  const startTracking = async (force = false) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable location access to use this feature."
        );
        setLoading(false);
        return;
      }

      // Stop previous tracking if any
      stopTracking();

      if (!initialLocationSent || force) setLoading(true);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          const [place] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          const city =
            place?.city ||
            place?.district ||
            place?.region ||
            place?.subregion ||
            place?.country ||
            "Unknown";

          // ✅ Send live location to WebView
          if (webViewRef.current) {
            webViewRef.current.postMessage(
              JSON.stringify({
                type: "LIVE_LOCATION_UPDATE",
                payload: { city, latitude, longitude },
              })
            );
          }

          // ✅ Update initial loading status
          if (!initialLocationSent) {
            setInitialLocationSent(true);
            setLoading(false);
          }

          setTracking(true);
        }
      );
    } catch (err) {
      console.error("Location error:", err);
      Alert.alert("Error", "Unable to fetch your current location.");
      setLoading(false);
    }
  };

  // ✅ Handle messages from WebView safely
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case "CLEAR_LOCATION":
          stopTracking();
          if (webViewRef.current) {
            webViewRef.current.postMessage(
              JSON.stringify({ type: "LOCATION_CLEARED" })
            );
          }
          break;

        case "REQUEST_LOCATION":
          startTracking(true);
          break;

        default:
          console.warn("Unknown message type:", data.type);
          break;
      }
    } catch (err) {
      console.error("Error handling WebView message:", err);
    }
  };

  // ✅ Render web app in browser
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        <iframe
          src={webUrl}
          title="My Web App"
          style={{ width: "100%", height: "100vh", border: "none" }}
        />
      </View>
    );
  }

  // ✅ Render mobile app with WebView
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          marginTop:
            Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
          backgroundColor: "#fff",
        }}
      >
        {/* Loading Overlay */}
        {loading && !initialLocationSent && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
              zIndex: 99,
            }}
          >
            <ActivityIndicator size="large" color="#00b8a9" />
          </View>
        )}

        {/* WebView */}
        <WebView
          ref={webViewRef}
          source={{
            uri: webUrl,
            headers: {
              Accept: "image/webp,image/apng,image/*,*/*",
              "Cache-Control": "no-cache",
            },
          }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          originWhitelist={["*"]}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setLoading(false)}
          onError={(e) => console.warn("WebView error: ", e.nativeEvent)}
          onHttpError={(e) => console.warn("HTTP error: ", e.nativeEvent)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}