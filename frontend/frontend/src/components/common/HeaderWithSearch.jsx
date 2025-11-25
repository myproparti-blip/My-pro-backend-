import React, { useState, useEffect, useRef } from "react";
import { SearchBar, Toast, List, Popup } from "antd-mobile";
import {
  UserOutline,
  SetOutline,
  BellOutline,
  HeartOutline,
  TeamOutline,
  InformationCircleOutline,
  UnorderedListOutline,
  CloseCircleOutline,
  EnvironmentOutline,
} from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import ProfilePopup from "../profile/Profile";

export default function HeaderWithSearch({ searchValue, setSearchValue, city, setCity }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const navigate = useNavigate();
  const hasCleared = useRef(false);
  const locationRequested = useRef(false);

  // ✅ Auto-request location from native when mounted
  useEffect(() => {
    if (!locationRequested.current) {
      locationRequested.current = true;
      Toast.show({ icon: "loading", content: "Detecting location..." });

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: "REQUEST_LOCATION" })
        );
      }
    }
  }, []);

  // ✅ Listen to native messages (location updates)
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const messageData = event.data ? event.data : event.nativeEvent?.data;
        const data = JSON.parse(messageData);

        if (data.type === "LIVE_LOCATION_UPDATE") {
          const detectedCity = data?.payload?.city?.trim();
          if (detectedCity && !hasCleared.current) {
            setCity(detectedCity);
            setSearchValue(detectedCity);
            setIsManualSearch(false);
            Toast.clear();
            Toast.show({
              icon: "success",
              content: `Detected: ${detectedCity}`,
            });
          }
        } else if (data.type === "LOCATION_CLEARED") {
          setCity("");
          setSearchValue("");
          hasCleared.current = true;
        }
      } catch (err) {
        console.log("Message parse error:", err);
      }
    };

    // ✅ Both Android and iOS webview message listeners
    window.addEventListener("message", handleMessage);
    document.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("message", handleMessage);
    };
  }, [setCity, setSearchValue]);

  const handleClearLocation = (e) => {
    e.stopPropagation();
    setCity("");
    setSearchValue("");
    hasCleared.current = true;

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "CLEAR_LOCATION" })
      );
    }
  };

  const handleSearchChange = (val) => {
    setSearchValue(val);
    setIsManualSearch(true);
  };

  const handleSearchSubmit = () => {
    if (!searchValue.trim()) return;
    Toast.show({ icon: "success", content: `Searching for ${searchValue}` });
  };

  const menuItems = [
    { icon: <UserOutline />, label: "My Profile", action: () => setShowProfile(true) },
    { icon: <SetOutline />, label: "My Properties", action: () => navigate("/my-properties") },
    { icon: <BellOutline />, label: "Notifications", action: () => Toast.show("Coming soon") },
    { icon: <HeartOutline />, label: "Favorites", action: () => navigate("/favorites") },
    { icon: <TeamOutline />, label: "Consultants", action: () => navigate("/consultants") },
    { icon: <InformationCircleOutline />, label: "About Us", action: () => Toast.show("Coming soon") },
  ];

  return (
    <>
      <header
        style={{
          backgroundColor: "#fff",
          padding: "5px 12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <SearchBar
              value={searchValue}
              placeholder="Search city or area..."
              showCancelButton={false}
              onChange={handleSearchChange}
              onSearch={handleSearchSubmit}
              style={{
                flex: 1,
                "--border-radius": "20px",
                "--background": "#f2f2f2",
                "--height": "47px",
                "--padding-left": city && !isManualSearch ? "50px" : "12px",
                "--padding-right": city && !isManualSearch ? "50px" : "12px",
              }}
            />

            {/* Show icon + clear button only if city detected */}
            {city && !isManualSearch && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#00b8a9",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <EnvironmentOutline style={{ fontSize: "18px" }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    backgroundColor: "#f2f2f2",
                    padding: "4px",
                    borderRadius: "50%",
                  }}
                  onClick={handleClearLocation}
                >
                  <CloseCircleOutline style={{ fontSize: "20px", color: "#999" }} />
                </div>
              </>
            )}
          </div>

          <UnorderedListOutline
            style={{ fontSize: 24, color: "#00b8a9", cursor: "pointer" }}
            onClick={() => setMenuVisible(true)}
          />
        </div>

        <Popup
          visible={menuVisible}
          onMaskClick={() => setMenuVisible(false)}
          position="right"
          bodyStyle={{ width: "70vw", backgroundColor: "#fff", padding: 16 }}
        >
          <h3 style={{ textAlign: "center", marginBottom: 16 }}>Menu</h3>
          <List>
            {menuItems.map((item, idx) => (
              <List.Item
                key={idx}
                prefix={item.icon}
                arrow
                onClick={() => {
                  item.action();
                  setMenuVisible(false);
                }}
              >
                {item.label}
              </List.Item>
            ))}
          </List>
        </Popup>
      </header>

      <ProfilePopup visible={showProfile} setVisible={setShowProfile} />
    </>
  );
}