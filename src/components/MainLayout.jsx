import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* 🔴 NAVBAR */}
      <Navbar open={open} setOpen={setOpen} />

      {/* 🧭 SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* 📦 CONTENIDO */}
      <div
        style={{
          marginTop: "60px",
          padding: "20px",
          background: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
