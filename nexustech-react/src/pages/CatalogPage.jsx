import { useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Field from '../components/ui/Field.jsx';
import Icon from '../components/ui/Icon.jsx';
import CatalogHero from '../components/catalog/CatalogHero.jsx';
import FilterPanel from '../components/catalog/FilterPanel.jsx';
import Pagination from '../components/catalog/Pagination.jsx';
import ProductCard from '../components/catalog/ProductCard.jsx';
import { categories, normalize } from '../utils/format.js';

const perPage = 24;
const categoryIcons = {
  Workstations: 'laptop',
  Hardware: 'cpu',
  Periféricos: 'headphones',
  Soluciones: 'code'
};

export default function CatalogPage({
  shop,
  favoriteOnly = false,
  onDetail,
  onEdit,
  onDelete,
  onPublish,
  exchange,
  showUSD,
  onCurrency
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  function update(setter, value) {
    setter(value);
    setPage(1);
  }

  function clear() {
    setQuery('');
    setCategory('all');
    setMaxPrice(5000000);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const result = shop.products.filter(
      (p) =>
        (!favoriteOnly || shop.favoriteSet.has(p.id)) &&
        (category === 'all' || p.categoria === category) &&
        p.precio <= maxPrice &&
        normalize(p.nombre + ' ' + p.descripcion + ' ' + (p.vendedor || '')).includes(
          normalize(query.trim())
        )
    );
    if (sort === 'low') result.sort((a, b) => a.precio - b.precio);
    if (sort === 'high') result.sort((a, b) => b.precio - a.precio);
    if (sort === 'name') result.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return result;
  }, [shop.products, shop.favoriteSet, favoriteOnly, query, category, maxPrice, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const usdRate = showUSD && exchange.status === 'success' ? exchange.rate.value : null;

  function changePage(next) {
    setPage(next);
    document.getElementById('resultados')?.scrollIntoView({ block: 'start' });
  }

  const isSeller = shop.user?.rol === 'vendedor' || shop.user?.rol === 'ambos';

  return (
    <>
      {favoriteOnly ? (
        <header className="nt-page-heading">
          <span className="nt-eyebrow">TU SELECCIÓN</span>
          <h1>
            Tus favoritos<span>.</span>
          </h1>
          <p>Vuelve a los equipos y soluciones que guardaste.</p>
          <a className="nt-text-link" href="#/catalogo">
            Explorar catálogo
            <Icon name="arrow" size={17} />
          </a>
        </header>
      ) : (
        <CatalogHero count={shop.products.length} onPublish={onPublish} />
      )}

      <div className="nt-category-shortcuts" role="group" aria-label="Líneas de productos">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant="ghost"
            icon={categoryIcons[cat]}
            aria-pressed={category === cat}
            onClick={() => update(setCategory, category === cat ? 'all' : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="nt-catalog-layout">
        <FilterPanel
          category={category}
          onCategory={(v) => update(setCategory, v)}
          maxPrice={maxPrice}
          onMaxPrice={(v) => update(setMaxPrice, v)}
          onClear={clear}
          exchange={exchange}
          showUSD={showUSD}
          onCurrency={onCurrency}
        />

        <section className="nt-results" id="resultados" aria-labelledby="resultados-titulo">
          <div className="nt-results-heading">
            <div>
              <h2 id="resultados-titulo">
                {favoriteOnly ? 'Productos guardados' : 'Explora el catálogo'}
              </h2>
              <p aria-live="polite">
                {filtered.length.toLocaleString('es-CL')} resultados · {visible.length} en esta página
              </p>
            </div>
            <Field
              label="Ordenar productos"
              hideLabel
              as="select"
              value={sort}
              onChange={(e) => update(setSort, e.target.value)}
            >
              <option value="default">Orden del catálogo</option>
              <option value="low">Menor precio</option>
              <option value="high">Mayor precio</option>
              <option value="name">Nombre: A–Z</option>
            </Field>
          </div>

          <Field
            label="Buscar productos"
            hideLabel
            icon="search"
            type="search"
            placeholder="Buscar equipo, especificación o vendedor…"
            value={query}
            onChange={(e) => update(setQuery, e.target.value)}
            className="nt-catalog-search"
          />

          {visible.length ? (
            <>
              <div className="nt-product-grid">
                {visible.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite={shop.favoriteSet.has(product.id)}
                    onFavorite={shop.toggleFavorite}
                    onDetail={onDetail}
                    onAdd={shop.addToCart}
                    onEdit={isSeller ? onEdit : null}
                    onDelete={isSeller ? onDelete : null}
                    usdRate={usdRate}
                    isSeller={isSeller}
                  />
                ))}
              </div>
              <Pagination page={safePage} totalPages={pages} onChange={changePage} />
            </>
          ) : (
            <EmptyState
              title={
                favoriteOnly && !shop.favoriteSet.size
                  ? 'Todavía no guardaste favoritos'
                  : 'No encontramos productos'
              }
              description={
                favoriteOnly && !shop.favoriteSet.size
                  ? 'Pulsa el corazón de una publicación para encontrarla aquí.'
                  : 'Prueba otro texto o amplía los filtros.'
              }
              icon={favoriteOnly ? 'heart' : 'search'}
              action={
                favoriteOnly && !shop.favoriteSet.size ? (
                  <a href="#/catalogo" className="btn nt-button nt-button--primary">
                    Ver catálogo
                  </a>
                ) : (
                  <Button variant="secondary" onClick={clear}>
                    Limpiar filtros
                  </Button>
                )
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
