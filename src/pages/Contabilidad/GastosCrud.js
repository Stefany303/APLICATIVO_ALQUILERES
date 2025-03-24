import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Asegúrate de tener react-router-dom instalado

const GastosCrud = () => {
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const response = await fetch("URL_DE_TU_API/gastos"); // Cambia esto por el enlace a tu API para obtener los gastos
        const data = await response.json();
        setGastos(data);
      } catch (error) {
        console.error("Error al obtener gastos:", error);
      }
    };

    fetchGastos();
  }, []);

  return (
    <div className="table-container"> {/* Contenedor principal */}
      <h2 className="table-title">Gastos Registrados</h2>
      {gastos.length > 0 ? (
        <table className="table"> {/* Aplicar la clase de tabla */}
          <thead>
            <tr>
              <th>Contrato ID</th>
              <th>Tipo de Servicio</th>
              <th>Monto</th>
              <th>Fecha de Pago</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto, index) => (
              <tr key={index}>
                <td>{gasto.contrato_id}</td>
                <td>{gasto.tipo_servicio}</td>
                <td>{gasto.monto}</td>
                <td>{gasto.fecha_pago}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay gastos registrados.</p>
      )}

      {/* Botón para redirigir a GastosRegistrar */}
      <Link to="/gastos-registrar" className="form-button">
        Registrar Gastos
      </Link>
    </div>
  );
};

export default GastosCrud;
