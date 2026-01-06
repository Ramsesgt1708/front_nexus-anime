# CRUD - Roles, Planes y Usuarios

Se han creado 3 nuevas páginas con CRUDs completos para gestionar:
- **Roles** (Administración de Roles de Usuario)
- **Planes** (Administración de Planes de Suscripción)
- **Usuarios** (Administración de Usuarios - Solo Admin)

## Estructura de archivos creados

### Servicios
- `src/services/roles.service.ts` - Servicio API para Roles
- `src/services/planes.service.ts` - Servicio API para Planes
- `src/services/usuarios.service.ts` - Servicio API para Usuarios

### Páginas y Formularios

**Roles:**
- `src/pages/roles/RolesPage.tsx` - Página principal de Roles
- `src/pages/roles/addRolesForm.tsx` - Formulario para agregar/editar roles

**Planes:**
- `src/pages/planes/PlanesPage.tsx` - Página principal de Planes
- `src/pages/planes/addPlanesForm.tsx` - Formulario para agregar/editar planes

**Usuarios:**
- `src/pages/usuarios/UsuariosPage.tsx` - Página principal de Usuarios (Protegida para Admin)
- `src/pages/usuarios/addUsuariosForm.tsx` - Formulario para agregar/editar usuarios

## Características

### Todas las páginas incluyen:
✅ **DataTable completo** con búsqueda, ordenamiento y paginación
✅ **Modal para crear/editar** registros
✅ **Botón toggle** para activar/desactivar registros
✅ **Botón eliminar** con confirmación SweetAlert
✅ **Estadísticas** (Total, Activos, Inactivos)
✅ **Validaciones** en formularios
✅ **Manejo de errores** con toasts
✅ **Fechas formateadas** de creación y modificación
✅ **Acciones** con menú desplegable

### Página de Usuarios - Características Especiales:
🔒 **Protección de acceso** - Solo accesible para Administradores
- Usa el hook `useHasAccess()` para validar permisos
- Muestra página "Acceso Denegado" si el usuario no es admin
- Los roles soportados son: `ADMIN` y `ROOT`

## Cómo agregar a la navegación

1. **Abre el archivo del Header o navegación** (probablemente `src/components/layout/Header.tsx`)

2. **Agrega los enlaces a las nuevas páginas:**
```tsx
// Importa las páginas (si usas React Router)
import RolesPage from './pages/roles/RolesPage';
import PlanesPage from './pages/planes/PlanesPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
```

3. **Agrega las rutas en tu router:**
```tsx
<Route path="/roles" element={<RolesPage />} />
<Route path="/planes" element={<PlanesPage />} />
<Route path="/usuarios" element={<UsuariosPage />} /> {/* Solo admin */}
```

4. **Agrega los links en el menú de navegación:**
```tsx
<Link to="/roles">Roles</Link>
<Link to="/planes">Planes</Link>
<Link to="/usuarios">Usuarios</Link> {/* Mostrar solo si es admin */}
```

## Endpoint del Backend

Las páginas están configuradas para usar los siguientes endpoints:

**Roles:**
- `GET /api/Roles` - Obtener todos
- `GET /api/Roles/{id}` - Obtener uno
- `POST /api/Roles` - Crear
- `PUT /api/Roles/{id}` - Actualizar
- `DELETE /api/Roles/{id}` - Eliminar
- `PATCH /api/Roles/{id}/toggle-status` - Cambiar estado

**Planes:**
- `GET /api/Planes` - Obtener todos
- `GET /api/Planes/{id}` - Obtener uno
- `POST /api/Planes` - Crear
- `PUT /api/Planes/{id}` - Actualizar
- `DELETE /api/Planes/{id}` - Eliminar
- `PATCH /api/Planes/{id}/toggle-status` - Cambiar estado

**Usuarios:**
- `GET /api/Usuarios` - Obtener todos
- `GET /api/Usuarios/{id}` - Obtener uno
- `POST /api/Usuarios` - Crear
- `PUT /api/Usuarios/{id}` - Actualizar
- `DELETE /api/Usuarios/{id}` - Eliminar
- `PATCH /api/Usuarios/{id}/toggle-status` - Cambiar estado

## Estructura de datos esperada

### Roles
```json
{
  "_id": "string",
  "nombre": "string",
  "descripcion": "string",
  "isActive": true,
  "fechaCreacion": "2024-01-01T00:00:00Z",
  "fechaModificacion": "2024-01-01T00:00:00Z"
}
```

### Planes
```json
{
  "_id": "string",
  "nombre": "string",
  "descripcion": "string",
  "precio": 99.99,
  "isActive": true,
  "fechaCreacion": "2024-01-01T00:00:00Z",
  "fechaModificacion": "2024-01-01T00:00:00Z"
}
```

### Usuarios
```json
{
  "_id": "string",
  "nombreCompleto": "string",
  "email": "string",
  "nombreUsuario": "string",
  "rol": "string",
  "isActive": true,
  "fechaCreacion": "2024-01-01T00:00:00Z",
  "fechaModificacion": "2024-01-01T00:00:00Z"
}
```

## Estilos

Todas las páginas usan:
- **Tailwind CSS** para los estilos
- **Tema oscuro** consistente con el resto de la aplicación
- **Colores**: Cyan (#2affd6), Blue, Green, Red, Purple
- **Diseño responsivo** para móvil y escritorio

## Información importante

⚠️ **La página de Usuarios:**
- Solo es visible para usuarios con rol **ADMIN** o **ROOT**
- Si un usuario sin estos permisos intenta acceder, verá una página de "Acceso Denegado"
- Se recomienda también proteger la ruta a nivel de router

💡 **Personalización:**
- Si tu API devuelve datos en formato diferente, ajusta los campos en los formularios
- Si necesitas agregar más campos, simplemente agrega más inputs en los formularios
- Los estilos pueden ser personalizados modificando las clases de Tailwind

✅ **Próximos pasos:**
1. Integra estas páginas en tu router
2. Prueba los CRUDs con tu API backend
3. Ajusta los campos según tu estructura de datos real
4. Personaliza los estilos si es necesario
