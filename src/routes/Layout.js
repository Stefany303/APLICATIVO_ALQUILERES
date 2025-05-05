import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Remove leading slash and convert to the format used in the sidebar
  const activeClassName = currentPath.substring(1);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar activeClassName={activeClassName} />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <Outlet /> {/* Here the child routes will be rendered */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
