import { useEffect, useId, useRef, useState } from 'react';
import { catalogHref, DEPARTMENTS } from '../../data/departments.js';
import Icon from '../ui/Icon.jsx';

function DepartmentGroup({ department, group, sectionId, onSelect }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const groupId = department.id + '/' + group.id;
  return <div className="nt-department-group">
    <h3>{group.label}</h3>
    <button type="button" className="nt-department-group-toggle" aria-expanded={expanded} aria-controls={id}
      onClick={() => setExpanded(!expanded)}>{group.label}<Icon name="chevron" size={15} /></button>
    <ul id={id} className="nt-department-links" data-expanded={expanded}>
      {group.children.map((child) => <li key={child.id}>
        <a href={catalogHref(groupId + '/' + child.id)} aria-current={sectionId === groupId + '/' + child.id ? 'page' : undefined} onClick={onSelect}>{child.label}</a>
      </li>)}
      <li><a className="nt-department-all" href={catalogHref(groupId)} aria-current={sectionId === groupId ? 'page' : undefined} aria-label={'Ver todos: ' + group.label} onClick={onSelect}>Ver todos<Icon name="arrow" size={14} /></a></li>
    </ul>
  </div>;
}

export default function DepartmentMenu({ activeId, onChange, section, onReselect }) {
  const root = useRef(null);
  const opener = useRef(null);
  const panel = useRef(null);
  const panelId = useId();
  const active = DEPARTMENTS.find(({ id }) => id === activeId);

  useEffect(() => {
    if (!active) return;
    panel.current.scrollTop = 0;
    function dismiss(event) {
      if (!root.current?.contains(event.target)) onChange(null);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [active, onChange]);

  function close(restoreFocus = false) {
    onChange(null);
    if (restoreFocus) opener.current?.focus();
  }

  function toggle(event, id) {
    opener.current = event.currentTarget;
    onChange(active?.id === id ? null : id);
  }

  function select(event) {
    close();
    if (event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey &&
        event.currentTarget.hash === location.hash) {
      event.preventDefault();
      onReselect();
    }
  }

  return <nav ref={root} className="nt-departments" aria-label="Categorías del catálogo"
    onKeyDown={(event) => { if (active && event.key === 'Escape') { event.preventDefault(); close(true); } }}
    onBlur={(event) => { if (active && event.relatedTarget && !root.current?.contains(event.relatedTarget)) close(); }}>
    <div className="nt-department-bar">
      <div className="nt-department-desktop-tabs">
        {DEPARTMENTS.map(({ id, label, icon }) => <button type="button" key={id} className="nt-department-tab"
          aria-expanded={active?.id === id} aria-controls={panelId} data-current={section?.departmentId === id}
          onClick={(event) => toggle(event, id)}>
          <Icon name={icon} size={17} /><span>{label}</span><Icon name="chevron" size={13} className="nt-department-caret" />
        </button>)}
      </div>
      <button type="button" className="nt-department-mobile-trigger" aria-expanded={Boolean(active)} aria-controls={panelId}
        onClick={(event) => { opener.current = event.currentTarget; onChange(active ? null : section?.departmentId || DEPARTMENTS[0].id); }}>
        <Icon name="grid" size={17} /><span>Categorías</span><Icon name="chevron" size={14} className="nt-department-caret" />
      </button>
    </div>
    <section ref={panel} id={panelId} className="nt-department-panel" hidden={!active} aria-label={active?.label}>
      {active && <div className="nt-department-panel-inner">
        <div className="nt-department-mobile-tabs" aria-label="Departamentos">
          {DEPARTMENTS.map(({ id, label, icon }) => <button type="button" key={id} aria-pressed={id === active.id} onClick={() => onChange(id)}>
            <Icon name={icon} size={16} /><span>{label}</span>
          </button>)}
        </div>
        <div className="nt-department-panel-heading">
          <h2>{active.label}</h2>
          <div>
            <a href={catalogHref(active.id)} aria-current={section?.id === active.id ? 'page' : undefined} onClick={select}>Ver todo<Icon name="arrow" size={16} /></a>
            <button type="button" className="nt-department-close" aria-label="Cerrar categorías" onClick={() => close(true)}><Icon name="close" size={18} /></button>
          </div>
        </div>
        <div className="nt-department-grid" key={active.id}>
          {active.groups.map((group) => <DepartmentGroup key={group.id} department={active} group={group} sectionId={section?.id} onSelect={select} />)}
        </div>
      </div>}
    </section>
  </nav>;
}
