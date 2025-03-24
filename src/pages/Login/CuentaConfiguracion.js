import React, { useEffect, useState } from "react";
import '../../assets/styles/form-styles.css'; // Asegúrate de que la ruta sea correcta

const ConfiguracionCuenta = () => {
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    nuevaContrasena: "",
    confirmarContrasena: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("URL_DE_TU_API/usuario"); // Cambia esto por tu API
      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error al obtener la información del usuario:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Resetear error

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("URL_DE_TU_API/usuario/cambiar-contrasena", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nuevaContrasena: formData.nuevaContrasena,
        }),
      });

      if (response.ok) {
        alert("Contraseña cambiada exitosamente!");
        setFormData({
          nuevaContrasena: "",
          confirmarContrasena: "",
        });
      } else {
        throw new Error("Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      alert("Error al cambiar la contraseña");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Configuración de Cuenta</h2>

      

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="nuevaContrasena">Nueva Contraseña</label>
          <input
            type="password"
            className="form-input"
            name="nuevaContrasena"
            id="nuevaContrasena"
            value={formData.nuevaContrasena}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmarContrasena">Confirmar Contraseña</label>
          <input
            type="password"
            className="form-input"
            name="confirmarContrasena"
            id="confirmarContrasena"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="form-button">Cambiar Contraseña</button>
      </form>
    </div>
  );
};

export default ConfiguracionCuenta;
