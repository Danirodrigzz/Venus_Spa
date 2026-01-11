import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Users, Calendar, CheckCircle, XCircle, Clock,
    TrendingUp, Activity, Search, LayoutDashboard,
    Settings, LogOut, Bell, MoreVertical,
    Plus, Filter, Download, UserPlus, MessageSquare,
    Mail, Edit2, Trash2, ExternalLink, ChevronDown,
    Menu, X, FileText, Wallet, Receipt, Shield,
    Globe, Lock, User, Phone, MapPin, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminDashboard.css';

const COLORS = ['#AC6D39', '#C58B5F', '#DBC7BB', '#4A3E37', '#7A6F68'];

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

    return (
        <div className="custom-select-wrapper" ref={ref} style={{ width }}>
            <div
                className="custom-select-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{ justifyContent: 'space-between' }}
            >
                <span>{value || placeholder}</span>
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
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminDashboard = ({ onLogout }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    const [newClient, setNewClient] = useState({ nombre: '', email: '', status: 'Nuevo' });
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
    const [newExpense, setNewExpense] = useState({ concepto: '', categoria: 'Suministros', monto: '', fecha: new Date().toISOString().split('T')[0] });
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeSettingsSection, setActiveSettingsSection] = useState('general');
    const [settings, setSettings] = useState({
        spaName: 'Venus Elegant Spa',
        phone: '04241145565',
        email: 'contacto@venuselegantspa.com',
        address: 'Calle Primavera #45, Santo Domingo',
        openingHour: '09:00',
        closingHour: '19:00',
        appointmentsInterval: '60 min',
        currency: 'USD',
        notificationsEnabled: true,
        autoApprove: false
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const notificationRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        fetchAllData();
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
        const { data } = await supabase.from('services').select('id, title');
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
                services (title)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const formatted = data.map(app => ({
                id: app.id,
                nombre: app.client_name,
                servicio: app.services?.title || 'Personalizado',
                fecha: app.date,
                hora: app.time,
                status: app.status,
                mensaje: app.message
            }));
            setAppointments(formatted);

            // Derive client list from appointments unique names
            const clientsMap = {};
            formatted.forEach(app => {
                if (!clientsMap[app.nombre]) {
                    clientsMap[app.nombre] = {
                        id: app.nombre,
                        nombre: app.nombre,
                        email: '-',
                        visitas: 0,
                        totalGastado: '$0',
                        ultimaVisita: app.fecha,
                        status: 'Nuevo'
                    };
                }
                clientsMap[app.nombre].visitas++;
                if (clientsMap[app.nombre].visitas > 10) clientsMap[app.nombre].status = 'VIP';
                else if (clientsMap[app.nombre].visitas > 3) clientsMap[app.nombre].status = 'Frecuente';
            });
            setClientList(Object.values(clientsMap));
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
        // En un caso real tendrías tabla de expenses, aquí simulamos o usamos local
        // const { data } = await supabase.from('expenses').select('*');
        // if (data) setExpenses(data);
    };

    const fetchNotifications = async () => {
        // Simulado por ahora o fetch de una tabla
        setNotifications([
            { id: 1, text: 'Bienvenido al panel Venus Spa', time: 'Sistema', unread: true }
        ]);
    };

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

    const handleDeleteClick = (id, type) => {
        setItemToDelete({ id, type });
        setShowDeleteModal(true);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const table = itemToDelete.type === 'appointment' ? 'appointments' : 'clients';
            // Nota: En este esquema simplificado, los clientes se derivan de las citas, 
            // así que borrar un cliente significaría borrar todas sus citas.
            const { error } = await supabase
                .from(table === 'appointments' ? 'appointments' : 'appointments')
                .delete()
                .eq(table === 'appointments' ? 'id' : 'client_name', itemToDelete.id);

            if (error) throw error;

            if (itemToDelete.type === 'appointment') {
                setAppointments(appointments.filter(app => app.id !== itemToDelete.id));
            } else {
                setAppointments(appointments.filter(app => app.nombre !== itemToDelete.id));
            }
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
                    status: 'pendiendo'
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
        setNewClient({ nombre: '', email: '', status: 'Nuevo' });
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
                    email: settings.email,
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
            c.email,
            c.visitas,
            c.totalGastado,
            c.status
        ]);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Nombre', 'Email', 'Visitas', 'Gasto Total', 'Categoría']],
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
        return [
            { name: 'Lun', citas: 4 }, { name: 'Mar', citas: 7 }, { name: 'Mie', citas: 5 },
            { name: 'Jue', citas: 8 }, { name: 'Vie', citas: 12 }, { name: 'Sab', citas: 15 }, { name: 'Dom', citas: 6 },
        ];
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
                        <div className="icon-box rose"><TrendingUp size={24} /></div>
                        <span className="trend positive">+18%</span>
                    </div>
                    <div className="stat-body">
                        <h3>Ingresos Est.</h3>
                        <h2>{stats.revenue}</h2>
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
                            value={appointmentFilter === 'all' ? 'Todas las Citas' : appointmentFilter.charAt(0).toUpperCase() + appointmentFilter.slice(1)}
                            options={['all', 'aprobada', 'pendiendo', 'rechazada'].map(o => o === 'all' ? 'Todas las Citas' : o.charAt(0).toUpperCase() + o.slice(1))}
                            onChange={(val) => handleFilterSelect('appointment', val === 'Todas las Citas' ? 'all' : val.toLowerCase())}
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
                                            {app.status === 'pendiendo' ? 'Pendiente' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                        </span>
                                    </td>
                                    <td data-label="Acciones">
                                        <div className="action-row">
                                            <button onClick={() => updateStatus(app.id, 'aprobada')} className="action-btn approve" title="Aprobar">
                                                <CheckCircle size={18} />
                                                <span className="mobile-label">Aprobar</span>
                                            </button>
                                            <button onClick={() => updateStatus(app.id, 'rechazada')} className="action-btn reject" title="Rechazar">
                                                <XCircle size={18} />
                                                <span className="mobile-label">Rechazar</span>
                                            </button>
                                            <div className="more-menu-container">
                                                <button
                                                    className={`action-btn more ${activeMenu === app.id ? 'active' : ''}`}
                                                    onClick={() => toggleMenu(app.id)}
                                                    title="Más acciones"
                                                >
                                                    <MoreVertical size={18} />
                                                    <span className="mobile-label">Más</span>
                                                </button>

                                                {activeMenu === app.id && (
                                                    <div className="more-dropdown">
                                                        <button className="dropdown-item" onClick={() => { setSelectedAppointment(app); setActiveMenu(null); }}>
                                                            <Activity size={14} /> Ver Detalles
                                                        </button>
                                                        <button className="dropdown-item whatsapp" onClick={() => { window.open(`https://wa.me/18493164217`, '_blank'); setActiveMenu(null); }}>
                                                            <MessageSquare size={14} /> WhatsApp
                                                        </button>
                                                        <div className="dropdown-divider"></div>
                                                        <button className="dropdown-item delete" onClick={() => handleDeleteClick(app.id, 'appointment')}>
                                                            <XCircle size={14} /> Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
            const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase());
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
                <td data-label="Email"><span className="text-muted">{client.email}</span></td>
                <td data-label="Visitas"><strong>{client.visitas}</strong></td>
                <td data-label="Total Gastado"><span className="revenue-text">{client.totalGastado}</span></td>
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
                                    <button className="dropdown-item" onClick={() => { window.open(`mailto:${client.email}`, '_blank'); setActiveMenu(null); }}>
                                        <Mail size={14} /> Enviar Email
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
                                placeholder="Buscar por nombre o email..."
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
                                    <th>Email</th>
                                    <th>Visitas</th>
                                    <th>Total Gastado</th>
                                    <th>Última Visita</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(renderClientRow)}
                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No se encontraron clientes.</td>
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

    const saveEditExpense = () => {
        setExpenses(expenses.map(e => e.id === editingExpense.id ? editingExpense : e));
        setShowEditExpenseModal(false);
        setEditingExpense(null);
    };

    const handleDeleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const handleCreateExpense = () => {
        const id = expenses.length + 1;
        setExpenses([...expenses, { ...newExpense, id, monto: parseFloat(newExpense.monto) }]);
        setShowNewExpenseModal(false);
        setNewExpense({ concepto: '', categoria: 'Suministros', monto: '', fecha: new Date().toISOString().split('T')[0] });
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.concepto.toLowerCase().includes(expenseSearch.toLowerCase());
        const matchesFilter = expenseCategoryFilter === 'Todas' || expense.categoria === expenseCategoryFilter;
        return matchesSearch && matchesFilter;
    });

    const getFinancialData = () => {
        // En un sistema real, aquí agruparíamos ingresos de citas y gastos por mes
        return [
            { name: 'Ene', ingresos: 4500, gastos: expenses.reduce((acc, curr) => acc + curr.monto, 0) },
            { name: 'Feb', ingresos: 5200, gastos: 1500 },
            { name: 'Mar', ingresos: 4800, gastos: 1100 },
            { name: 'Abr', ingresos: 6100, gastos: 1800 },
            { name: 'May', ingresos: 5900, gastos: 1400 },
            { name: 'Jun', ingresos: 7200, gastos: 2100 },
        ];
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
                                    value={editingExpense.concepto}
                                    onChange={(e) => setEditingExpense({ ...editingExpense, concepto: e.target.value })}
                                />
                            </div>
                            <div className="form-group-admin">
                                <label>Monto ($)</label>
                                <input
                                    type="number"
                                    className="premium-input-field"
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
                        <h2>$12,450.00</h2>
                        <span className="trend positive">+15.2% esta temporada</span>
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
                        <h2>$85.50</h2>
                        <span className="trend positive">Ticket saludable</span>
                    </div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-body">
                        <label>Fidelidad de Clientes</label>
                        <h2>78%</h2>
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

            <nav className="settings-tabs-nav">
                <button
                    className={`settings-tab-link ${activeSettingsSection === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsSection('general')}
                >
                    <Globe size={18} /> General
                </button>
                <button
                    className={`settings-tab-link ${activeSettingsSection === 'horario' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsSection('horario')}
                >
                    <Clock size={18} /> Horario
                </button>
                <button
                    className={`settings-tab-link ${activeSettingsSection === 'notificaciones' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsSection('notificaciones')}
                >
                    <Bell size={18} /> Notificaciones
                </button>
                <button
                    className={`settings-tab-link ${activeSettingsSection === 'seguridad' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsSection('seguridad')}
                >
                    <Shield size={18} /> Seguridad
                </button>
            </nav>

            <div className="settings-tabs-content">
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
                                    <label>Correo Electrónico</label>
                                    <div className="input-with-icon-premium">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            className="premium-input-field"
                                            value={settings.email}
                                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
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
                                    <CustomSelect
                                        value={settings.currency}
                                        options={['USD', 'DOP', 'VES', 'EUR']}
                                        onChange={(val) => setSettings({ ...settings, currency: val })}
                                    />
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

                {activeSettingsSection === 'horario' && (
                    <div className="settings-card single-card">
                        <div className="card-header-premium">
                            <Clock size={20} />
                            <h3>Horarios de Operación</h3>
                        </div>
                        <div className="card-body-premium">
                            <div className="settings-grid">
                                <div className="form-group-admin">
                                    <label>Apertura</label>
                                    <div className="input-with-icon-premium">
                                        <Clock size={18} />
                                        <input
                                            type="time"
                                            className="premium-input-field"
                                            value={settings.openingHour}
                                            onChange={(e) => setSettings({ ...settings, openingHour: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-admin">
                                    <label>Cierre</label>
                                    <div className="input-with-icon-premium">
                                        <Clock size={18} />
                                        <input
                                            type="time"
                                            className="premium-input-field"
                                            value={settings.closingHour}
                                            onChange={(e) => setSettings({ ...settings, closingHour: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-admin">
                                    <label>Intervalo entre Citas</label>
                                    <CustomSelect
                                        value={settings.appointmentsInterval}
                                        options={['30 min', '45 min', '60 min', '90 min', '120 min']}
                                        onChange={(val) => setSettings({ ...settings, appointmentsInterval: val })}
                                    />
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
                            <div className="settings-toggle-item small">
                                <div>
                                    <strong>Aprobación Automática</strong>
                                    <p>Citas de clientes VIP sugeridas.</p>
                                </div>
                                <div className={`premium-switch ${settings.autoApprove ? 'active' : ''}`} onClick={() => setSettings({ ...settings, autoApprove: !settings.autoApprove })}>
                                    <div className="switch-handle"></div>
                                </div>
                            </div>
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
                            <div className="settings-grid">
                                <div className="form-group-admin">
                                    <label>Contraseña Actual</label>
                                    <div className="input-with-icon-premium">
                                        <Lock size={18} />
                                        <input type="password" placeholder="••••••••" className="premium-input-field" />
                                    </div>
                                </div>
                                <div className="form-group-admin">
                                    <label>Nueva Contraseña</label>
                                    <div className="input-with-icon-premium">
                                        <Lock size={18} />
                                        <input type="password" placeholder="••••••••" className="premium-input-field" />
                                    </div>
                                </div>
                                <div className="form-group-admin">
                                    <label>Confirmar Nueva Contraseña</label>
                                    <div className="input-with-icon-premium">
                                        <Lock size={18} />
                                        <input type="password" placeholder="••••••••" className="premium-input-field" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="settings-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-primary-admin" onClick={handleSaveSettings}>
                        <Check size={18} /> Guardar Todos los Cambios
                    </button>
                </div>
            </div>

        </>
    );


    const stats = {
        total: appointments.length,
        approved: appointments.filter(a => a.status === 'aprobada').length,
        rejected: appointments.filter(a => a.status === 'rechazada').length,
        pending: appointments.filter(a => a.status === 'pendiendo').length,
        revenue: '$12,450'
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
                    <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabChange('reports')}><TrendingUp size={20} /><span>Reportes</span></button>
                </nav>
                <div className="sidebar-footer">
                    <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}><Settings size={20} /><span>Configuración</span></button>
                    <button className="nav-item logout" onClick={() => setShowLogoutModal(true)}><LogOut size={20} /><span>Cerrar Sesión</span></button>
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
                                                <span>{n.time}</span>
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
                            <span className={`status-pill ${selectedAppointment.status}`}>{selectedAppointment.status}</span>
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
                        <p>Esta acción no se puede deshacer.</p>
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
                            <div className="form-group-admin"><label>Nombre</label><input type="text" className="premium-input-field" value={editingClient.nombre} onChange={(e) => setEditingClient({ ...editingClient, nombre: e.target.value })} /></div>
                            <div className="form-group-admin"><label>Email</label><input type="email" className="premium-input-field" value={editingClient.email} onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })} /></div>
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
                            <div className="form-group-admin"><label>Cliente</label><input type="text" className="premium-input-field" value={newApp.nombre} onChange={(e) => setNewApp({ ...newApp, nombre: e.target.value })} /></div>
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
                            <div className="form-group-admin"><label>Nombre</label><input type="text" className="premium-input-field" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} /></div>
                            <div className="form-group-admin"><label>Email</label><input type="email" className="premium-input-field" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} /></div>
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
                        <div className="modal-form-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                            <div className="form-group-admin"><label>Concepto</label><input className="premium-input-field" placeholder="Ej: Insumos" value={newExpense.concepto} onChange={(e) => setNewExpense({ ...newExpense, concepto: e.target.value })} /></div>
                            <div className="form-group-admin"><label>Monto ($)</label><input type="number" className="premium-input-field" value={newExpense.monto} onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })} /></div>
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

            {selectedClient && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal client-modal-large">
                        <div className="client-modal-header">
                            <div className="avatar-huge">{selectedClient.nombre.charAt(0)}</div>
                            <div className="client-header-info">
                                <h2>{selectedClient.nombre}</h2>
                                <p>{selectedClient.email} • <span className={`status-pill ${selectedClient.status.toLowerCase()}`}>{selectedClient.status}</span></p>
                            </div>
                        </div>
                        <div className="client-stats-row">
                            <div className="mini-stat"><span>Visitas</span><strong>{selectedClient.visitas}</strong></div>
                            <div className="mini-stat"><span>Total</span><strong>{selectedClient.totalGastado}</strong></div>
                            <div className="mini-stat"><span>Última</span><strong>{selectedClient.ultimaVisita}</strong></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setSelectedClient(null)}>Cerrar</button>
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
        </div>
    );
};

export default AdminDashboard;
