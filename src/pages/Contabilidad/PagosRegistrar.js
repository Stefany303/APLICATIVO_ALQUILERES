import React from "react";

const PagosRegistrar = ({ formData, handleChange, handleSubmit, contratos }) => {
  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form-title">Registrar Pago</h2>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="contrato_id">Contrato</label>
          <select
            className="form-select"
            name="contrato_id"
            id="contrato_id"
            value={formData.contrato_id}
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
          <label className="form-label" htmlFor="monto">Monto</label>
          <input
            type="number"
            className="form-input"
            name="monto"
            id="monto"
            placeholder="Monto"
            value={formData.monto}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="metodo_pago">Método de Pago</label>
          <select
            className="form-select"
            name="metodo_pago"
            id="metodo_pago"
            value={formData.metodo_pago}
            onChange={handleChange}
            required
          >
            <option value="">Método de Pago</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="paypal">PayPal</option>
            <option value="efectivo">Efectivo</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="tipo_pago">Tipo de Pago</label>
          <select
            className="form-select"
            name="tipo_pago"
            id="tipo_pago"
            value={formData.tipo_pago}
            onChange={handleChange}
            required
          >
            <option value="">Tipo de Pago</option>
            <option value="alquiler">Alquiler</option>
            <option value="servicio_adicional">Servicio Adicional</option>
          </select>
        </div>
      </div>
      <button type="submit" className="form-button">Registrar Pago</button>
    </form>
  );
};

export default PagosRegistrar;
