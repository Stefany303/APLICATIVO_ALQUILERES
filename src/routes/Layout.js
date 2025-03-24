import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar /> {/* 🔹 Sidebar siempre presente */}
      <div className="content">
        <Outlet /> {/* 🔹 Aquí se renderizan las páginas */}
      </div>
    </div>
  );
};

export default Layout;
