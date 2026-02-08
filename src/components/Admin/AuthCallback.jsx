import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the hash params from the URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const access_token = hashParams.get('access_token');
                const refresh_token = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                // Also check query params (Supabase can use either)
                const queryParams = new URLSearchParams(window.location.search);
                const token_hash = queryParams.get('token_hash');
                const recovery_type = queryParams.get('type');

                console.log('Auth callback triggered:', { access_token, token_hash, type, recovery_type });

                // If we have tokens in the hash, set the session
                if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });

                    if (error) {
                        console.error('Error setting session:', error);
                        alert('Error al procesar la autenticación. Por favor intenta de nuevo.');
                        window.location.href = '/#/admin';
                        return;
                    }
                }

                // If it's a password recovery, redirect to admin in reset mode
                if (type === 'recovery' || recovery_type === 'recovery') {
                    // Redirect to admin with recovery flag
                    window.location.href = '/#/admin';
                } else {
                    // Regular login callback
                    window.location.href = '/#/admin';
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                alert('Ocurrió un error. Redirigiendo al login...');
                window.location.href = '/#/admin';
            }
        };

        handleAuthCallback();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #FDF9F6 0%, #F5E6DA 100%)',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #AC6D39',
                    borderTop: '4px solid transparent',
                    borderRadius: '50%',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h2 style={{ color: '#4A3E37', marginBottom: '10px' }}>Procesando...</h2>
                <p style={{ color: '#7A6F68' }}>Estamos verificando tu información</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AuthCallback;
