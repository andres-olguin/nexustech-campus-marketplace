import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Field from '../components/ui/Field.jsx';
import Icon from '../components/ui/Icon.jsx';
import Badge from '../components/ui/Badge.jsx';
import Alert from '../components/ui/Alert.jsx';
import useValidatedForm from '../hooks/useValidatedForm.js';
import { isEmail, formatCLP } from '../utils/format.js';
import api from '../services/backendApi.js';

const CAMPUS_LIST = [
  'Campus República UNAB',
  'Campus Casona UNAB',
  'Campus Bellavista UNAB',
  'Campus Los Leones UNAB',
  'Sede Viña del Mar UNAB',
  'Sede Concepción UNAB'
];

function LoginForm({ onLogin }) {
  const [authError, setAuthError] = useState(null);

  const form = useValidatedForm(
    { email: 'estudiante@uandresbello.edu', password: 'password123' },
    (values) => {
      const errors = {};
      if (!isEmail(values.email)) errors.email = 'Ingresa un correo electrónico válido.';
      if (values.password.length < 4) errors.password = 'Escribe una clave de al menos 4 caracteres.';
      return errors;
    },
    async (values) => {
      setAuthError(null);
      const res = await api.login(values.email, values.password);
      if (res.success && res.data.user) {
        onLogin(res.data.user);
      } else {
        // Fallback local
        const guessedName = values.email.split('@')[0].replace('.', ' ');
        onLogin({
          nombre: guessedName.charAt(0).toUpperCase() + guessedName.slice(1),
          email: values.email,
          rol: 'ambos',
          campus: 'Campus República UNAB'
        });
      }
    }
  );

  const props = (name) => ({
    name,
    value: form.values[name],
    onChange: form.change,
    error: form.errors[name]
  });

  return (
    <form ref={form.ref} onSubmit={form.submit} noValidate>
      {authError && <Alert tone="danger" title="Error de autenticación">{authError}</Alert>}
      <Field label="Correo electrónico institucional" {...props('email')} required type="email" maxLength={160} />
      <Field label="Contraseña" {...props('password')} required type="password" maxLength={80} />
      <Button type="submit" icon="user" className="nt-full-width">
        Iniciar Sesión
      </Button>
    </form>
  );
}

