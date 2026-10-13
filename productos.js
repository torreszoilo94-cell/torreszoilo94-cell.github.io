
 // @ts-nocheck
const SUPABASE_URL = "https://tlzmkxszlnvywhchcfwf.supabase.co";
const SUPABASE_KEY = "sb_publishable_HAZbvQxqGBNfMLPeHthvoQ_Vdj6qCK8";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("product-search");
const categoryFilter = document.getElementById("category-filter");
const catalogMessage = document.getElementById("catalog-message");

let productos = [];
let resumenResenas = {};
let resenasPorProducto = {};

async function cargarCatalogo() {
    productGrid.innerHTML = "<p>Cargando productos...</p>";

    const { data, error } = await db
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando productos:", error);
        productGrid.textContent =
            "No se pudieron cargar los productos. Inténtalo más tarde.";
        return;
    }

    productos = (data || []).filter(
        product => product.available !== false
    );

    await Promise.all([
        cargarResumenResenas(),
        cargarResenasPublicadas()
    ]);

    const categorias = [...new Set(
        productos
            .map(product => product.category)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "es"));

    categoryFilter.innerHTML =
        '<option value="">Todas las categorías</option>';

    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        categoryFilter.appendChild(option);
    });

    mostrarProductos();
}

async function cargarResumenResenas() {
    resumenResenas = {};

    const ids = productos.map(p => p.id).filter(Boolean);
    if (!ids.length) return;

    const { data, error } = await db
        .from("product_review_summary")
        .select("product_id, average_rating, review_count")
        .in("product_id", ids);

    if (error) {
        console.error("Error cargando resumen de reseñas:", error);
        return;
    }

    (data || []).forEach(item => {
        resumenResenas[item.product_id] = item;
    });
}

async function cargarResenasPublicadas() {
    resenasPorProducto = {};

    const ids = productos.map(p => p.id).filter(Boolean);
    if (!ids.length) return;

    const { data, error } = await db
        .from("product_reviews")
        .select("id, product_id, customer_name, rating, comment, created_at")
        .in("product_id", ids)
        .eq("approved", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando opiniones publicadas:", error);
        return;
    }

    (data || []).forEach(resena => {
        if (!resenasPorProducto[resena.product_id]) {
            resenasPorProducto[resena.product_id] = [];
        }

        resenasPorProducto[resena.product_id].push(resena);
    });
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function crearValoracion(product) {
    const resumen = resumenResenas[product.id];
    const promedio = resumen
        ? Number(resumen.average_rating) || 0
        : 0;
    const cantidad = resumen
        ? Number(resumen.review_count) || 0
        : 0;

    const contenedor = crearElemento("div", "product-rating");
    const estrellas = crearElemento("span", "rating-stars");

    estrellas.setAttribute(
        "aria-label",
        cantidad
            ? `${promedio.toFixed(1)} de 5 estrellas`
            : "Todavía sin valoraciones"
    );

    for (let i = 1; i <= 5; i++) {
        estrellas.appendChild(crearElemento(
            "span",
            i <= Math.round(promedio)
                ? "estrella-activa"
                : "estrella-vacia",
            i <= Math.round(promedio) ? "★" : "☆"
        ));
    }

    contenedor.appendChild(estrellas);

    if (cantidad > 0) {
        contenedor.appendChild(crearElemento(
            "span", "rating-number", promedio.toFixed(1)
        ));

        contenedor.appendChild(crearElemento(
            "span",
            "rating-count",
            cantidad === 1 ? "(1 reseña)" : `(${cantidad} reseñas)`
        ));
    } else {
        contenedor.appendChild(crearElemento(
            "span", "rating-count", "Sin reseñas todavía"
        ));
    }

    return contenedor;
}


function crearListaResenas(product) {
    const seccion = crearElemento("section", "product-reviews");

    const resenas = resenasPorProducto[product.id] || [];

    const boton = crearElemento(
        "button",
        "reviews-toggle-button",
        `Ver opiniones (${resenas.length})`
    );

    boton.type = "button";
    boton.setAttribute("aria-expanded", "false");

    const contenido = crearElemento("div", "reviews-content");
    contenido.hidden = true;

    if (!resenas.length) {
        contenido.appendChild(crearElemento(
            "p",
            "no-reviews",
            "Todavía no hay opiniones publicadas."
        ));
    } else {
        resenas.forEach(resena => {
            const tarjeta = crearElemento("article", "review-item");
            const cabecera = crearElemento("div", "review-header");

            const nombre = crearElemento(
                "strong",
                "review-author",
                resena.customer_name || "Cliente"
            );

            const estrellas = crearElemento("span", "rating-stars");
            const nota = Math.max(
                0,
                Math.min(5, Number(resena.rating) || 0)
            );

            for (let i = 1; i <= 5; i++) {
                estrellas.appendChild(crearElemento(
                    "span",
                    i <= nota ? "estrella-activa" : "estrella-vacia",
                    i <= nota ? "★" : "☆"
                ));
            }

            cabecera.append(nombre, estrellas);

            const comentario = crearElemento(
                "p",
                "review-comment",
                resena.comment || ""
            );

            tarjeta.append(cabecera, comentario);

            if (resena.created_at) {
                const fecha = new Date(resena.created_at);

                if (!Number.isNaN(fecha.getTime())) {
                    tarjeta.appendChild(crearElemento(
                        "small",
                        "review-date",
                        fecha.toLocaleDateString("es")
                    ));
                }
            }

            contenido.appendChild(tarjeta);
        });
    }

    boton.addEventListener("click", () => {
        const abrir = contenido.hidden;

        contenido.hidden = !abrir;
        boton.setAttribute("aria-expanded", String(abrir));

        boton.textContent = abrir
            ? "Cerrar opiniones"
            : `Ver opiniones (${resenas.length})`;
    });

    seccion.append(boton, contenido);

    return seccion;
}


function crearFormularioResena(product) {
    const detalles = crearElemento("details", "review-form-wrap");
    const resumen = crearElemento("summary", "", "Dejar una reseña");
    const form = crearElemento("form", "product-review-form");

    const nombreLabel = crearElemento("label", "", "Tu nombre");
    const nombreInput = crearElemento("input");
    nombreInput.type = "text";
    nombreInput.name = "customer_name";
    nombreInput.maxLength = 80;
    nombreInput.autocomplete = "name";
    nombreInput.placeholder = "Escribe tu nombre";
    nombreInput.required = true;
    nombreLabel.appendChild(nombreInput);

    const ratingLabel = crearElemento("label", "", "Tu valoración");
    const ratingSelect = crearElemento("select");
    ratingSelect.name = "rating";
    ratingSelect.required = true;

    const inicial = crearElemento(
        "option", "", "Selecciona de 1 a 5 estrellas"
    );
    inicial.value = "";
    inicial.disabled = true;
    inicial.selected = true;
    ratingSelect.appendChild(inicial);

    for (let i = 5; i >= 1; i--) {
        const option = crearElemento(
            "option",
            "",
            `${"★".repeat(i)}${"☆".repeat(5 - i)} — ${i} ${
                i === 1 ? "estrella" : "estrellas"
            }`
        );
        option.value = String(i);
        ratingSelect.appendChild(option);
    }

    ratingLabel.appendChild(ratingSelect);

    const comentarioLabel = crearElemento("label", "", "Tu comentario");
    const comentario = crearElemento("textarea");
    comentario.name = "comment";
    comentario.maxLength = 1000;
    comentario.rows = 4;
    comentario.placeholder = "Cuéntanos tu experiencia con el producto";
    comentario.required = true;
    comentarioLabel.appendChild(comentario);

    const boton = crearElemento("button", "", "Enviar reseña");
    boton.type = "submit";

    const mensaje = crearElemento("p", "review-message");
    mensaje.setAttribute("aria-live", "polite");

    form.append(
        nombreLabel,
        ratingLabel,
        comentarioLabel,
        boton,
        mensaje
    );

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const customerName = nombreInput.value.trim();
        const comment = comentario.value.trim();
        const rating = Number(ratingSelect.value);

        if (
            !customerName ||
            !comment ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            mensaje.textContent = "Completa todos los campos correctamente.";
            return;
        }

        boton.disabled = true;
        mensaje.textContent = "Enviando reseña...";

        const { error } = await db.from("product_reviews").insert({
            product_id: product.id,
            customer_name: customerName,
            rating,
            comment,
            approved: false
        });

        if (error) {
            console.error("Error enviando reseña:", error);
            mensaje.textContent =
                "No se pudo enviar. Inténtalo de nuevo más tarde.";
            boton.disabled = false;
            return;
        }

        form.reset();
        mensaje.textContent =
            "¡Gracias! Tu reseña está pendiente de aprobación.";
        boton.disabled = false;
    });

    detalles.append(resumen, form);
    return detalles;
}

