# 🌿 Venus Eternal Spa - Sitio Web & Panel Administrativo

Bienvenido al repositorio oficial de **Venus Eternal Spa**. Este proyecto es una aplicación web moderna diseñada para un spa de lujo, ofreciendo una experiencia de usuario premium, elegante y relajante. El sistema incluye tanto una landing page pública para clientes como un panel administrativo para la gestión del negocio.

## 📋 Descripción

**Venus Eternal Spa** es una solución digital completa para la industria del bienestar. La aplicación conecta a los clientes con los servicios del spa a través de una interfaz visualmente atractiva y responsive, facilitando la reserva de citas y la exploración de servicios. Además, proporciona herramientas administrativas para gestionar el flujo de trabajo interno.

## ✨ Características Principales

### 🌟 Experiencia del Cliente (Frontend)
- **Diseño Premium**: Interfaz elegante con animaciones suaves (Framer Motion) y estética minimalista.
- **Navegación Intuitiva**: Secciones claras como Inicio, Nosotros, Servicios, Galería y Reservas.
- **Sistema de Reservas**: Formulario integrado para solicitar citas.
- **Galería interactiva**: Visualización de instalaciones y tratamientos.
- **Contacto Directo**: integración con botón de WhatsApp para comunicación instantánea.
- **Diseño Responsivo**: Adaptado perfectamente a dispositivos móviles, tablets y escritorio.

### 🛡️ Panel Administrativo (Backend/Gestión)
- **Acceso Seguro**: Sistema de autenticación para administradores.
- **Dashboard de Control**: Vista general del estado del negocio.
- **Gestión de Citas**: Visualización y administración de las reservas de clientes.
- **Gestión de Servicios**: (Funcionalidad prevista) Administración del catálogo de tratamientos.

## 🛠️ Tecnologías Utilizadas

Este proyecto ha sido construido utilizando las últimas tecnologías en desarrollo web para asegurar rendimiento y escalabilidad:

- **Frontend Core**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/) - para un entorno de desarrollo ultrarrápido.
- **Estilos**: CSS3 moderno con variables y diseño responsivo.
- **Iconografía**: [Lucide React](https://lucide.dev/) y [Tabler Icons](https://tabler.io/).
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) - para transiciones fluidas.
- **Enrutamiento**: [React Router](https://reactrouter.com/) (v7).
- **Backend/Base de Datos**: [Supabase](https://supabase.com/) - para autenticación y almacenamiento de datos en tiempo real.
- **Visualización de Datos**: [Recharts](https://recharts.org/) - para gráficos en el dashboard.

## 🚀 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- npm (o yarn/pnpm)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Danirodrigzz/Venus_Spa.git
   cd Venus_Spa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto basándote en el ejemplo (si existe) o añade tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_supabase
   ```

4. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   Visita `http://localhost:5173` para ver la aplicación.

## 📂 Estructura del Proyecto

```
Venus_Spa/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/          # Imágenes y recursos
│   ├── components/
│   │   ├── Admin/       # Componentes del panel de administración
│   │   ├── Sections/    # Secciones de la landing page (Hero, About, etc.)
│   │   └── UI/          # Componentes reutilizables (Navbar, Footer, Buttons)
│   ├── lib/             # Utilidades y configuración (e.g., cliente Supabase)
│   ├── App.jsx          # Componente principal y enrutamiento
│   ├── main.jsx         # Punto de entrada de React
│   └── index.css        # Estilos globales
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js       # Configuración de Vite
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar o mejorar.

1. Haz un Fork del proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE.md](LICENSE.md) para más detalles.

---

<p align="center">
  Desarrollado con ❤️ para <strong>Venus Eternal Spa</strong>
</p>
