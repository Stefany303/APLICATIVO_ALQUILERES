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
const InquilinosRegistros = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [filteredInquilinos, setFilteredInquilinos] = useState([]);
  const [filter, setFilter] = useState("");
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
  useEffect(() => {
    fetchInquilinos();
    fetchContratos();
  }, []);
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

  const fetchInquilinos = async () => {
    try {
      const response = await fetch("URL_DE_TU_API/inquilinos"); // Cambia esto por tu API
      const data = await response.json();
      setInquilinos(data);
      setFilteredInquilinos(data); // Inicializar los inquilinos filtrados
    } catch (error) {
      console.error("Error al obtener inquilinos:", error);
    }
  };

  const fetchContratos = async () => {
    try {
      const response = await fetch("URL_DE_TU_API/contratos"); // Cambia esto por tu API
      const data = await response.json();
      setContratos(data);
    } catch (error) {
      console.error("Error al obtener contratos:", error);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    const filtered = inquilinos.filter((inquilino) =>
      Object.values(inquilino).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredInquilinos(filtered);
  };

  const handleEdit = (inquilino) => {
    // Implementa la lógica para editar un inquilino
    alert(`Editando inquilino con ID: ${inquilino.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este inquilino?")) {
      try {
        const response = await fetch(`URL_DE_TU_API/inquilinos/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert("Inquilino eliminado exitosamente!");
          fetchInquilinos(); // Refresca la lista de inquilinos
        } else {
          throw new Error("Error al eliminar el inquilino");
        }
      } catch (error) {
        console.error("Error al eliminar inquilino:", error);
        alert("Error al eliminar el inquilino");
      }
    }
  };

  const handleView = (inquilino) => {
    // Lógica para ver detalles del inmueble
    console.log("Ver Inquilino con ID:", inquilino);
    // Aquí puedes redirigir a otra página o mostrar un modal con los detalles
  };

  
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Apellido",
      dataIndex: "apellido",
      sorter: (a, b) => a.apellido.localeCompare(b.apellido),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
    },
    {
      title: "Contrato",
      dataIndex: "contrato",
      render: (contrato) => (contrato ? "Sí" : "No"),
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
    <Sidebar id='menu-item3' id1='menu-items3' activeClassName='inquilinos-registros'/>
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
                              placeholder="Search here"
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
                              <label>Nombre Inquilino </label>
                              <input className="form-control" type="text" />
                            </div>
                          </div>
                          
                          <div className="col-12 col-md-6 col-xl-4">
                            <div className="doctor-submit">
                              <button
                                type="submit"
                                className="btn btn-primary submit-list-form me-2"
                              >
                                Aplicar Filtro
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
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`,
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

export default InquilinosRegistros;
