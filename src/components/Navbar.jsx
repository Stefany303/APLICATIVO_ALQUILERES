import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importa Link de react-router-dom

const Navbar = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState(new Set());
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSubmenuOption, setSelectedSubmenuOption] = useState(null);

  const handleMenuItemClick = (id) => {
    setOpenSubmenus((prev) => {
      const updatedSubmenus = new Set(prev);
      if (updatedSubmenus.has(id)) {
        updatedSubmenus.delete(id);
      } else {
        updatedSubmenus.add(id);
      }
      return updatedSubmenus;
    });

    setSelectedOption((prevSelected) => (prevSelected === id ? null : id));
    setSelectedSubmenuOption(null);
  };

  const handleSubmenuItemClick = (menuId, submenuTitle) => {
    const uniqueId = `${menuId}_${submenuTitle}`;
    setSelectedSubmenuOption(uniqueId);
    setSelectedOption(null);
  };


  return (
    <nav className="navbar">
      <div className={`navbar-header ${isOpenMenu ? 'expanded' : ''}`}>
        <div className='navbar-menu'>
          <button onClick={() => setIsOpenMenu(!isOpenMenu)}>
            <span className="hamburger" />
          </button>
        </div>

        {isOpenMenu && (
          <ul className={`navbar-list ${isOpenMenu ? 'expanded' : ''}`} >
            {[
              { id: 1, title: "INMUEBLE", subItems: ["AÑADIR", "REGISTRAR", "REGISTROS"] },
              { id: 2, title: "ESPACIOS", subItems: ["AÑADIR", "REGISTRAR", "REGISTROS"] },
              { id: 3, title: "REPORTES", subItems: ["PAGOS", "GASTOS"] },
              { id: 4, title: "CONTRATO", subItems: ["GENERAR", "REGISTROS"] },
              { id: 5, title: "INQUILINOS", subItems: ["REGISTROS"] },
              { id: 6, title: "CUENTA", subItems: ["CONFIGURACION"] },
            ].map((item) => (
              <li key={item.id} className="navbar-item">
                <Link
                  to="#"
                  className={`navbar-link ${selectedOption === item.id ? 'selected' : ''}`}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  {item.title}
                </Link>
                {openSubmenus.has(item.id) && (
                  <ul className="sub-menu open">
                    {item.subItems.map((subItem, index) => (
                      <li key={index}>
                        <Link
                          to={`/${item.title.toLowerCase()}-${subItem.toLowerCase()}`} // Cambia la ruta según sea necesario
                          className={`submenu-link ${selectedSubmenuOption === `${item.id}_${subItem}` ? 'selected' : ''}`}
                          onClick={() => handleSubmenuItemClick(item.id, subItem)}
                        >
                          {subItem}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
