import React, { useEffect, useState } from "react";
import '../../assets/styles/table-styles.css'; // Asegúrate de que la ruta sea correcta
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal, blogimg12,
  blogimg2, blogimg4, blogimg6, blogimg8} from '../../components/imagepath';
import { FiChevronRight } from "react-icons/fi";
import {onShowSizeChange,itemRender}from  '../../components/Pagination';
import { Table } from 'antd';
import Select from "react-select";
import { DatePicker} from "antd";

const ContratoRegistros = () => {
  const [selectedOption, setSelectedOption] = useState(null);
    const [options, setOptions] = useState([
      { value: 1, label: "Select LeaveType" },
      { value: 2, label: "Medical Leave" },
      { value: 3, label: "Casual Leave" },
      { value: 3, label: "Loss of Pay" }
    ]);
  const [contratos, setContratos] = useState([]);
  const [filteredContratos, setFilteredContratos] = useState([]);
  const [filter, setFilter] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
      const onSelectChange = (newSelectedRowKeys) => {
        console.log("selectedRowKeys changed: ", selectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
      };
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
    const onChange = (date, dateString) => {
      // console.log(date, dateString);
    };
  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      const response = await fetch("URL_DE_TU_API/contratos"); // Cambia esto por tu API
      const data = await response.json();
      setContratos(data);
      setFilteredContratos(data); // Inicializar los contratos filtrados
    } catch (error) {
      console.error("Error al obtener contratos:", error);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    const filtered = contratos.filter((contrato) =>
      Object.values(contrato).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredContratos(filtered);
  };

  const handleEdit = (contrato) => {
    // Implementa la lógica para editar un contrato
    alert(`Editando contrato con ID: ${contrato.id}`);
  };
  const handleView = (contrato) => {
    // Lógica para ver detalles del inmueble
    console.log("Ver inmueble con ID:", contrato);
    // Aquí puedes redirigir a otra página o mostrar un modal con los detalles
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este contrato?")) {
      try {
        const response = await fetch(`URL_DE_TU_API/contratos/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Contrato eliminado exitosamente!");
          fetchContratos(); // Refresca la lista de contratos
        } else {
          throw new Error("Error al eliminar el contrato");
        }
      } catch (error) {
        console.error("Error al eliminar contrato:", error);
        alert("Error al eliminar el contrato");
      }
    }
  };
  const datasource = [
    {
     
      Name: "Andrea Lalema",
      Department: "Otolaryngology",
      Specialization: "Infertility",
      Degree: "MBBS, MS",
      Mobile: "+1 23 456890",
      Email: "example@email.com",
      JoiningDate: "01.10.2022",
      FIELD9: ""
    }]
  const columns = [
    {
      title: "Inquilino",
      dataIndex: "inquilino",
      sorter: (a, b) => a.inquilino.localeCompare(b.inquilino),
    },
    {
      title: "Espacio",
      dataIndex: "espacio",
      sorter: (a, b) => a.espacio.localeCompare(b.espacio),
    },
    {
      title: "Propietario",
      dataIndex: "propietario",
      sorter: (a, b) => a.propietario.localeCompare(b.propietario),
    },
    {
      title: "Fecha Inicio",
      dataIndex: "fecha_inicio",
      sorter: (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: "Fecha Fin",
      dataIndex: "fecha_fin",
      sorter: (a, b) => new Date(a.fecha_fin) - new Date(b.fecha_fin),
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: "Monto Alquiler",
      dataIndex: "monto_alquiler",
      sorter: (a, b) => (a.monto_alquiler || 0) - (b.monto_alquiler || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${monto.toFixed(2)}` : "N/A"),
    },
    {
      title: "Monto Garantía",
      dataIndex: "monto_garantia",
      sorter: (a, b) => (a.monto_garantia || 0) - (b.monto_garantia || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${monto.toFixed(2)}` : "N/A"),
    },
    
    {
      title: "Descripción",
      dataIndex: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
    },
    {
      title: "Documento",
      dataIndex: "documento",
      render: (doc) => (doc ? <a href={doc} target="_blank" rel="noopener noreferrer">Ver documento</a> : "N/A"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      sorter: (a, b) => a.estado.localeCompare(b.estado),
      render: (estado) => {
        const estadoColores = {
          activo: "text-success",
          inactivo: "text-warning",
          finalizado: "text-danger",
        };
        return <span className={estadoColores[estado] || ""}>{estado}</span>;
      },
    },
    {
      title: "Fecha Pago",
      dataIndex: "fecha_pago",
      sorter: (a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago),
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: "Tipo Contrato",
      dataIndex: "tipo_contrato",
      sorter: (a, b) => a.tipo_contrato.localeCompare(b.tipo_contrato),
    },
    {
      title: "Acciones",
      dataIndex: "acciones",
      render: (text, record) => (
        <div className="text-end">
          <div className="dropdown dropdown-action">
            <Link
              to="#"
              className="action-icon dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fas fa-ellipsis-v" />
            </Link>
            <div className="dropdown-menu dropdown-menu-end">
              <Link className="dropdown-item" to="#" onClick={() => handleView(record.id)}>
                <i className="far fa-eye me-2" />
                Ver
              </Link>
              <Link className="dropdown-item" to="#" onClick={() => handleEdit(record.id)}>
                <i className="far fa-edit me-2" />
                Editar
              </Link>
              <Link className="dropdown-item" to="#" onClick={() => handleDelete(record.id)}>
                <i className="fa fa-trash-alt me-2" />
                Eliminar
              </Link>
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <>
    <Header />
    <Sidebar id='menu-item5' id1='menu-items5' activeClassName='contrato-registros'/>
    <>
  <div className="page-wrapper">
    <div className="content">
      {/* Page Header */}
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <ul className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="#">Inmuebles </Link>
            </li>
              <li className="breadcrumb-item">
                <i className="feather-chevron-right">
                  <FiChevronRight />
                  </i>
              </li>
              <li className="breadcrumb-item active">Lista de Inmuebles</li>
            </ul>
          </div>
        </div>
      </div>
      {/* /Page Header */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card card-table show-entire">
            <div className="card-body">
              {/* Table Header */}
              <div className="page-table-header mb-2">
                <div className="row align-items-center">
                  <div className="col">
                    <div className="doctor-table-blk">
                      <h3>Lista de Inmuebles</h3>
                      <div className="doctor-search-blk">
                        <div className="top-nav-search table-search-blk">
                          <form>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Buscar aquí"
                            />
                            <Link className="btn">
                              <img
                                src={searchnormal}
                                alt="#"
                              />
                            </Link>
                          </form>
                        </div>
                        <div className="add-group">
                          <Link
                            to="/add-doctor"
                            className="btn btn-primary add-pluss ms-2"
                          >
                            <img src={plusicon} alt="#" />
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-primary doctor-refresh ms-2"
                          >
                            <img src={refreshicon} alt="#" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto text-end float-end ms-auto download-grp">
                    <Link to="#" className=" me-2">
                      <img src={pdficon} alt="#" />
                    </Link>
                    <Link to="#" className=" me-2">
                    </Link>
                    <Link to="#" className=" me-2">
                      <img src={pdficon3} alt="#" />
                    </Link>
                    <Link to="#">
                      <img src={pdficon4} alt="#" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Table Header */}

              <div className="staff-search-table">
                      <form>
                        <div className="row">
              
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>Seleccionar Inmueble </label>
                              <Select
                                defaultValue={selectedOption}
                                onChange={setSelectedOption}
                                options={options}
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="form-group local-forms">
                              <label>Seleccionar Piso </label>
                              <Select
                                defaultValue={selectedOption}
                                onChange={setSelectedOption}
                                options={options}
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                              />
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="doctor-submit">
                              <button
                                type="submit"
                                className="btn btn-primary submit-list-form me-2"
                              >
                                Aplicar Filtros
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>


              <div className="table-responsive doctor-list">
              <Table
                        pagination={{
                          total: datasource.length,
                          showTotal: (total, range) =>
                          `Mostrando ${range[0]} de ${range[1]} de ${total} registros`,
                          // showSizeChanger: true,
                           onShowSizeChange: onShowSizeChange,
                           itemRender: itemRender,
                        }}
                        columns={columns}
                        dataSource={datasource}

                        rowSelection={rowSelection}
                        rowKey={(record) => record.id}
                        style={{
                          backgroundColor: '#f2f2f2', // Replace with your desired background color for the table
                        }}
                      />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </div>

    </>
</>
  );
};

export default ContratoRegistros;
