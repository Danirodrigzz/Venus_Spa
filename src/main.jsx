import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical React Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#2A231F',
          backgroundColor: '#FAF6F0',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#A46838', fontSize: '24px', marginBottom: '12px' }}>
            Se detectó un error al inicializar la aplicación
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '20px', color: '#786E65' }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <pre style={{
            background: '#FFFFFF',
            border: '1px solid #E2D9CF',
            padding: '20px',
            borderRadius: '6px',
            fontSize: '13px',
            lineHeight: '1.5',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {this.state.error?.stack}
            {'\n\nComponent Stack:\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#A46838',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Reintentar carga
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
