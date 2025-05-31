/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../assets/styles/Style.css';
import { baricon, baricon1, logo, noteicon, searchnormal, user06 } from './imagepath';
import { useAuth } from "../utils/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1070);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1070);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlesidebar = () => {
    const body = document.body;
    if (body) {
      body.classList.toggle("mini-sidebar");
    }
  };

  const handlesidebarmobilemenu = () => {
    const body = document.body;
    const html = document.documentElement;
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    
    if (body) {
      body.classList.toggle("slide-nav");
    }
    
    if (html) {
      html.classList.toggle("menu-opened");
    }
    
    if (sidebarOverlay) {
      sidebarOverlay.classList.toggle("opened");
    }
  };

  const openDrawer = () => {
    const div = document.querySelector(".main-wrapper");
    if (div?.classList?.contains("open-msg-box")) {
      div?.classList?.remove("open-msg-box");
    } else {
      div?.classList?.add("open-msg-box");
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/admin-dashboard" className="logo">
          <img src={logo} width={65} height={65} alt="" />
          <span>Alquileres</span>
        </Link>
      </div>
      {!isMobile && (
        <Link id="toggle_btn" to="#" onClick={handlesidebar}>
          <img src={baricon} alt="" />
        </Link>
      )}
      {isMobile && (
        <Link id="mobile_btn" className="mobile_btn float-start" to="#" onClick={handlesidebarmobilemenu}>
          <img src={baricon1} alt="" />
        </Link>
      )}
      {/*<div className="top-nav-search mob-view">
        <form>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar aquí"
          />
          <Link className="btn">
            <img src={searchnormal} alt="" />
          </Link>
        </form>
      </div>*/}
      <ul className="nav user-menu float-end">
        <li className="nav-item dropdown d-none d-sm-block">
          {/*<Link
            to="#"
            className="dropdown-toggle nav-link"
            data-bs-toggle="dropdown"
          >
            <img src={noteicon} alt="" />
            <span className="pulse" />
          </Link>*/}
         { /*<div className="dropdown-menu notifications">
            <div className="topnav-dropdown-header">
              <span>Notificaciones</span>
            </div>
            <div className="drop-scroll">
              <ul className="notification-list">
                <li className="notification-message">
                  <Link to="#">
                    <div className="media">
                      <span className="avatar">V</span>
                      <div className="media-body">
                        <p className="noti-details">
                          <span className="noti-title">Nuevo inquilino</span> registrado
                        </p>
                        <p className="noti-time">
                          <span className="notification-time">Hace 4 mins</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="topnav-dropdown-footer">
              <Link to="#">Ver todas las notificaciones</Link>
            </div>
          </div>*/}
        </li>
        <li className="nav-item dropdown has-arrow">
          <Link
            to="#"
            className="dropdown-toggle nav-link"
            data-bs-toggle="dropdown"
          >
            <span className="user-img">
              <img src={user06} alt="" />
              <span className="status online" />
            </span>
            <span>{user?.nombre || 'Usuario'}</span>
          </Link>
          <div className="dropdown-menu">
            <div className="user-header">
              <div className="avatar avatar-sm">
                <img src={user06} alt="" className="avatar-img rounded-circle" />
              </div>
              <div className="user-text">
                <h6>{user?.nombre || 'Usuario'}</h6>
                <p className="text-muted mb-0">{user?.rol || 'Usuario'}</p>
              </div>
            </div>
            {/*<Link className="dropdown-item" to="/perfil">Mi Perfil</Link>*/}
            <Link className="dropdown-item" to="/conf-cambio-contrasena">Configuración</Link>
            <Link className="dropdown-item" onClick={logout} to="#">Cerrar Sesión</Link>
          </div>
        </li>
      </ul>
      <div className="dropdown mobile-user-menu float-end">
        <Link
          to="#"
          className="dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa-solid fa-ellipsis-vertical" />
        </Link>
        <div className="dropdown-menu dropdown-menu-end">
          <Link className="dropdown-item" to="/perfil">
            Mi Perfil
          </Link>
          <Link className="dropdown-item" to="/editar-perfil">
            Editar Perfil
          </Link>
          <Link className="dropdown-item" to="/conf-cambio-contrasena">
            Configuración
          </Link>
          <Link className="dropdown-item" onClick={logout} to="#">
            Cerrar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
