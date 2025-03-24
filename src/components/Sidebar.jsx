import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import { blog, dashboard, logout, menuicon04, menuicon06, menuicon08, menuicon09, menuicon10, menuicon11, menuicon12, menuicon14, menuicon15, menuicon16, sidemenu } from './imagepath';
import Scrollbars from "react-scrollbars-custom";

const Sidebar = (props) => {
  // 'sidebar' guarda el label del submenú activo.
  const [sidebar, setSidebar] = useState("");

  // Función para alternar la visualización de un submenú y actualizar el estado
  const handleClick = (e, item, item1, label) => {
    const div = document.querySelector(`#${item}`);
    const ulDiv = document.querySelector(`.${item1}`);
    
    if (sidebar === label) {
      // Si ya estaba activo, se cierra
      ulDiv.style.display = 'none';
      div.classList.remove('subdrop');
      setSidebar("");
    } else {
      // Se abre el submenú y se cierra el que estuviera abierto
      ulDiv.style.display = 'block';
      div.classList.add('subdrop');
      setSidebar(label);
    }
    console.log('div', div);
    console.log('sidebar', sidebar);
  }

  // Al cargar la página, si se pasa activeClassName y es de Inmuebles, se abre ese submenú
  useEffect(() => {
    if (props?.activeClassName) {
      // Mapeo de palabras clave a submenús:
      // Cada objeto contiene:
      // - keyword: la palabra clave a buscar en activeClassName (en minúsculas)
      // - submenu: el label que usas en handleClick para identificar el submenú
      // - menuId: el id del <Link> que abre el submenú
      // - submenuClass: la clase del <ul> del submenú
      const submenuMapping = [
        { keyword: 'admin-dashboard', submenu: 'Dashboard', menuId: 'menu-item', submenuClass: 'menu-items' },
        { keyword: 'inmueble-anadir', submenu: 'Inmuebles', menuId: 'menu-item1', submenuClass: 'menu-items1' },
        { keyword: 'persona-registrar', submenu: 'Inmuebles', menuId: 'menu-item1', submenuClass: 'menu-items1' },
        { keyword: 'inmueble-registros', submenu: 'Inmuebles', menuId: 'menu-item1', submenuClass: 'menu-items1' },
        { keyword: 'espacios-anadir', submenu: 'Espacios', menuId: 'menu-item2', submenuClass: 'menu-items2' },
        { keyword: 'espacios-registrar', submenu: 'Espacios', menuId: 'menu-item2', submenuClass: 'menu-items2' },
        { keyword: 'espacios-registros', submenu: 'Espacios', menuId: 'menu-item2', submenuClass: 'menu-items2' },
        
        { keyword: 'espacios-detalle', submenu: 'Espacios', menuId: 'menu-item2', submenuClass: 'menu-items2' },
        { keyword: 'inquilinos-registrar', submenu: 'Inquilinos', menuId: 'menu-item3', submenuClass: 'menu-items3' },
        { keyword: 'inquilinos-registros', submenu: 'Inquilinos', menuId: 'menu-item3', submenuClass: 'menu-items3' },
        { keyword: 'inquilinos-pago', submenu: 'Inquilinos', menuId: 'menu-item3', submenuClass: 'menu-items3' },
        { keyword: 'inquilinos-detalle', submenu: 'Inquilinos', menuId: 'menu-item3', submenuClass: 'menu-items3' },
        { keyword: 'contabilidad-gastos', submenu: 'Contabilidad', menuId: 'menu-item4', submenuClass: 'menu-items4' },
        { keyword: 'contabilidad-pagos', submenu: 'Contabilidad', menuId: 'menu-item4', submenuClass: 'menu-items4' },
        
        { keyword: 'contrato-generar', submenu: 'Contratos', menuId: 'menu-item5', submenuClass: 'menu-items5' },
        { keyword: 'contrato-registros', submenu: 'Contratos', menuId: 'menu-item5', submenuClass: 'menu-items5' },
        { keyword: 'reporte-pagos', submenu: 'Reportes', menuId: 'menu-item6', submenuClass: 'menu-items6' },
        { keyword: 'reporte-gastos', submenu: 'Reportes', menuId: 'menu-item6', submenuClass: 'menu-items6' },
        { keyword: 'conf-cambio-contrasena', submenu: 'Configuracion', menuId: 'menu-item7', submenuClass: 'menu-items7' },
       
      ];
      const active = props.activeClassName.toLowerCase();
      const mappingItem = submenuMapping.find(item => active.indexOf(item.keyword) !== -1);
      if (mappingItem) {
        setSidebar(mappingItem.submenu);
        const div = document.getElementById(mappingItem.menuId);
        const ulDiv = document.querySelector(`.${mappingItem.submenuClass}`);
        if (div && ulDiv) {
          ulDiv.style.display = 'block';
          div.classList.add('subdrop');
        }
      }
      }
    }, [props.activeClassName]);

  // Las funciones para controlar el expandido del menú
  const expandMenu = () => {
    document.body.classList.remove("expand-menu");
  };
  const expandMenuOpen = () => {
    document.body.classList.add("expand-menu");
  };

  return (
    <>
      <div className="sidebar" id="sidebar">
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={0}
          autoHeightMax="95vh"
          thumbMinSize={30}
          universal={false}
          hideTracksWhenNotNeeded={true}
        >
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu"
              onMouseLeave={expandMenu}
              onMouseOver={expandMenuOpen}
            >
              <ul>
                <li className="menu-title">Menu</li>
                {/* Dashboard */}
                <li className="submenu" >
                  <Link 
                    to="#" 
                    id="menu-item" 
                    onClick={(e) => {
                      handleClick(e, "menu-item", "menu-items", "Dashboard")
                    }}
                  >
                    <span className="menu-side">
                      <img src={dashboard} alt="" />
                    </span>{" "}
                    <span> Dashboard </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Dashboard' ? 'block' : "none" }} className='menu-items'>
                    <li>
                      <Link className={props?.activeClassName === 'admin-dashboard' ? 'active' : ''} to="/admin-dashboard">Admin Dashboard</Link>
                    </li>
                  </ul>
                </li>
                {/* Inmuebles */}
                <li className="submenu">
                  <Link 
                    to="#" 
                    id="menu-item1" 
                    onClick={(e) => {
                      handleClick(e, "menu-item1", "menu-items1", "Inmuebles")
                    }}
                  >
                    <span className="menu-side">
                      {/* <img src={doctor} alt="" /> */}
                    </span>{" "}
                    <span>Inmuebles</span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Inmuebles' ? 'block' : 'none' }} className="menu-items1">
                    <li>
                      <Link className={props?.activeClassName === 'inmueble-anadir' ? 'active' : ''} to="/inmueble-anadir">Añadir</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'persona-registrar' ? 'active' : ''} to="/persona-registrar">Registrar</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'inmueble-registros' ? 'active' : ''} to="/inmueble-registros">Registros</Link>
                    </li>
                  </ul>
                </li>
                {/* Espacios */}
                <li className="submenu">
                  <Link to="#" id="menu-item2" onClick={(e) => handleClick(e, "menu-item2", "menu-items2", "Espacios")}>
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span>Espacios</span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Espacios' ? 'block' : 'none' }} className="menu-items2">
                  <li>
                      <Link className={props?.activeClassName === 'espacios-anadir' ? 'active' : ''} to="/espacios-anadir">Añadir</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'espacios-registrar' ? 'active' : ''} to="/espacios-registrar">Registrar</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'espacios-registros' ? 'active' : ''} to="/espacios-registros">Registros </Link>
                    </li>
                    
                  </ul>
                </li>
                {/* Inquilinos */}
                <li className="submenu">
                  <Link to="#" id="menu-item3" onClick={(e) => handleClick(e, "menu-item3", "menu-items3", "Inquilinos")}>
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span> Inquilinos</span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Inquilinos' ? 'block' : 'none' }} className="menu-items3">
    
                    <li>
                      <Link className={props?.activeClassName === 'inquilinos-registrar' ? 'active' : ''} to="/inquilinos-registrar">Registrar</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'inquilinos-registros' ? 'active' : ''} to="/inquilinos-registros">Registros </Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'inquilinos-pago' ? 'active' : ''} to="/inquilinos-pago">Registrar Pago </Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'inquilinos-contrato' ? 'active' : ''} to="/employeesalary">Detalle de contrato</Link>
                    </li>
                  </ul>
                </li>
                
                {/* Contabilidad */}
                <li className="submenu">
                  <Link 
                    to="#" 
                    id="menu-item4" 
                    onClick={(e) => handleClick(e, "menu-item4", "menu-items4", "Contabilidad")}
                  >
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span> Contabilidad </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Contabilidad' ? 'block' : "none" }} className="menu-items4">
                    
                    <li>
                      <Link className={props?.activeClassName === 'contabilidad-pagos' ? 'active' : ''} to="/contabilidad-pagos">Pagos</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'contabilidad-gastos' ? 'active' : ''} to="/contabilidad-gastos">Gastos</Link>
                    </li>
                    
                  </ul>
                </li>
                {/* Pagos */}
                <li className="submenu">
                  <Link 
                    to="#" 
                    id="menu-item5" 
                    onClick={(e) => handleClick(e, "menu-item5", "menu-items5", "Contratos")}
                  >
                    <span className="menu-side">
                      <img src={menuicon09} alt="" />
                    </span>{" "}
                    <span> Contratos</span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Contratos' ? 'block' : "none" }} className="menu-items5">
                   
                    <li>
                      <Link className={props?.activeClassName === 'contrato-registros' ? 'active' : ''} to="/contrato-registros">Lista de contratos</Link>
                    </li>
                  </ul>
                </li>
                
                {/* Reportes */}
                <li className="submenu">
                  <Link 
                    to="#" 
                    id="menu-item6" 
                    onClick={(e) => handleClick(e, "menu-item6", "menu-items6", "Reportes")}
                  >
                    <i className="fa fa-flag" /> <span> Reportes </span>{" "}
                    <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Reportes' ? 'block' : "none" }} className="menu-items6">
                    <li>
                      <Link className={props?.activeClassName === 'reporte-gastos' ? 'active' : ''} to="/reporte-gastos">Reporte de gastos </Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'reporte-pagos' ? 'active' : ''} to="/reporte-pagos">Reporte de pagos</Link>
                    </li>
                  </ul>
                </li>
                {/* Configuración */}
                
                <li className="submenu">
                  <Link 
                    to="#" 
                    id="menu-item7" 
                    onClick={(e) => handleClick(e, "menu-item7", "menu-items7", "Configuracion")}
                  >
                    <i className="fa fa-flag" /> <span> Configuracion </span>{" "}
                    <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Configuracion' ? 'block' : "none" }} className="menu-items7">
                    <li>
                      <Link className={props?.activeClassName === 'conf-cambio-contrasena' ? 'active' : ''} to="/conf-cambio-contrasena">Cambio de contraseña</Link>
                    </li>
                    
                  </ul>
                </li>
              </ul>
              <div className="logout-btn">
                <Link to="/login">
                  <span className="menu-side">
                    <img src={logout} alt="" />
                  </span>{" "}
                  <span>Salir</span>
                </Link>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  )
}

export default Sidebar;
