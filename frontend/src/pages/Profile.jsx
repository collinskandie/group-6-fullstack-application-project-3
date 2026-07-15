import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/authApi";

function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    authApi
      .updateMe({ name, email, phone, address })
      .then((res) => {
        updateUser(res.data);
        setProfileSuccess("Profile updated.");
      })
      .catch((err) => setProfileError(err.response?.data?.message || "Failed to update profile"))
      .finally(() => setSavingProfile(false));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }

    setSavingPassword(true);
    authApi
      .changePassword({ current_password: currentPassword, new_password: newPassword })
      .then(() => {
        setPasswordSuccess("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((err) => setPasswordError(err.response?.data?.message || "Failed to update password"))
      .finally(() => setSavingPassword(false));
  };

  if (!user) return null;

  return (
    <main className="main-content">
      <header className="page-header">
        <h1>My Profile</h1>
        <p>Update your details and password.</p>
      </header>

      <div className="filter-card" style={{ marginBottom: "1.5rem", maxWidth: "480px" }}>
        <h3 className="filter-label">Profile Details</h3>
        <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            aria-label="Name"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="filter-select"
            disabled={savingProfile}
          />
          <input
            type="email"
            aria-label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="filter-select"
            disabled={savingProfile}
          />
          <input
            type="tel"
            aria-label="Phone"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="filter-select"
            disabled={savingProfile}
          />
          <input
            type="text"
            aria-label="Address"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="filter-select"
            disabled={savingProfile}
          />
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
        {profileError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{profileError}</p>}
        {profileSuccess && <p style={{ color: "var(--color-primary)", fontSize: "13px", marginTop: "8px" }}>{profileSuccess}</p>}
      </div>

      <div className="filter-card" style={{ maxWidth: "480px" }}>
        <h3 className="filter-label">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
          <input
            type="password"
            aria-label="Current password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="filter-select"
            disabled={savingPassword}
          />
          <input
            type="password"
            aria-label="New password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="filter-select"
            disabled={savingPassword}
          />
          <input
            type="password"
            aria-label="Confirm new password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="filter-select"
            disabled={savingPassword}
          />
          <button type="submit" className="btn-primary" disabled={savingPassword}>
            {savingPassword ? "Saving..." : "Update Password"}
          </button>
        </form>
        {passwordError && <p style={{ color: "var(--color-error-text)", fontSize: "13px", marginTop: "8px" }}>{passwordError}</p>}
        {passwordSuccess && <p style={{ color: "var(--color-primary)", fontSize: "13px", marginTop: "8px" }}>{passwordSuccess}</p>}
      </div>
    </main>
  );
}

export default Profile;
