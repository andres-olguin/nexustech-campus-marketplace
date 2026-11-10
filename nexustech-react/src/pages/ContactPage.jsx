import { useState } from 'react';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Field from '../components/ui/Field.jsx';
import Icon from '../components/ui/Icon.jsx';
import useValidatedForm from '../hooks/useValidatedForm.js';
import { isEmail } from '../utils/format.js';

export default function ContactPage({ onSave, contacts }) {
  const [code, setCode] = useState(null);
  const form = useValidatedForm({ nombre: '', email: '', mensaje: '' }, (values) => {
    const errors = {};
    if (values.nombre.trim().length < 3) errors.nombre = 'Ingresa tu nombre de al menos 3 caracteres.';
    if (!isEmail(values.email)) errors.email = 'Ingresa un correo válido.';
    if (values.mensaje.trim().length < 10) errors.mensaje = 'Escribe un mensaje de al menos 10 caracteres.';
    return errors;
  }, (values) => setCode(onSave(values)));
  const props = (name) => ({ name, value: form.values[name], onChange: form.change, error: form.errors[name] });
  return <><header className="nt-page-heading"><span className="nt-eyebrow">HABLEMOS</span><h1>Contacto<span>.</span></h1><p>Consultas sobre publicaciones y la experiencia de NexusTech.</p></header><div className="nt-two-columns"><Card title="Escribe tu consulta" description="Formulario de demostración. La consulta queda registrada en este navegador.">{code && <Alert tone="success" title="Consulta de demostración registrada">Número: {code}</Alert>}<form ref={form.ref} onSubmit={form.submit} noValidate><Field label="Nombre y apellido" {...props('nombre')} required maxLength={100} /><Field label="Correo electrónico" {...props('email')} type="email" required maxLength={160} /><Field label="Mensaje" {...props('mensaje')} as="textarea" rows={5} required maxLength={2000} /><Button type="submit" icon="mail">Guardar consulta de demostración</Button></form></Card><div className="nt-contact-aside"><Card title="NexusTech Campus Hub"><div className="nt-contact-note"><Icon name="cpu" size={28} /><p>Marketplace de hardware y soluciones informáticas para la comunidad universitaria.</p></div><dl className="nt-detail-list"><div><dt>Comunidad</dt><dd>UNAB · Sede Viña del Mar</dd></div><div><dt>Asignatura</dt><dd>Desarrollo Web y Móvil · Hito 3 (Prototipo estudiantil)</dd></div></dl></Card>{contacts.length > 0 && <Card title="Tus consultas recientes"><ul className="nt-contact-history">{contacts.slice(0, 3).map((contact) => <li key={contact.codigo}><strong>{contact.codigo}</strong><p>{contact.mensaje}</p></li>)}</ul></Card>}</div></div></>;
}
