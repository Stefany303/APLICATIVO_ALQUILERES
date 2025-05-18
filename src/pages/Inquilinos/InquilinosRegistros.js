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
  const [filteredInquilinos, setFilteredInquilinos] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    setLoading(true);
    try {
      const data = await contratoService.obtenerContratosDetalles();
      console.log('Datos recibidos del backend:', data);
      
      // Asegurarnos de que los datos sean un array
      const contratosArray = Array.isArray(data) ? data : [data];
      
      // Mapear los datos al formato exacto que espera la tabla
      const formattedData = contratosArray.map(contrato => {
        console.log('Procesando contrato:', contrato);
        return {
          key: contrato.id, // Añadir key para la tabla
          id: contrato.id,
          inquilino_nombre: contrato.inquilino_nombre || '',
          inquilino_apellido: contrato.inquilino_apellido || '',
          inquilino_dni: contrato.inquilino_dni || '',
          inquilino_email: contrato.inquilino_email || '',
          inquilino_telefono: contrato.inquilino_telefono || '',
          inmueble_nombre: contrato.inmueble_nombre || '',
          espacio_nombre: contrato.espacio_nombre || '',
          fecha_inicio: contrato.fecha_inicio,
          fecha_fin: contrato.fecha_fin,
          monto_alquiler: contrato.monto_alquiler,
          monto_garantia: contrato.monto_garantia,
          estado: contrato.estado,
          descripcion: contrato.descripcion,
          fecha_pago: contrato.fecha_pago
        };
      });

      console.log('Datos formateados para la tabla:', formattedData);
      setInquilinos(formattedData);
      setFilteredInquilinos(formattedData);
    } catch (error) {
      console.error('Error al cargar los contratos:', error);
      message.error('Error al cargar los contratos');
    } finally {
      setLoading(false);
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

  const handleViewDetails = (inquilino) => {
    setSelectedInquilino(inquilino);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Inquilino',
      dataIndex: 'inquilino_nombre',
      key: 'inquilino',
      render: (text, record) => `${record.inquilino_nombre} ${record.inquilino_apellido}`,
    },
    {
      title: 'Documento',
      dataIndex: 'inquilino_dni',
      key: 'documento',
    },
    {
      title: 'Email',
      dataIndex: 'inquilino_email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'inquilino_telefono',
      key: 'telefono',
    },
    {
      title: 'Inmueble',
      dataIndex: 'inmueble_nombre',
      key: 'inmueble',
    },
    {
      title: 'Espacio',
      dataIndex: 'espacio_nombre',
      key: 'espacio',
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => (
        <Tag color={record.estado === 'activo' ? 'green' : 'red'}>
          {record.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
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
        </Space>
      ),
    },
  ];

  const renderInquilinoInfo = (inquilino) => {
    if (!inquilino) return null;

    return (
      <Card title="Información del Contrato" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Fecha Inicio" value={new Date(inquilino.fecha_inicio).toLocaleDateString()} />
          </Col>
          <Col span={8}>
            <Statistic title="Fecha Fin" value={new Date(inquilino.fecha_fin).toLocaleDateString()} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Monto Mensual" 
              value={`$${parseFloat(inquilino.monto_alquiler).toFixed(2)}`}
              precision={2}
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Statistic 
              title="Depósito" 
              value={`$${parseFloat(inquilino.monto_garantia).toFixed(2)}`}
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Estado" value={inquilino.estado} />
          </Col>
          <Col span={8}>
            <Statistic title="Fecha de Pago" value={new Date(inquilino.fecha_pago).toLocaleDateString()} />
          </Col>
        </Row>
        {inquilino.descripcion && (
          <div style={{ marginTop: 16 }}>
            <h4>Observaciones:</h4>
            <p>{inquilino.descripcion}</p>
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
                <Link to="#">Inquilinos </Link>
            </li>
              <li className="breadcrumb-item">
                <i className="feather-chevron-right">
                  <FiChevronRight />
                  </i>
              </li>
              <li className="breadcrumb-item active">Lista de Inquilinos</li>
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
                      <h3>Lista de Inquilinos</h3>
                      <div className="doctor-search-blk">
                        <div className="top-nav-search table-search-blk">
                          <form>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search here"
                              value={filter}
                              onChange={handleFilterChange}
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
                            to="/inquilinos-registrar"
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
                          total: filteredInquilinos.length,
                          showTotal: (total, range) =>
                          `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                          onShowSizeChange: onShowSizeChange,
                          itemRender: itemRender,
                        }}
                        columns={columns}
                        dataSource={filteredInquilinos}
                        loading={loading}
                        rowKey="id"
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
      title="Detalles del Contrato"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      width={800}
    >
      {selectedInquilino && (
        <>
          <Card title="Información del Inquilino">
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Nombre:</strong> {selectedInquilino.inquilino_nombre} {selectedInquilino.inquilino_apellido}</p>
                <p><strong>Documento:</strong> {selectedInquilino.inquilino_dni}</p>
                <p><strong>Email:</strong> {selectedInquilino.inquilino_email}</p>
              </Col>
              <Col span={12}>
                <p><strong>Teléfono:</strong> {selectedInquilino.inquilino_telefono}</p>
                <p><strong>Inmueble:</strong> {selectedInquilino.inmueble_nombre}</p>
                <p><strong>Espacio:</strong> {selectedInquilino.espacio_nombre}</p>
              </Col>
            </Row>
          </Card>
          {renderInquilinoInfo(selectedInquilino)}
        </>
      )}
    </Modal>
</>
    
    </>
  );
};

export default InquilinosRegistros;
