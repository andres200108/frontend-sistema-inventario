import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar  from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Navbar open={open} setOpen={setOpen}/>
      <Sidebar open={open} setOpen={setOpen}/>
      <main style={{ marginTop:52, marginLeft:0, padding:"1.5rem", background:"var(--color-background-tertiary)", minHeight:"calc(100vh - 52px)" }}>
        <Outlet/>
      </main>
    </div>
  );
}