function mostrarProductos() {
    const busqueda = searchInput.value.trim().toLocaleLowerCase("es");
    const categoria = categoryFilter.value;

    const filtrados = productos.filter(product => {
        const nombre = (product.name || "").toLocaleLowerCase("es");
        const descripcion = (product.description || "").toLocaleLowerCase("es");

        return (
            (!busqueda ||
                nombre.includes(busqueda) ||
                descripcion.includes(busqueda)) &&
            (!categoria || product.category === categoria)
        );
    });

    catalogMessage.textContent = filtrados.length === 1
        ? "Se encontró 1 producto."
        : `Se encontraron ${filtrados.length} productos.`;

    productGrid.innerHTML = "";

    if (!filtrados.length) {
        productGrid.appendChild(crearElemento(
            "p", "", "No hay productos que coincidan con tu búsqueda."
        ));
        return;
    }

    filtrados.forEach(product => {
        const card = crearElemento("article", "product-card");

        const image = crearElemento("img");
        image.src = product.image_url || "images/logo.jpg";
        image.alt = product.name || "Producto de limpieza";
        image.loading = "lazy";
        image.onerror = () => {
            image.onerror = null;
            image.src = "images/logo.jpg";
        };

        const category = crearElemento(
            "p", "product-category", product.category || ""
        );
        const name = crearElemento("h3", "", product.name || "");
        const description = crearElemento(
            "p", "", product.description || ""
        );
        const price = crearElemento(
            "p", "product-price", product.price ?? ""
        );
        const availability = crearElemento(
            "p", "product-availability", "Disponible"
        );

        card.append(
            image,
            category,
            name,
            description,
            crearValoracion(product),
            crearListaResenas(product),
            price,
            availability,
            crearFormularioResena(product)
        );

        productGrid.appendChild(card);
    });
}

searchInput.addEventListener("input", mostrarProductos);
categoryFilter.addEventListener("change", mostrarProductos);

cargarCatalogo();
