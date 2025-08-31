# 💰 FinanWaken

**Tu aplicación personal para el control y seguimiento de finanzas personales**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Descripción

FinanWaken es una aplicación web moderna y completa para la gestión de finanzas personales. Permite a los usuarios controlar sus gastos, ingresos, deudas y metas de ahorro en una interfaz intuitiva y visualmente atractiva.

## ✨ Características Principales

### 💳 Gestión Financiera Completa
- **Control de Gastos**: Registra y categoriza todos tus gastos
- **Seguimiento de Ingresos**: Administra tus fuentes de ingreso
- **Gestión de Deudas**: Controla deudas con fechas de pago y progreso
- **Metas de Ahorro**: Define objetivos financieros y monitorea el avance

### 📊 Dashboard Interactivo
- **Visualizaciones en Tiempo Real**: Gráficos de ingresos vs gastos
- **Distribución por Categorías**: Análisis detallado de gastos
- **Progreso de Metas**: Seguimiento visual de objetivos de ahorro
- **Balance Global**: Vista completa de tu situación financiera

### 🔐 Sistema de Autenticación
- **Registro e Inicio de Sesión**: Sistema seguro de autenticación
- **Perfiles de Usuario**: Gestión personalizada de cuentas
- **Cambio de Contraseña**: Funcionalidad de seguridad

### 📱 Experiencia de Usuario
- **Diseño Responsivo**: Funciona perfectamente en móviles y desktop
- **Tema Oscuro/Claro**: Interfaz adaptable a preferencias
- **PWA (Progressive Web App)**: Instalable como aplicación nativa
- **Navegación Intuitiva**: Interfaz moderna y fácil de usar

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.2.4** - Framework de React con SSR
- **React 19.0.0** - Biblioteca de interfaz de usuario
- **TypeScript 5.0** - Tipado estático para JavaScript
- **Tailwind CSS 4.1.3** - Framework de CSS utilitario
- **Radix UI** - Componentes de interfaz accesibles
- **Recharts** - Biblioteca de gráficos para React
- **Framer Motion** - Animaciones fluidas

### Backend
- **Next.js API Routes** - API REST integrada
- **Prisma 6.5.0** - ORM moderno para bases de datos
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js 5.0** - Autenticación completa
- **bcrypt** - Encriptación de contraseñas

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **next-pwa** - Soporte para PWA

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL
- npm o yarn

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/finanwaken.git
   cd finanwaken
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus configuraciones:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/finanwaken"
   NEXTAUTH_SECRET="tu-secreto-seguro"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Configura la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abre tu navegador**
   Visita [http://localhost:3000](http://localhost:3000)

## 📖 Uso

### Registro e Inicio de Sesión
1. Ve a la página principal y haz clic en "Comenzar Gratis"
2. Completa el formulario de registro con tu información
3. Inicia sesión con tus credenciales

### Dashboard Principal
- **Vista General**: Revisa tu balance mensual, ingresos y gastos
- **Gráficos**: Analiza tendencias financieras con visualizaciones interactivas
- **Metas**: Monitorea el progreso de tus objetivos de ahorro
- **Deudas**: Controla tus obligaciones financieras

### Gestión de Finanzas
- **Gastos**: Agrega y categoriza tus gastos diarios
- **Ingresos**: Registra todas tus fuentes de ingreso
- **Deudas**: Gestiona préstamos y obligaciones
- **Metas**: Establece y sigue objetivos financieros

## 🏗️ Estructura del Proyecto

```
finanwaken/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # Rutas de API
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── expenses/          # Gestión de gastos
│   │   ├── incomes/           # Gestión de ingresos
│   │   ├── debts/             # Gestión de deudas
│   │   ├── goals/             # Gestión de metas
│   │   ├── auth/              # Autenticación
│   │   └── profile/           # Perfil de usuario
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── forms/            # Formularios
│   │   └── layout/           # Componentes de layout
│   ├── lib/                  # Utilidades y configuraciones
│   ├── hooks/                # Custom hooks
│   └── types/                # Definiciones de TypeScript
├── prisma/                   # Esquema y migraciones de BD
├── public/                   # Archivos estáticos
└── docs/                     # Documentación adicional
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción

# Utilidades
npm run lint         # Ejecuta el linter
npx prisma studio    # Abre Prisma Studio para gestionar la BD
```

## 📊 Base de Datos

El proyecto utiliza PostgreSQL con Prisma como ORM. Los modelos principales incluyen:

- **User**: Usuarios del sistema
- **Income**: Registro de ingresos
- **Expense**: Registro de gastos
- **Debt**: Gestión de deudas
- **DebtPayment**: Pagos de deudas
- **Goal**: Metas de ahorro

## 🎨 Personalización

### Temas
El proyecto soporta temas claro y oscuro. Los estilos se pueden personalizar en:
- `src/app/globals.css` - Estilos globales
- `tailwind.config.js` - Configuración de Tailwind

### Componentes
Los componentes están construidos con shadcn y son completamente personalizables:
- `src/components/ui/` - Componentes base
- `src/components/dashboard/` - Componentes específicos del dashboard

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación](docs/)
2. Busca en los [issues existentes](https://github.com/tu-usuario/finanwaken/issues)
3. Crea un nuevo issue con detalles del problema

## 🚀 Roadmap

- [ ] Integración con bancos para sincronización automática
- [ ] Exportación de reportes en PDF
- [ ] Notificaciones push para recordatorios
- [ ] App móvil nativa
- [ ] Análisis predictivo de gastos
- [ ] Integración con servicios de inversión

## 📞 Contacto

- **Desarrollador**: [Alan Calderón]
- **Email**: cb147.ambriz.calderon.alan@gmail.com
- **GitHub**: [@AlanWaken1](https://github.com/AlanWaken1)

---

⭐ **¡Si te gusta este proyecto, dale una estrella en GitHub!**
