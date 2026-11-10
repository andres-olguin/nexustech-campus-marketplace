import { useEffect, useMemo, useState } from "react";
import CatalogHero from "../components/catalog/CatalogHero.jsx";
import ProductCard from "../components/catalog/ProductCard.jsx";
import Pagination from "../components/catalog/Pagination.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { useRemote } from "../hooks/useShop.js";
import { DEMO_CATEGORIES, getDemoCatalog } from "../data/demoCatalog.js";

const DEMO_PAGE_LIMIT = 24;

export default function CatalogPage({
  shop,
  favoriteOnly,
  onDetail,
  onEdit,
  onArchive,
  onPublish,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const result = useRemote(
    (signal) => {
      if (demoMode && !favoriteOnly) return null;
      return favoriteOnly
        ? shop.session
          ? shop.api.favorites(page, signal)
          : null
        : shop.api.products(
            { page, limit: 20, search: debounced, categoryId, maxPrice },
            signal,
          );
    },
    [
      shop.api,
      shop.revision,
      shop.session,
      favoriteOnly,
      demoMode,
      page,
      debounced,
      categoryId,
      maxPrice,
    ],
  );

  const demoAll = useMemo(() => (demoMode ? getDemoCatalog() : []), [demoMode]);

  const demoSubcategories = useMemo(() => {
    if (!demoMode) return [];
    const pool = categoryId
      ? demoAll.filter((p) => p.category === categoryId)
      : demoAll;
    return [...new Set(pool.map((p) => p.subcategory).filter(Boolean))].sort();
  }, [demoMode, demoAll, categoryId]);

  const demoFiltered = useMemo(() => {
    if (!demoMode) return [];
    const term = debounced.toLowerCase();
    const maxP = maxPrice !== "" ? Number(maxPrice) : null;
    const filtered = demoAll.filter((p) => {
      if (categoryId && p.category !== categoryId) return false;
      if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
      if (conditionFilter && p.condition !== conditionFilter) return false;
      if (maxP !== null && p.price > maxP) return false;
      if (
        term &&
        !p.name.toLowerCase().includes(term) &&
        !p.description.toLowerCase().includes(term) &&
        !p.category.toLowerCase().includes(term) &&
        !(p.subcategory || "").toLowerCase().includes(term) &&
        !(p.specs || []).some((s) => s.toLowerCase().includes(term))
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name-asc") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
    }
    if (sortBy === "name-desc") {
      return [...filtered].sort((a, b) => b.name.localeCompare(a.name, "es"));
    }
    return filtered;
  }, [
    demoMode,
    demoAll,
    debounced,
    categoryId,
    subcategoryFilter,
    conditionFilter,
    maxPrice,
    sortBy,
  ]);

  const categories = shop.categories.data || [];
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  const isDemoActive = demoMode && !favoriteOnly;
  const data = isDemoActive
    ? {
        items: demoFiltered.slice(
          (page - 1) * DEMO_PAGE_LIMIT,
          page * DEMO_PAGE_LIMIT,
        ),
        page,
        limit: DEMO_PAGE_LIMIT,
        total: demoFiltered.length,
      }
    : result.data;

  const rawProducts = favoriteOnly
    ? data?.items.map((f) => f.product) || []
    : data?.items || [];

  const products = useMemo(() => {
    if (isDemoActive || sortBy === "default") return rawProducts;
    if (sortBy === "price-asc")
      return [...rawProducts].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc")
      return [...rawProducts].sort((a, b) => b.price - a.price);
    if (sortBy === "name-asc")
      return [...rawProducts].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sortBy === "name-desc")
      return [...rawProducts].sort((a, b) => b.name.localeCompare(a.name, "es"));
    return rawProducts;
  }, [isDemoActive, rawProducts, sortBy]);

  function switchMode(enableDemo) {
    setDemoMode(enableDemo);
    setCategory("");
    setSubcategoryFilter("");
    setConditionFilter("");
    setSearch("");
    setDebounced("");
    setMaxPrice("");
    setSortBy("default");
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

      <div className="nt-catalog-layout">
        <aside className="nt-filter-panel">
          <h2>Explorar</h2>
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
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
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
              onChange={(e) => setSearch(e.target.value)}
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
              title="No hay publicaciones para mostrar"
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
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    category={categoryNames.get(p.categoryId) || p.category}
                    own={!p.isDemo && p.sellerId === shop.user?.id}
                    favorite={!p.isDemo && shop.favoriteSet.has(p.id)}
                    onFavorite={favorite}
                    onDetail={onDetail}
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
                totalPages={Math.max(1, Math.ceil(data.total / data.limit))}
                onChange={setPage}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
