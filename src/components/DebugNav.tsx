import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UnifiedAuthContext";

export const DebugNav: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useUser();

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999,
      background: "#fff",
      borderBottom: "1px solid #eee",
      padding: "8px 16px",
      display: "flex",
      gap: "8px"
    }}>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/dashboard")}>Dashboard</button>
      <button onClick={() => navigate("/parent-dashboard")}>Parent Dashboard</button>
      <button onClick={() => navigate("/student-dashboard")}>Student Dashboard</button>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}; 