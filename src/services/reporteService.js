import api from './api';

// Clase que maneja los servicios de reportes
class ReporteService {
    // Obtener todos los reportes
    async obtenerTodos() {
        try {
            const response = await api.get('/reportes');
            return response.data;
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    }

    // Obtener un reporte por ID
    async obtenerPorId(id) {
        try {
            const response = await api.get(`/reportes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener reporte con ID ${id}:`, error);
            throw error;
        }
    }

    // Crear un reporte
    async crear(reporte) {
        try {
            const response = await api.post('/reportes', reporte);
            return response.data;
        } catch (error) {
            console.error('Error al crear reporte:', error);
            throw error;
        }
    }

    // Actualizar un reporte
    async actualizar(id, reporte) {
        try {
            const response = await api.put(`/reportes/${id}`, reporte);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar reporte con ID ${id}:`, error);
            throw error;
        }
    }

    // Eliminar un reporte
    async eliminar(id) {
        try {
            const response = await api.delete(`/reportes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar reporte con ID ${id}:`, error);
            throw error;
        }
    }

    // Generar reporte de pagos con filtros
    async generarReportePagos(filtros = {}) {
        try {
            // Convertir los filtros a parámetros de URL
            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await api.get(`/reportes/generar/pagos?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al generar reporte de pagos:', error);
            throw error;
        }
    }

    // Generar reporte de gastos con filtros
    async generarReporteGastos(filtros = {}) {
        try {
            // Convertir los filtros a parámetros de URL
            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
                    params.append(key, filtros[key]);
                }
            });

            const response = await api.get(`/reportes/generar/gastos?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error al generar reporte de gastos:', error);
            throw error;
        }
    }

    // Dashboard - Obtener todos los datos en una sola llamada
    async obtenerDatosDashboard() {
        try {
            const response = await api.get('/reportes/dashboard/completo');
            return response.data;
        } catch (error) {
            console.error('Error al obtener datos del dashboard:', error);
            throw error;
        }
    }

    // Obtener estadísticas generales para el dashboard
    async obtenerEstadisticasGenerales() {
        try {
            const response = await api.get('/reportes/estadisticas/generales');
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas generales:', error);
            throw error;
        }
    }

    // Dashboard - Total de inquilinos por mes
    async obtenerInquilinosPorMes() {
        try {
            const response = await api.get('/reportes/dashboard/inquilinos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener total de inquilinos por mes:', error);
            throw error;
        }
    }

    // Dashboard - Espacios disponibles vs ocupados
    async obtenerEspaciosDisponiblesVsOcupados() {
        try {
            const response = await api.get('/reportes/dashboard/espacios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener espacios disponibles vs ocupados:', error);
            throw error;
        }
    }

    // Dashboard - Ingresos mensuales
    async obtenerIngresosMensuales() {
        try {
            const response = await api.get('/reportes/dashboard/ingresos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener ingresos mensuales:', error);
            throw error;
        }
    }

    // Dashboard - Gastos mensuales
    async obtenerGastosMensuales() {
        try {
            const response = await api.get('/reportes/dashboard/gastos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener gastos mensuales:', error);
            throw error;
        }
    }

    // Dashboard - Contratos activos vs mes anterior
    async obtenerContratosActivos() {
        try {
            const response = await api.get('/reportes/dashboard/contratos-activos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener contratos activos:', error);
            throw error;
        }
    }

    // Dashboard - Tasa de ocupación por inmueble
    async obtenerTasaOcupacion() {
        try {
            const response = await api.get('/reportes/dashboard/ocupacion');
            return response.data;
        } catch (error) {
            console.error('Error al obtener tasa de ocupación:', error);
            throw error;
        }
    }

    // Dashboard - Contratos por vencer
    async obtenerContratosPorVencer() {
        try {
            const response = await api.get('/reportes/dashboard/contratos-por-vencer');
            return response.data;
        } catch (error) {
            console.error('Error al obtener contratos por vencer:', error);
            throw error;
        }
    }

    // Dashboard - Pagos pendientes vs pagados por mes
    async obtenerPagosPendientesVsPagados() {
        try {
            const response = await api.get('/reportes/dashboard/pagos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener pagos pendientes vs pagados:', error);
            throw error;
        }
    }

    // Dashboard - Contratos vencidos vs renovados por mes
    async obtenerContratosVencidosVsRenovados() {
        try {
            const response = await api.get('/reportes/dashboard/contratos-renovados');
            return response.data;
        } catch (error) {
            console.error('Error al obtener contratos vencidos vs renovados:', error);
            throw error;
        }
    }
}

const reporteService = new ReporteService();
export default reporteService; 