import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { TabBar } from "antd-mobile";
import {
  AppOutline,
  UserOutline,
  UnorderedListOutline,
  SetOutline,
} from "antd-mobile-icons";
import "antd-mobile/es/global";
// Pages
import Home from "./pages/home";
import BookConsultant from "./pages/BookConsultant";
import PropertyListing from "./pages/PropertyListing";
import Login from "./pages/login";
import PostProperty from "./components/proparti/PostProperty";
import Management from "./pages/Management";
import MyProperties from "./components/proparti/MyProperties";
import PropertyDetails from "./components/proparti/PropertyDetails";
import Profile from "./components/profile/Profile";
import Favorites from "./components/profile/Favorites";
// Mobile layout settings
const MOBILE_MAX_WIDTH = "500px";
const appContainerStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  width: "100%",
  maxWidth: MOBILE_MAX_WIDTH,
  margin: "0 auto",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  position: "relative",
  overflow: "hidden",
  backgroundColor: "#F5F5F5",
};
export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("loggedIn") === "true"
  );
  const [transparent, setTransparent] = useState(true); // :star2: for dynamic transparency
  const location = useLocation();
  const navigate = useNavigate();
  // Get active tab based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/" || path === "/home") return "home";
    if (path.startsWith("/BookConsultant")) return "BookConsultant";
    if (path.startsWith("/PropertyListing")) return "PropertyListing";
    if (path.startsWith("/Management")) return "Management";
    return "home";
  };
  const activeTab = getActiveTab();
  // Persist login state
  useEffect(() => {
    localStorage.setItem("loggedIn", loggedIn);
  }, [loggedIn]);
  // Show login if not authenticated
  if (!loggedIn) return <Login onLoginSuccess={() => setLoggedIn(true)} />;
  // Tab configuration
  const tabs = [
    { key: "home", icon: <AppOutline />, title: "Home", path: "/home" },
    {
      key: "BookConsultant",
      icon: <UserOutline />,
      title: "Book Consultant",
      path: "/BookConsultant",
    },
    {
      key: "PropertyListing",
      icon: <UnorderedListOutline />,
      title: "Property Listing",
      path: "/PropertyListing",
    },
    {
      key: "Management",
      icon: <SetOutline />,
      title: "Property Management",
      path: "/Management",
    },
  ];
  // Handle tab change
  const handleTabChange = (key) => {
    const tab = tabs.find((t) => t.key === key);
    if (tab && location.pathname !== tab.path) {
      navigate(tab.path);
    }
    // :star2: make it semi-transparent briefly on tab change
    setTransparent(false);
    setTimeout(() => setTransparent(true), 300);
  };
  return (
    <div style={appContainerStyle}>
      {/* Page Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/BookConsultant" element={<BookConsultant />} />
          <Route path="/PropertyListing" element={<PropertyListing />} />
          <Route path="/Management" element={<Management />} />
          <Route path="/post-property" element={<PostProperty />} />
          <Route path="/profile/:id" element={<BookConsultant />} />
          <Route path="/PropertyDetails/:id" element={<PropertyDetails />} />
         <Route path="/property/:id" element={<PropertyDetails />} /> 
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      {/* :white_check_mark: Bottom TabBar with transparent style */}
      <div
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
          backgroundColor: transparent
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          transition: "all 0.4s ease",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <TabBar activeKey={activeTab} onChange={handleTabChange}>
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
}