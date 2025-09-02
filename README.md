echo "# Cinemapp 🎬

Una aplicación móvil desarrollada con React Native y TypeScript que te permite explorar películas y acceder a la cámara de tu dispositivo.

## 🚀 Características

- **Explorar Películas**: Descubre las películas más populares, mejor valoradas y próximos estrenos
- **Búsqueda Inteligente**: Encuentra películas por título
- **Detalles Completos**: Información detallada de cada película (sinopsis, reparto, calificación, etc.)
- **Cámara Integrada**: Acceso directo a la cámara del dispositivo para tomar fotos
- **Interfaz Moderna**: Diseño intuitivo y atractivo

## 🛠️ Tecnologías Utilizadas

- **React Native** con **TypeScript**
- **Expo** para desarrollo y build
- **API de TMDB** (The Movie Database)
- **React Navigation** para navegación
- **Expo Camera** para acceso a la cámara
- **Hooks** de React para gestión de estado

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI instalado globalmente
- Dispositivo móvil con Expo Go o emulador

## 🔧 Instalación

1. **Clona el repositorio**:
   \`\`\`bash
   git clone https://github.com/codehsalas/cinemapp.git
   cd cinemapp
   \`\`\`

2. **Instala las dependencias**:
   \`\`\`bash
   npm install
   # o
   yarn install
   \`\`\`

3. **Configura variables de entorno**:
   Crea un archivo \`.env\` en la raíz del proyecto:
   \`\`\`
   TMDB_API_KEY=tu_api_key_de_tmdb
   TMDB_BASE_URL=https://api.themoviedb.org/3
   TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
   \`\`\`

4. **Obtén tu API Key de TMDB**:
   - Regístrate en [The Movie Database](https://www.themoviedb.org/settings/api)
   - Obtén tu API key
   - Reemplaza \`tu_api_key_de_tmdb\` en el archivo \`.env\`

## 🚀 Ejecución

**Desarrollo**:
\`\`\`bash
npm start
# o
yarn start
\`\`\`

**Android**:
\`\`\`bash
npm run android
# o
yarn android
\`\`\`

**iOS**:
\`\`\`bash
npm run ios
# o
yarn ios
\`\`\`

## 📱 Funcionalidades de la Cámara

La aplicación incluye acceso nativo a la cámara del dispositivo:
- Toma fotos directamente desde la app
- Permisos gestionados automáticamente
- Integración seamless con la interfaz

## 🎨 Estructura del Proyecto

\`\`\`
cinemapp/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── screens/        # Pantallas de la aplicación
│   ├── services/       # Servicios API (TMDB)
│   ├── hooks/          # Custom hooks
│   ├── types/          # Definiciones TypeScript
│   └── utils/          # Utilidades
├── assets/             # Recursos estáticos
└── App.tsx            # Componente principal
\`\`\`

## 🌟 Próximas Características

- [ ] Favoritos y listas personalizadas
- [ ] Trailers integrados
- [ ] Notificaciones de estrenos
- [ ] Modo offline
- [ ] Compartir películas

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Haz fork del proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo \`LICENSE\` para más detalles.

## 👨‍💻 Autor

**Hector Salas**  
- GitHub: [@codehsalas](https://github.com/codehsalas)

## 🙏 Agradecimientos

- [The Movie Database (TMDB)](https://www.themoviedb.org/) por la API
- [Expo](https://expo.dev/) por las herramientas de desarrollo
- Comunidad de React Native

---

⭐ Si te gusta este proyecto, no olvides darle una estrella en GitHub!
" > README.md
