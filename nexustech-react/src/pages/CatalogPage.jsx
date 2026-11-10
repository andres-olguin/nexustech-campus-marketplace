import { useCallback, useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Field from '../components/ui/Field.jsx';
import Icon from '../components/ui/Icon.jsx';
import CatalogHero from '../components/catalog/CatalogHero.jsx';
import ExchangeRatePanel from '../components/catalog/ExchangeRatePanel.jsx';
import FilterPanel from '../components/catalog/FilterPanel.jsx';
import Pagination from '../components/catalog/Pagination.jsx';
import ProductCard from '../components/catalog/ProductCard.jsx';
import { catalogHref } from '../data/departments.js';
import { GENERAL_PROFILE, profileForId, profileForProduct, profileForSection } from '../data/filterProfiles.js';
import { activeFacetLabels, catalogProfiles, catalogSearch, facetCatalog, filterCatalog } from '../utils/catalog.js';
import { categories, formatNumber } from '../utils/format.js';
import { MAX_PRICE } from '../utils/pricing.js';

const PER_PAGE = 24;
const categoryIcons = { all: 'grid', Workstations: 'laptop', Hardware: 'cpu', Periféricos: 'headphones', Soluciones: 'code' };
const browseCategories = ['all', ...categories];
const EMPTY_FACETS = {};

function scrollToResults() {
  document.getElementById('resultados')?.scrollIntoView({ block: 'start' });
}

function SectionHeading({ section }) {
  return <header className="nt-section-heading">
    <nav aria-label="Ruta del catálogo">
      <ol>
        <li><a href={catalogHref()}>Catálogo</a></li>
        {section.trail.map(({ id, label }) => <li key={id}>
          <Icon name="chevron" size={13} />
          {id === section.id ? <span aria-current="page">{label}</span> : <a href={catalogHref(id)}>{label}</a>}
        </li>)}
      </ol>
    </nav>
    <h1>{section.label}</h1>
  </header>;
}

export default function CatalogPage({ shop, section, favoriteOnly = false, onDetail, onDelete, onEditPrice, onPublish, exchange, showUSD, onCurrency }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [typeChoice, setTypeChoice] = useState('');
  const [technical, setTechnical] = useState({ profileId: GENERAL_PROFILE.id, values: EMPTY_FACETS });
  const favorites = favoriteOnly ? shop.favoriteSet : null;
  const search = useMemo(() => catalogSearch(query, section), [query, section]);
  const pool = useMemo(
    () => filterCatalog(shop.products, { search, category, maxPrice: MAX_PRICE, sort, favorites, section }),
    [shop.products, search, category, sort, favorites, section]
  );
  const { inferred, choices } = useMemo(() => catalogProfiles(pool), [pool]);
  const fixedProfile = profileForSection(section) || search.profile;
  const chosen = fixedProfile ? null : profileForId(typeChoice);
  const profile = fixedProfile || chosen || inferred;
  const facets = technical.profileId === profile.id ? technical.values : EMPTY_FACETS;
  // Un cambio de familia descarta los filtros técnicos de la anterior.
  if (technical.profileId !== profile.id) setTechnical({ profileId: profile.id, values: EMPTY_FACETS });
  const facetLabels = activeFacetLabels(facets, profile.fields);
  const activeCount = Number(Boolean(query.trim())) + Number(category !== 'all') + Number(maxPrice < MAX_PRICE)
    + Number(sort !== 'default') + Number(Boolean(chosen)) + facetLabels.length;
  const emptyFavorites = favoriteOnly && !shop.favoriteSet.size && !activeCount;

  function update(setter, value) { setter(value); setPage(1); }
  function clear() {
    setQuery(''); setCategory('all'); setMaxPrice(MAX_PRICE); setSort('default');
    setTypeChoice(''); setTechnical({ profileId: profile.id, values: EMPTY_FACETS }); setPage(1);
  }
  function changeCategory(value) {
    if (value === category) return;
    update(setCategory, value);
    setTypeChoice('');
    setTechnical({ profileId: profile.id, values: EMPTY_FACETS });
  }
  function changeQuery(value) {
    const next = catalogSearch(value, section);
    if (next.profile && typeChoice && next.profile.id !== typeChoice) setTypeChoice('');
    update(setQuery, value);
  }
  function changeFacet(key, value) {
    setTechnical((current) => {
      const next = { ...(current.profileId === profile.id ? current.values : EMPTY_FACETS) };
      if (value) next[key] = value;
      else delete next[key];
      return { profileId: profile.id, values: next };
    });
    setPage(1);
  }
  const candidates = useMemo(
    () => pool.filter((product) => product.precio <= maxPrice && (!chosen || profileForProduct(product) === chosen)),
    [pool, maxPrice, chosen]
  );
  const { results: filtered, options } = useMemo(() => facetCatalog(candidates, facets, profile.fields), [candidates, facets, profile]);
  const inspect = useCallback((product) => onDetail(product, filtered), [onDetail, filtered]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages);
  const first = (safePage - 1) * PER_PAGE;
  const visible = filtered.slice(first, first + PER_PAGE);
  const usdRate = showUSD ? exchange.rate?.value : null;

  function explore() {
    document.getElementById('resultados-titulo')?.focus({ preventScroll: true });
    scrollToResults();
  }

  return <>
    {favoriteOnly ? <header className="nt-page-heading">
      <span className="nt-eyebrow">TU SELECCIÓN</span><h1>Tus favoritos<span>.</span></h1>
      <p>Vuelve a los equipos y soluciones que guardaste.</p>
      <a className="nt-text-link" href="#/catalogo">Explorar catálogo<Icon name="arrow" size={16} /></a>
    </header> : section ? <SectionHeading section={section} /> : <CatalogHero count={shop.products.length} onExplore={explore} onPublish={onPublish} />}
    <section id="resultados" className="nt-catalog-section" aria-labelledby="resultados-titulo">
      <div className="nt-results-heading">
        <h2 id="resultados-titulo" tabIndex={-1}>{favoriteOnly ? 'Productos guardados' : section ? 'Productos relacionados' : 'Explora el catálogo'}</h2>
        <p aria-live="polite">{formatNumber(filtered.length)} {filtered.length === 1 ? 'resultado' : 'resultados'}
          {visible.length > 0 && <span> · {first + 1}–{first + visible.length}</span>}
        </p>
      </div>
      <div className="nt-browse-tools">
        <Field id="nexus-search" label="Buscar productos" hideLabel icon="search" type="search"
          placeholder="Buscar productos…" maxLength={160} value={query} onChange={(event) => changeQuery(event.target.value)} className="nt-catalog-search" />
        <Field label="Ordenar productos" hideLabel as="select" value={sort} onChange={(event) => update(setSort, event.target.value)}>
          <option value="default">Orden inicial</option><option value="low">Menor precio</option>
          <option value="high">Mayor precio</option><option value="name">Nombre: A–Z</option>
        </Field>
      </div>
      <div className="nt-category-shortcuts" role="group" aria-label="Líneas de productos">
        {browseCategories.map((cat) => <Button key={cat} variant="ghost" icon={categoryIcons[cat]} aria-pressed={category === cat}
          onClick={() => changeCategory(category === cat ? 'all' : cat)}>{cat === 'all' ? 'Todas' : cat}</Button>)}
      </div>
      <ExchangeRatePanel exchange={exchange} showUSD={showUSD} onCurrency={onCurrency} />
      <div className="nt-catalog-layout">
        <FilterPanel category={category} onCategory={changeCategory} maxPrice={maxPrice}
          onMaxPrice={(value) => update(setMaxPrice, value)} onClear={clear} activeCount={activeCount}
          profile={profile} typeChoices={fixedProfile ? [] : choices} chosen={chosen} onTypeChange={(value) => update(setTypeChoice, value)}
          options={options} selections={facets} onFacetChange={changeFacet} />
        <div className="nt-results">
          {facetLabels.length > 0 && <div className="nt-facet-chips" role="group" aria-label="Filtros técnicos aplicados">
            {facetLabels.map(({ key, label }) => <Button key={key} variant="ghost" icon="close"
              aria-label={'Quitar filtro ' + label} onClick={() => changeFacet(key, '')}>{label}</Button>)}
          </div>}
          {visible.length ? <>
            <div className="nt-product-grid">{visible.map((product) => <ProductCard key={product.id} product={product}
              favorite={shop.favoriteSet.has(product.id)} onFavorite={shop.toggleFavorite} onDetail={inspect} onAdd={shop.addToCart}
              onDelete={onDelete} onEditPrice={shop.editableIds.has(product.id) ? onEditPrice : undefined} usdRate={usdRate} />)}</div>
            <Pagination page={safePage} totalPages={pages} onChange={(next) => { setPage(next); scrollToResults(); }} />
          </> : <EmptyState title={emptyFavorites ? 'Todavía no guardaste favoritos' : 'No hay productos relacionados a esto'}
            description={emptyFavorites ? 'Pulsa el corazón de una publicación para encontrarla aquí.'
              : query.trim() ? <>No encontramos coincidencias para <strong>«{query.trim()}»</strong>. Prueba otro texto o amplía los filtros.</>
                : activeCount ? 'Prueba ampliar o quitar los filtros.'
                  : section ? <>Todavía no hay publicaciones en <strong>{section.label}</strong>. Puedes explorar otras categorías.</>
                    : 'Todavía no hay publicaciones en el catálogo.'} icon={emptyFavorites ? 'heart' : 'search'}
            action={emptyFavorites
              ? <a className="btn nt-button nt-button--primary" href={catalogHref()}>Ver catálogo</a>
              : (activeCount > 0 || section) && <div className="nt-empty-actions">
                {activeCount > 0 && <Button variant="secondary" onClick={clear}>Limpiar filtros</Button>}
                {section && <a className="btn nt-button nt-button--primary" href={catalogHref()}>Ver todo el catálogo</a>}
              </div>} />}
        </div>
      </div>
    </section>
  </>;
}
