import { useEffect, useId, useRef } from 'react';
import Button from './Button.jsx';

// Solo se usa la API del diálogo para sincronizar su apertura con la prop open.
export default function Dialog({ open, title, description, onClose, children, wide = false, drawer = false, navigation, viewKey, onKeyDown }) {
  const ref = useRef(null);
  const heading = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    if (!open || !viewKey) return;
    const dialog = ref.current;
    dialog.scrollTop = 0;
    if (!dialog.contains(document.activeElement)) heading.current?.focus({ preventScroll: true });
  }, [open, viewKey]);
  function backdrop(event) {
    if (event.target !== ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose();
  }
  return <dialog ref={ref} className={'nt-dialog' + (wide ? ' nt-dialog--wide' : '') + (drawer ? ' nt-dialog--drawer' : '')} aria-labelledby={id + '-title'} aria-describedby={description ? id + '-description' : undefined} onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={() => { if (!ref.current.open) onClose(); }} onClick={backdrop} onKeyDown={onKeyDown}>
    <div className="nt-dialog-header"><div><h2 id={id + '-title'} ref={heading} tabIndex={-1}>{title}</h2>{description && <p id={id + '-description'}>{description}</p>}</div><Button variant="ghost" icon="close" className="nt-icon-button" aria-label="Cerrar ventana" onClick={onClose} /></div>
    {navigation}
    <div className="nt-dialog-body">{children}</div>
  </dialog>;
}
