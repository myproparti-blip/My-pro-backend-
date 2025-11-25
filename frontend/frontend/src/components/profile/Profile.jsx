import React, { useEffect, useState } from "react";
import {
  Popup,
  Avatar,
  List,
  Button,
  Tag,
  Space,
  Toast,
  SpinLoading,
} from "antd-mobile";
import {
  UserOutline,
  PhoneFill,
  StarFill,
  EditSOutline,
  DeleteOutline,
  ExclamationCircleOutline,
} from "antd-mobile-icons";
import { deleteProfile, getProfile } from "../../services/auth";

export default function ProfilePopup({ visible, setVisible, onProfileDeleted }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible) fetchProfile();
  }, [visible]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      const userData = res?.data?.user || res?.data || res?.user;
      if (res?.success && userData) {
        setProfile(userData);
      } else {
        Toast.show({ icon: "fail", content: "Failed to load profile data" });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      Toast.show({ icon: "fail", content: "Error loading profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (userId) => {
    try {
      const result = await deleteProfile(userId);
      if (result.success) {
        Toast.show({ icon: "success", content: "Account deleted successfully!" });
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          if (onProfileDeleted) onProfileDeleted();
          window.location.reload();
        }, 1500);
      } else {
        Toast.show({
          icon: "fail",
          content: result.error || "Failed to delete account",
        });
      }
    } catch (error) {
      console.error("Delete profile error:", error);
      Toast.show({
        icon: "fail",
        content: "An error occurred while deleting account",
      });
    }
  };

  return (
    <>
      <Popup
        visible={visible}
        onMaskClick={() => setVisible(false)}
        onClose={() => setVisible(false)}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "24px 20px",
          background: "#fff",
          boxSizing: "border-box",
        }}
      >
        {loading ? (
          <div className="loading-profile">
            <SpinLoading color="primary" style={{ fontSize: 48 }} />
          </div>
        ) : profile ? (
          <div className="profile-container">
            {/* Actions (Edit & Delete) */}
            <div className="profile-actions">
              <div className="icon-btn" title="Edit Profile">
                <EditSOutline
                  fontSize={22}
                  style={{ color: "#1677FF" }}
                  onClick={() =>
                    Toast.show({ icon: "loading", content: "Edit coming soon!" })
                  }
                />
              </div>
              <div className="icon-btn" title="Delete Account">
                <DeleteOutline
                  fontSize={22}
                  style={{ color: "#FF3141" }}
                  onClick={() => setDeleteConfirmVisible(true)}
                />
              </div>
            </div>

            {/* Avatar */}
            <Avatar
              src={profile.avatar}
              style={{
                "--size": "90px",
                "--border-radius": "50%",
                backgroundColor: "#1677FF",
                marginBottom: "16px",
              }}
              fallback={<UserOutline fontSize={42} />}
            />

            {/* Name */}
            <h2 className="profile-name">{profile.name || "User"}</h2>

            {/* Details */}
            <List style={{ marginTop: "12px", width: "100%" }}>
              <List.Item prefix={<PhoneFill />}>
                <strong>{profile.phone || "N/A"}</strong>
              </List.Item>

              <List.Item prefix={<StarFill />}>
                <Space wrap>
                  {(Array.isArray(profile.role) ? profile.role : [profile.role])
                    .filter(Boolean)
                    .map((r, i) => (
                      <Tag color="success" key={i}>
                        {typeof r === "string"
                          ? r.charAt(0).toUpperCase() + r.slice(1)
                          : String(r || "").toUpperCase()}
                      </Tag>
                    ))}
                </Space>
              </List.Item>

              <List.Item>
                <div className="profile-joined">
                  Joined:{" "}
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN")
                    : "N/A"}
                </div>
              </List.Item>
            </List>

            {/* Close Button */}
            <Button
              color="primary"
              fill="solid"
              block
              size="large"
              style={{ marginTop: "24px", borderRadius: "12px" }}
              onClick={() => setVisible(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="no-profile">
            <p>No profile data found</p>
          </div>
        )}
      </Popup>

      {/* Delete Confirmation Popup */}
      <Popup
        visible={deleteConfirmVisible}
        onMaskClick={() => setDeleteConfirmVisible(false)}
        onClose={() => setDeleteConfirmVisible(false)}
        bodyStyle={{
          borderRadius: "16px",
          padding: "24px 16px",
          textAlign: "center",
          background: "#fff",
          width: "90%",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <ExclamationCircleOutline
            style={{
              fontSize: "48px",
              color: "#FF3141",
              marginBottom: "16px",
            }}
          />
          <h3>Delete Account?</h3>
          <p style={{ color: "#666", marginTop: "8px" }}>
            This action cannot be undone.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            block
            fill="outline"
            onClick={() => setDeleteConfirmVisible(false)}
          >
            Cancel
          </Button>
          <Button
            block
            color="danger"
            onClick={() => {
              setDeleteConfirmVisible(false);
              setVisible(false);
              handleDeleteProfile(profile._id);
            }}
          >
            Yes, Delete
          </Button>
        </div>
      </Popup>

      <style jsx>{`
        .profile-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          width: 100%;
          padding-bottom: 24px;
        }

        .profile-actions {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          gap: 10px;
          padding: 8px;
          background: transparent;
        }

        .icon-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f5f5f5;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #e9e9e9;
          transform: scale(1.05);
        }

        .profile-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .profile-joined {
          font-size: 13px;
          color: #8c8c8c;
        }

        .loading-profile {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .no-profile {
          text-align: center;
          padding: 60px 0;
          color: #666;
        }
      `}</style>
    </>
  );
}
