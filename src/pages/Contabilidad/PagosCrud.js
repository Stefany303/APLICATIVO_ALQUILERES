import React, { useState, useEffect } from "react";
import axios from "axios";
import '../../assets/styles/table-styles.css';
import '../../assets/styles/PagosCrud.css';
import { FaFileExcel } from 'react-icons/fa'
const PagosCrud = () => {
  const [pagos, setPagos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [formData, setFormData] = useState({
    contrato_id: "",
    monto: "",
    metodo_pago: "",
    tipo_pago: "",
    estado: "pendiente",
  });

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    inmueble: "",
    piso: "",
  });

  useEffect(() => {
    fetchPagos();
    fetchContratos();
  }, []);

  const fetchPagos = async () => {
    try {
      const response = await axios.get("/api/pagos", { params: filtros });
      setPagos(response.data);
    } catch (error) {
      console.error("Error al obtener pagos", error);
    }
  };

  const fetchContratos = async () => {
    try {
      const response = await axios.get("/api/contratos");
      setContratos(response.data);
    } catch (error) {
      console.error("Error al obtener contratos", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/pagos", formData);
      fetchPagos();
      setFormData({ contrato_id: "", monto: "", metodo_pago: "", tipo_pago: "", estado: "pendiente" });
    } catch (error) {
      console.error("Error al registrar pago", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este pago?")) {
      try {
        await axios.delete(`/api/pagos/${id}`);
        fetchPagos();
      } catch (error) {
        console.error("Error al eliminar pago", error);
      }
    }
  };

  const exportToExcel = () => {
    // Implementar la lógica de exportación a Excel aquí
    console.log("Exportar a Excel");
  };

  return (
    <div className="container">
      <h2>Gestión de Pagos</h2>
      
      
      <div className="filter-container">
  <div className="filter-row">
    <select name="inmueble" value={filtros.inmueble} onChange={handleFiltroChange}>
      <option value="">Seleccione Inmueble</option>
      <option value="inmueble1">Inmueble 1</option>
      <option value="inmueble2">Inmueble 2</option>
      {/* Más opciones según sea necesario */}
    </select>
    
    <select name="piso" value={filtros.piso} onChange={handleFiltroChange}>
      <option value="">Seleccione Piso</option>
      <option value="piso1">Piso 1</option>
      <option value="piso2">Piso 2</option>
      {/* Más opciones según sea necesario */}
    </select>
  </div>

  <div className="filter-row">
    <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleFiltroChange} />
    <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleFiltroChange} />
  </div>

  <div className="filter-actions">
    <button onClick={fetchPagos}>Filtrar</button>
    <button className="export-button" onClick={exportToExcel}>
    <FaFileExcel style={{ marginRight: '8px', width: '20px', height: '20px' }} />
      Exportar a Excel
    </button>
  </div>
</div>



      <div className="table-container">
        <h3 className="table-title">Pagos Registrados</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contrato</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td>{pago.id}</td>
                <td>{pago.contrato_id}</td>
                <td>{pago.monto}</td>
                <td>{pago.metodo_pago}</td>
                <td>{pago.tipo_pago}</td>
                <td>{pago.estado}</td>
                <td>
                  <button className="table-action-button edit">Editar</button>
                  <button className="table-action-button delete" onClick={() => handleDelete(pago.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PagosCrud;
