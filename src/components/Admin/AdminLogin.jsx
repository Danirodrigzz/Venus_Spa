import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [forgotMode, setForgotMode] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (data?.user) onLogin();
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://venus-spa.vercel.app/#/admin',
            });
            if (resetError) throw resetError;
            setMessage('Se ha enviado un correo para restablecer tu contraseña.');
        } catch (err) {
            setError(err.message || 'Error al enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="login-logo">V</div>
                    <h1>Venus Elegant Spa</h1>
                    <p>{forgotMode ? 'Recuperar Contraseña' : 'Panel de Administración'}</p>
                </div>

                {!forgotMode ? (
                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && <div className="login-error">{error}</div>}

                        <div className="form-group-login">
                            <label>Correo Electrónico</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-login">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>Contraseña</label>
                                <button
                                    type="button"
                                    className="forgot-link"
                                    onClick={() => { setForgotMode(true); setError(''); setMessage(''); }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-pass"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Sesión'}
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleForgotPassword}>
                        {error && <div className="login-error">{error}</div>}
                        {message && <div className="login-success">{message}</div>}

                        <p className="forgot-instruction">
                            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
                        </p>

                        <div className="form-group-login">
                            <label>Correo Electrónico</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Enviar Instrucciones'}
                        </button>

                        <button
                            type="button"
                            className="back-to-login"
                            onClick={() => { setForgotMode(false); setError(''); setMessage(''); }}
                        >
                            <ChevronLeft size={16} /> Volver al Inicio de Sesión
                        </button>
                    </form>
                )}

                <div className="login-footer">
                    <a href="#/">Volver al sitio público</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
