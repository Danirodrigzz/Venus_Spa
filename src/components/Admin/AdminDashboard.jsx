import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Users, Calendar, CheckCircle, XCircle, Clock, TrendingUp, Activity, Search, LayoutDashboard,
    Settings, LogOut, Bell, MoreVertical, Plus, Filter, Download, UserPlus, MessageSquare,
    Mail, Edit2, Trash2, ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Menu, X, FileText, Wallet, Receipt, Shield,
    Globe, Lock, User, Phone, MapPin, Check, DollarSign, Save, Type, AlignLeft, Sparkle, Eye, EyeOff,
    Flower2, Wind, Heart, Waves, Zap, Flame
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminDashboard.css';

// Admin Dashboard - Updated v2.0

const COLORS = ['#AC6D39', '#C58B5F', '#DBC7BB', '#4A3E37', '#7A6F68'];

const AdminIconMap = {
    'Flower2': <Flower2 size={16} />,
    'Flame': <Flame size={16} />,
    'Zap': <Zap size={16} />,
    'Activity': <Activity size={16} />,
    'Waves': <Waves size={16} />,
    'Sparkle': <Sparkle size={16} />,
    'Heart': <Heart size={16} />,
    'Wind': <Wind size={16} />,
};

const CustomSelect = ({ value, options, onChange, placeholder = "Seleccionar", width = "100%" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderOption = (val) => {
        const icon = AdminIconMap[val];
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon && <span style={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>{icon}</span>}
                <span>{val}</span>
            </div>
        );
    };

    return (
        <div className="custom-select-wrapper" ref={ref} style={{ width }}>
            <div
                className="custom-select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                {renderOption(value || placeholder)}
                <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>
            {isOpen && (
                <div className="custom-select-options">
                    {options.map(option => (
                        <div
                            key={option}
                            className={`custom-option ${value === option ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {renderOption(option)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminDashboard = ({ onLogout, isResetting, onResetComplete }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientList, setClientList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [appointmentFilter, setAppointmentFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [showNewAppModal, setShowNewAppModal] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newApp, setNewApp] = useState({ nombre: '', servicio: '', fecha: '', hora: '', mensaje: '' });
    const [newClient, setNewClient] = useState({ nombre: '', status: 'Nuevo' });
    const [openFilter, setOpenFilter] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chartPeriod, setChartPeriod] = useState('Últimos 7 días');
    const [dbServices, setDbServices] = useState([]);

    // Expenses States
    const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [expenseSearch, setExpenseSearch] = useState('');
    const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('Todas');
    const [expenseFilterDropdownOpen, setExpenseFilterDropdownOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(isResetting);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Services Management States
    const [showNewServiceModal, setShowNewServiceModal] = useState(false);
    const [showEditServiceModal, setShowEditServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [newService, setNewService] = useState({ title: '', description: '', price: 0, icon_name: 'Sparkle', show_price: true });
    const [newExpense, setNewExpense] = useState({ concepto: '', categoria: 'Suministros', monto: '', fecha: new Date().toISOString().split('T')[0] });
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeSettingsSection, setActiveSettingsSection] = useState('general');
    const [settings, setSettings] = useState({
        spaName: 'Venus Elegant Spa',
        phone: '04241145565',

        address: 'Calle Primavera #45, Santo Domingo',
        openingHour: '09:00',
        closingHour: '19:00',
        appointmentsInterval: '60 min',
        currency: 'USD',
        notificationsEnabled: true,
        autoApprove: false
    });
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const notificationRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Función para calcular tiempo relativo
    const getRelativeTime = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins === 1) return 'Hace 1 minuto';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;
        if (diffHours === 1) return 'Hace 1 hora';
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        if (diffDays === 1) return 'Hace 1 día';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            setLoading(true);

            // Verificar que tengamos una sesión activa
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Session antes de actualizar contraseña:', session);

            if (!session) {
                throw new Error('No hay sesión activa. Por favor vuelve a solicitar el enlace de recuperación.');
            }

            const { data, error } = await supabase.auth.updateUser({ password: newPassword });

            console.log('Resultado de updateUser:', { data, error });

            if (error) {
                // Traducir mensajes de error de Supabase al español
                let errorMessage = error.message;
                if (errorMessage.includes('New password should be different')) {
                    errorMessage = 'La nueva contraseña debe ser diferente de la anterior';
                } else if (errorMessage.includes('Password should be')) {
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                } else if (errorMessage.includes('session')) {
                    errorMessage = 'La sesión ha expirado. Por favor solicita un nuevo enlace de recuperación.';
                }
                throw new Error(errorMessage);
            }

            if (!data?.user) {
                throw new Error('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
            }

            console.log('Contraseña actualizada correctamente para email:', data.user.email);

            showToast('✅ Contraseña actualizada con éxito. Ya puedes usar el panel.');
            setShowResetModal(false);
            setNewPassword('');

            // Limpiar el parámetro de recovery de la URL sin recargar
            window.history.replaceState({}, '', '/#/admin');

            // Llamar onResetComplete para limpiar el estado isResetting
            onResetComplete();
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isResetting) setShowResetModal(true);
    }, [isResetting]);

    useEffect(() => {
        fetchAllData();
    }, []);

    // Actualizar notificaciones cada minuto para tiempo real
    useEffect(() => {
        const interval = setInterval(() => {
            // Forzar re-render de notificaciones actualizando el estado
            setNotifications(prev => [...prev]);
        }, 60000); // 60 segundos

        return () => clearInterval(interval);
    }, []);


    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAppointments(),
                fetchSettings(),
                fetchExpenses(),
                fetchNotifications(),
                fetchServicesList()
            ]);
        } catch (error) {
            console.error('Error fetching all data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServicesList = async () => {
        const { data } = await supabase.from('services').select('*').order('id', { ascending: true });
        if (data) {
            setDbServices(data);
            if (!newApp.servicio && data.length > 0) {
                setNewApp(prev => ({ ...prev, servicio: data[0].title }));
            }
        }
    };

    const fetchAppointments = async () => {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                services (title, price)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const formatted = data.map(app => ({
                id: app.id,
                nombre: app.client_name,
                servicio: app.services?.title || 'Personalizado',
                precio: app.services?.price || 0,
                fecha: app.date,
                hora: app.time,
                status: app.status,
                mensaje: app.message
            }));
            setAppointments(formatted);

            // Derive client list from appointments - SOLO clientes con citas aprobadas o completadas
            const clientsMap = {};
            formatted.forEach(app => {
                // FILTRO: Solo contar si la cita está aprobada o completada
                const isApproved = app.status === 'aprobada' || app.status === 'completada';

                if (!clientsMap[app.nombre]) {
                    clientsMap[app.nombre] = {
                        id: app.nombre,
                        nombre: app.nombre,
                        visitas: 0,
                        totalGastado: 0, // Ahora es número
                        ultimaVisita: app.fecha,
                        status: 'Nuevo',
                        hasApprovedAppointment: false,
                        servicios: [] // Lista de servicios únicos
                    };
                }

                // Solo contar visitas aprobadas/completadas
                if (isApproved) {
                    clientsMap[app.nombre].visitas++;
                    clientsMap[app.nombre].hasApprovedAppointment = true;

                    // Sumar al total solo si está completada
                    if (app.status === 'completada') {
                        clientsMap[app.nombre].totalGastado += app.precio;
                    }

                    // Agregar servicio a la lista si no está
                    if (!clientsMap[app.nombre].servicios.includes(app.servicio)) {
                        clientsMap[app.nombre].servicios.push(app.servicio);
                    }

                    // Actualizar última visita solo si es aprobada
                    if (app.fecha > clientsMap[app.nombre].ultimaVisita) {
                        clientsMap[app.nombre].ultimaVisita = app.fecha;
                    }
                }

                // Actualizar categoría basado en visitas aprobadas
                if (clientsMap[app.nombre].visitas > 10) clientsMap[app.nombre].status = 'VIP';
                else if (clientsMap[app.nombre].visitas > 3) clientsMap[app.nombre].status = 'Frecuente';
            });

            // FILTRAR: Solo clientes con al menos una cita aprobada
            const approvedClients = Object.values(clientsMap).filter(client => client.hasApprovedAppointment);
            setClientList(approvedClients);
        }
    };

    const fetchSettings = async () => {
        const { data, error } = await supabase.from('settings').select('*').single();
        if (!error && data) {
            setSettings({
                ...data,
                spaName: data.spa_name,
                openingHour: data.opening_hour,
                closingHour: data.closing_hour,
                appointmentsInterval: data.appointments_interval,
                notificationsEnabled: data.notifications_enabled,
                autoApprove: data.auto_approve
            });
        }
    };

    const fetchExpenses = async () => {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data) {
            const formatted = data.map(exp => ({
                id: exp.id,
                concepto: exp.concept,
                categoria: exp.category,
                monto: exp.amount,
                fecha: exp.date
            }));
            setExpenses(formatted);
        }
    };

    const fetchNotifications = () => {
        const alerts = [];

        // Citas pendientes con timestamp real
        const pendingApps = appointments.filter(a => a.status === 'pending' || a.status === 'pendiendo');
        if (pendingApps.length > 0) {
            // Usa la fecha más reciente de las citas pendientes
            const mostRecentPending = pendingApps.reduce((latest, app) => {
                const appDate = new Date(app.fecha + 'T' + app.hora);
                const latestDate = new Date(latest.fecha + 'T' + latest.hora);
                return appDate > latestDate ? app : latest;
            });
            const timestamp = new Date(mostRecentPending.fecha + 'T' + mostRecentPending.hora);

            alerts.push({
                id: 'pending-alert',
                text: `Tienes ${pendingApps.length} cita(s) pendiente(s) de aprobar.`,
                timestamp: timestamp.toISOString(),
                unread: true
            });
        }

        // Gastos altos recientes con timestamp real
        if (expenses.length > 0 && expenses[0].date === new Date().toISOString().split('T')[0]) {
            const expenseTimestamp = new Date(expenses[0].date);
            alerts.push({
                id: 'new-expense',
                text: `Se registró un nuevo gasto hoy: ${expenses[0].concepto}`,
                timestamp: expenseTimestamp.toISOString(),
                unread: true
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                id: 1,
                text: 'Todo al día. No hay nuevas alertas.',
                timestamp: new Date().toISOString(),
                unread: false
            });
        }

        setNotifications(alerts);
    };

    useEffect(() => {
        fetchNotifications();
    }, [appointments, expenses]); // Recalcular notificaciones si cambian citas o gastos

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close notifications
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            // Close active More menus if click is outside
            if (activeMenu && !event.target.closest('.more-menu-container')) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu, showNotifications]);

    const handleLogout = () => {
        onLogout();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    const handleDeleteClick = (id, type, message = 'Esta acción no se puede deshacer.') => {
        setItemToDelete({ id, type, message });
        setShowDeleteModal(true);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            let error;
            if (itemToDelete.type === 'appointment') {
                const res = await supabase.from('appointments').delete().eq('id', itemToDelete.id);
                error = res.error;
                if (!error) setAppointments(appointments.filter(app => app.id !== itemToDelete.id));
            } else if (itemToDelete.type === 'client') {
                const res = await supabase.from('appointments').delete().eq('client_name', itemToDelete.id);
                error = res.error;
                if (!error) {
                    setAppointments(appointments.filter(app => app.nombre !== itemToDelete.id));
                    setClientList(clientList.filter(client => client.id !== itemToDelete.id));
                }
            } else if (itemToDelete.type === 'expense') {
                const res = await supabase.from('expenses').delete().eq('id', itemToDelete.id);
                error = res.error;
                if (!error) setExpenses(expenses.filter(e => e.id !== itemToDelete.id));
            } else if (itemToDelete.type === 'service') {
                const res = await supabase.from('services').delete().eq('id', itemToDelete.id);
                error = res.error;
                if (!error) setDbServices(dbServices.filter(s => s.id !== itemToDelete.id));
            }

            if (error) throw error;
            showToast('Eliminado correctamente');
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('Error al eliminar', 'error');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleEditClient = (client) => {
        setEditingClient({ ...client });
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const saveEditClient = () => {
        setClientList(clientList.map(c => c.id === editingClient.id ? editingClient : c));
        setShowEditModal(false);
        setEditingClient(null);
    };

    const handleCreateAppointment = async () => {
        try {
            const { data: services } = await supabase.from('services').select('id, title');
            const selectedService = services?.find(s => s.title === newApp.servicio);

            const { data, error } = await supabase
                .from('appointments')
                .insert([{
                    client_name: newApp.nombre,
                    service_id: selectedService?.id,
                    date: newApp.fecha,
                    time: newApp.hora,
                    message: newApp.mensaje,
                    status: 'pending'
                }])
                .select();

            if (error) throw error;

            fetchAppointments();
            setShowNewAppModal(false);
            setNewApp({ nombre: '', servicio: 'Masajes', fecha: '', hora: '', mensaje: '' });
            showToast('Cita creada con éxito');
        } catch (error) {
            console.error('Error creating app:', error);
            showToast('Error al crear cita', 'error');
        }
    };

    const handleCreateClient = () => {
        const id = clientList.length + 1;
        setClientList([...clientList, {
            ...newClient,
            id,
            visitas: 0,
            totalGastado: '$0',
            ultimaVisita: 'N/A'
        }]);
        setShowNewClientModal(false);
        setNewClient({ nombre: '', status: 'Nuevo' });
        showToast('Cliente registrado con éxito');
    };

    const handleFilterSelect = (type, value) => {
        if (type === 'appointment') setAppointmentFilter(value);
        else setClientFilter(value);
        setOpenFilter(null);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setAppointments(appointments.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
            showToast(`Estado actualizado: ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error al actualizar estado', 'error');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({
                    id: 1,
                    spa_name: settings.spaName,
                    phone: settings.phone,

                    address: settings.address,
                    opening_hour: settings.openingHour,
                    closing_hour: settings.closingHour,
                    appointments_interval: settings.appointmentsInterval,
                    notifications_enabled: settings.notificationsEnabled,
                    auto_approve: settings.autoApprove
                });

            if (error) throw error;
            showToast('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Error al guardar configuración', 'error');
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Configuración de encabezado corregida
        doc.setFontSize(22);
        doc.setTextColor(172, 109, 57); // Color --admin-primary
        doc.text('Venus Elegant Spa', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139); // Color --admin-text-muted
        doc.text('Informe General de Actividad', 105, 30, { align: 'center' });
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });

        // Tabla de Citas
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59); // Color --admin-text-main
        doc.text('Listado de Citas', 14, 55);

        const appointmentRows = filteredAppointments.map(app => [
            app.nombre,
            app.servicio,
            `${app.fecha} ${app.hora}`,
            app.status.toUpperCase()
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['Cliente', 'Servicio', 'Fecha y Hora', 'Estado']],
            body: appointmentRows,
            theme: 'grid',
            headStyles: { fillColor: [172, 109, 57] }, // --admin-primary
            styles: { fontSize: 9 }
        });

        // Tabla de Clientes (en una nueva página o a continuación)
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.text('Directorio de Clientes', 14, finalY);

        const clientRows = clientList.map(c => [
            c.nombre,
            c.visitas,
            c.totalGastado,
            c.status
        ]);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Nombre', 'Visitas', 'Gasto Total', 'Categoría']],
            body: clientRows,
            theme: 'striped',
            headStyles: { fillColor: [172, 109, 57] },
            styles: { fontSize: 9 }
        });

        doc.save(`Reporte_Venus_Spa_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const getServiceStats = () => {
        const services = {};
        appointments.forEach(a => {
            services[a.servicio] = (services[a.servicio] || 0) + 1;
        });
        return Object.keys(services).map(name => ({ name, value: services[name] }));
    };

    const getTimeStats = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const stats = days.map(day => ({ name: day, citas: 0 }));

        appointments.forEach(app => {
            const date = new Date(app.fecha);
            // Ajustar zona horaria si es necesario, pero new Date(string) suele funcionar bien para fechas YYYY-MM-DD
            // Nota: getDay() devuelve 0 para Domingo, 1 Lunes...
            if (!isNaN(date.getTime())) {
                stats[date.getDay()].citas += 1;
            }
        });

        // Reordenar para empezar en Lunes si se prefiere, o dejar Domingo primero
        return [...stats.slice(1), stats[0]]; // Lun a Dom
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.servicio.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = appointmentFilter === 'all' || app.status === appointmentFilter;
        return matchesSearch && matchesFilter;
    });

    // Render Dashboard Module
    const renderDashboard = () => (
        <>
            <div className="content-header">
                <div>
                    <h1>Panel de Control</h1>
                    <p>Bienvenido de nuevo, aquí tienes el resumen de hoy.</p>
                </div>
                <button className="btn-primary-admin" onClick={downloadPDF}>
                    <Download size={18} /> Descargar Informe
                </button>
            </div>

            <div className="stats-cards-grid">
                <div className="premium-stat-card">
                    <div className="stat-header">
                        <div className="icon-box blue"><Calendar size={24} /></div>
                        <span className="trend positive">+12%</span>
                    </div>
                    <div className="stat-body">
                        <h3>Total Citas</h3>
                        <h2>{stats.total}</h2>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-header">
                        <div className="icon-box green"><CheckCircle size={24} /></div>
                        <span className="trend positive">+5%</span>
                    </div>
                    <div className="stat-body">
                        <h3>Aprobadas</h3>
                        <h2>{stats.approved}</h2>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-header">
                        <div className="icon-box amber"><Clock size={24} /></div>
                        <span className="trend neutral">0%</span>
                    </div>
                    <div className="stat-body">
                        <h3>Pendientes</h3>
                        <h2>{stats.pending}</h2>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-header">
                        <div className="icon-box red"><XCircle size={24} /></div>
                        <span className="trend neutral">-</span>
                    </div>
                    <div className="stat-body">
                        <h3>Rechazadas</h3>
                        <h2>{stats.rejected}</h2>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-header">
                        <div className="icon-box rose"><TrendingUp size={24} /></div>
                        <span className="trend positive">+18%</span>
                    </div>
                    <div className="stat-body">
                        <h3>Ingresos Potenciales</h3>
                        <h2>{stats.potential_revenue}</h2>
                        <span className="trend positive">Solo citas aprobadas</span>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-header">
                        <div className="icon-box green"><Wallet size={24} /></div>
                        <span className="trend positive">En Caja</span>
                    </div>
                    <div className="stat-body">
                        <h3>Ingresos Reales</h3>
                        <h2>{stats.real_revenue}</h2>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card main-chart">
                    <div className="card-header">
                        <h3>Actividad de Citas</h3>
                        <div className="filter-dropdown-container">
                            <button
                                className={`filter-btn-premium ${openFilter === 'chart' ? 'active' : ''}`}
                                onClick={() => setOpenFilter(openFilter === 'chart' ? null : 'chart')}
                                style={{ padding: '0.4rem 1rem', borderRadius: '10px' }}
                            >
                                <span>{chartPeriod}</span>
                                <ChevronDown size={14} className={`chevron ${openFilter === 'chart' ? 'rotate' : ''}`} />
                            </button>

                            {openFilter === 'chart' && (
                                <div className="filter-menu-premium" style={{ width: '160px' }}>
                                    <button
                                        onClick={() => { setChartPeriod('Últimos 7 días'); setOpenFilter(null); }}
                                        className={chartPeriod === 'Últimos 7 días' ? 'selected' : ''}
                                    >
                                        Últimos 7 días
                                    </button>
                                    <button
                                        onClick={() => { setChartPeriod('Este mes'); setOpenFilter(null); }}
                                        className={chartPeriod === 'Este mes' ? 'selected' : ''}
                                    >
                                        Este mes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container-large">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={getTimeStats()}>
                                <defs>
                                    <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#AC6D39" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#AC6D39" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="citas" stroke="#AC6D39" strokeWidth={3} fillOpacity={1} fill="url(#colorCitas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-card side-chart">
                    <div className="card-header">
                        <h3>Servicios Destacados</h3>
                    </div>
                    <div className="chart-container-small">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={getServiceStats()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {getServiceStats().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            {getServiceStats().map((item, i) => (
                                <div key={i} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                    <span className="label">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Render Appointments Module
    const renderAppointments = () => (
        <>
            <div className="content-header">
                <div>
                    <h1>Gestión de Citas</h1>
                    <p>Visualiza y administra todas las reservas del spa.</p>
                </div>
                <div className="header-btns">
                    <div className="filter-dropdown-container">
                        <CustomSelect
                            value={appointmentFilter === 'all' ? 'Todas las Citas' :
                                appointmentFilter === 'pending' ? 'Pendiente' :
                                    appointmentFilter === 'aprobada' ? 'Aprobada' :
                                        appointmentFilter === 'completada' ? 'Completada' :
                                            appointmentFilter === 'rechazada' ? 'Rechazada' :
                                                appointmentFilter.charAt(0).toUpperCase() + appointmentFilter.slice(1)}
                            options={['Todas las Citas', 'Aprobada', 'Pendiente', 'Completada', 'Rechazada']}
                            onChange={(val) => handleFilterSelect('appointment',
                                val === 'Todas las Citas' ? 'all' :
                                    val === 'Pendiente' ? 'pending' :
                                        val === 'Aprobada' ? 'aprobada' :
                                            val === 'Completada' ? 'completada' :
                                                val === 'Rechazada' ? 'rechazada' : val.toLowerCase())}
                            width="200px"
                        />
                    </div>
                    <button className="btn-primary-admin" onClick={() => setShowNewAppModal(true)}>
                        <Plus size={18} /> Nueva Cita
                    </button>
                </div>
            </div>

            <div className="dashboard-card full-width">
                <div className="card-header">
                    <h3>Listado Completo</h3>
                    <div className="search-input-box">
                        <Search size={16} />
                        <input type="text" placeholder="Buscar citas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="action-legend" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div className="legend-item"><CheckCircle size={16} /> Aprobar</div>
                    <div className="legend-item"><Wallet size={16} /> Finalizar y Cobrar</div>
                    <div className="legend-item"><XCircle size={16} /> Rechazar</div>
                </div>
                <div className="table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Servicio</th>
                                <th>Fecha y Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((app) => (
                                <tr key={app.id}>
                                    <td data-label="Cliente">
                                        <div className="client-cell">
                                            <div className="avatar-small">{app.nombre.charAt(0)}</div>
                                            <div className="info">
                                                <strong>{app.nombre}</strong>
                                                <span>Socio Venus Spa</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Servicio"><span className="badge-service">{app.servicio}</span></td>
                                    <td data-label="Fecha / Hora">
                                        <div className="date-cell">
                                            <strong>{app.fecha}</strong>
                                            <span>{app.hora}</span>
                                        </div>
                                    </td>
                                    <td data-label="Estado">
                                        <span className={`status-pill ${app.status}`}>
                                            {(app.status === 'pending' || app.status === 'pendiendo') ? 'Pendiente' :
                                                app.status === 'completada' ? 'Completada' :
                                                    app.status === 'aprobada' ? 'Aprobada' :
                                                        app.status === 'rechazada' ? 'Rechazada' :
                                                            app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                    </td>
                                    <td data-label="Acciones">
                                        <div className="action-row">
                                            {app.status === 'rechazada' ? (
                                                <span style={{
                                                    color: '#94a3b8',
                                                    fontSize: '0.85rem',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Rechazada - Sin acciones
                                                </span>
                                            ) : (
                                                <>
                                                    {app.status !== 'completada' && (
                                                        <>
                                                            <button onClick={() => updateStatus(app.id, 'aprobada')} className="action-btn approve" data-tooltip="Aprobar Cita">
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button onClick={() => updateStatus(app.id, 'completada')} className="action-btn complete" data-tooltip="Finalizar y Cobrar" style={{ color: '#0369a1', background: '#e0f2fe' }}>
                                                                <Wallet size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button onClick={() => updateStatus(app.id, 'rechazada')} className="action-btn reject" data-tooltip="Rechazar Cita">
                                                        <XCircle size={18} />
                                                    </button>
                                                    <div className="more-menu-container">
                                                        <button
                                                            className={`action-btn more ${activeMenu === app.id ? 'active' : ''}`}
                                                            onClick={() => toggleMenu(app.id)}
                                                            data-tooltip="Más Opciones"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {activeMenu === app.id && (
                                                            <div className="more-dropdown">
                                                                <button className="dropdown-item" onClick={() => { setSelectedAppointment(app); setActiveMenu(null); }}>
                                                                    <Activity size={14} /> Ver Detalles
                                                                </button>
                                                                <button className="dropdown-item whatsapp" onClick={() => { window.open(`https://wa.me/18493164217`, '_blank'); setActiveMenu(null); }}>
                                                                    <MessageSquare size={14} /> WhatsApp
                                                                </button>
                                                                <button className="dropdown-item" onClick={() => { updateStatus(app.id, 'pending'); setActiveMenu(null); }}>
                                                                    <Clock size={14} /> Marcar como Pendiente
                                                                </button>
                                                                <div className="dropdown-divider"></div>
                                                                <button className="dropdown-item delete" onClick={() => handleDeleteClick(app.id, 'appointment')}>
                                                                    <XCircle size={14} /> Eliminar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    // Otros renders (Clients, Reports, Settings) - simplificados por espacio
    const renderClients = () => {
        const filteredClients = clientList.filter(client => {
            const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = clientFilter === 'all' || client.status === clientFilter;
            return matchesSearch && matchesFilter;
        });

        const renderClientRow = (client) => (
            <tr key={client.id}>
                <td data-label="Cliente">
                    <div className="client-cell">
                        <div className="avatar-small">{client.nombre.charAt(0)}</div>
                        <strong>{client.nombre}</strong>
                    </div>
                </td>

                <td data-label="Visitas"><strong>{client.visitas}</strong></td>
                <td data-label="Total Gastado">
                    <span className="revenue-text">
                        ${client.totalGastado.toFixed(2)}
                    </span>
                </td>
                <td data-label="Servicios">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {client.servicios && client.servicios.length > 0 ? (
                            client.servicios.slice(0, 2).map((servicio, idx) => (
                                <span
                                    key={idx}
                                    className="status-pill"
                                    style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        background: 'rgba(172, 109, 57, 0.1)',
                                        color: 'var(--primary)'
                                    }}
                                >
                                    {servicio}
                                </span>
                            ))
                        ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>
                        )}
                        {client.servicios && client.servicios.length > 2 && (
                            <span
                                className="status-pill"
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 8px',
                                    background: 'rgba(100, 116, 139, 0.1)',
                                    color: '#64748b'
                                }}
                            >
                                +{client.servicios.length - 2}
                            </span>
                        )}
                    </div>
                </td>
                <td data-label="Última Visita">{client.ultimaVisita}</td>
                <td data-label="Categoría">
                    <span className={`status-pill ${client.status.toLowerCase()}`}>
                        {client.status}
                    </span>
                </td>
                <td data-label="Acciones">
                    <div className="action-row">
                        <button className="action-btn" onClick={() => setSelectedClient(client)} title="Historial y Detalles">
                            <Activity size={18} />
                            <span className="mobile-label">Historial</span>
                        </button>
                        <div className="more-menu-container">
                            <button
                                className={`action-btn more ${activeMenu === `client-${client.id}` ? 'active' : ''}`}
                                onClick={() => toggleMenu(`client-${client.id}`)}
                                title="Más opciones"
                            >
                                <MoreVertical size={18} />
                                <span className="mobile-label">Opciones</span>
                            </button>

                            {activeMenu === `client-${client.id}` && (
                                <div className="more-dropdown">
                                    <button className="dropdown-item" onClick={() => handleEditClient(client)}>
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button className="dropdown-item whatsapp" onClick={() => { window.open(`https://wa.me/18493164217`, '_blank'); setActiveMenu(null); }}>
                                        <MessageSquare size={14} /> WhatsApp
                                    </button>

                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item delete" onClick={() => handleDeleteClick(client.id, 'client')}>
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </td>
            </tr>
        );

        return (
            <>
                <div className="content-header">
                    <div>
                        <h1>Directorio de Clientes</h1>
                        <p>Gestiona la relación con tus clientes y su historial.</p>
                    </div>
                    <div className="header-btns">
                        <div className="filter-dropdown-container">
                            <CustomSelect
                                value={clientFilter === 'all' ? 'Todos los Clientes' : clientFilter}
                                options={['Todos los Clientes', 'VIP', 'Frecuente', 'Nuevo']}
                                onChange={(val) => handleFilterSelect('client', val === 'Todos los Clientes' ? 'all' : val)}
                                width="200px"
                            />
                        </div>
                        <button className="btn-primary-admin" onClick={() => setShowNewClientModal(true)}>
                            <UserPlus size={18} /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                <div className="stats-cards-grid">
                    <div className="premium-stat-card">
                        <div className="stat-body">
                            <h3>Clientes VIP</h3>
                            <h2>{clientList.filter(c => c.status === 'VIP').length}</h2>
                        </div>
                    </div>
                    <div className="premium-stat-card">
                        <div className="stat-body">
                            <h3>Promedio Visitas</h3>
                            <h2>8.5</h2>
                        </div>
                    </div>
                    <div className="premium-stat-card">
                        <div className="stat-body">
                            <h3>Nuevos este mes</h3>
                            <h2>+12</h2>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card full-width">
                    <div className="card-header">
                        <h3>Clientes Registrados</h3>
                        <div className="search-input-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>

                                    <th>Visitas</th>
                                    <th>Total Gastado</th>
                                    <th>Servicios</th>
                                    <th>Última Visita</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(renderClientRow)}
                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No se encontraron clientes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        );
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowEditExpenseModal(true);
    };

    const saveEditExpense = async () => {
        try {
            const { error } = await supabase
                .from('expenses')
                .update({
                    concept: editingExpense.concepto,
                    category: editingExpense.categoria,
                    amount: editingExpense.monto,
                    date: editingExpense.fecha
                })
                .eq('id', editingExpense.id);

            if (error) throw error;

            setExpenses(expenses.map(e => e.id === editingExpense.id ? editingExpense : e));
            setShowEditExpenseModal(false);
            setEditingExpense(null);
            showToast('Gasto actualizado');
        } catch (error) {
            console.error('Error saving expense:', error);
            showToast('Error: ' + (error.message || 'No se pudo guardar'), 'error');
        }
    };

    const handleDeleteExpense = async (id) => {
        handleDeleteClick(id, 'expense', '¿Estás seguro de eliminar este gasto? No se podrá recuperar.');
    };

    const handleCreateExpense = async () => {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert([{
                    concept: newExpense.concepto,
                    category: newExpense.categoria,
                    amount: parseFloat(newExpense.monto),
                    date: newExpense.fecha
                }])
                .select();

            if (error) throw error;

            fetchExpenses();
            setShowNewExpenseModal(false);
            setNewExpense({ concepto: '', categoria: 'Suministros', monto: '', fecha: new Date().toISOString().split('T')[0] });
            showToast('Gasto registrado con éxito');
        } catch (error) {
            console.error('Error creating expense:', error);
            showToast('Error: ' + (error.message || 'No se pudo registrar el gasto'), 'error');
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.concepto.toLowerCase().includes(expenseSearch.toLowerCase());
        const matchesFilter = expenseCategoryFilter === 'Todas' || expense.categoria === expenseCategoryFilter;
        return matchesSearch && matchesFilter;
    });

    const handleEditService = (service) => {
        setEditingService(service);
        setShowEditServiceModal(true);
    };

    const saveEditService = async () => {
        if (!editingService?.id) return;
        try {
            const { error } = await supabase
                .from('services')
                .update({
                    title: editingService.title,
                    description: editingService.description,
                    price: parseFloat(editingService.price) || 0,
                    icon_name: editingService.icon_name,
                    show_price: editingService.show_price
                })
                .eq('id', editingService.id);

            if (error) throw error;

            await fetchServicesList();
            setShowEditServiceModal(false);
            setEditingService(null);
            showToast('Servicio actualizado');
        } catch (error) {
            console.error('Error saving service:', error);
            showToast('Error: ' + (error.message || 'No se pudo guardar'), 'error');
        }
    };

    const handleDeleteService = async (id) => {
        handleDeleteClick(id, 'service', '¿Estás seguro de eliminar este servicio? Esto puede afectar a los reportes de citas pasadas.');
    };

    const handleCreateService = async () => {
        try {
            const { error } = await supabase
                .from('services')
                .insert([{
                    title: newService.title,
                    description: newService.description,
                    price: parseFloat(newService.price) || 0,
                    icon_name: newService.icon_name,
                    show_price: newService.show_price
                }]);

            if (error) throw error;

            await fetchServicesList();
            setShowNewServiceModal(false);
            setNewService({ title: '', description: '', price: 0, icon_name: 'Sparkle', show_price: true });
            showToast('Nuevo servicio creado');
        } catch (error) {
            console.error('Error creating service:', error);
            showToast('Error: ' + (error.message || 'No se pudo crear'), 'error');
        }
    };

    const renderServices = () => (
        <>
            <div className="content-header">
                <div>
                    <h1>Gestión de Servicios</h1>
                    <p>Configura los masajes, precios y visibilidad.</p>
                </div>
                <button className="btn-primary-admin" onClick={() => setShowNewServiceModal(true)}>
                    <Plus size={18} /> Nuevo Servicio
                </button>
            </div>

            <div className="dashboard-card full-width">
                <div className="table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Estado Web</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dbServices.map((service) => (
                                <tr key={service.id}>
                                    <td data-label="Servicio">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="icon-box-small" style={{ background: 'rgba(172, 109, 57, 0.1)', color: '#AC6D39', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {AdminIconMap[service.icon_name] || AdminIconMap[service.icon] || <Sparkle size={16} />}
                                            </div>
                                            <strong>{service.title}</strong>
                                        </div>
                                    </td>
                                    <td data-label="Descripción" style={{ maxWidth: '300px' }} className="truncate-text">{service.description}</td>
                                    <td data-label="Precio"><strong>${service.price}</strong></td>
                                    <td data-label="Estado Web">
                                        <span className={`status-pill ${service.show_price ? 'approved' : 'pending'}`}>
                                            {service.show_price ? 'Precio Público' : 'Precio Privado'}
                                        </span>
                                    </td>
                                    <td data-label="Acciones">
                                        <div className="action-row">
                                            <button className="action-btn edit" onClick={() => handleEditService(service)} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteService(service.id)} title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const getFinancialData = () => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonthIdx = new Date().getMonth();

        // Solo mostramos los últimos 6 meses
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const m = (currentMonthIdx - i + 12) % 12;
            last6Months.push({
                name: months[m],
                monthIdx: m,
                ingresos: 0,
                gastos: 0
            });
        }

        // Sumar ingresos de citas aprobadas (y completadas)
        appointments.filter(a => a.status === 'aprobada' || a.status === 'completada').forEach(app => {
            const appDate = new Date(app.fecha);
            const appMonth = appDate.getMonth();
            const dataPoint = last6Months.find(d => d.monthIdx === appMonth);
            if (dataPoint) {
                const service = dbServices.find(s =>
                    s.title?.trim().toLowerCase() === app.servicio?.trim().toLowerCase()
                );
                dataPoint.ingresos += (service?.price || 0);
            }
        });

        // Sumar gastos
        expenses.forEach(exp => {
            const expDate = new Date(exp.fecha);
            const expMonth = expDate.getMonth();
            const dataPoint = last6Months.find(d => d.monthIdx === expMonth);
            if (dataPoint) {
                dataPoint.gastos += exp.monto || 0;
            }
        });

        return last6Months;
    };

    const renderExpenses = () => (
        <>
            <div className="content-header">
                <div>
                    <h1>Gestión de Gastos</h1>
                    <p>Controla y clasifica los egresos del spa.</p>
                </div>
                <button className="btn-primary-admin" onClick={() => setShowNewExpenseModal(true)}>
                    <Plus size={18} /> Nuevo Gasto
                </button>
            </div>

            <div className="expenses-controls">
                <div className="search-box-premium">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por concepto..."
                        value={expenseSearch}
                        onChange={(e) => setExpenseSearch(e.target.value)}
                    />
                </div>

                <CustomSelect
                    value={expenseCategoryFilter === 'Todas' ? 'Todas las Categorías' : expenseCategoryFilter}
                    options={['Todas', 'Suministros', 'Servicios', 'Alquiler', 'Marketing', 'Otros']}
                    onChange={setExpenseCategoryFilter}
                    width="220px"
                />
            </div>

            <div className="dashboard-card full-width">
                <div className="table-wrapper">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Categoría</th>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td data-label="Concepto"><strong>{expense.concepto}</strong></td>
                                    <td data-label="Categoría"><span className="badge-service" style={{ background: '#f1f5f9', color: '#64748b' }}>{expense.categoria}</span></td>
                                    <td data-label="Fecha">{expense.fecha}</td>
                                    <td data-label="Monto" style={{ color: '#ef4444', fontWeight: '700' }}>- ${expense.monto.toLocaleString()}</td>
                                    <td data-label="Acciones">
                                        <div className="action-row">
                                            <button className="action-btn edit" onClick={() => handleEditExpense(expense)} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteExpense(expense.id)} title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                        No se encontraron gastos que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Expense Modal */}
            {showEditExpenseModal && editingExpense && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal">
                        <h2>Editar Gasto</h2>
                        <div className="modal-form-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <div className="form-group-admin">
                                <label>Concepto</label>
                                <input
                                    className="premium-input-field"
                                    placeholder="Concepto del gasto"
                                    value={editingExpense.concepto}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, concepto: e.target.value })}
                                />
                            </div>
                            <div className="form-group-admin">
                                <label>Monto ($)</label>
                                <input
                                    type="number"
                                    className="premium-input-field"
                                    placeholder="0.00"
                                    value={editingExpense.monto}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, monto: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="form-group-admin">
                                <label>Categoría</label>
                                <CustomSelect
                                    value={editingExpense.categoria}
                                    options={['Suministros', 'Servicios', 'Alquiler', 'Marketing', 'Otros']}
                                    onChange={(val) => setEditingExpense({ ...editingExpense, categoria: val })}
                                />
                            </div>
                            <div className="form-group-admin">
                                <label>Fecha</label>
                                <input
                                    type="date"
                                    className="premium-input-field"
                                    value={editingExpense.fecha}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, fecha: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowEditExpenseModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={saveEditExpense}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );



    const renderReports = () => (
        <>
            <div className="content-header">
                <div>
                    <h1>Reportes y Analíticas</h1>
                    <p>Análisis profundo del rendimiento de Venus Spa.</p>
                </div>
                <div className="header-btns">
                    <button className="btn-primary-admin" onClick={downloadPDF}>
                        <FileText size={18} /> Exportar Auditoría PDF
                    </button>
                </div>
            </div>

            <div className="stats-cards-grid">
                <div className="premium-stat-card">
                    <div className="stat-body">
                        <label>Ingresos Totales</label>
                        <h2>{stats.revenue}</h2>
                        <span className="trend positive">Finalizadas y cobradas</span>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-body">
                        <label>Gastos Operativos</label>
                        <h2 style={{ color: '#64748b' }}>${expenses.reduce((acc, curr) => acc + curr.monto, 0).toLocaleString()}</h2>
                        <span className="trend neutral">{expenses.length} registros</span>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-body">
                        <label>Promedio por Cliente</label>
                        <h2>{stats.avg_per_client}</h2>
                        <span className="trend positive">Ticket saludable</span>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-body">
                        <label>Fidelidad de Clientes</label>
                        <h2>{stats.client_loyalty}</h2>
                        <span className="trend positive">Vuelven pronto</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card main-chart">
                    <div className="card-header">
                        <h3>Comparativa Ingresos vs Gastos</h3>
                    </div>
                    <div className="chart-container-large">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getFinancialData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'rgba(172, 109, 57, 0.05)' }}
                                />
                                <Bar dataKey="ingresos" fill="#AC6D39" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="gastos" fill="#DBC7BB" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-card side-chart">
                    <div className="card-header">
                        <h3>Eficiencia por Servicio</h3>
                    </div>
                    <div className="service-efficiency-list">
                        {[
                            { name: 'Masajes', efficiency: 92, color: '#AC6D39' },
                            { name: 'Faciales', efficiency: 85, color: '#C58B5F' },
                            { name: 'Aromaterapia', efficiency: 70, color: '#DBC7BB' },
                            { name: 'Depilación', efficiency: 65, color: '#4A3E37' }
                        ].map((s, i) => (
                            <div key={i} className="efficiency-item" style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{s.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.efficiency}% ocupación</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${s.efficiency}%`, background: s.color, borderRadius: '10px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    const renderSettings = () => (
        <>
            <div className="content-header">
                <div>
                    <h1>Configuración</h1>
                    <p>Gestiona los detalles operativos y la identidad de Venus Spa.</p>
                </div>
                <button className="btn-primary-admin" onClick={() => showToast('Configuración guardada correctamente')}>
                    Guardar Cambios
                </button>
            </div>

            <div className="settings-container-premium">
                <nav className="settings-sidebar-nav">
                    <button
                        className={`settings-nav-btn ${activeSettingsSection === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveSettingsSection('general')}
                    >
                        <Globe size={18} />
                        <div className="nav-btn-text">
                            <strong>General</strong>
                            <span>Identidad y contacto</span>
                        </div>
                    </button>

                    <button
                        className={`settings-nav-btn ${activeSettingsSection === 'notificaciones' ? 'active' : ''}`}
                        onClick={() => setActiveSettingsSection('notificaciones')}
                    >
                        <Bell size={18} />
                        <div className="nav-btn-text">
                            <strong>Notificaciones</strong>
                            <span>Alertas y automatización</span>
                        </div>
                    </button>
                    <button
                        className={`settings-nav-btn ${activeSettingsSection === 'seguridad' ? 'active' : ''}`}
                        onClick={() => setActiveSettingsSection('seguridad')}
                    >
                        <Shield size={18} />
                        <div className="nav-btn-text">
                            <strong>Seguridad</strong>
                            <span>Contraseñas y acceso</span>
                        </div>
                    </button>
                </nav>

                <div className="settings-content-area">
                    {activeSettingsSection === 'general' && (
                        <div className="settings-card single-card">
                            <div className="card-header-premium">
                                <Globe size={20} />
                                <h3>Información del Spa</h3>
                            </div>
                            <div className="card-body-premium">
                                <div className="settings-grid">
                                    <div className="form-group-admin">
                                        <label>Nombre del Negocio</label>
                                        <div className="input-with-icon-premium">
                                            <LayoutDashboard size={18} />
                                            <input
                                                type="text"
                                                className="premium-input-field"
                                                value={settings.spaName}
                                                onChange={(e) => setSettings({ ...settings, spaName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-admin">
                                        <label>Teléfono de Contacto</label>
                                        <div className="input-with-icon-premium">
                                            <Phone size={18} />
                                            <input
                                                type="text"
                                                className="premium-input-field"
                                                value={settings.phone}
                                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group-admin">
                                        <label>Moneda del Sistema</label>
                                        <div className="premium-input-field disabled-field" style={{ background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}>
                                            USD (Dólares Estadounidenses)
                                        </div>
                                    </div>
                                    <div className="form-group-admin full-width-admin">
                                        <label>Dirección Física</label>
                                        <div className="input-with-icon-premium">
                                            <MapPin size={18} />
                                            <input
                                                type="text"
                                                className="premium-input-field"
                                                value={settings.address}
                                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {activeSettingsSection === 'notificaciones' && (
                        <div className="settings-card single-card">
                            <div className="card-header-premium">
                                <Bell size={20} />
                                <h3>Preferencias de Alerta</h3>
                            </div>
                            <div className="card-body-premium">
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Las notificaciones del sistema están activas. Pronto podrás configurar canales adicionales aquí.</p>
                            </div>
                        </div>
                    )}

                    {activeSettingsSection === 'seguridad' && (
                        <div className="settings-card single-card">
                            <div className="card-header-premium">
                                <Shield size={20} />
                                <h3>Seguridad y Acceso</h3>
                            </div>
                            <div className="card-body-premium">
                                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    Utiliza esta sección para cambiar tu contraseña maestra del panel administrativo.
                                </p>
                                <div className="settings-grid">
                                    <div className="form-group-admin">
                                        <label>Nueva Contraseña</label>
                                        <div style={{ position: 'relative' }}>
                                            <div className="input-with-icon-premium">
                                                <Lock size={18} />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Mínimo 6 caracteres"
                                                    className="premium-input-field"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    style={{ paddingRight: '50px' }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '4px',
                                                    transition: 'color 0.2s',
                                                    zIndex: 10
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#AC6D39'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group-admin">
                                        <label>Confirmar Nueva Contraseña</label>
                                        <div style={{ position: 'relative' }}>
                                            <div className="input-with-icon-premium">
                                                <Lock size={18} />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Repite la contraseña"
                                                    className="premium-input-field"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    style={{ paddingRight: '50px' }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '4px',
                                                    transition: 'color 0.2s',
                                                    zIndex: 10
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#AC6D39'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn-primary-admin"
                                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                                        onClick={async () => {
                                            await handleUpdatePassword();
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                    >
                                        <Shield size={16} /> Actualizar Contraseña
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="settings-footer-actions">
                        <button className="btn-save-settings" onClick={handleSaveSettings}>
                            <Check size={18} /> Guardar todos los cambios
                        </button>
                    </div>
                </div>
            </div>

        </>
    );


    const calcPotential = appointments
        .filter(a => a.status === 'aprobada')
        .reduce((acc, curr) => {
            const service = dbServices.find(s =>
                s.title?.trim().toLowerCase() === curr.servicio?.trim().toLowerCase()
            );
            const price = service ? parseFloat(service.price) : 0;
            return acc + (isNaN(price) ? 0 : price);
        }, 0);

    const calcReal = appointments
        .filter(a => a.status === 'completada')
        .reduce((acc, curr) => {
            const service = dbServices.find(s =>
                s.title?.trim().toLowerCase() === curr.servicio?.trim().toLowerCase()
            );
            const price = service ? parseFloat(service.price) : 0;
            return acc + (isNaN(price) ? 0 : price);
        }, 0);

    const stats = {
        total: appointments.length,
        approved: appointments.filter(a => a.status === 'aprobada').length,
        rejected: appointments.filter(a => a.status === 'rechazada').length,
        pending: appointments.filter(a => a.status === 'pending' || a.status === 'pendiendo').length,
        completed: appointments.filter(a => a.status === 'completada').length,
        potential_revenue: `$${calcPotential.toLocaleString()}`,
        real_revenue: `$${calcReal.toLocaleString()}`,
        revenue: `$${calcReal.toLocaleString()}`,
        avg_per_client: `$${clientList.length > 0 ? (calcReal / clientList.length).toFixed(2) : '0.00'}`,
        client_loyalty: `${clientList.length > 0 ? Math.round((clientList.filter(c => c.visitas > 1).length / clientList.length) * 100) : 0}%`
    };

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-circle">V</div>
                    <span>Venus<span>Spa</span></span>
                    <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}><LayoutDashboard size={20} /><span>Dashboard</span></button>
                    <button className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => handleTabChange('appointments')}><Calendar size={20} /><span>Citas</span></button>
                    <button className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => handleTabChange('clients')}><Users size={20} /><span>Clientes</span></button>
                    <button className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => handleTabChange('expenses')}><Receipt size={20} /><span>Gastos</span></button>
                    <button className={`nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => handleTabChange('services')}><Sparkle size={20} /><span>Servicios</span></button>
                    <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabChange('reports')}><TrendingUp size={20} /><span>Reportes</span></button>
                </nav>
                <div className="sidebar-footer">
                    <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}><Settings size={20} /><span>Configuración</span></button>
                    <button className="nav-item logout" onClick={handleLogout}><LogOut size={20} /><span>Cerrar Sesión</span></button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="search-input-box desktop-only"><Search size={18} /><input type="text" placeholder="Buscar citas o clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    </div>
                    <div className="topbar-actions">
                        <div className="notification-wrapper">
                            <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell size={20} />
                                {notifications.filter(n => n.unread).length > 0 && <span className="notification-badge"></span>}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown" ref={notificationRef}>
                                    <div className="notif-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h4>Notificaciones</h4>
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="close-notif-btn"
                                                style={{ padding: '4px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <button onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}>Marcar todas como leídas</button>
                                    </div>
                                    <div className="notif-list">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                                                <p>{n.text}</p>
                                                <span>{getRelativeTime(n.timestamp)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="notif-footer">
                                        <button>Ver todas las notificaciones</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="user-profile">
                            <img src="https://ui-avatars.com/api/?name=Admin+Spa&background=AC6D39&color=fff" alt="User" />
                            <div className="user-info"><strong>Admin</strong><span>Administrador</span></div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'clients' && renderClients()}
                    {activeTab === 'expenses' && renderExpenses()}
                    {activeTab === 'services' && renderServices()}
                    {activeTab === 'reports' && renderReports()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </main>

            {/* Modals */}
            {showLogoutModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal">
                        <div className="modal-icon-warning"><LogOut size={32} /></div>
                        <h2>¿Cerrar Sesión?</h2>
                        <p>Estás a punto de salir del panel administrativo. ¿Deseas continuar?</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                            <button className="btn-modal-confirm" onClick={handleLogout}>Sí, Salir</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedAppointment && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details">
                            <div className="avatar-large">{selectedAppointment.nombre.charAt(0)}</div>
                            <h2>Detalles de la Cita</h2>
                            <span className={`status-pill ${selectedAppointment.status}`}>
                                {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'pendiendo') ? 'Pendiente' :
                                    selectedAppointment.status === 'completada' ? 'Completada' :
                                        selectedAppointment.status === 'aprobada' ? 'Aprobada' :
                                            selectedAppointment.status === 'rechazada' ? 'Rechazada' :
                                                selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                            </span>
                        </div>
                        <div className="details-grid">
                            <div className="detail-box"><label>Cliente</label><strong>{selectedAppointment.nombre}</strong></div>
                            <div className="detail-box"><label>Servicio</label><strong>{selectedAppointment.servicio}</strong></div>
                            <div className="detail-box"><label>Fecha</label><strong>{selectedAppointment.fecha}</strong></div>
                            <div className="detail-box"><label>Hora</label><strong>{selectedAppointment.hora}</strong></div>
                        </div>
                        <div className="detail-box full"><label>Mensaje / Notas</label><p>{selectedAppointment.mensaje || 'Sin mensaje adicional.'}</p></div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setSelectedAppointment(null)}>Cerrar</button>
                            <button className="btn-primary-admin" onClick={() => { window.open(`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`, '_blank'); }}>
                                <MessageSquare size={18} /> Contactar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal">
                        <div className="modal-icon-warning"><Trash2 size={32} /></div>
                        <h2>¿Confirmar eliminación?</h2>
                        <p>{itemToDelete?.message || 'Esta acción no se puede deshacer.'}</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                            <button className="btn-modal-confirm" onClick={confirmDelete}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingClient && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details"><h2>Editar Cliente</h2></div>
                        <div className="edit-form">
                            <div className="form-group-admin"><label>Nombre</label><input type="text" className="premium-input-field" placeholder="Ej. Maria Perez" value={editingClient.nombre} onChange={(e) => setEditingClient({ ...editingClient, nombre: e.target.value })} /></div>

                            <div className="form-group-admin">
                                <label>Categoría</label>
                                <CustomSelect
                                    value={editingClient.status}
                                    options={['Nuevo', 'Frecuente', 'VIP']}
                                    onChange={(val) => setEditingClient({ ...editingClient, status: val })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={saveEditClient}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewAppModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details"><h2>Nueva Cita</h2></div>
                        <div className="edit-form">
                            <div className="form-group-admin"><label>Cliente</label><input type="text" className="premium-input-field" placeholder="Nombre del cliente..." value={newApp.nombre} onChange={(e) => setNewApp({ ...newApp, nombre: e.target.value })} /></div>
                            <div className="form-group-admin">
                                <label>Servicio</label>
                                <CustomSelect
                                    value={newApp.servicio}
                                    options={dbServices.length > 0 ? dbServices.map(s => s.title) : ['Masajes', 'Faciales', 'Manicure y Pedicure']}
                                    onChange={(val) => setNewApp({ ...newApp, servicio: val })}
                                />
                            </div>
                            <div className="details-grid" style={{ padding: 0 }}>
                                <div className="form-group-admin"><label>Fecha</label><input type="date" className="premium-input-field" value={newApp.fecha} onChange={(e) => setNewApp({ ...newApp, fecha: e.target.value })} /></div>
                                <div className="form-group-admin"><label>Hora</label><input type="time" className="premium-input-field" value={newApp.hora} onChange={(e) => setNewApp({ ...newApp, hora: e.target.value })} /></div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowNewAppModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={handleCreateAppointment}>Crear</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewClientModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details"><h2>Nuevo Cliente</h2></div>
                        <div className="edit-form">
                            <div className="form-group-admin"><label>Nombre</label><input type="text" className="premium-input-field" placeholder="Ej. Maria Perez" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} /></div>
                            <div className="form-group-admin">
                                <label>Categoría</label>
                                <CustomSelect
                                    value={newClient.status}
                                    options={['Nuevo', 'Frecuente', 'VIP']}
                                    onChange={(val) => setNewClient({ ...newClient, status: val })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowNewClientModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={handleCreateClient}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewExpenseModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal">
                        <h2>Registrar Nuevo Gasto</h2>
                        <div className="modal-form-grid" style={{ display: 'grid', gap: '1.25rem', marginTop: '1.5rem' }}>
                            <div className="form-group-admin"><label>Concepto</label><input className="premium-input-field" placeholder="Ej: Insumos" value={newExpense.concepto} onChange={(e) => setNewExpense({ ...newExpense, concepto: e.target.value })} /></div>
                            <div className="form-group-admin"><label>Monto ($)</label><input type="number" className="premium-input-field" placeholder="0.00" value={newExpense.monto} onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })} /></div>
                            <div className="form-group-admin">
                                <label>Categoría</label>
                                <CustomSelect
                                    value={newExpense.categoria}
                                    options={['Suministros', 'Servicios', 'Alquiler', 'Marketing', 'Otros']}
                                    onChange={(val) => setNewExpense({ ...newExpense, categoria: val })}
                                />
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowNewExpenseModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={handleCreateExpense}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {showNewServiceModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details"><h2>Nuevo Servicio</h2></div>
                        <div className="edit-form premium-form-v2">
                            <div className="form-group-admin">
                                <label><Type size={14} /> Título</label>
                                <div className="input-with-icon-premium">
                                    <Sparkle size={16} />
                                    <input type="text" className="premium-input-field" placeholder="Nombre del servicio" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group-admin">
                                <label><AlignLeft size={14} /> Descripción</label>
                                <textarea className="premium-input-field" rows="2" placeholder="Breve descripción..." value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
                            </div>

                            <div className="details-grid" style={{ padding: 0, gap: '1.5rem' }}>
                                <div className="form-group-admin">
                                    <label><DollarSign size={16} /> Precio ($)</label>
                                    <input type="number" className="premium-input-field" placeholder="0.00" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} />
                                </div>
                                <div className="form-group-admin">
                                    <label><Sparkle size={16} /> Icono Visual</label>
                                    <CustomSelect
                                        value={newService.icon_name}
                                        options={['Sparkle', 'Flower2', 'Wind', 'Heart', 'Waves', 'Zap', 'Flame', 'Activity']}
                                        onChange={(val) => setNewService({ ...newService, icon_name: val })}
                                    />
                                </div>
                            </div>

                            <div className="settings-toggle-item premium-toggle-box" style={{ marginTop: '0.5rem' }}>
                                <div className="toggle-info">
                                    <div className="toggle-icon-bg"><Eye size={16} /></div>
                                    <div><strong>Precio en Web</strong></div>
                                </div>
                                <div className={`premium-switch ${newService.show_price ? 'active' : ''}`} onClick={() => setNewService({ ...newService, show_price: !newService.show_price })}>
                                    <div className="switch-handle"></div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowNewServiceModal(false)}>
                                <X size={16} /> Cancelar
                            </button>
                            <button className="btn-primary-admin" onClick={handleCreateService}>
                                <Plus size={16} /> Crear Servicio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditServiceModal && editingService && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details"><h2>Editar Servicio</h2></div>
                        <div className="edit-form premium-form-v2">
                            <div className="form-group-admin">
                                <label><Type size={14} /> Título</label>
                                <div className="input-with-icon-premium">
                                    <Sparkle size={16} />
                                    <input type="text" className="premium-input-field" value={editingService.title} onChange={(e) => setEditingService({ ...editingService, title: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group-admin">
                                <label><AlignLeft size={14} /> Descripción</label>
                                <textarea className="premium-input-field" rows="2" value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} />
                            </div>

                            <div className="details-grid" style={{ padding: 0, gap: '1.5rem' }}>
                                <div className="form-group-admin">
                                    <label><DollarSign size={14} /> Precio ($)</label>
                                    <input type="number" className="premium-input-field" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} />
                                </div>
                                <div className="form-group-admin">
                                    <label><Sparkle size={14} /> Icono</label>
                                    <CustomSelect
                                        value={editingService.icon_name}
                                        options={['Sparkle', 'Flower2', 'Wind', 'Heart', 'Waves', 'Zap', 'Flame', 'Activity']}
                                        onChange={(val) => setEditingService({ ...editingService, icon_name: val })}
                                    />
                                </div>
                            </div>

                            <div className="settings-toggle-item premium-toggle-box" style={{ marginTop: '0.5rem' }}>
                                <div className="toggle-info">
                                    <div className="toggle-icon-bg"><Eye size={16} /></div>
                                    <div><strong>Precio en Web</strong></div>
                                </div>
                                <div className={`premium-switch ${editingService.show_price ? 'active' : ''}`} onClick={() => setEditingService({ ...editingService, show_price: !editingService.show_price })}>
                                    <div className="switch-handle"></div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowEditServiceModal(false)}>
                                <X size={16} /> Cancelar
                            </button>
                            <button className="btn-primary-admin" onClick={saveEditService}>
                                <Save size={16} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedClient && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal client-modal-large">
                        <div className="client-modal-header">
                            <div className="avatar-huge">{selectedClient.nombre.charAt(0)}</div>
                            <div className="client-header-info">
                                <h2>{selectedClient.nombre}</h2>
                                <p><span className={`status-pill ${selectedClient.status.toLowerCase()}`}>{selectedClient.status}</span></p>
                            </div>
                        </div>
                        <div className="client-stats-row">
                            <div className="mini-stat"><span>Visitas</span><strong>{selectedClient.visitas}</strong></div>
                            <div className="mini-stat"><span>Total</span><strong>${selectedClient.totalGastado.toFixed(2)}</strong></div>
                            <div className="mini-stat"><span>Última</span><strong>{selectedClient.ultimaVisita}</strong></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setSelectedClient(null)}>
                                <X size={18} /> Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`premium-toast ${toast.type}`}>
                    <div className="toast-content">
                        <Check size={18} />
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
            {showResetModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details"><h2>Restablecer Contraseña</h2></div>
                        <div className="edit-form">
                            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Por favor ingresa tu nueva contraseña maestra para el panel.
                            </p>
                            <div className="form-group-admin">
                                <label>Nueva Contraseña</label>
                                <div style={{ position: 'relative', overflow: 'visible' }}>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        className="premium-input-field"
                                        placeholder="Mínimo 6 caracteres"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{ paddingRight: '50px', width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '6px',
                                            transition: 'color 0.2s',
                                            zIndex: 100,
                                            pointerEvents: 'auto'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#AC6D39'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group-admin">
                                <label>Confirmar Contraseña</label>
                                <div style={{ position: 'relative', overflow: 'visible' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="premium-input-field"
                                        placeholder="Repite la contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{ paddingRight: '50px', width: '100%' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '15px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '6px',
                                            transition: 'color 0.2s',
                                            zIndex: 100,
                                            pointerEvents: 'auto'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#AC6D39'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn-primary-admin" style={{ width: '100%', justifyContent: 'center' }} onClick={handleUpdatePassword}>
                                <Shield size={18} /> Actualizar Contraseña y Entrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
