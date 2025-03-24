import React, { useState, useEffect } from "react";

const GastosRegistrar = () => {
  const [formData, setFormData] = useState({
    contrato_id: "",
    tipo_servicio: "",
    monto: "",
    fecha_pago: "",
  });

  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        const response = await fetch("URL_DE_TU_API/contratos"); // Cambia esto por el enlace a tu API
        const data = await response.json();
        setContratos(data);
      } catch (error) {
        console.error("Error al obtener contratos:", error);
      }
    };

    fetchContratos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("URL_DE_TU_API/gastos", { // Cambia esto por el enlace a tu API para registrar gastos
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Gasto registrado exitosamente!");
        // Opcional: Reiniciar el formulario después de registrar
        setFormData({
          contrato_id: "",
          tipo_servicio: "",
          monto: "",
          fecha_pago: "",
        });
        // Puedes volver a obtener la lista de gastos si es necesario
      } else {
        throw new Error("Error al registrar el gasto");
      }
    } catch (error) {
      console.error("Error al registrar gasto:", error);
      alert("Error al registrar el gasto");
    }
  };

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">Registrar Gastos</h2>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="contrato_id">Contrato</label>
            <select
              className="form-select"
              name="contrato_id"
              id="contrato_id"
              value={formData.contrato_id || ""}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar Contrato</option>
              {contratos.map((contrato) => (
                <option key={contrato.id} value={contrato.id}>
                  Contrato {contrato.id} - Inquilino {contrato.inquilino_id}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tipo_servicio">Tipo de Servicio</label>
            <select
              className="form-select"
              name="tipo_servicio"
              id="tipo_servicio"
              value={formData.tipo_servicio || ""}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar Tipo de Servicio</option>
              <option value="agua">Agua</option>
              <option value="luz">Luz</option>
              <option value="internet">Internet</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="monto">Monto</label>
            <input
              type="number"
              className="form-input"
              name="monto"
              placeholder="Monto"
              value={formData.monto || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fecha_pago">Fecha de Pago</label>
            <input
              type="date"
              className="form-input"
              name="fecha_pago"
              value={formData.fecha_pago || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="form-button">Registrar Gastos</button>
      </form>
    </div>
  );
};

export default GastosRegistrar;
