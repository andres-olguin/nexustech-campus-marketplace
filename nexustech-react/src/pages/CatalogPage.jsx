import { useEffect, useMemo, useState } from "react";
import CatalogHero from "../components/catalog/CatalogHero.jsx";
import ProductCard from "../components/catalog/ProductCard.jsx";
import Pagination from "../components/catalog/Pagination.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ExchangeRatePanel from "../components/catalog/ExchangeRatePanel.jsx";
import { TechnicalFilters } from "../components/catalog/FilterPanel.jsx";
import { GENERAL_PROFILE, PRODUCT_PROFILES, profileForId, profileForProduct } from "../data/filterProfiles.js";
import { catalogSearch, facetCatalog, filterCatalog } from "../utils/catalog.js";
import { demoFilterSource, optionsFromApi } from "../utils/connectedCatalog.js";
import { useRemote } from "../hooks/useShop.js";
import { DEMO_CATEGORIES, getDemoCatalog } from "../data/demoCatalog.js";

const DEMO_PAGE_LIMIT = 24;
const LIVE_PAGE_LIMIT = 20;
const NO_FACETS = {};

export default function CatalogPage({
  shop,
  favoriteOnly,
  onDetail,
  onEdit,
  onPrice,
  onArchive,
  onPublish,
  exchange,
  showUSD,
  onCurrency,
  usdRate,
}) {
  const [demoMode, setDemoMode] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategory] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [typeChoice, setTypeChoice] = useState("");
  const [technical, setTechnical] = useState({ profile: null, selections: NO_FACETS });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const isDemoActive = demoMode && !favoriteOnly;
  const hint = useMemo(() => catalogSearch(debounced).profile, [debounced]);
  const categories = shop.categories.data || [];
  const inferredType = hint || catalogSearch(
    isDemoActive ? subcategoryFilter || categoryId : categories.find(c => c.id === categoryId)?.name || "",
  ).profile;
  const profile = profileForId(typeChoice) || inferredType || GENERAL_PROFILE;
  const selections = technical.profile === profile.id ? technical.selections : NO_FACETS;
  const encoded = Object.keys(selections).length ? JSON.stringify(selections) : undefined;
  const liveProfile = typeChoice || (encoded && profile.id !== "general" ? profile.id : undefined);
  const baseQuery = { search: debounced, categoryId, maxPrice };
  const liveQuery = { ...baseQuery, profile: liveProfile, facets: encoded, sort: sortBy, limit: LIVE_PAGE_LIMIT };
  const result = useRemote(
    (signal) => isDemoActive ? null : favoriteOnly
      ? (shop.session ? shop.api.favorites(page, signal) : null)
      : shop.api.products({ ...liveQuery, page }, signal),
    [shop.api, shop.revision, shop.session, favoriteOnly, isDemoActive, page, debounced, categoryId, maxPrice, liveProfile, encoded, sortBy],
  );
  const optionsProfile = profile.id === "general" ? undefined : profile.id;
  const remoteOptions = useRemote(
    (signal) => favoriteOnly || isDemoActive || !optionsProfile ? null :
      shop.api.catalogFacets({ ...baseQuery, profile: optionsProfile }, signal),
    [shop.api, shop.revision, favoriteOnly, isDemoActive, debounced, categoryId, maxPrice, optionsProfile],
  );

  const demoAll = useMemo(() => isDemoActive ? getDemoCatalog().map(demoFilterSource) : [], [isDemoActive]);
  const demoSubcategories = useMemo(() => [...new Set(demoAll
    .filter(p => !categoryId || p.category === categoryId)
    .map(p => p.subcategory).filter(Boolean))].sort(), [demoAll, categoryId]);
  const demoFiltered = useMemo(() => {
    if (!isDemoActive) return { results: [], options: {} };
    const pool = demoAll.filter(p => (!subcategoryFilter || p.subcategory === subcategoryFilter) &&
      (!conditionFilter || p.condition === conditionFilter) &&
      (!typeChoice || profileForProduct(p).id === typeChoice));
    const filtered = filterCatalog(pool, { query: debounced, category: categoryId || "all", maxPrice: maxPrice === "" ? Infinity : Number(maxPrice) });
    if (sortBy === "price-asc") filtered.sort((a,b) => a.price - b.price);
    if (sortBy === "price-desc") filtered.sort((a,b) => b.price - a.price);
    if (sortBy === "name-asc") filtered.sort((a,b) => a.name.localeCompare(b.name, "es"));
    if (sortBy === "name-desc") filtered.sort((a,b) => b.name.localeCompare(a.name, "es"));
    return facetCatalog(filtered, selections, profile.fields);
  }, [isDemoActive, demoAll, subcategoryFilter, conditionFilter, typeChoice, debounced, categoryId, maxPrice, sortBy, selections, profile]);

  const options = useMemo(() => isDemoActive ? demoFiltered.options :
    optionsFromApi(profile.fields, remoteOptions.data || [], selections),
    [isDemoActive, demoFiltered, profile, remoteOptions.data, selections]);
  const categoryNames = new Map(categories.map(c => [c.id, c.name]));
  const data = isDemoActive ? {
    items: demoFiltered.results.slice((page - 1) * DEMO_PAGE_LIMIT, page * DEMO_PAGE_LIMIT),
    page, limit: DEMO_PAGE_LIMIT, total: demoFiltered.results.length,
  } : result.data;
  const extract = (found) => favoriteOnly ? found.items.map(f => f.product) : found.items;
  const products = data ? extract(data) : [];
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  useEffect(() => {
    if (data && page > pageCount) setPage(pageCount);
  }, [data, page, pageCount]);

  function inspect(product, index) {
    const offset = (data.page - 1) * data.limit;
    onDetail(product, {
      items: products,
      page: data.page,
      limit: data.limit,
      index: offset + index,
      count: data.total,
      async loadPage(next, signal) {
        if (isDemoActive) return demoFiltered.results.slice((next - 1) * DEMO_PAGE_LIMIT, next * DEMO_PAGE_LIMIT);
        const found = favoriteOnly ? await shop.api.favorites(next, signal) : await shop.api.products({ ...liveQuery, page: next }, signal);
        return extract(found);
      },
    });
  }

  function pickFacet(key, value) {
    const next = { ...selections };
    if (value) next[key] = value;
    else delete next[key];
    setTechnical({ profile: profile.id, selections: next });
    setPage(1);
  }

  function switchMode(enableDemo) {
    setDemoMode(enableDemo);
    setCategory("");
    setSubcategoryFilter("");
    setConditionFilter("");
    setSearch("");
    setDebounced("");
    setMaxPrice("");
    setSortBy("default");
    setTypeChoice("");
    setTechnical({ profile: null, selections: NO_FACETS });
    setPage(1);
  }

  function add(id) {
    if (!shop.user) {
      location.hash = "/acceso";
      return;
    }
    shop.act(() =>
      shop.run(
        () =>
          shop.api.setQuantity(
            id,
            (shop.cart?.items.find((i) => i.productId === id)?.quantity || 0) +
              1,
          ),
        "Carrito actualizado en el servidor.",
      ),
    );
  }

  function favorite(id) {
    if (!shop.user) {
      location.hash = "/acceso";
      return;
    }
    shop.act(() =>
      shop.run(
        () => shop.api.favorite(id, shop.favoriteSet.has(id)),
        "Favoritos actualizados.",
      ),
    );
  }

  return (
    <>
      {favoriteOnly ? (
        <header className="nt-page-heading">
          <span className="nt-eyebrow">TU SELECCIÓN</span>
          <h1>
            Tus favoritos<span>.</span>
          </h1>
          <p>Publicaciones guardadas en tu cuenta.</p>
        </header>
      ) : (
        <CatalogHero count={data?.total || 0} onPublish={onPublish} />
      )}

      {isDemoActive && (
        <Alert title="Modo catálogo de demostración (240 productos en 12 categorías)">
          Estás explorando la presentación visual de demostración para UNAB Sede
          Viña del Mar (sin persistencia SQL ni compras reales).{" "}
          <Button variant="secondary" onClick={() => switchMode(false)}>
            Volver al catálogo en vivo (NestJS)
          </Button>
        </Alert>
      )}

      <ExchangeRatePanel exchange={exchange} showUSD={showUSD} onCurrency={onCurrency} />
      <div className="nt-catalog-layout">
        <aside className="nt-filter-panel">
          <div className="nt-marketplace-filter-heading">
            <h2>Explorar</h2>
            {!favoriteOnly && <Button variant="ghost" className="nt-marketplace-filter-toggle"
              aria-controls="marketplace-filters" aria-expanded={mobileFiltersOpen}
              icon="filter" onClick={() => setMobileFiltersOpen(open => !open)}>Filtros</Button>}
          </div>
          <div className="nt-marketplace-filters" id="marketplace-filters" data-open={mobileFiltersOpen || favoriteOnly}>
          <p>Precios en CLP. El inventario real se confirma en el servidor.</p>
          {!favoriteOnly && (
            <>
              <Field
                label="Categoría"
                as="select"
                value={categoryId}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategoryFilter("");
                  setTypeChoice("");
                  setTechnical({ profile: null, selections: NO_FACETS });
                  setPage(1);
                }}
              >
                <option value="">Todas las categorías</option>
                {isDemoActive
                  ? DEMO_CATEGORIES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))
                  : categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
              </Field>

              {isDemoActive && demoSubcategories.length > 0 && (
                <Field
                  label="Subcategoría"
                  as="select"
                  value={subcategoryFilter}
                  onChange={(e) => {
                    setSubcategoryFilter(e.target.value);
                    setTypeChoice("");
                    setTechnical({ profile: null, selections: NO_FACETS });
                    setPage(1);
                  }}
                >
                  <option value="">Todas las subcategorías</option>
                  {demoSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </Field>
              )}

              {isDemoActive && (
                <Field
                  label="Estado del equipo"
                  as="select"
                  value={conditionFilter}
                  onChange={(e) => {
                    setConditionFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Nuevo y Usado</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                </Field>
              )}

              <Field
                label="Ordenar por"
                as="select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              >
                <option value="default">Novedades / Destacados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A - Z</option>
                <option value="name-desc">Nombre: Z - A</option>
              </Field>

              <Field
                label="Precio máximo en CLP"
                type="number"
                min={0}
                max={2500000}
                step={1}
                value={maxPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (Number.isInteger(Number(value)) &&
                      Number(value) >= 0 &&
                      Number(value) <= 2500000)
                  ) {
                    setMaxPrice(value);
                    setPage(1);
                  }
                }}
              />
              <Field label="Tipo de producto" as="select" value={typeChoice}
                onChange={e => {
                  setTypeChoice(e.target.value);
                  setTechnical({ profile: null, selections: NO_FACETS });
                  setPage(1);
                }}>
                <option value="">Automático según la búsqueda</option>
                {PRODUCT_PROFILES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </Field>
              {profile.label && <p className="nt-technical-label">Filtros para <strong>{profile.label}</strong></p>}
              <TechnicalFilters profile={profile} options={options} selections={selections} onChange={pickFacet} />
              {!isDemoActive && remoteOptions.status === "error" && <p className="nt-muted" role="status">No se pudieron cargar las opciones técnicas.</p>}
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setDebounced("");
                  setTypeChoice("");
                  setTechnical({ profile: null, selections: NO_FACETS });
                  setCategory("");
                  setSubcategoryFilter("");
                  setConditionFilter("");
                  setMaxPrice("");
                  setSortBy("default");
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </>
          )}
          {!isDemoActive && shop.categories.status === "error" && (
            <Alert tone="error">
              No se pudieron cargar categorías.{" "}
              <Button onClick={shop.refresh}>Reintentar</Button>
            </Alert>
          )}
          <a className="nt-text-link" href="#/acceso">
            Gestionar mi perfil y categorías
          </a>
          </div>
        </aside>

        <section
          className="nt-results"
          aria-labelledby="resultados-titulo"
          aria-busy={!isDemoActive && result.status === "loading"}
        >
          <div className="nt-results-heading">
            <div>
              <h2 id="resultados-titulo">
                {favoriteOnly
                  ? "Publicaciones guardadas"
                  : isDemoActive
                    ? "Catálogo de demostración (Viña del Mar)"
                    : "Catálogo del marketplace"}
              </h2>
              <p>
                {data
                  ? `${data.total} resultados · página ${data.page} (${data.limit} por página)`
                  : "Consulta al servidor"}
              </p>
            </div>
            <div className="nt-results-actions">
              {!favoriteOnly && (
                <Button
                  variant={isDemoActive ? "primary" : "secondary"}
                  onClick={() => switchMode(!isDemoActive)}
                >
                  {isDemoActive
                    ? "Ver catálogo API real"
                    : "Ver catálogo demo (240)"}
                </Button>
              )}
              {!isDemoActive && (
                <Button onClick={shop.refresh} disabled={shop.busy}>
                  Actualizar
                </Button>
              )}
            </div>
          </div>

          {!favoriteOnly && (
            <Field
              label="Buscar productos"
              type="search"
              placeholder="Nombre, categoría, subcategoría o especificación"
              value={search}
              maxLength={160}
              onChange={(e) => {
                const value = e.target.value;
                if (catalogSearch(value).profile?.id !== hint?.id) {
                  setTechnical({ profile: null, selections: NO_FACETS });
                }
                setSearch(value);
              }}
            />
          )}

          {favoriteOnly && !shop.user ? (
            <Alert>
              <a href="#/acceso">Inicia sesión</a> para consultar tus favoritos.
            </Alert>
          ) : !isDemoActive && result.status === "loading" ? (
            <p role="status">Cargando publicaciones…</p>
          ) : !isDemoActive && result.error ? (
            <Alert tone="error" title="Catálogo no disponible">
              {result.error.message}{" "}
              <div className="nt-alert-inline-actions">
                <Button variant="secondary" onClick={shop.refresh}>
                  Reintentar
                </Button>
                {!favoriteOnly && (
                  <Button variant="ghost" onClick={() => switchMode(true)}>
                    Explorar catálogo de demostración (240 ítems)
                  </Button>
                )}
              </div>
            </Alert>
          ) : !products.length ? (
            <EmptyState
              title={favoriteOnly ? "No hay publicaciones para mostrar" : "No hay productos relacionados a esto"}
              description={
                isDemoActive
                  ? "Ningún producto de demostración coincide con los filtros actuales."
                  : "Prueba otros filtros o publica el primer producto. Si lo deseas, también puedes explorar el catálogo demostrativo."
              }
              action={
                !favoriteOnly && !isDemoActive ? (
                  <Button variant="secondary" onClick={() => switchMode(true)}>
                    Explorar catálogo demo (240 ítems)
                  </Button>
                ) : null
              }
            />
          ) : (
            <>
              <div className="nt-product-grid">
                {products.map((p, index) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    category={categoryNames.get(p.categoryId) || p.category}
                    own={!p.isDemo && p.sellerId === shop.user?.id}
                    favorite={!p.isDemo && shop.favoriteSet.has(p.id)}
                    onFavorite={favorite}
                    onDetail={() => inspect(p, index)}
                    usdRate={usdRate}
                    onPrice={onPrice}
                    onAdd={add}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    busy={
                      shop.busy ||
                      Boolean(shop.user && shop.account.status !== "success")
                    }
                  />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={pageCount}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
