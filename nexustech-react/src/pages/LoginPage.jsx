import { useState } from 'react';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Field from '../components/ui/Field.jsx';
export default function LoginPage({ shop, onPublish }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const body = { email: form.get('email').trim(), password: form.get('password') };
    if (register) body.name = form.get('name').trim();
    try { await shop.authenticate(body, register); } catch (err) { setError(err.message); }
  }
  async function save(event) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    try { await shop.run(() => shop.api.updateProfile({ name: form.get('name').trim(), sellerName: form.get('sellerName').trim() }), 'Perfil guardado en el servidor.'); } catch (err) { setError(err.message); }
  }
  async function create(event) {
    event.preventDefault(); setError('');
    const form = event.currentTarget;
    try { await shop.run(() => shop.api.createCategory(new FormData(form).get('categoryName').trim()), 'Categoría creada.'); form.reset(); } catch (err) { setError(err.message); }
  }
  return <section className="nt-account-page"><header className="nt-page-heading"><span className="nt-eyebrow">TU ESPACIO</span><h1>Mi cuenta<span>.</span></h1><p>Compra y publica con la misma cuenta. Los permisos se verifican en el servidor.</p></header>{error && <Alert tone="error">{error}</Alert>}
    {!shop.user ? <div className="nt-auth-card"><div className="nt-form-actions"><Button variant={!register ? 'primary' : 'secondary'} onClick={() => { setRegister(false); setError(''); }}>Iniciar sesión</Button><Button variant={register ? 'primary' : 'secondary'} onClick={() => { setRegister(true); setError(''); }}>Crear cuenta</Button></div><form key={String(register)} onSubmit={submit} aria-busy={shop.busy}>{register && <Field label="Nombre" name="name" required minLength={3} maxLength={80} autoComplete="name" />}<Field label="Correo electrónico" type="email" name="email" required maxLength={254} autoComplete="email" /><Field label="Contraseña" type="password" name="password" required minLength={register ? 12 : 1} maxLength={128} autoComplete={register ? 'new-password' : 'current-password'} hint={register ? 'Entre 12 y 128 caracteres. Usa datos sintéticos para la demo.' : 'La sesión dura hasta una hora y no se guarda al recargar.'} /><Button type="submit" disabled={shop.busy}>{shop.busy ? 'Conectando…' : register ? 'Registrar cuenta' : 'Ingresar'}</Button></form></div> : <>
    <div className="nt-form-actions"><Button onClick={onPublish} disabled={shop.busy}>Publicar producto</Button><a className="nt-text-link" href="#/rastreo">Mis pedidos y ventas</a><Button variant="secondary" onClick={shop.logout} disabled={shop.busy}>Cerrar sesión</Button></div>
    {shop.account.status === 'loading' ? <p role="status">Consultando perfil…</p> : shop.account.error ? <Alert tone="error">{shop.account.error.message}<Button onClick={shop.refresh}>Reintentar</Button></Alert> : shop.profile && <div className="nt-profile-grid"><section className="nt-auth-card"><h2>Perfil comprador y vendedor</h2><p>{shop.profile.email}</p><small className="nt-id">Usuario: {shop.profile.id}</small><form key={shop.profile.id + shop.profile.name + shop.profile.sellerProfile.displayName} onSubmit={save}><Field label="Nombre del perfil" name="name" defaultValue={shop.profile.name} required minLength={3} maxLength={80} /><Field label="Nombre de vendedor" name="sellerName" defaultValue={shop.profile.sellerProfile.displayName} required minLength={3} maxLength={80} /><Button type="submit" disabled={shop.busy}>Guardar perfil</Button></form></section><section className="nt-auth-card"><h2>Categorías</h2>{shop.categories.error && <Alert tone="error">{shop.categories.error.message}</Alert>}<ul>{shop.categories.data?.map(c => <li key={c.id}>{c.name}</li>)}</ul><form onSubmit={create}><Field label="Nueva categoría" name="categoryName" required minLength={3} maxLength={80} /><Button type="submit" disabled={shop.busy}>Crear categoría</Button></form></section></div>}
    </>}
  </section>;
}
