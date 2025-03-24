import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "../../assets/styles/Style.css";
import inmuebleService from "../../services/inmuebleService";

const VerInmueble = () => {
  const { id } = useParams(); // Obtén el ID del inmueble desde la URL
  const navigate = useNavigate();
  const [inmueble, setInmueble] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInmueble = async () => {
      try {
        const data = await inmuebleService.obtenerInmueblePorId(id);
        setInmueble(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inmueble:", error);
        setLoading(false);
      }
    };

    fetchInmueble();
  }, [id]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!inmueble) {
    return <div>Inmueble no encontrado</div>;
  }

  return (
    <div>
      <Header />
      <Sidebar id="menu-item1" id1="menu-items1" activeClassName="inmueble-ver" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Inmueble</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FaChevronRight icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Ver</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <div className="form-heading">
                        <h4>Detalles del Inmueble</h4>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Nombre del Inmueble</label>
                        <p>{inmueble.nombre}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Descripción</label>
                        <p>{inmueble.descripcion}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Dirección</label>
                        <p>{inmueble.direccion}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Ubigeo</label>
                        <p>{inmueble.ubigeo}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Propietario</label>
                        <p>{inmueble.propietario?.nombre} {inmueble.propietario?.apellido}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 col-xl-6">
                      <div className="form-group local-forms">
                        <label>Tipo de Inmueble</label>
                        <p>{inmueble.tipoInmueble?.nombre}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="doctor-submit text-end">
                        <button
                          type="button"
                          className="btn btn-primary cancel-form"
                          onClick={() => navigate("/inmueble-registros")}
                        >
                          Volver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerInmueble;