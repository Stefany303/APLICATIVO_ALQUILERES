/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import config from "config";

import { Route, Redirect, BrowserRouter as Router, Routes,Navigate } from "react-router-dom";
// import Header from "./components/header";
import Home from "./components/home";
import Login from "./components/pages/login";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import PrivateRoute from "./PrivateRoute";


const AppContainer = function (props) {


  return (
    <Router>   
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>     
    </Router>
  );
};

export default AppContainer;
