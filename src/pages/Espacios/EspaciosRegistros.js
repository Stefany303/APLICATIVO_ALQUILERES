import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../../assets/styles/table-styles.css';
import '../../assets/styles/filtros-styles.css';
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

const InquilinosRegistrar = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([
    { value: 1, label: "Select LeaveType" },
    { value: 2, label: "Medical Leave" },
    { value: 3, label: "Casual Leave" },
    { value: 3, label: "Loss of Pay" }
  ]);
  const [espacios, setEspacios] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [selectedInmueble, setSelectedInmueble] = useState('');
  const [selectedPiso, setSelectedPiso] = useState('');

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
    const fetchData = async () => {
      try {
        const inmueblesResponse = await axios.get('/api/inmuebles');
        setInmuebles(inmueblesResponse.data);
        const espaciosResponse = await axios.get('/api/espacios');
        setEspacios(espaciosResponse.data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedInmueble) {
      const fetchPisos = async () => {
        try {
          const response = await axios.get(`/api/pisos/${selectedInmueble}`);
          setPisos(response.data);
        } catch (error) {
          console.error('Error al obtener pisos:', error);
        }
      };
      fetchPisos();
    } else {
      setPisos([]);
      setSelectedPiso('');
    }
  }, [selectedInmueble]);

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
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/espacios/${id}`);
      setEspacios(espacios.filter(espacio => espacio.id !== id));
    } catch (error) {
      console.error('Error al eliminar el espacio:', error);
    }
  };

  const filteredEspacios = espacios.filter(espacio =>
    (!selectedInmueble || espacio.inmueble_id === parseInt(selectedInmueble)) &&
    (!selectedPiso || espacio.piso_id === parseInt(selectedPiso))
  );



  const handleView = (inmuebleId) => {
    // Lógica para ver detalles del inmueble
    console.log("Ver inmueble con ID:", inmuebleId);
    // Aquí puedes redirigir a otra página o mostrar un modal con los detalles
  };

  const handleEdit = (inmuebleId) => {
    // Lógica para editar el inmueble
    console.log("Editar inmueble con ID:", inmuebleId);
    // Aquí puedes redirigir a una página de edición
  };



  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
    },
    {
      title: "Precio",
      dataIndex: "precio",
      sorter: (a, b) => (a.precio || 0) - (b.precio || 0),
      render: (precio) => (precio !== undefined ? `S/ ${precio.toFixed(2)}` : "N/A"),
    },
    {
      title: "Capacidad",
      dataIndex: "capacidad",
      sorter: (a, b) => a.capacidad - b.capacidad,
    },
    {
      title: "Baño",
      dataIndex: "bano",
      sorter: (a, b) => a.bano - b.bano,
      render: (bano) => (bano ? "Sí" : "No"),
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
    <Sidebar id='menu-item3' id1='menu-items3' activeClassName='espacios-registros'/>
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
                                Search
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

export default InquilinosRegistrar;
