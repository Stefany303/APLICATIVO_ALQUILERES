import React, { useState } from "react";
// Asegúrate de que la ruta sea correcta

const ContratoGenerar = () => {
  const [formData, setFormData] = useState({
    inquilino_id: "",
    espacio_id: "",
    propietario_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    monto_alquiler: "",
    monto_garantia: "",
    descripcion: "",
    documento: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      documento: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      const response = await fetch("URL_DE_TU_API/contratos", { // Cambia esto por tu API
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Contrato registrado exitosamente!");
        // Reiniciar el formulario
        setFormData({
          inquilino_id: "",
          espacio_id: "",
          propietario_id: "",
          fecha_inicio: "",
          fecha_fin: "",
          monto_alquiler: "",
          monto_garantia: "",
          descripcion: "",
          documento: null,
        });
      } else {
        throw new Error("Error al registrar el contrato");
      }
    } catch (error) {
      console.error("Error al registrar contrato:", error);
      alert("Error al registrar el contrato");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Registrar Contrato</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="inquilino_id">Inquilino ID</label>
          <input
            type="text"
            className="form-input"
            name="inquilino_id"
            id="inquilino_id"
            value={formData.inquilino_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="espacio_id">Espacio ID</label>
          <input
            type="text"
            className="form-input"
            name="espacio_id"
            id="espacio_id"
            value={formData.espacio_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="propietario_id">Propietario ID</label>
          <input
            type="text"
            className="form-input"
            name="propietario_id"
            id="propietario_id"
            value={formData.propietario_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fecha_inicio">Fecha de Inicio</label>
          <input
            type="date"
            className="form-input"
            name="fecha_inicio"
            id="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fecha_fin">Fecha de Fin</label>
          <input
            type="date"
            className="form-input"
            name="fecha_fin"
            id="fecha_fin"
            value={formData.fecha_fin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="monto_alquiler">Monto de Alquiler</label>
          <input
            type="number"
            className="form-input"
            name="monto_alquiler"
            id="monto_alquiler"
            value={formData.monto_alquiler}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="monto_garantia">Monto de Garantía</label>
          <input
            type="number"
            className="form-input"
            name="monto_garantia"
            id="monto_garantia"
            value={formData.monto_garantia}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="descripcion">Descripción</label>
          <textarea
            className="form-textarea"
            name="descripcion"
            id="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="documento">Subir Documento (PDF)</label>
          <input
            type="file"
            className="form-input"
            name="documento"
            id="documento"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="form-button">Registrar Contrato</button>
      </form>
    </div>
  );
};

export default ContratoGenerar;
