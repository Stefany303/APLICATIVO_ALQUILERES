import React, { useEffect, useState, useRef } from "react";
import '../../assets/styles/table-styles.css';
import '../../assets/styles/select-components.css';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from "../../components/Sidebar";
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../components/imagepath';
import { FiChevronRight, FiFileText, FiDownload, FiEye, FiUpload } from "react-icons/fi";
import { onShowSizeChange, itemRender } from '../../components/Pagination';
import { Table, DatePicker, Spin, Modal, Button, Form, Input, DatePicker as AntDatePicker, Select, App } from 'antd';
import ReactSelect from 'react-select';
import { useAuth } from "../../utils/AuthContext";
import contratoService from "../../services/contratoService";
import inmuebleService from "../../services/inmuebleService";
import pisoService from "../../services/pisoService";
import documentoService from "../../services/documentoService";
import espacioService from "../../services/espacioService";
import pagoService from "../../services/pagoService";
import { API_URL } from "../../services/authService";
import moment from 'moment';
import { SearchOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SaveOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { TextArea } = Input;
const { RangePicker } = AntDatePicker;

const ContratoRegistrosContent = () => {
  const navigate = useNavigate();
  const { estaAutenticado, getAuthToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  
  // Estados para datos
  const [contratos, setContratos] = useState([]);
  const [filteredContratos, setFilteredContratos] = useState([]);
  const [inmuebles, setInmuebles] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [espacios, setEspacios] = useState([]); // Para obtener relación espacio-piso
  
  // Estados para filtros
  const [selectedInmueble, setSelectedInmueble] = useState(null);
  const [selectedPiso, setSelectedPiso] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedEstado, setSelectedEstado] = useState(null);
  
  // Estados para modales
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFinalizar, setLoadingFinalizar] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [contratoFile, setContratoFile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  
  // Estados para manejo de documentos
  const [documento, setDocumento] = useState(null);
  const [documentoError, setDocumentoError] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [documentoExistente, setDocumentoExistente] = useState(null);
  
  // Estados para cancelación de contrato
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [contratoACancelar, setContratoACancelar] = useState(null);
  const [pagosCancelacion, setPagosCancelacion] = useState([]);
  const [loadingCancelacion, setLoadingCancelacion] = useState(false);
  const [loadingPagosCancelacion, setLoadingPagosCancelacion] = useState(false);
  
  // Estados para verificación de pagos y finalización
  const [contratosConPagosPagados, setContratosConPagosPagados] = useState(new Set());
  const [loadingVerificacionPagos, setLoadingVerificacionPagos] = useState(false);
  const [estadisticasPagos, setEstadisticasPagos] = useState(new Map()); // Map para almacenar estadísticas de pagos por contrato
  
  // Estados para modal de finalización
  const [finalizarModalVisible, setFinalizarModalVisible] = useState(false);
  const [contratoAFinalizar, setContratoAFinalizar] = useState(null);
  const [pagosFinalizacion, setPagosFinalizacion] = useState([]);
  const [loadingPagosFinalizacion, setLoadingPagosFinalizacion] = useState(false);
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Estados para manejo de archivos y carga
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [modalUploadVisible, setModalUploadVisible] = useState(false);
  const fileInputRef = useRef(null);
  
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  // Verificar autenticación
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
    }
  }, [estaAutenticado, navigate]);

  // Cargar datos iniciales
  useEffect(() => {
    if (!estaAutenticado) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contratosData, inmueblesData, espaciosData] = await Promise.all([
          contratoService.obtenerContratosDetalles(),
          inmuebleService.obtenerInmuebles(),
          espacioService.obtenerEspacios(), // Obtener todos los espacios para la relación con pisos
        ]);
        setContratos(Array.isArray(contratosData) ? contratosData : []);
        setFilteredContratos(Array.isArray(contratosData) ? contratosData : []);
        setInmuebles(inmueblesData.map(item => ({ value: item.id, label: item.nombre })));
        setEspacios(Array.isArray(espaciosData) ? espaciosData : []); // Guardar espacios para filtros
      } catch (err) {
        console.error("Error detallado al cargar datos:", err);
        setError(`Error al cargar los datos: ${err.message || 'Error desconocido'}`);
        message.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [estaAutenticado]);

  // Cargar pisos cuando se selecciona un inmueble
  useEffect(() => {
    if (!selectedInmueble) {
      setPisos([]);
      return;
    }
    
    const fetchPisos = async () => {
      try {
        const pisosData = await pisoService.obtenerPorInmueble(selectedInmueble);
        console.log('Datos de pisos recibidos del backend:', pisosData);
        
        // Solo mostrar pisos que tienen espacios con contratos activos
        const pisosConContratos = pisosData.filter(piso => {
          // Verificar si hay espacios en este piso
          const espaciosEnPiso = espacios.filter(espacio => 
            espacio.piso_id && espacio.piso_id.toString() === piso.id.toString()
          );
          
          // Verificar si hay contratos en alguno de esos espacios
          const hayContratos = espaciosEnPiso.some(espacio => 
            contratos.some(contrato => 
              contrato.espacio_id && contrato.espacio_id.toString() === espacio.id.toString()
            )
          );
          
          console.log(`Piso ${piso.id} (${piso.nombre || piso.nombre_piso}): espacios=${espaciosEnPiso.length}, contratos=${hayContratos}`);
          return hayContratos;
        });
        
        console.log('Pisos con contratos:', pisosConContratos);
        
        const pisosMapeados = pisosConContratos.map(item => ({ 
          value: item.id, 
          label: item.nombre || item.nombre_piso || `Piso ${item.id}` 
        }));
        console.log('Pisos mapeados:', pisosMapeados);
        setPisos(pisosMapeados);
      } catch (err) {
        console.error("Error detallado al cargar pisos:", err);
        setPisos([]);
        message.error("Error al cargar los pisos");
      }
    };
    
    fetchPisos();
  }, [selectedInmueble, espacios, contratos]);

  // Aplicar filtros
  useEffect(() => {
    if (!contratos.length) return;
    
    let filtered = [...contratos];
    
    // Filtrar por inmueble
    if (selectedInmueble) {
      filtered = filtered.filter(contrato => 
        contrato.inmueble_id && contrato.inmueble_id.toString() === selectedInmueble.toString()
      );
    }
    
    // Filtrar por piso - Usando la relación espacio-piso
    if (selectedPiso && espacios.length > 0) {
      // Obtener todos los espacios que pertenecen al piso seleccionado
      const espaciosDelPiso = espacios.filter(espacio => 
        espacio.piso_id && espacio.piso_id.toString() === selectedPiso.toString()
      );
      
      // Obtener los IDs de esos espacios
      const idsEspaciosDelPiso = espaciosDelPiso.map(espacio => espacio.id);
      
      // Filtrar contratos que tengan un espacio de este piso
      filtered = filtered.filter(contrato => 
        contrato.espacio_id && idsEspaciosDelPiso.includes(contrato.espacio_id)
      );
    }
    
    // Filtrar por estado
    if (selectedEstado) {
      filtered = filtered.filter(contrato => 
        contrato.estado && contrato.estado.toLowerCase() === selectedEstado.toLowerCase()
      );
    }
    
    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(contrato => 
        (contrato.inquilino_nombre && contrato.inquilino_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.inquilino_apellido && contrato.inquilino_apellido.toLowerCase().includes(searchLower)) ||
        (contrato.espacio_nombre && contrato.espacio_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.inmueble_nombre && contrato.inmueble_nombre.toLowerCase().includes(searchLower)) ||
        (contrato.descripcion && contrato.descripcion.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredContratos(filtered);
  }, [contratos, selectedInmueble, selectedPiso, selectedEstado, searchText, espacios]);

  // Verificar pagos cuando cambien los contratos filtrados
  useEffect(() => {
    if (filteredContratos.length > 0) {
      verificarPagosTodosContratos();
    }
  }, [filteredContratos]);

  const handleInmuebleChange = (value) => {
    setSelectedInmueble(value);
    setSelectedPiso(null); // Reiniciar piso al cambiar inmueble
    if (!value) {
      setPisos([]); // Limpiar pisos si no hay inmueble seleccionado
    }
  };

  const handlePisoChange = (value) => {
    setSelectedPiso(value);
  };

  const handleEstadoChange = (value) => {
    setSelectedEstado(value);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const contratosData = await contratoService.obtenerContratosDetalles();
      setContratos(Array.isArray(contratosData) ? contratosData : []);
      message.success("Datos actualizados");
      
      // Verificar pagos después de actualizar contratos
      if (Array.isArray(contratosData) && contratosData.length > 0) {
        setTimeout(() => {
          verificarPagosTodosContratos();
        }, 500); // Pequeño delay para asegurar que los datos estén actualizados
      }
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      message.error("Error al actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setLoadingDoc(true);
      setDocumentoError(false);
      setDocumentoExistente(null);
      
      // Obtener el documento existente
      documentoService.obtenerDocumentosPorDocumentable(id, 'contrato')
        .then(documentos => {
          if (documentos && documentos.length > 0) {
            setDocumentoExistente(documentos[0]);
          }
          setContratoSeleccionado(contrato);
          setViewModalVisible(true);
        })
        .catch(error => {
          console.error("Error al obtener documento:", error);
          setDocumentoExistente(null);
          setDocumentoError(true);
        })
        .finally(() => {
          setLoadingDoc(false);
        });
    } else {
      message.error("No se encontró el contrato seleccionado");
    }
  };

  const handleEdit = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setContratoSeleccionado(contrato);
      
      // Convertir fechas a objetos moment correctamente
      const fechaInicio = contrato.fecha_inicio ? moment(contrato.fecha_inicio) : null;
      const fechaFin = contrato.fecha_fin ? moment(contrato.fecha_fin) : null;
      const fechaPago = contrato.fecha_pago ? moment(contrato.fecha_pago) : null;
      
      // Configurar valores iniciales del formulario
      form.setFieldsValue({
        monto_alquiler: contrato.monto_alquiler,
        monto_garantia: contrato.monto_garantia,
        descripcion: contrato.descripcion,
        estado: contrato.estado,
        fechas: fechaInicio && fechaFin ? [fechaInicio, fechaFin] : null,
        fecha_pago: fechaPago
      });
      
      setEditModalVisible(true);
    } else {
      message.error("No se encontró el contrato seleccionado");
    }
  };

  const handleSaveEdit = async () => {
    try {
      setLoadingSave(true);
      // Validar formulario
      const values = await form.validateFields();
      
      // Preparar datos para enviar
      // Asegurarnos de que las fechas estén en formato YYYY-MM-DD
      const fechaInicio = values.fechas[0].format('YYYY-MM-DD');
      const fechaFin = values.fechas[1].format('YYYY-MM-DD');
      const fechaPago = values.fecha_pago.format('YYYY-MM-DD');
      
      const contratoData = {
        monto_alquiler: values.monto_alquiler,
        monto_garantia: values.monto_garantia,
        descripcion: values.descripcion,
        estado: values.estado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        fecha_pago: fechaPago
      };
      
      
      // Llamar al servicio para actualizar
      await contratoService.actualizarContrato(contratoSeleccionado.id, contratoData);
      
      // Guardar los datos actualizados para mostrar en el modal de éxito
      setUpdatedData({
        ...contratoData,
        inquilino_nombre: contratoSeleccionado.inquilino_nombre,
        inquilino_apellido: contratoSeleccionado.inquilino_apellido,
        inmueble_nombre: contratoSeleccionado.inmueble_nombre,
        espacio_nombre: contratoSeleccionado.espacio_nombre
      });
      
      // Actualizar la lista
      handleRefresh();
      
      // Cerrar modal de edición y mostrar modal de éxito
      setEditModalVisible(false);
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error("Error al actualizar contrato:", err);
      message.error("Error al guardar cambios: " + (err.message || "Error desconocido"));
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id) => {
    if (!estaAutenticado) {
      message.error("No hay sesión activa");
      return;
    }
    
    try {
      await contratoService.eliminarContrato(id);
      message.success("Contrato eliminado correctamente");
      
      // Actualizar la lista de contratos
      const contratosData = await contratoService.obtenerContratosDetalles();
      setContratos(Array.isArray(contratosData) ? contratosData : []);
    } catch (err) {
      console.error("Error al eliminar contrato:", err);
      message.error("Error al eliminar el contrato");
    }
  };

  const handleFinalizarContrato = async (contrato) => {
    try {
      setContratoAFinalizar(contrato);
      setLoadingPagosFinalizacion(true);
      setFinalizarModalVisible(true);
      
      // Obtener todos los pagos y filtrar por contrato_id
      const todosLosPagos = await pagoService.obtenerPagos();
      const pagosDelContrato = Array.isArray(todosLosPagos) ? 
        todosLosPagos.filter(pago => pago.contrato_id && pago.contrato_id.toString() === contrato.id.toString()) : 
        [];
      
      setPagosFinalizacion(pagosDelContrato);
      
    } catch (error) {
      console.error('Error al obtener pagos del contrato:', error);
      message.error('Error al cargar los pagos del contrato');
      setPagosFinalizacion([]);
    } finally {
      setLoadingPagosFinalizacion(false);
    }
  };

  // Función para confirmar la finalización del contrato (transaccional con rollback)
  const handleConfirmarFinalizacion = async () => {
    if (!contratoAFinalizar) return;
    
    // Variables para rollback
    let contratoActualizado = false;
    let espacioActualizado = false;
    let estadoOriginalContrato = contratoAFinalizar.estado;
    
    try {
      setLoadingFinalizar(true);
      message.loading('Finalizando contrato...', 0);
      
      console.log('=== INICIO TRANSACCIÓN FINALIZACIÓN ===');
      
      // PASO 1: Actualizar el estado del contrato a 'finalizado'
      try {
        console.log('PASO 1: Finalizando contrato...');
        const contratoData = {
          monto_alquiler: contratoAFinalizar.monto_alquiler,
          monto_garantia: contratoAFinalizar.monto_garantia,
          descripcion: contratoAFinalizar.descripcion,
          estado: 'finalizado', // El nuevo estado
          fecha_inicio: moment(contratoAFinalizar.fecha_inicio).format('YYYY-MM-DD'),
          fecha_fin: moment(contratoAFinalizar.fecha_fin).format('YYYY-MM-DD'),
          fecha_pago: moment(contratoAFinalizar.fecha_pago).format('YYYY-MM-DD'),
        };
        
        await contratoService.actualizarContrato(contratoAFinalizar.id, contratoData);
        contratoActualizado = true;
        console.log('✅ Contrato finalizado exitosamente');
      } catch (error) {
        console.log('❌ Error al finalizar contrato:', error.message);
        throw new Error(`No se pudo finalizar el contrato: ${error.message}`);
      }
      
      // PASO 2: Liberar el espacio
      try {
        if (!contratoAFinalizar.espacio_id) {
          throw new Error('Falta información del espacio (espacio ID) para poder actualizarlo.');
        }
        
        console.log('PASO 2: Liberando espacio...');
        await espacioService.cambiarEstadoEspacio(contratoAFinalizar.espacio_id, 0);
        espacioActualizado = true;
        console.log('✅ Espacio liberado exitosamente');
      } catch (error) {
        console.log('❌ Error al liberar espacio:', error.message);
        throw new Error(`Error al liberar el espacio: ${error.message}`);
      }

      // Si llegamos aquí, todas las operaciones fueron exitosas
      console.log('=== TRANSACCIÓN COMPLETADA EXITOSAMENTE ===');
      message.destroy();
      message.success('El contrato ha sido finalizado y el espacio ha sido liberado.');
      
      setFinalizarModalVisible(false);
      setContratoAFinalizar(null);
      setPagosFinalizacion([]);
      
      // Recargar la lista de contratos
      handleRefresh();

    } catch (error) {
      // ROLLBACK: Revertir cambios realizados
      console.log('=== INICIANDO ROLLBACK ===');
      message.destroy();
      message.loading('Revirtiendo cambios...', 0);
      
      try {
        // Revertir espacio si fue actualizado
        if (espacioActualizado && contratoAFinalizar.espacio_id) {
          console.log('Revirtiendo estado del espacio...');
          await espacioService.cambiarEstadoEspacio(contratoAFinalizar.espacio_id, 1); // 1 = ocupado
        }
        
        // Revertir contrato si fue actualizado
        if (contratoActualizado) {
          console.log('Revirtiendo estado del contrato...');
          const contratoData = {
            monto_alquiler: contratoAFinalizar.monto_alquiler,
            monto_garantia: contratoAFinalizar.monto_garantia,
            descripcion: contratoAFinalizar.descripcion,
            estado: estadoOriginalContrato,
            fecha_inicio: moment(contratoAFinalizar.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(contratoAFinalizar.fecha_fin).format('YYYY-MM-DD'),
            fecha_pago: moment(contratoAFinalizar.fecha_pago).format('YYYY-MM-DD'),
          };
          await contratoService.actualizarContrato(contratoAFinalizar.id, contratoData);
        }
        
        console.log('=== ROLLBACK COMPLETADO ===');
        message.destroy();
        message.error(`Error al finalizar el contrato: ${error.message}. Todos los cambios han sido revertidos.`);
        
      } catch (rollbackError) {
        console.error('=== ERROR EN ROLLBACK ===', rollbackError);
        message.destroy();
        message.error(`Error crítico: No se pudo revertir completamente los cambios. Contacte al administrador. Error original: ${error.message}`);
      }
      
      // Recargar datos para mostrar el estado actual
      handleRefresh();
      
    } finally {
      setLoadingFinalizar(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setSelectedInmueble(null);
    setSelectedPiso(null);
    setSelectedEstado(null);
    setSearchText("");
    setPisos([]); // Limpiar también los pisos disponibles
  };

  // Función para verificar si todos los pagos de un contrato están pagados
  const verificarPagosContrato = async (contratoId) => {
    try {
      // Obtener todos los pagos y filtrar por contrato_id
      const todosLosPagos = await pagoService.obtenerPagos();
      const pagosDelContrato = Array.isArray(todosLosPagos) ? 
        todosLosPagos.filter(pago => pago.contrato_id && pago.contrato_id.toString() === contratoId.toString()) : 
        [];
      
      // Verificar si todos los pagos están pagados
      if (pagosDelContrato.length === 0) {
        return false; // Si no hay pagos, no se puede finalizar
      }
      
      const todosPagados = pagosDelContrato.every(pago => pago.estado === 'pagado');
      return todosPagados;
      
    } catch (error) {
      console.error('Error al verificar pagos del contrato:', error);
      return false;
    }
  };

  // Función para verificar pagos de todos los contratos activos
  const verificarPagosTodosContratos = async () => {
    try {
      setLoadingVerificacionPagos(true);
      
      // Obtener todos los pagos una sola vez
      const todosLosPagos = await pagoService.obtenerPagos();
      const contratosActivos = filteredContratos.filter(contrato => contrato.estado === 'activo');
      
      const contratosConTodosPagados = new Set();
      const estadisticasMap = new Map();
      
      for (const contrato of contratosActivos) {
        const pagosDelContrato = Array.isArray(todosLosPagos) ? 
          todosLosPagos.filter(pago => pago.contrato_id && pago.contrato_id.toString() === contrato.id.toString()) : 
          [];
        
        // Contar pagos por estado
        const pagosPagados = pagosDelContrato.filter(pago => pago.estado === 'pagado').length;
        const totalPagos = pagosDelContrato.length;
        
        // Guardar estadísticas
        estadisticasMap.set(contrato.id.toString(), {
          pagados: pagosPagados,
          total: totalPagos,
          todosPagados: totalPagos > 0 && pagosPagados === totalPagos
        });
        
        // Solo agregar si tiene pagos Y todos están pagados
        if (totalPagos > 0 && pagosPagados === totalPagos) {
          contratosConTodosPagados.add(contrato.id.toString());
        }
      }
      
      setContratosConPagosPagados(contratosConTodosPagados);
      setEstadisticasPagos(estadisticasMap);
      
    } catch (error) {
      console.error('Error al verificar pagos de todos los contratos:', error);
      setContratosConPagosPagados(new Set());
      setEstadisticasPagos(new Map());
    } finally {
      setLoadingVerificacionPagos(false);
    }
  };

  // Función para cancelar contrato
  const handleCancelarContrato = async (contrato) => {
    try {
      console.log('=== INICIO CANCELACIÓN DE CONTRATO ===');
      console.log('Contrato seleccionado:', contrato);
      console.log('ID del contrato:', contrato.id);
      
      setContratoACancelar(contrato);
      setLoadingPagosCancelacion(true);
      setCancelModalVisible(true);
      
      // Obtener todos los pagos y filtrar por contrato_id
      console.log('Obteniendo todos los pagos...');
      const todosLosPagos = await pagoService.obtenerPagos();
      console.log('Total de pagos obtenidos:', todosLosPagos?.length || 0);
      console.log('Primeros 3 pagos:', todosLosPagos?.slice(0, 3));
      
      const pagosDelContrato = Array.isArray(todosLosPagos) ? 
        todosLosPagos.filter(pago => {
          const coincide = pago.contrato_id && pago.contrato_id.toString() === contrato.id.toString();
          if (coincide) {
            console.log('Pago coincidente encontrado:', pago);
          }
          return coincide;
        }) : 
        [];
      
      console.log('Pagos filtrados para el contrato:', pagosDelContrato);
      console.log('Cantidad de pagos del contrato:', pagosDelContrato.length);
      
      setPagosCancelacion(pagosDelContrato);
      
    } catch (error) {
      console.error('Error al obtener pagos del contrato:', error);
      message.error('Error al cargar los pagos del contrato');
      setPagosCancelacion([]);
    } finally {
      setLoadingPagosCancelacion(false);
      console.log('=== FIN CANCELACIÓN DE CONTRATO ===');
    }
  };

  // Función para confirmar la cancelación del contrato (transaccional con rollback)
  const handleConfirmarCancelacion = async () => {
    if (!contratoACancelar) return;
    
    // Variables para rollback
    let contratoActualizado = false;
    let pagosActualizados = [];
    let espacioActualizado = false;
    let estadoOriginalContrato = contratoACancelar.estado;
    
    try {
      setLoadingCancelacion(true);
      message.loading('Cancelando contrato...', 0);
      
      const pagosPendientes = pagosCancelacion.filter(pago => 
        pago.estado === 'pendiente' || pago.estado === 'vencido'
      );
      
      console.log('=== INICIO TRANSACCIÓN CANCELACIÓN ===');
      console.log('Pagos a cancelar:', pagosPendientes.length);
      
      // PASO 1: Actualizar el estado del contrato a 'cancelado'
      try {
        console.log('PASO 1: Cancelando contrato...');
        const contratoData = {
          monto_alquiler: contratoACancelar.monto_alquiler,
          monto_garantia: contratoACancelar.monto_garantia,
          descripcion: contratoACancelar.descripcion,
          estado: 'cancelado',
          fecha_inicio: moment(contratoACancelar.fecha_inicio).format('YYYY-MM-DD'),
          fecha_fin: moment(contratoACancelar.fecha_fin).format('YYYY-MM-DD'),
          fecha_pago: moment(contratoACancelar.fecha_pago).format('YYYY-MM-DD'),
        };
        
        await contratoService.actualizarContrato(contratoACancelar.id, contratoData);
        contratoActualizado = true;
        console.log('✅ Contrato cancelado exitosamente');
      } catch (error) {
        console.log('❌ Error al cancelar contrato:', error.message);
        throw new Error(`No se pudo cancelar el contrato: ${error.message}`);
      }
      
      // PASO 2: Cancelar todos los pagos pendientes
      for (const pago of pagosPendientes) {
        try {
          console.log(`PASO 2: Cancelando pago ${pago.id}...`);
          const pagoData = {
            contrato_id: pago.contrato_id,
            monto: pago.monto,
            metodo_pago: pago.metodo_pago,
            tipo_pago: pago.tipo_pago || 'alquiler',
            estado: 'cancelado',
            fecha_pago: pago.fecha_pago,
            fecha_real_pago: pago.fecha_real_pago,
            observacion: pago.observacion || 'Cancelado por cancelación de contrato'
          };
          
          await pagoService.actualizarPago(pago.id, pagoData);
          pagosActualizados.push({id: pago.id, estadoOriginal: pago.estado});
          console.log(`✅ Pago ${pago.id} cancelado exitosamente`);
        } catch (error) {
          console.log(`❌ Error al cancelar pago ${pago.id}:`, error.message);
          throw new Error(`Error al cancelar el pago ${pago.id}: ${error.message}`);
        }
      }
      
      // PASO 3: Liberar el espacio
      try {
        if (!contratoACancelar.espacio_id) {
          throw new Error('Falta información del espacio (espacio ID) para poder actualizarlo.');
        }
        
        console.log('PASO 3: Liberando espacio...');
        await espacioService.cambiarEstadoEspacio(contratoACancelar.espacio_id, 0);
        espacioActualizado = true;
        console.log('✅ Espacio liberado exitosamente');
      } catch (error) {
        console.log('❌ Error al liberar espacio:', error.message);
        throw new Error(`Error al liberar el espacio: ${error.message}`);
      }
      
      // Si llegamos aquí, todas las operaciones fueron exitosas
      console.log('=== TRANSACCIÓN COMPLETADA EXITOSAMENTE ===');
      message.destroy();
      const mensajeExito = pagosPendientes.length > 0 
        ? `El contrato ha sido cancelado exitosamente. ${pagosPendientes.length} pago(s) pendiente(s) también fueron cancelados.`
        : 'El contrato ha sido cancelado exitosamente.';
      
      message.success(mensajeExito);
      setCancelModalVisible(false);
      setContratoACancelar(null);
      setPagosCancelacion([]);
      
      // Recargar la lista de contratos
      handleRefresh();
      
    } catch (error) {
      // ROLLBACK: Revertir cambios realizados
      console.log('=== INICIANDO ROLLBACK ===');
      message.destroy();
      message.loading('Revirtiendo cambios...', 0);
      
      try {
        // Revertir espacio si fue actualizado
        if (espacioActualizado && contratoACancelar.espacio_id) {
          console.log('Revirtiendo estado del espacio...');
          await espacioService.cambiarEstadoEspacio(contratoACancelar.espacio_id, 1); // 1 = ocupado
        }
        
        // Revertir pagos actualizados
        for (const pagoRevertir of pagosActualizados) {
          console.log(`Revirtiendo pago ${pagoRevertir.id}...`);
          const pagoOriginal = pagosCancelacion.find(p => p.id === pagoRevertir.id);
          if (pagoOriginal) {
            const pagoData = {
              contrato_id: pagoOriginal.contrato_id,
              monto: pagoOriginal.monto,
              metodo_pago: pagoOriginal.metodo_pago,
              tipo_pago: pagoOriginal.tipo_pago || 'alquiler',
              estado: pagoRevertir.estadoOriginal,
              fecha_pago: pagoOriginal.fecha_pago,
              fecha_real_pago: pagoOriginal.fecha_real_pago,
              observacion: pagoOriginal.observacion
            };
            await pagoService.actualizarPago(pagoRevertir.id, pagoData);
          }
        }
        
        // Revertir contrato si fue actualizado
        if (contratoActualizado) {
          console.log('Revirtiendo estado del contrato...');
          const contratoData = {
            monto_alquiler: contratoACancelar.monto_alquiler,
            monto_garantia: contratoACancelar.monto_garantia,
            descripcion: contratoACancelar.descripcion,
            estado: estadoOriginalContrato,
            fecha_inicio: moment(contratoACancelar.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(contratoACancelar.fecha_fin).format('YYYY-MM-DD'),
            fecha_pago: moment(contratoACancelar.fecha_pago).format('YYYY-MM-DD'),
          };
          await contratoService.actualizarContrato(contratoACancelar.id, contratoData);
        }
        
        console.log('=== ROLLBACK COMPLETADO ===');
        message.destroy();
        message.error(`Error al cancelar el contrato: ${error.message}. Todos los cambios han sido revertidos.`);
        
      } catch (rollbackError) {
        console.error('=== ERROR EN ROLLBACK ===', rollbackError);
        message.destroy();
        message.error(`Error crítico: No se pudo revertir completamente los cambios. Contacte al administrador. Error original: ${error.message}`);
      }
      
      // Recargar datos para mostrar el estado actual
      handleRefresh();
      
    } finally {
      setLoadingCancelacion(false);
    }
  };

  // Función para generar contrato en PDF
  const handleGenerarContratoPDF = async (id) => {
    try {
      setGeneratingPdf(true);
      const contrato = contratos.find(c => c.id === id);
      
      if (!contrato) {
        message.error("No se encontró el contrato seleccionado");
        return;
      }
      
      // Aquí utilizaríamos la biblioteca jsPDF para generar el PDF
      message.info("Generando contrato en PDF...");
      
      // Simulamos un tiempo de generación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear estructura HTML para el contrato (esto es un ejemplo)
      const contenidoContrato = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .subtitle { font-size: 16px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .info-row { display: flex; margin-bottom: 5px; }
              .info-label { font-weight: bold; width: 180px; }
              .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
              .signature { width: 45%; text-align: center; }
              .signature-line { border-top: 1px solid #000; margin-top: 50px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">CONTRATO DE ARRENDAMIENTO</div>
              <div class="subtitle">Folio: ${contrato.id}</div>
            </div>
            
            <div class="section">
              <div class="section-title">DATOS DEL PROPIETARIO</div>
              <div class="info-row"><div class="info-label">Razón Social:</div> EMPRESA DE ALQUILERES S.A.</div>
              <div class="info-row"><div class="info-label">RUC:</div> 20123456789</div>
              <div class="info-row"><div class="info-label">Dirección:</div> Av. Principal 123, Lima</div>
            </div>
            
            <div class="section">
              <div class="section-title">DATOS DEL ARRENDATARIO</div>
              <div class="info-row"><div class="info-label">Nombre:</div> ${contrato.inquilino_nombre} ${contrato.inquilino_apellido}</div>
              <div class="info-row"><div class="info-label">Documento:</div> ${contrato.inquilino_dni || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Email:</div> ${contrato.inquilino_email || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Teléfono:</div> ${contrato.inquilino_telefono || 'No especificado'}</div>
            </div>
            
            <div class="section">
              <div class="section-title">DATOS DEL INMUEBLE</div>
              <div class="info-row"><div class="info-label">Inmueble:</div> ${contrato.inmueble_nombre || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Espacio:</div> ${contrato.espacio_nombre || 'No especificado'}</div>
              <div class="info-row"><div class="info-label">Descripción:</div> ${contrato.espacio_descripcion || 'No especificado'}</div>
            </div>
            
            <div class="section">
              <div class="section-title">CONDICIONES DEL CONTRATO</div>
              <div class="info-row"><div class="info-label">Fecha de inicio:</div> ${new Date(contrato.fecha_inicio).toLocaleDateString()}</div>
              <div class="info-row"><div class="info-label">Fecha de fin:</div> ${new Date(contrato.fecha_fin).toLocaleDateString()}</div>
              <div class="info-row"><div class="info-label">Duración:</div> ${calcularDuracionContrato(contrato.fecha_inicio, contrato.fecha_fin)}</div>
              <div class="info-row"><div class="info-label">Monto de alquiler:</div> S/ ${parseFloat(contrato.monto_alquiler).toFixed(2)} mensuales</div>
              <div class="info-row"><div class="info-label">Monto de garantía:</div> S/ ${parseFloat(contrato.monto_garantia).toFixed(2)}</div>
              <div class="info-row"><div class="info-label">Fecha de pago mensual:</div> ${new Date(contrato.fecha_pago).getDate()} de cada mes</div>
            </div>
            
            <div class="section">
              <div class="section-title">OBSERVACIONES</div>
              <p>${contrato.descripcion || 'Sin observaciones adicionales.'}</p>
            </div>
            
            <div class="section">
              <p>Este contrato de arrendamiento se rige por las leyes vigentes en materia de arrendamiento. Ambas partes declaran estar de acuerdo con todas las cláusulas y condiciones establecidas en el presente documento.</p>
            </div>
            
            <div class="signatures">
              <div class="signature">
                <div class="signature-line"></div>
                <p>EL ARRENDADOR</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p>EL ARRENDATARIO</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // En una implementación real, aquí usaríamos jsPDF y html2canvas para convertir
      // este HTML a un PDF y descargarlo
      
      // Por ahora, simulamos la descarga
      const blob = new Blob([contenidoContrato], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Contrato_${contrato.id}_${contrato.inquilino_apellido}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success("Contrato generado correctamente");
      
    } catch (error) {
      console.error("Error al generar contrato PDF:", error);
      message.error("Error al generar el contrato en PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Función auxiliar para calcular la duración del contrato
  const calcularDuracionContrato = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaMs = fin - inicio;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    
    const años = Math.floor(dias / 365);
    const meses = Math.floor((dias % 365) / 30);
    const diasRestantes = dias % 30;
    
    let duracion = '';
    if (años > 0) duracion += `${años} año${años !== 1 ? 's' : ''} `;
    if (meses > 0) duracion += `${meses} mes${meses !== 1 ? 'es' : ''} `;
    if (diasRestantes > 0) duracion += `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`;
    
    return duracion.trim() || 'Indefinido';
  };

  // Función para abrir el modal de subida de contrato firmado
  const handleSubirContratoFirmado = (id) => {
    const contrato = contratos.find(c => c.id === id);
    if (contrato) {
      setContratoSeleccionado(contrato);
      setModalUploadVisible(true);
    } else {
      alert('No se encontró el contrato seleccionado');
    }
  };

  // Función para manejar la selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        message.error('Solo se permiten archivos PDF');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  // Función para ver documento directamente usando el servicio
  const handleViewDocument = async (keyDocumento) => {
    try {
      if (!keyDocumento) {
        throw new Error('Key del documento no disponible');
      }
      
      const response = await documentoService.verDocumento(keyDocumento);
      if (response.url) {
        window.open(response.url, '_blank');
      } else {
        throw new Error('URL no disponible en la respuesta');
      }
    } catch (error) {
      console.error('Error al ver el documento:', error);
      message.error('Error al abrir el documento. Por favor, intente descargarlo.');
    }
  };

  // Función para descargar documento directamente usando el servicio
  const handleDownloadDocument = async (keyDocumento, nombreArchivo) => {
    try {
      if (!keyDocumento) {
        throw new Error('Key del documento no disponible');
      }
      
      const response = await documentoService.descargarDocumento(keyDocumento);
      if (response.url) {
        // Crear un enlace temporal para la descarga
        const link = document.createElement('a');
        link.href = response.url;
        link.setAttribute('download', response.nombre || nombreArchivo || 'documento.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('URL no disponible en la respuesta');
      }
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      message.error('Error al descargar el documento. Por favor, intente más tarde.');
    }
  };

  const handleUploadAndActivate = async () => {
    try {
      if (!selectedFile) {
        message.error('Debe cargar un documento de respaldo para el contrato');
        return;
      }

      if (!contratoSeleccionado) {
        message.error('Debe seleccionar un contrato primero');
        return;
      }

      // Validar que el archivo sea PDF
      if (selectedFile.type !== 'application/pdf') {
        message.error('Solo se permiten archivos PDF');
        return;
      }

      setUploadingDocument(true);
      
      try {
        // Verificar que el ID del contrato sea válido y esté disponible
        if (!contratoSeleccionado.id) {
          throw new Error('El ID del contrato no es válido');
        }
        
        // Asegurarse de que el ID sea un entero
        const idContrato = parseInt(contratoSeleccionado.id);
        if (isNaN(idContrato)) {
          throw new Error('El ID del contrato no es un número válido');
        }
        
        // PASO 1: Activar el contrato PRIMERO (igual que ContabilidadPagos actualiza el pago primero)
        console.log('Activando contrato antes de subir documento...');
        await contratoService.activarContrato(idContrato);
        console.log('Contrato activado exitosamente');
        
        // Formatear fechas correctamente
        const fechaActual = new Date();
        const anioActual = fechaActual.getFullYear();
        const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const diaActual = String(fechaActual.getDate()).padStart(2, '0');
        const horaActual = String(fechaActual.getHours()).padStart(2, '0');
        const minutosActual = String(fechaActual.getMinutes()).padStart(2, '0');
        const segundosActual = String(fechaActual.getSeconds()).padStart(2, '0');
        
        // Crear un nombre de archivo cifrado basado en la fecha actual y el ID del contrato
        // Formato: contrato_YYYYMMDD_HHMMSS_ID.pdf
        const nombreArchivo = `contrato_${anioActual}${mesActual}${diaActual}_${horaActual}${minutosActual}${segundosActual}_${idContrato}.pdf`;
        
        // Crear un objeto File con el nuevo nombre
        const nuevoArchivo = new File([selectedFile], nombreArchivo, { type: selectedFile.type });
        
        // Incluir un timeout para evitar problemas de concurrencia
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // PASO 2: Subir el archivo (el servicio ya crea el documento automáticamente)
        console.log('Subiendo archivo...');
        const respuestaArchivo = await documentoService.subirArchivo(
          nuevoArchivo, 
          idContrato, 
          'contrato',
          { usarCarpetaComun: true }
        );
        console.log('Archivo subido y documento creado exitosamente:', respuestaArchivo);
        
        message.success('Contrato activado correctamente y documento subido al servidor.');
        
        // Reset form and search
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Cerrar modal de subida
        setModalUploadVisible(false);
        
        // Recargar los contratos
        await handleRefresh();
        setContratoSeleccionado(null);
        
      } catch (docError) {
        console.error('Error en el proceso de documento:', docError);
        message.error(`Error en el proceso: ${docError.message || 'Revise la consola para más detalles'}`);
        throw docError;
      }
      
    } catch (error) {
      console.error('Error detallado:', error);
      if (error.response && error.response.data) {
        message.error(`Error: ${error.response.data.mensaje || error.message}`);
      } else {
        message.error('Error al procesar el contrato o documento');
      }
    } finally {
      setUploadingDocument(false);
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      const dataForExcel = filteredContratos.map(item => ({
        'Inquilino': `${item.inquilino_nombre || ''} ${item.inquilino_apellido || ''}`,
        'Espacio': item.espacio_nombre || '',
        'Inmueble': item.inmueble_nombre || '',
        'Fecha Inicio': item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '',
        'Fecha Fin': item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : '',
        'Monto Alquiler': item.monto_alquiler ? `S/ ${parseFloat(item.monto_alquiler).toFixed(2)}` : '',
        'Monto Garantía': item.monto_garantia ? `S/ ${parseFloat(item.monto_garantia).toFixed(2)}` : '',
        'Estado': item.estado || '',
        'Fecha Pago': item.fecha_pago ? new Date(item.fecha_pago).toLocaleDateString() : ''
      }));
      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contratos");
      // Guardar archivo
      const fecha = new Date().toISOString().slice(0,10);
      const fileName = `Contratos_${fecha}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      message.error('Error al exportar el reporte');
    }
  };

  const columns = [
    {
      title: "Inquilino",
      key: "inquilino",
      render: (text, record) => `${record.inquilino_nombre || ''} ${record.inquilino_apellido || ''}`,
      sorter: (a, b) => {
        const nombreA = `${a.inquilino_nombre || ''} ${a.inquilino_apellido || ''}`;
        const nombreB = `${b.inquilino_nombre || ''} ${b.inquilino_apellido || ''}`;
        return nombreA.localeCompare(nombreB);
      }
    },
    {
      title: "Espacio",
      dataIndex: "espacio_nombre",
      sorter: (a, b) => a.espacio_nombre?.localeCompare(b.espacio_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Inmueble",
      dataIndex: "inmueble_nombre",
      sorter: (a, b) => a.inmueble_nombre?.localeCompare(b.inmueble_nombre || ''),
      render: (text) => text || "N/A",
    },
    {
      title: "Fecha Inicio",
      dataIndex: "fecha_inicio",
      sorter: (a, b) => new Date(a.fecha_inicio || 0) - new Date(b.fecha_inicio || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Fecha Fin",
      dataIndex: "fecha_fin",
      sorter: (a, b) => new Date(a.fecha_fin || 0) - new Date(b.fecha_fin || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Monto Alquiler",
      dataIndex: "monto_alquiler",
      sorter: (a, b) => (parseFloat(a.monto_alquiler) || 0) - (parseFloat(b.monto_alquiler) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Monto Garantía",
      dataIndex: "monto_garantia",
      sorter: (a, b) => (parseFloat(a.monto_garantia) || 0) - (parseFloat(b.monto_garantia) || 0),
      render: (monto) => (monto !== undefined && monto !== null ? `S/ ${parseFloat(monto).toFixed(2)}` : "N/A"),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      sorter: (a, b) => a.estado?.localeCompare(b.estado || ''),
      render: (estado) => {
        if (!estado) return "N/A";
        
        const estadoColores = {
          activo: "text-success",
          inactivo: "text-warning",
          finalizado: "text-danger",
          cancelado: "text-secondary",
        };
        return <span className={estadoColores[estado.toLowerCase()] || ""}>{estado}</span>;
      },
    },
    {
      title: "Fecha Pago",
      dataIndex: "fecha_pago",
      sorter: (a, b) => new Date(a.fecha_pago || 0) - new Date(b.fecha_pago || 0),
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : "N/A",
    },
    {
      title: "Pagos",
      key: "pagos_estado",
      render: (_, record) => {
        if (record.estado !== 'activo') {
          return <span className="text-muted">-</span>;
        }
        
        if (loadingVerificacionPagos) {
          return <span className="spinner-border spinner-border-sm text-primary" role="status"></span>;
        }
        
        const estadisticas = estadisticasPagos.get(record.id.toString());
        
        if (!estadisticas || estadisticas.total === 0) {
          return (
            <span className="text-muted" title="Sin pagos registrados">
              <i className="fas fa-minus-circle me-1"></i>
              0/0
            </span>
          );
        }
        
        const { pagados, total, todosPagados } = estadisticas;
        
        return todosPagados ? (
          <span className="text-success" title="Todos los pagos están al día">
            <i className="fas fa-check-circle me-1"></i>
            {pagados}/{total}
          </span>
        ) : (
          <span className="text-warning" title={`${pagados} de ${total} pagos completados`}>
            <i className="fas fa-clock me-1"></i>
            {pagados}/{total}
          </span>
        );
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <div className="action-buttons d-flex justify-content-center">
          <button
            className="btn btn-sm btn-primary me-1"
            onClick={() => handleView(record.id)}
            title="Ver detalles"
          >
            <EyeOutlined />
          </button>
          <button
            className="btn btn-sm btn-info me-1"
            onClick={() => handleGenerarContratoPDF(record.id)}
            title="Generar contrato PDF"
            disabled={generatingPdf}
          >
            <i className="fas fa-file-pdf"></i>
            {generatingPdf && <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>}
          </button>
          {record.estado === 'inactivo' && (
            <button
              className="btn btn-sm btn-success me-1"
              onClick={() => handleSubirContratoFirmado(record.id)}
              title="Subir contrato firmado y activar"
            >
              <i className="fas fa-upload"></i>
            </button>
          )}
          {record.estado === 'activo' && contratosConPagosPagados.has(record.id.toString()) && (
            <button
              className="btn btn-sm btn-dark me-1"
              onClick={() => handleFinalizarContrato(record)}
              title="Finalizar Contrato"
              disabled={loadingFinalizar}
            >
              <i className="fas fa-flag-checkered"></i>
            </button>
          )}
          {(record.estado === 'activo' || record.estado === 'inactivo') && (
            <button
              className="btn btn-sm btn-danger me-1"
              onClick={() => handleCancelarContrato(record)}
              title="Cancelar contrato"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(record.id)}
            title="Eliminar contrato"
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <Sidebar id="menu-item5" id1="menu-items5" activeClassName="contrato-registros" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Contratos</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FiChevronRight />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Lista de Contratos</li>
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
                          <h3>Lista de Contratos</h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form onSubmit={(e) => e.preventDefault()}>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar por inquilino, espacio..."
                                  value={searchText}
                                  onChange={handleSearch}
                                />
                                <button className="btn" type="button">
                                  <SearchOutlined />
                                </button>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link
                                to="/inquilinos-registrar"
                                className="btn btn-primary add-pluss ms-2"
                                title="Generar nuevo contrato"
                              >
                                <PlusOutlined />
                              </Link>
                              <button
                                className="btn btn-primary doctor-refresh ms-2"
                                onClick={handleRefresh}
                                title="Actualizar datos"
                              >
                                <i className="fas fa-sync-alt"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp">
                      <button
                        className="btn btn-outline-success ms-2"
                        onClick={exportToExcel}
                        title="Exportar a Excel"
                      >
                      <FileExcelOutlined />
                      </button>
                  </div>
                    </div>
                  </div>
                  {/* /Table Header */}

                  {/* Filtros */}
                  <div className="staff-search-table mb-4">
                    <div className="card">
                      {/*<div className="card-header bg-light">
                        <h5 className="mb-0">
                          <i className="fas fa-filter me-2"></i>
                          Filtros de búsqueda
                        </h5>
                      </div>*/}
                      <div className="card-body">
                        <form>
                          <div className="row">
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Inmueble</label>
                                <ReactSelect
                                  placeholder="Seleccionar inmueble"
                                  isClearable
                                  value={selectedInmueble ? inmuebles.find(i => i.value === selectedInmueble) : null}
                                  onChange={(option) => handleInmuebleChange(option?.value)}
                                  options={inmuebles}
                                  classNamePrefix="select"
                                  noOptionsMessage={() => "No hay inmuebles disponibles"}
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      backgroundColor: 'white',
                                      borderColor: '#e2e8f0',
                                      borderWidth: '1px',
                                      borderRadius: '8px',
                                      minHeight: '45px',
                                      cursor: 'pointer',
                                      boxShadow: 'none',
                                      '&:hover': {
                                        borderColor: '#3b82f6'
                                      }
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: '#6b7280',
                                      fontSize: '14px'
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: '#1f2937',
                                      fontSize: '14px'
                                    }),
                                    input: (provided) => ({
                                      ...provided,
                                      color: '#1f2937',
                                      fontSize: '14px'
                                    }),
                                    valueContainer: (provided) => ({
                                      ...provided,
                                      padding: '8px 12px'
                                    }),
                                    indicatorSeparator: () => ({
                                      display: 'none'
                                    }),
                                    dropdownIndicator: (provided) => ({
                                      ...provided,
                                      color: '#6b7280',
                                      '&:hover': {
                                        color: '#374151'
                                      }
                                    }),
                                    clearIndicator: (provided) => ({
                                      ...provided,
                                      color: '#6b7280',
                                      '&:hover': {
                                        color: '#374151'
                                      }
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      borderRadius: '8px',
                                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                      border: '1px solid #e5e7eb',
                                      zIndex: 9999
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: state.isSelected 
                                        ? '#3b82f6' 
                                        : state.isFocused 
                                        ? '#eff6ff' 
                                        : 'white',
                                      color: state.isSelected ? 'white' : '#1f2937',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      padding: '10px 12px'
                                    })
                                  }}
                                />
                              </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Piso</label>
                                <ReactSelect
                                  placeholder={!selectedInmueble ? "Primero selecciona un inmueble" : "Seleccionar piso"}
                                  isClearable
                                  value={selectedPiso ? pisos.find(p => p.value === selectedPiso) : null}
                                  onChange={(option) => handlePisoChange(option?.value)}
                                  options={pisos}
                                  isDisabled={!selectedInmueble}
                                  classNamePrefix="select"
                                  noOptionsMessage={() => selectedInmueble ? "No hay pisos con contratos" : "Primero selecciona un inmueble"}
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: state.isDisabled ? '#f5f5f5' : 'white',
                                      borderColor: state.isDisabled ? '#d1d5db' : '#e2e8f0',
                                      borderWidth: '1px',
                                      borderRadius: '8px',
                                      minHeight: '45px',
                                      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                                      boxShadow: 'none',
                                      '&:hover': {
                                        borderColor: state.isDisabled ? '#d1d5db' : '#3b82f6'
                                      }
                                    }),
                                    placeholder: (provided, state) => ({
                                      ...provided,
                                      color: state.isDisabled ? '#9ca3af' : '#6b7280',
                                      fontSize: '14px'
                                    }),
                                    singleValue: (provided, state) => ({
                                      ...provided,
                                      color: state.isDisabled ? '#6b7280' : '#1f2937',
                                      fontSize: '14px'
                                    }),
                                    input: (provided) => ({
                                      ...provided,
                                      color: '#1f2937',
                                      fontSize: '14px'
                                    }),
                                    valueContainer: (provided) => ({
                                      ...provided,
                                      padding: '8px 12px'
                                    }),
                                    indicatorSeparator: () => ({
                                      display: 'none'
                                    }),
                                    dropdownIndicator: (provided, state) => ({
                                      ...provided,
                                      color: state.isDisabled ? '#9ca3af' : '#6b7280',
                                      '&:hover': {
                                        color: state.isDisabled ? '#9ca3af' : '#374151'
                                      }
                                    }),
                                    clearIndicator: (provided, state) => ({
                                      ...provided,
                                      color: state.isDisabled ? '#9ca3af' : '#6b7280',
                                      '&:hover': {
                                        color: state.isDisabled ? '#9ca3af' : '#374151'
                                      }
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      borderRadius: '8px',
                                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                      border: '1px solid #e5e7eb',
                                      zIndex: 9999
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: state.isSelected 
                                        ? '#3b82f6' 
                                        : state.isFocused 
                                        ? '#eff6ff' 
                                        : 'white',
                                      color: state.isSelected ? 'white' : '#1f2937',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      padding: '10px 12px'
                                    })
                                  }}
                                />
                              </div>
                            </div>
                            <div className="col-12 col-md-4 mb-3">
                              <div className="form-group local-forms">
                                <label>Estado del contrato</label>
                                <ReactSelect
                                  placeholder="Seleccionar estado"
                                  isClearable
                                  value={selectedEstado ? { value: selectedEstado, label: selectedEstado.charAt(0).toUpperCase() + selectedEstado.slice(1) } : null}
                                  onChange={(option) => handleEstadoChange(option?.value)}
                                  options={[
                                    { value: 'activo', label: 'Activo' },
                                    { value: 'inactivo', label: 'Inactivo' },
                                    { value: 'finalizado', label: 'Finalizado' },
                                    { value: 'cancelado', label: 'Cancelado' }
                                  ]}
                                  classNamePrefix="select"
                                  noOptionsMessage={() => "No hay estados disponibles"}
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      backgroundColor: 'white',
                                      borderColor: '#e2e8f0',
                                      borderWidth: '1px',
                                      borderRadius: '8px',
                                      minHeight: '45px',
                                      cursor: 'pointer',
                                      boxShadow: 'none',
                                      '&:hover': {
                                        borderColor: '#3b82f6'
                                      }
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: '#6b7280',
                                      fontSize: '14px'
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: '#1f2937',
                                      fontSize: '14px'
                                    }),
                                    input: (provided) => ({
                                      ...provided,
                                      color: '#1f2937',
                                      fontSize: '14px'
                                    }),
                                    valueContainer: (provided) => ({
                                      ...provided,
                                      padding: '8px 12px'
                                    }),
                                    indicatorSeparator: () => ({
                                      display: 'none'
                                    }),
                                    dropdownIndicator: (provided) => ({
                                      ...provided,
                                      color: '#6b7280',
                                      '&:hover': {
                                        color: '#374151'
                                      }
                                    }),
                                    clearIndicator: (provided) => ({
                                      ...provided,
                                      color: '#6b7280',
                                      '&:hover': {
                                        color: '#374151'
                                      }
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      borderRadius: '8px',
                                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                      border: '1px solid #e5e7eb',
                                      zIndex: 9999
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: state.isSelected 
                                        ? '#3b82f6' 
                                        : state.isFocused 
                                        ? '#eff6ff' 
                                        : 'white',
                                      color: state.isSelected ? 'white' : '#1f2937',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      padding: '10px 12px'
                                    })
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-12 d-flex justify-content-between align-items-center">
                              <div className="text-muted">
                                <small>
                                  Mostrando {filteredContratos.length} de {contratos.length} contratos
                                  {(selectedInmueble || selectedPiso || selectedEstado || searchText) && 
                                    <span className="text-primary"> (filtros aplicados)</span>
                                  }
                                </small>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={handleLimpiarFiltros}
                                disabled={!selectedInmueble && !selectedPiso && !selectedEstado && !searchText}
                              >
                                <i className="fas fa-undo me-1"></i> Limpiar filtros
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  {/* /Filtros */}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center my-4">
                      <Spin tip="Cargando datos..." />
                    </div>
                  ) : (
                    <div className="table-responsive doctor-list">
                      <Table
                        pagination={{
                          total: filteredContratos.length,
                          showTotal: (total, range) =>
                            `Mostrando ${range[0]} de ${range[1]} de ${total} registros`,
                          pageSize: 10,
                          
                        }}
                        columns={columns}
                        dataSource={filteredContratos}
                        rowKey="id"
                        loading={loading}
                        rowSelection={rowSelection}
                        scroll={{ x: 'max-content' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ver Detalles */}
      <Modal
        title="Detalles del Contrato"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setContratoSeleccionado(null);
          setDocumentoExistente(null);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setViewModalVisible(false);
              setContratoSeleccionado(null);
              setDocumentoExistente(null);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Cerrar
          </Button>
        ]}
        width={800}
        destroyOnClose={true}
        centered
      >
        {contratoSeleccionado && (
          <div className="contrato-details">
            <div className="row">
              <div className="col-md-6">
                <h4>Información del Inquilino</h4>
                <p><strong>Nombre:</strong> {contratoSeleccionado.inquilino_nombre} {contratoSeleccionado.inquilino_apellido}</p>
                <p><strong>DNI:</strong> {contratoSeleccionado.inquilino_dni || 'No especificado'}</p>
                <p><strong>Email:</strong> {contratoSeleccionado.inquilino_email || 'No especificado'}</p>
                <p><strong>Teléfono:</strong> {contratoSeleccionado.inquilino_telefono || 'No especificado'}</p>
              </div>
              <div className="col-md-6">
                <h4>Información del Espacio</h4>
                <p><strong>Inmueble:</strong> {contratoSeleccionado.inmueble_nombre}</p>
                <p><strong>Espacio:</strong> {contratoSeleccionado.espacio_nombre}</p>
                <p><strong>Descripción:</strong> {contratoSeleccionado.espacio_descripcion || 'No especificada'}</p>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-6">
                <h4>Detalles del Contrato</h4>
                <p><strong>Estado:</strong> <span className={`text-${
                  contratoSeleccionado.estado === 'activo' ? 'success' : 
                  contratoSeleccionado.estado === 'inactivo' ? 'warning' : 
                  contratoSeleccionado.estado === 'cancelado' ? 'secondary' : 
                  'danger'
                }`}>{contratoSeleccionado.estado}</span></p>
                <p><strong>Fecha Inicio:</strong> {new Date(contratoSeleccionado.fecha_inicio).toLocaleDateString()}</p>
                <p><strong>Fecha Fin:</strong> {new Date(contratoSeleccionado.fecha_fin).toLocaleDateString()}</p>
                <p><strong>Fecha Pago:</strong> {new Date(contratoSeleccionado.fecha_pago).toLocaleDateString()}</p>
              </div>
              <div className="col-md-6">
                <h4>Información Financiera</h4>
                <p><strong>Monto Alquiler:</strong> S/ {parseFloat(contratoSeleccionado.monto_alquiler).toFixed(2)}</p>
                <p><strong>Monto Garantía:</strong> S/ {parseFloat(contratoSeleccionado.monto_garantia).toFixed(2)}</p>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12">
                <h4>Documentos</h4>
                {loadingDoc ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Buscando documento...</p>
                  </div>
                ) : documentoExistente ? (
                  <div className="document-container p-3 border rounded">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="document-info d-flex align-items-center">
                        <span className="document-icon me-3">
                          <FiFileText size={24} className="text-primary" />
                        </span>
                        <span className="document-name">
                          {documentoExistente.nombre}
                          {documentoError && (
                            <span className="text-danger ms-2">(No disponible)</span>
                          )}
                        </span>
                      </div>
                      <div className="document-actions">
                        <Button
                          type="default"
                          icon={<FiDownload className="me-1" />}
                          onClick={() => handleDownloadDocument(documentoExistente.key, documentoExistente.nombre)}
                          className="me-2"
                          disabled={documentoError}
                        >
                          Descargar
                        </Button>
                        <Button
                          type="primary"
                          icon={<FiEye className="me-1" />}
                          onClick={() => handleViewDocument(documentoExistente.key)}
                          disabled={documentoError}
                        >
                          Ver documento
                        </Button>
                      </div>
                    </div>
                    
                    {documentoError && (
                      <div className="alert alert-warning mt-3">
                        <p className="mb-0">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          El documento no se encuentra disponible en estos momentos.
                        </p>
                        <p className="small mb-0 mt-2">
                          Esto puede deberse a que:
                        </p>
                        <ul className="small mb-0">
                          <li>El documento fue eliminado o movido</li>
                          <li>No tienes permisos para acceder al documento</li>
                          <li>La ruta del documento es incorrecta</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <p className="mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      No hay documentos asociados a este contrato.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sección para subir nuevo documento */}
            {/* <div className="row mt-4">
              <div className="col-12">
                <h4>Subir Nuevo Documento</h4>
                <div className="form-group">
                  <label>Seleccionar archivo PDF:</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <small className="form-text text-muted">
                    Solo se permiten archivos PDF (máx. 5MB)
                  </small>
                </div>
                <Button
                  type="primary"
                  icon={<FiUpload className="me-1" />}
                  loading={uploadingDocument}
                  onClick={handleUploadAndActivate}
                  disabled={!selectedFile}
                  className="mt-2"
                >
                  Subir Documento
                </Button>
              </div>
            </div> */}
            
            {contratoSeleccionado.descripcion && (
              <div className="row mt-4">
                <div className="col-12">
                  <h4>Observaciones</h4>
                  <p>{contratoSeleccionado.descripcion}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Contrato"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancelar
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loadingSave}
            onClick={handleSaveEdit}
          >
            Guardar Cambios
          </Button>
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="monto_alquiler"
            label="Monto de Alquiler"
            rules={[{ required: true, message: 'Por favor ingrese el monto de alquiler' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="monto_garantia"
            label="Monto de Garantía"
            rules={[{ required: true, message: 'Por favor ingrese el monto de garantía' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="fechas"
            label="Período del Contrato"
            rules={[{ required: true, message: 'Por favor seleccione el período del contrato' }]}
          >
            <RangePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
            />
          </Form.Item>
          <Form.Item
            name="fecha_pago"
            label="Fecha de Pago Mensual"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de pago' }]}
          >
            <AntDatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
            />
          </Form.Item>
          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
          >
            <Select>
              <Select.Option value="activo">Activo</Select.Option>
              <Select.Option value="inactivo">Inactivo</Select.Option>
              <Select.Option value="finalizado">Finalizado</Select.Option>
              <Select.Option value="cancelado">Cancelado</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Observaciones"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para subir contrato firmado */}
      <Modal
        title="Subir Contrato Firmado"
        open={modalUploadVisible}
        onCancel={() => {
          setModalUploadVisible(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setModalUploadVisible(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={loadingUpload}
            onClick={handleUploadAndActivate}
          >
            Subir y Activar
          </Button>
        ]}
      >
        <div className="form-group">
          <label>Seleccionar archivo PDF del contrato firmado:</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <small className="form-text text-muted">
            Solo se permiten archivos PDF. El contrato debe estar firmado por todas las partes.
          </small>
        </div>
        
        {documentoExistente && (
          <div className="alert alert-info mt-3">
            <p className="mb-0">
              <FiFileText className="me-2" />
              Documento actual: <strong>{documentoExistente.nombre}</strong>
            </p>
            <small>Para reemplazarlo, suba un nuevo archivo</small>
          </div>
        )}
      </Modal>

      {/* Modal de éxito */}
      <Modal
        title="¡Actualización Exitosa!"
        open={showSuccessModal}
        onOk={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
        okText="Aceptar"
        cancelButtonProps={{ style: { display: 'none' } }}
        centered
      >
        <div>
          <p>El contrato se ha actualizado correctamente con los siguientes datos:</p>
          {updatedData && (
            <ul style={{ listStyleType: 'none', padding: '10px' }}>
              <li><strong>Inquilino:</strong> {updatedData.inquilino_nombre} {updatedData.inquilino_apellido}</li>
              <li><strong>Inmueble:</strong> {updatedData.inmueble_nombre}</li>
              <li><strong>Espacio:</strong> {updatedData.espacio_nombre}</li>
              <li><strong>Monto Alquiler:</strong> S/ {parseFloat(updatedData.monto_alquiler).toFixed(2)}</li>
              <li><strong>Monto Garantía:</strong> S/ {parseFloat(updatedData.monto_garantia).toFixed(2)}</li>
              <li><strong>Fecha Inicio:</strong> {updatedData.fecha_inicio}</li>
              <li><strong>Fecha Fin:</strong> {updatedData.fecha_fin}</li>
              <li><strong>Fecha de Pago:</strong> {updatedData.fecha_pago}</li>
              <li><strong>Estado:</strong> {updatedData.estado}</li>
              {updatedData.descripcion && <li><strong>Observaciones:</strong> {updatedData.descripcion}</li>}
            </ul>
          )}
        </div>
      </Modal>
      
      {/* Modal de Cancelación de Contrato */}
      <Modal
        title={<div className="text-danger"><i className="fas fa-times-circle me-2"></i>Cancelar Contrato</div>}
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          setContratoACancelar(null);
          setPagosCancelacion([]);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setCancelModalVisible(false);
              setContratoACancelar(null);
              setPagosCancelacion([]);
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={loadingCancelacion}
            onClick={handleConfirmarCancelacion}
          >
            Confirmar Cancelación
          </Button>
        ]}
        width={800}
        destroyOnClose={true}
        centered
      >
        {contratoACancelar && (
          <div>
            <div className="alert alert-warning mb-4">
              <h5 className="alert-heading">
                <i className="fas fa-exclamation-triangle me-2"></i>
                ¡Atención! Esta acción no se puede deshacer
              </h5>
              <p className="mb-0">
                Al cancelar este contrato, automáticamente se cancelarán todos los pagos pendientes asociados.
                El espacio quedará disponible para nuevos inquilinos.
              </p>
            </div>

            <div className="contract-info mb-4">
              <h6>Información del Contrato:</h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Inquilino:</strong> {contratoACancelar.inquilino_nombre} {contratoACancelar.inquilino_apellido}</p>
                  <p><strong>Inmueble:</strong> {contratoACancelar.inmueble_nombre}</p>
                  <p><strong>Espacio:</strong> {contratoACancelar.espacio_nombre}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Estado Actual:</strong> <span className="text-capitalize">{contratoACancelar.estado}</span></p>
                  <p><strong>Monto Alquiler:</strong> S/ {parseFloat(contratoACancelar.monto_alquiler || 0).toFixed(2)}</p>
                  <p><strong>Período:</strong> {new Date(contratoACancelar.fecha_inicio).toLocaleDateString()} - {new Date(contratoACancelar.fecha_fin).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="payments-info">
              <h6>Pagos Asociados al Contrato:</h6>
              {loadingPagosCancelacion ? (
                <div className="text-center p-4">
                  <Spin tip="Cargando pagos..." />
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Se encontraron {pagosCancelacion.length} pago(s) asociado(s) a este contrato
                    </small>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha Pago</th>
                          <th>Monto</th>
                          <th>Estado</th>
                          <th>Tipo</th>
                          <th>Método Pago</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosCancelacion.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted">
                              No hay pagos asociados a este contrato
                            </td>
                          </tr>
                        ) : (
                          pagosCancelacion.map((pago, index) => (
                            <tr key={pago.id || index}>
                              <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : 'N/A'}</td>
                              <td>S/ {parseFloat(pago.monto || 0).toFixed(2)}</td>
                              <td>
                                <span className={`badge ${
                                  pago.estado === 'pendiente' ? 'bg-warning text-dark' :
                                  pago.estado === 'pagado' ? 'bg-success' :
                                  pago.estado === 'vencido' ? 'bg-danger' :
                                  pago.estado === 'cancelado' ? 'bg-secondary' : 'bg-light text-dark'
                                }`}>
                                  {pago.estado || 'Sin estado'}
                                </span>
                              </td>
                              <td>{pago.tipo_pago || 'alquiler'}</td>
                              <td>{pago.metodo_pago || 'N/A'}</td>
                              <td>
                                {(pago.estado === 'pendiente' || pago.estado === 'vencido') ? (
                                  <span className="text-danger">
                                    <i className="fas fa-times-circle me-1"></i>
                                    Se cancelará
                                  </span>
                                ) : pago.estado === 'pagado' ? (
                                  <span className="text-success">
                                    <i className="fas fa-check-circle me-1"></i>
                                    Mantendrá estado
                                  </span>
                                ) : pago.estado === 'cancelado' ? (
                                  <span className="text-secondary">
                                    <i className="fas fa-ban me-1"></i>
                                    Ya cancelado
                                  </span>
                                ) : (
                                  <span className="text-muted">Sin cambios</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {pagosCancelacion.filter(p => p.estado === 'pendiente' || p.estado === 'vencido').length > 0 && (
              <div className="alert alert-info mt-3">
                <i className="fas fa-info-circle me-2"></i>
                Se cancelarán {pagosCancelacion.filter(p => p.estado === 'pendiente' || p.estado === 'vencido').length} pago(s) pendiente(s).
                Los pagos ya realizados mantendrán su estado.
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* Modal de Finalización de Contrato */}
      <Modal
        title={<div className="text-success"><i className="fas fa-flag-checkered me-2"></i>Finalizar Contrato</div>}
        open={finalizarModalVisible}
        onCancel={() => {
          setFinalizarModalVisible(false);
          setContratoAFinalizar(null);
          setPagosFinalizacion([]);
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setFinalizarModalVisible(false);
              setContratoAFinalizar(null);
              setPagosFinalizacion([]);
            }}
          >
            Cancelar
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={loadingFinalizar}
            onClick={handleConfirmarFinalizacion}
          >
            Confirmar Finalización
          </Button>
        ]}
        width={800}
        destroyOnClose={true}
        centered
      >
        {contratoAFinalizar && (
          <div>
            <div className="alert alert-success mb-4">
              <h5 className="alert-heading">
                <i className="fas fa-check-circle me-2"></i>
                Todos los pagos están al día
              </h5>
              <p className="mb-0">
                Este contrato está listo para ser finalizado. El espacio será liberado y estará disponible 
                para nuevos inquilinos.
              </p>
            </div>

            <div className="contract-info mb-4">
              <h6>Información del Contrato:</h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Inquilino:</strong> {contratoAFinalizar.inquilino_nombre} {contratoAFinalizar.inquilino_apellido}</p>
                  <p><strong>Inmueble:</strong> {contratoAFinalizar.inmueble_nombre}</p>
                  <p><strong>Espacio:</strong> {contratoAFinalizar.espacio_nombre}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Estado Actual:</strong> <span className="text-success text-capitalize">{contratoAFinalizar.estado}</span></p>
                  <p><strong>Monto Alquiler:</strong> S/ {parseFloat(contratoAFinalizar.monto_alquiler || 0).toFixed(2)}</p>
                  <p><strong>Período:</strong> {new Date(contratoAFinalizar.fecha_inicio).toLocaleDateString()} - {new Date(contratoAFinalizar.fecha_fin).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="payments-info">
              <h6>Historial de Pagos del Contrato:</h6>
              {loadingPagosFinalizacion ? (
                <div className="text-center p-4">
                  <Spin tip="Cargando pagos..." />
                </div>
              ) : (
                <div>
                  <div className="mb-2">
                    <small className="text-muted">
                      Total de pagos: {pagosFinalizacion.length} | 
                      Pagados: {pagosFinalizacion.filter(p => p.estado === 'pagado').length} |
                      Otros: {pagosFinalizacion.filter(p => p.estado !== 'pagado').length}
                    </small>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha Pago</th>
                          <th>Monto</th>
                          <th>Estado</th>
                          <th>Tipo</th>
                          <th>Método Pago</th>
                          <th>Fecha Real</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosFinalizacion.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted">
                              No hay pagos registrados para este contrato
                            </td>
                          </tr>
                        ) : (
                          pagosFinalizacion.map((pago, index) => (
                            <tr key={pago.id || index} className={pago.estado === 'pagado' ? 'table-success' : ''}>
                              <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : 'N/A'}</td>
                              <td>S/ {parseFloat(pago.monto || 0).toFixed(2)}</td>
                              <td>
                                <span className={`badge ${
                                  pago.estado === 'pagado' ? 'bg-success' :
                                  pago.estado === 'pendiente' ? 'bg-warning text-dark' :
                                  pago.estado === 'vencido' ? 'bg-danger' :
                                  pago.estado === 'cancelado' ? 'bg-secondary' : 'bg-light text-dark'
                                }`}>
                                  {pago.estado || 'Sin estado'}
                                </span>
                              </td>
                              <td>{pago.tipo_pago || 'alquiler'}</td>
                              <td>{pago.metodo_pago || 'N/A'}</td>
                              <td>{pago.fecha_real_pago ? new Date(pago.fecha_real_pago).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="alert alert-info mt-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Al finalizar este contrato:</strong>
              <ul className="mb-0 mt-2">
                <li>El contrato cambiará a estado "finalizado"</li>
                <li>El espacio "{contratoAFinalizar.espacio_nombre}" será liberado</li>
                <li>Los pagos realizados mantendrán su historial</li>
                <li>Esta acción no se puede deshacer</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Estilos adicionales para documentos y selects */}
      <style>{`
        .document-container {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
        }
        
        .document-info {
          display: flex;
          align-items: center;
        }
        
        .document-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .document-name {
          font-weight: 500;
        }
        
        .document-actions {
          display: flex;
          gap: 10px;
        }
        
        .upload-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        /* Estilos adicionales para ReactSelect - Solo lo esencial */
        .select__control {
          box-shadow: none !important;
          border-radius: 8px !important;
        }

        .select__control:focus,
        .select__control:focus-within {
          box-shadow: none !important;
          border-color: #3b82f6 !important;
        }

        .select__menu {
          z-index: 9999 !important;
        }
      `}</style>
    </>
  );
};

const ContratoRegistros = () => {
  return (
    <App>
      <ContratoRegistrosContent />
    </App>
  );
};

export default ContratoRegistros;