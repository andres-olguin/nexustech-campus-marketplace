import { useEffect, useState } from "react";
import CatalogHero from "../components/catalog/CatalogHero.jsx";
import ProductCard from "../components/catalog/ProductCard.jsx";
import Pagination from "../components/catalog/Pagination.jsx";
import Button from "../components/ui/Button.jsx";
import Field from "../components/ui/Field.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { useRemote } from "../hooks/useShop.js";
export default function CatalogPage({
  shop,
  favoriteOnly,
  onDetail,
  onEdit,
  onArchive,
  onPublish,
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const result = useRemote(
    (signal) =>
      favoriteOnly
        ? shop.session
          ? shop.api.favorites(page, signal)
          : null
        : shop.api.products(
            { page, limit: 20, search: debounced, categoryId, maxPrice },
            signal,
          ),
    [
      shop.api,
      shop.revision,
      shop.session,
      favoriteOnly,
      page,
      debounced,
      categoryId,
      maxPrice,
    ],
  );
  const categories = shop.categories.data || [];
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const data = result.data;
  const products = favoriteOnly
    ? data?.items.map((f) => f.product) || []
    : data?.items || [];
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
      <div className="nt-catalog-layout">
        <aside className="nt-filter-panel">
          <h2>Explorar</h2>
          <p>Precios en CLP. El inventario se confirma al comprar.</p>
          {!favoriteOnly && (
            <>
              <Field
                label="Categoría"
                as="select"
                value={categoryId}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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
                  setMaxPrice("");
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </>
          )}
          {shop.categories.status === "error" && (
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
          aria-busy={result.status === "loading"}
        >
          <div className="nt-results-heading">
            <div>
              <h2 id="resultados-titulo">
                {favoriteOnly
                  ? "Publicaciones guardadas"
                  : "Catálogo del marketplace"}
              </h2>
              <p>
                {data
                  ? `${data.total} resultados · página ${data.page}`
                  : "Consulta al servidor"}
              </p>
            </div>
            <Button onClick={shop.refresh} disabled={shop.busy}>
              Actualizar
            </Button>
          </div>
          {!favoriteOnly && (
            <Field
              label="Buscar productos"
              type="search"
              placeholder="Nombre o descripción"
              value={search}
              maxLength={160}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          {favoriteOnly && !shop.user ? (
            <Alert>
              <a href="#/acceso">Inicia sesión</a> para consultar tus favoritos.
            </Alert>
          ) : result.status === "loading" ? (
            <p role="status">Cargando publicaciones…</p>
          ) : result.error ? (
            <Alert tone="error" title="Catálogo no disponible">
              {result.error.message}
              <Button variant="secondary" onClick={shop.refresh}>
                Reintentar
              </Button>
            </Alert>
          ) : !products.length ? (
            <EmptyState
              title="No hay publicaciones para mostrar"
              description="Prueba otros filtros o publica el primer producto. No se muestran datos locales de respaldo."
            />
          ) : (
            <>
              <div className="nt-product-grid">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    category={categoryNames.get(p.categoryId)}
                    own={p.sellerId === shop.user?.id}
                    favorite={shop.favoriteSet.has(p.id)}
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