function RegisterForm({ onRegister }) {
  const [regError, setRegError] = useState(null);

  const form = useValidatedForm(
    {
      nombre: '',
      email: '',
      password: '',
      rol: 'vendedor',
      campus: CAMPUS_LIST[0],
      telefono: '+56 9 '
    },
    (values) => {
      const errors = {};
      if (values.nombre.trim().length < 3) errors.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
      if (!isEmail(values.email)) errors.email = 'Ingresa un correo institucional válido.';
      if (values.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres.';
      if (!values.campus) errors.campus = 'Selecciona tu sede o campus.';
      return errors;
    },
    async (values) => {
      setRegError(null);
      const res = await api.register(values);
      if (res.success && res.data.user) {
        onRegister(res.data.user);
      } else {
        onRegister({
          id: 'usr-' + Date.now().toString(36),
          nombre: values.nombre,
          email: values.email,
          rol: values.rol,
          campus: values.campus,
          telefono: values.telefono
        });
      }
    }
  );

  const props = (name) => ({
    name,
    value: form.values[name],
    onChange: form.change,
    error: form.errors[name]
  });

  return (
    <form ref={form.ref} onSubmit={form.submit} noValidate>
      {regError && <Alert tone="danger" title="Error al registrar">{regError}</Alert>}
      <Field label="Nombre y apellido" {...props('nombre')} required maxLength={80} placeholder="Ej. Camila Rojas" />
      <Field label="Correo UNAB / institucional" {...props('email')} required type="email" maxLength={160} placeholder="usuario@uandresbello.edu" />
      <Field label="Contraseña" {...props('password')} required type="password" maxLength={80} placeholder="Mínimo 6 caracteres" />

      <div className="nt-form-row">
        <Field label="Tipo de perfil" {...props('rol')} as="select" required>
          <option value="comprador">Comprador (Buscar y adquirir hardware)</option>
          <option value="vendedor">Vendedor (Publicar y ofrecer equipos)</option>
          <option value="ambos">Perfil Híbrido (Comprador y Vendedor)</option>
        </Field>

        <Field label="Campus / Sede" {...props('campus')} as="select" required>
          {CAMPUS_LIST.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Field>
      </div>

      <Field label="Teléfono de contacto" {...props('telefono')} maxLength={30} placeholder="+56 9 1234 5678" />

      <Button type="submit" icon="check" className="nt-full-width">
        Crear Cuenta en NexusTech
      </Button>
    </form>
  );
}

export default function LoginPage({
  user,
  onLogin,
  onLogout,
  onSwitchRole,
  onPublish,
  onEditProduct,
  products = [],
  orders = []
}) {
  const [tab, setTab] = useState('login'); // 'login' o 'register'

  const userRole = user?.rol || 'comprador';
  const isSeller = userRole === 'vendedor' || userRole === 'ambos';
  const myProducts = products.filter((p) => p.vendedor === user?.nombre || p.vendedor_id === user?.id);
  const myOrders = orders.filter((o) => o.email === user?.email || o.email_cliente === user?.email);

  return (
    <div className="nt-account-layout">
      <header className="nt-page-heading">
        <span className="nt-eyebrow">CAMPUS HUB UNAB</span>
        <h1>
          {user ? 'Panel de Cuenta' : 'Acceso a NexusTech'}
          <span>.</span>
        </h1>
        <p>Gestión de identidad, perfiles comprador/vendedor e inventario académico.</p>
        <div className="nt-account-art">
          <Icon name="cpu" size={70} />
        </div>
      </header>

      {user ? (
        <div className="nt-profile-dashboard">
          <Card title="Perfil de Usuario" description="Datos del usuario y rol activo en el marketplace.">
            <div className="nt-profile-card">
              <div className="nt-profile-header">
                <span className="nt-profile-avatar">{user.nombre.slice(0, 1).toUpperCase()}</span>
                <div className="nt-profile-info">
                  <h2>{user.nombre}</h2>
                  <p>{user.email}</p>
                  <div className="nt-profile-badges">
                    <Badge tone={isSeller ? 'primary' : 'muted'}>
                      ROL: {userRole.toUpperCase()}
                    </Badge>
                    <span className="nt-campus-tag">
                      <Icon name="shield" size={14} /> {user.campus || 'Campus República UNAB'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="nt-role-switch-box">
                <div>
                  <strong>Alternar Modo de Operación</strong>
                  <p>Cambia entre vista de comprador y herramientas de vendedor de hardware.</p>
                </div>
                <Button
                  variant="secondary"
                  icon="refresh"
                  onClick={() => onSwitchRole && onSwitchRole()}
                >
                  Cambiar a {userRole === 'vendedor' ? 'Comprador' : 'Vendedor'}
                </Button>
              </div>

              <div className="nt-user-stats-grid">
                <div className="nt-stat-box">
                  <span className="nt-stat-num">{myOrders.length}</span>
                  <span className="nt-stat-label">Pedidos Realizados</span>
                </div>
                <div className="nt-stat-box">
                  <span className="nt-stat-num">{myProducts.length}</span>
                  <span className="nt-stat-label">Publicaciones Activas</span>
                </div>
                <div className="nt-stat-box">
                  <span className="nt-stat-num">{isSeller ? 'Habilitado' : 'Solo Compras'}</span>
                  <span className="nt-stat-label">Estado de Venta</span>
                </div>
              </div>

              <div className="nt-profile-actions">
                {isSeller && (
                  <Button icon="plus" onClick={onPublish}>
                    Publicar Nuevo Producto
                  </Button>
                )}
                <Button variant="danger" icon="logout" onClick={onLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </Card>

          {isSeller && (
            <Card
              title="Mis Publicaciones e Inventario"
              description="Equipos y soluciones tecnológicas que has publicado en el catálogo."
            >
              {myProducts.length === 0 ? (
                <div className="nt-empty-inventory">
                  <p>Aún no has publicado productos con esta cuenta.</p>
                  <Button icon="plus" onClick={onPublish}>
                    Crear mi primera publicación
                  </Button>
                </div>
              ) : (
                <div className="nt-seller-inventory-table">
                  {myProducts.map((p) => (
                    <div key={p.id} className="nt-inventory-row">
                      <div className="nt-inv-info">
                        <strong>{p.nombre}</strong>
                        <span>{p.categoria} · {formatCLP(p.precio)} · Stock: {p.stock || 1}</span>
                      </div>
                      <div className="nt-inv-actions">
                        {onEditProduct && (
                          <Button
                            variant="secondary"
                            icon="edit"
                            onClick={() => onEditProduct(p)}
                          >
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      ) : (
        <Card
          title={tab === 'login' ? 'Iniciar Sesión' : 'Registro de Cuenta'}
          description="Conecta con tu perfil de estudiante o docente para comprar y vender tecnología."
        >
          <div className="nt-auth-tabs">
            <button
              className={`nt-tab-btn ${tab === 'login' ? 'is-active' : ''}`}
              onClick={() => setTab('login')}
            >
              Iniciar Sesión
            </button>
            <button
              className={`nt-tab-btn ${tab === 'register' ? 'is-active' : ''}`}
              onClick={() => setTab('register')}
            >
              Crear Cuenta Nueva
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm onLogin={onLogin} />
          ) : (
            <RegisterForm onRegister={onLogin} />
          )}
        </Card>
      )}
    </div>
  );
}
