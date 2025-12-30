import React, { useState, useEffect } from 'react';
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
    Menu, X
} from 'lucide-react';
import './AdminDashboard.css';

// Premium Mock Data
const MOCK_DATA = [
    { id: 1, nombre: 'Ana García', servicio: 'Masajes', fecha: '2025-12-30', hora: '10:00', status: 'aprobada', mensaje: 'Masaje relajante de tejido profundo' },
    { id: 2, nombre: 'Juan Pérez', servicio: 'Faciales', fecha: '2025-12-30', hora: '11:30', status: 'pendiendo', mensaje: 'Limpieza profunda con vapor' },
    { id: 3, nombre: 'Carla Ruiz', servicio: 'Aromaterapia', fecha: '2025-12-31', hora: '14:00', status: 'aprobada', mensaje: 'Aceites esenciales de lavanda' },
    { id: 4, nombre: 'Luis Mora', servicio: 'Depilación', fecha: '2025-12-31', hora: '16:00', status: 'rechazada', mensaje: 'Cita de último minuto' },
    { id: 5, nombre: 'Elena Vega', servicio: 'Masajes', fecha: '2025-01-02', hora: '09:00', status: 'pendiendo', mensaje: 'Terapia con piedras calientes' },
    { id: 6, nombre: 'Roberto Sanz', servicio: 'Faciales', fecha: '2025-01-02', hora: '15:00', status: 'aprobada', mensaje: 'Tratamiento hidratante' },
];

const CLIENT_MOCK_DATA = [
    { id: 1, nombre: 'Ana García', email: 'ana@gmail.com', visitas: 12, totalGastado: '$1,200', ultimaVisita: '2025-12-30', status: 'VIP' },
    { id: 2, nombre: 'Carla Ruiz', email: 'cruiz@yahoo.com', visitas: 8, totalGastado: '$850', ultimaVisita: '2025-12-31', status: 'Frecuente' },
    { id: 3, nombre: 'Juan Pérez', email: 'juanp@gmail.com', visitas: 2, totalGastado: '$150', ultimaVisita: '2025-12-15', status: 'Nuevo' },
    { id: 4, nombre: 'Maria Estévez', email: 'maria_e@outlook.com', visitas: 15, totalGastado: '$2,100', ultimaVisita: '2025-12-28', status: 'VIP' },
    { id: 5, nombre: 'Luis Mora', email: 'lmora@gmail.com', visitas: 5, totalGastado: '$400', ultimaVisita: '2025-12-10', status: 'Frecuente' },
];

const COLORS = ['#AC6D39', '#C58B5F', '#DBC7BB', '#4A3E37', '#7A6F68'];

