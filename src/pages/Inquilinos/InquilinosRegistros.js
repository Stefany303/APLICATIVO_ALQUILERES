import React, { useEffect, useState } from "react";
import '../../assets/styles/table-styles.css'; // Asegúrate de que la ruta sea correcta
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal, blogimg12,
  blogimg2, blogimg4, blogimg6, blogimg8} from '../../components/imagepath';
import { FiChevronRight } from "react-icons/fi";
import {onShowSizeChange,itemRender}from  '../../components/Pagination';
import { Table, Button, Space, Modal, message, Tag, Card, Row, Col, Statistic } from 'antd';
import Select from "react-select";
import { DatePicker} from "antd";
import inquilinoService from '../../services/inquilinoService';
import contratoService from '../../services/contratoService';

import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const InquilinosRegistros = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [filteredInquilinos, setFilteredInquilinos] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
    try {
      const data = await inquilinoService.getInquilinos();
      setInquilinos(data);
      setFilteredInquilinos(data); // Inicializar los inquilinos filtrados
    } catch (error) {
      setError(error.message);
      message.error('Error al cargar los inquilinos');
    } finally {
      setLoading(false);
    }
  };

  const fetchContratos = async () => {
    setLoadingContratos(true);
    try {
      const data = await contratoService.obtenerContratos();
      console.log('Contratos recibidos:', data);
      setContratos(data);
    } catch (error) {
      console.error('Error al cargar los contratos:', error);
      message.error('Error al cargar los contratos');
    } finally {
      setLoadingContratos(false);
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
    try {
      await inquilinoService.deleteInquilino(id);
      message.success('Inquilino eliminado exitosamente');
      fetchInquilinos();
    } catch (error) {
      message.error('Error al eliminar el inquilino');
    }
  };

  const handleViewDetails = (inquilino) => {
    setSelectedInquilino(inquilino);
    setModalVisible(true);
  };

  const getContratoInquilino = (inquilinoId) => {
    const contrato = contratos.find(contrato => contrato.inquilino_id === inquilinoId);
    console.log('Buscando contrato para inquilino:', inquilinoId);
    console.log('Contrato encontrado:', contrato);
    return contrato;
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text, record) => `${record.nombre} ${record.apellido}`,
    },
    {
      title: 'Documento',
      dataIndex: 'dni',
      key: 'dni',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
    },
    {
      title: 'Contrato',
      key: 'contrato',
      render: (_, record) => {
        const contrato = getContratoInquilino(record.id);
        return contrato ? (
          <Tag color={contrato.estado === 'activo' ? 'green' : 'red'}>
            {contrato.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Tag>
        ) : (
          <Tag color="default">Sin contrato</Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
          >
            Ver
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/inquilinos-editar/${record.id}`)}
          >
            Editar
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const renderContratoInfo = (inquilino) => {
    const contrato = getContratoInquilino(inquilino.id);
    if (!contrato) return null;

    return (
      <Card title="Información del Contrato" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Fecha Inicio" value={new Date(contrato.fecha_inicio).toLocaleDateString()} />
          </Col>
          <Col span={8}>
            <Statistic title="Fecha Fin" value={new Date(contrato.fecha_fin).toLocaleDateString()} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Monto Mensual" 
              value={`$${contrato.monto_alquiler.toFixed(2)}`}
              precision={2}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Statistic 
              title="Depósito" 
              value={`$${contrato.monto_garantia.toFixed(2)}`}
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Estado" value={contrato.estado} />
          </Col>
          <Col span={8}>
            <Statistic title="Fecha de Pago" value={new Date(contrato.fecha_pago).toLocaleDateString()} />
          </Col>
        </Row>
        {contrato.descripcion && (
          <div style={{ marginTop: 16 }}>
            <h4>Observaciones:</h4>
            <p>{contrato.descripcion}</p>
          </div>
        )}
      </Card>
    );
  };

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
                        dataSource={inquilinos}
                        loading={loading}
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

    <Modal
      title="Detalles del Inquilino"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      width={800}
    >
      {selectedInquilino && (
        <>
          <Card title="Información Personal">
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Nombre:</strong> {selectedInquilino.nombre} {selectedInquilino.apellido}</p>
                <p><strong>Documento:</strong> {selectedInquilino.dni}</p>
                <p><strong>Email:</strong> {selectedInquilino.email}</p>
              </Col>
              <Col span={12}>
                <p><strong>Teléfono:</strong> {selectedInquilino.telefono}</p>
                <p><strong>Dirección:</strong> {selectedInquilino.direccion}</p>
              </Col>
            </Row>
          </Card>
          {renderContratoInfo(selectedInquilino)}
        </>
      )}
    </Modal>
</>
    
    </>
  );
};

export default InquilinosRegistros;