const AdminDashboard = ({ onLogout }) => {
    const [appointments, setAppointments] = useState(MOCK_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientList, setClientList] = useState(CLIENT_MOCK_DATA);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [appointmentFilter, setAppointmentFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [showNewAppModal, setShowNewAppModal] = useState(false);
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newApp, setNewApp] = useState({ nombre: '', servicio: 'Masajes', fecha: '', hora: '', mensaje: '' });
    const [newClient, setNewClient] = useState({ nombre: '', email: '', status: 'Nuevo' });
    const [openFilter, setOpenFilter] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        onLogout();
    };

    const toggleMenu = (id) => {
        setActiveMenu(activeMenu === id ? null : id);
    };

    const handleDeleteClick = (id, type) => {
        setItemToDelete({ id, type });
        setShowDeleteModal(true);
        setActiveMenu(null);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'appointment') {
            setAppointments(appointments.filter(app => app.id !== itemToDelete.id));
        } else {
            setClientList(clientList.filter(c => c.id !== itemToDelete.id));
        }
        setShowDeleteModal(false);
        setItemToDelete(null);
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

    const handleCreateAppointment = () => {
        const id = appointments.length + 1;
        setAppointments([...appointments, { ...newApp, id, status: 'pendiendo' }]);
        setShowNewAppModal(false);
        setNewApp({ nombre: '', servicio: 'Masajes', fecha: '', hora: '', mensaje: '' });
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

    const updateStatus = (id, newStatus) => {
        setAppointments(appointments.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
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
                <button className="btn-primary-admin">
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
                        <div className="custom-select-wrapper">
                            <select className="premium-select">
                                <option>Últimos 7 días</option>
                                <option>Este mes</option>
                            </select>
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
                        <button
                            className={`filter-btn-premium ${openFilter === 'appointments' ? 'active' : ''}`}
                            onClick={() => setOpenFilter(openFilter === 'appointments' ? null : 'appointments')}
                        >
                            <Filter size={18} />
                            <span>{appointmentFilter === 'all' ? 'Todas las Citas' : appointmentFilter.charAt(0).toUpperCase() + appointmentFilter.slice(1)}</span>
                            <ChevronDown size={16} className={`chevron ${openFilter === 'appointments' ? 'rotate' : ''}`} />
                        </button>

                        {openFilter === 'appointments' && (
                            <div className="filter-menu-premium">
                                <button onClick={() => handleFilterSelect('appointment', 'all')} className={appointmentFilter === 'all' ? 'selected' : ''}>Todas las Citas</button>
                                <button onClick={() => handleFilterSelect('appointment', 'aprobada')} className={appointmentFilter === 'aprobada' ? 'selected' : ''}>Aprobadas</button>
                                <button onClick={() => handleFilterSelect('appointment', 'pendiendo')} className={appointmentFilter === 'pendiendo' ? 'selected' : ''}>Pendientes</button>
                                <button onClick={() => handleFilterSelect('appointment', 'rechazada')} className={appointmentFilter === 'rechazada' ? 'selected' : ''}>Rechazadas</button>
                            </div>
                        )}
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
                                                        <button className="dropdown-item whatsapp" onClick={() => { window.open(`https://wa.me/18495319662`, '_blank'); setActiveMenu(null); }}>
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
                                    <button className="dropdown-item whatsapp" onClick={() => { window.open(`https://wa.me/18495319662`, '_blank'); setActiveMenu(null); }}>
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
                            <button
                                className={`filter-btn-premium ${openFilter === 'clients' ? 'active' : ''}`}
                                onClick={() => setOpenFilter(openFilter === 'clients' ? null : 'clients')}
                            >
                                <Filter size={18} />
                                <span>{clientFilter === 'all' ? 'Todos los Clientes' : clientFilter}</span>
                                <ChevronDown size={16} className={`chevron ${openFilter === 'clients' ? 'rotate' : ''}`} />
                            </button>

                            {openFilter === 'clients' && (
                                <div className="filter-menu-premium">
                                    <button onClick={() => handleFilterSelect('client', 'all')} className={clientFilter === 'all' ? 'selected' : ''}>Todos los Clientes</button>
                                    <button onClick={() => handleFilterSelect('client', 'VIP')} className={clientFilter === 'VIP' ? 'selected' : ''}>VIP</button>
                                    <button onClick={() => handleFilterSelect('client', 'Frecuente')} className={clientFilter === 'Frecuente' ? 'selected' : ''}>Frecuentes</button>
                                    <button onClick={() => handleFilterSelect('client', 'Nuevo')} className={clientFilter === 'Nuevo' ? 'selected' : ''}>Nuevos</button>
                                </div>
                            )}
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

    const renderReports = () => (
        <>
            <div className="content-header">
                <div><h1>Reportes Financieros</h1><p>Análisis detallado de ingresos.</p></div>
                <button className="btn-primary-admin"><Download size={18} /> Exportar Excel</button>
            </div>
            <div className="dashboard-card"><p style={{ width: '100%', textAlign: 'center', color: '#64748b', padding: '3rem' }}>Análisis avanzado de productividad.</p></div>
        </>
    );

    const renderSettings = () => (
        <>
            <div className="content-header">
                <div><h1>Configuración</h1><p>Ajustes generales del sistema.</p></div>
            </div>
            <div className="dashboard-card" style={{ maxWidth: '600px' }}>
                <div className="settings-form">
                    <div className="form-group-login" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre del Spa</label>
                        <input className="premium-select" style={{ width: '100%', padding: '0.8rem' }} defaultValue="Venus Elegant Spa" />
                    </div>
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
                    <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /><span>Dashboard</span></button>
                    <button className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}><Calendar size={20} /><span>Citas</span></button>
                    <button className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}><Users size={20} /><span>Clientes</span></button>
                    <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><TrendingUp size={20} /><span>Reportes</span></button>
                </nav>
                <div className="sidebar-footer">
                    <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /><span>Configuración</span></button>
                    <button className="nav-item logout" onClick={() => setShowLogoutModal(true)}><LogOut size={20} /><span>Cerrar Sesión</span></button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="search-input-box desktop-only"><Search size={18} /><input type="text" placeholder="Buscar..." /></div>
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-btn"><Bell size={20} /></button>
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
                    {activeTab === 'reports' && renderReports()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal">
                        <div className="modal-icon-warning">
                            <LogOut size={32} />
                        </div>
                        <h2>¿Cerrar Sesión?</h2>
                        <p>Estás a punto de salir del panel administrativo. ¿Deseas continuar?</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                            <button className="btn-modal-confirm" onClick={handleLogout}>Sí, Salir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details">
                            <div className="avatar-large">{selectedAppointment.nombre.charAt(0)}</div>
                            <h2>Detalles de la Cita</h2>
                            <span className={`status-pill ${selectedAppointment.status}`}>{selectedAppointment.status}</span>
                        </div>

                        <div className="details-grid">
                            <div className="detail-box">
                                <label>Cliente</label>
                                <strong>{selectedAppointment.nombre}</strong>
                            </div>
                            <div className="detail-box">
                                <label>Servicio Solicitado</label>
                                <strong>{selectedAppointment.servicio}</strong>
                            </div>
                            <div className="detail-box">
                                <label>Fecha</label>
                                <strong>{selectedAppointment.fecha}</strong>
                            </div>
                            <div className="detail-box">
                                <label>Hora</label>
                                <strong>{selectedAppointment.hora}</strong>
                            </div>
                        </div>

                        <div className="detail-box full">
                            <label>Mensaje / Preferencias</label>
                            <p>{selectedAppointment.mensaje || 'Sin mensaje adicional.'}</p>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setSelectedAppointment(null)}>Cerrar</button>
                            <button className="btn-primary-admin" onClick={() => { window.open(`https://wa.me/18495319662?text=Hola ${selectedAppointment.nombre}, te contactamos de Venus Elegant Spa sobre tu cita de ${selectedAppointment.servicio}...`, '_blank'); }}>
                                <MessageSquare size={18} /> Contactar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generic Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal">
                        <div className="modal-icon-warning">
                            <Trash2 size={32} />
                        </div>
                        <h2>¿Confirmar eliminación?</h2>
                        <p>Esta acción no se puede deshacer. ¿Seguro que deseas eliminar este {itemToDelete?.type === 'appointment' ? 'registro de cita' : 'cliente'}?</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                            <button className="btn-modal-confirm" onClick={confirmDelete}>Sí, Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Client Modal */}
            {showEditModal && editingClient && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details">
                            <h2>Editar Cliente</h2>
                            <p>Modifica los datos de contacto y categoría.</p>
                        </div>
                        <div className="edit-form">
                            <div className="form-group-admin">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    className="premium-input-field"
                                    value={editingClient.nombre}
                                    onChange={(e) => setEditingClient({ ...editingClient, nombre: e.target.value })}
                                />
                            </div>
                            <div className="form-group-admin">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="premium-input-field"
                                    value={editingClient.email}
                                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group-admin">
                                <label>Categoría</label>
                                <select
                                    className="premium-select-field"
                                    value={editingClient.status}
                                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value })}
                                >
                                    <option value="Nuevo">Nuevo</option>
                                    <option value="Frecuente">Frecuente</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={saveEditClient}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Appointment Modal */}
            {showNewAppModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details">
                            <h2>Nueva Cita</h2>
                            <p>Ingresa los datos para registrar una reserva manual.</p>
                        </div>
                        <div className="edit-form">
                            <div className="form-group-admin">
                                <label>Cliente</label>
                                <input type="text" className="premium-input-field" placeholder="Nombre completo" value={newApp.nombre} onChange={(e) => setNewApp({ ...newApp, nombre: e.target.value })} />
                            </div>
                            <div className="form-group-admin">
                                <label>Servicio</label>
                                <select className="premium-select-field" value={newApp.servicio} onChange={(e) => setNewApp({ ...newApp, servicio: e.target.value })}>
                                    <option value="Masajes">Masajes</option>
                                    <option value="Faciales">Faciales</option>
                                    <option value="Aromaterapia">Aromaterapia</option>
                                    <option value="Depilación">Depilación</option>
                                </select>
                            </div>
                            <div className="details-grid" style={{ padding: 0, background: 'none' }}>
                                <div className="form-group-admin">
                                    <label>Fecha</label>
                                    <input type="date" className="premium-input-field" value={newApp.fecha} onChange={(e) => setNewApp({ ...newApp, fecha: e.target.value })} />
                                </div>
                                <div className="form-group-admin">
                                    <label>Hora</label>
                                    <input type="time" className="premium-input-field" value={newApp.hora} onChange={(e) => setNewApp({ ...newApp, hora: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group-admin">
                                <label>Mensaje / Notas</label>
                                <textarea className="premium-input-field" placeholder="Notas adicionales..." style={{ minHeight: '80px' }} value={newApp.mensaje} onChange={(e) => setNewApp({ ...newApp, mensaje: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowNewAppModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={handleCreateAppointment}>Crear Cita</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Client Modal */}
            {showNewClientModal && (
                <div className="admin-modal-overlay">
                    <div className="premium-modal details-modal">
                        <div className="modal-header-details">
                            <h2>Nuevo Cliente</h2>
                            <p>Registra un nuevo cliente en el directorio.</p>
                        </div>
                        <div className="edit-form">
                            <div className="form-group-admin">
                                <label>Nombre Completo</label>
                                <input type="text" className="premium-input-field" placeholder="Ej. Juan Pérez" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} />
                            </div>
                            <div className="form-group-admin">
                                <label>Email</label>
                                <input type="email" className="premium-input-field" placeholder="correo@ejemplo.com" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                            </div>
                            <div className="form-group-admin">
                                <label>Categoría Inicial</label>
                                <select className="premium-select-field" value={newClient.status} onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}>
                                    <option value="Nuevo">Nuevo</option>
                                    <option value="Frecuente">Frecuente</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <button className="btn-modal-cancel" onClick={() => setShowNewClientModal(false)}>Cancelar</button>
                            <button className="btn-primary-admin" onClick={handleCreateClient}>Registrar Cliente</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Client History Modal */}
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
                            <div className="mini-stat"><span>Visitas Totales</span><strong>{selectedClient.visitas}</strong></div>
                            <div className="mini-stat"><span>Inversión Total</span><strong>{selectedClient.totalGastado}</strong></div>
                            <div className="mini-stat"><span>Última vez</span><strong>{selectedClient.ultimaVisita}</strong></div>
                        </div>

                        <div className="history-section">
                            <h3>Historial de Citas</h3>
                            <div className="history-list">
                                {appointments.filter(a => a.nombre === selectedClient.nombre).length > 0 ? (
                                    appointments.filter(a => a.nombre === selectedClient.nombre).map(app => (
                                        <div key={app.id} className="history-item">
                                            <div className="h-date"><strong>{app.fecha}</strong><span>{app.hora}</span></div>
                                            <div className="h-info"><strong>{app.servicio}</strong><span>Status: {app.status}</span></div>
                                            <ExternalLink size={16} className="h-icon" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-history">No hay citas registradas recientemente.</p>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setSelectedClient(null)}>Cerrar</button>
                            <button className="btn-primary-admin" onClick={() => { window.open(`https://wa.me/18495319662`, '_blank'); }}>
                                <MessageSquare size={18} /> Contactar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
