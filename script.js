// ============================================
// EL INGENIOSO EXPERTO
// SCRIPT PRINCIPAL DE LA PORTADA
// ============================================
// @ts-nocheck
const SUPABASE_URL =
    "https://tlzmkxszlnvywhchcfwf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_HAZbvQxqGBNfMLPeHthvoQ_Vdj6qCK8";

const { createClient } = window.supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================
// FUNCIONES AUXILIARES
// ============================================

function crearElemento(
    etiqueta,
    clase,
    texto
) {
    const elemento =
        document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined && texto !== null) {
        elemento.textContent = texto;
    }

    return elemento;
}


function crearImagen(
    url,
    nombre
) {
    const imagen =
        document.createElement("img");

    imagen.className = "product-image";
    imagen.alt = nombre || "Producto de limpieza";
    imagen.loading = "lazy";

    imagen.src =
        url || "images/logo.png";

    imagen.onerror = function () {
        this.onerror = null;
        this.src = "images/logo.png";
    };

    return imagen;
}


function formatearPrecio(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "Precio no disponible";
    }

    return numero.toLocaleString("es-CU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " CUP";
}


function obtenerFechaHabana() {
    const partes = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "America/Havana",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).formatToParts(new Date());

    const valores = {};

    partes.forEach(function (parte) {
        valores[parte.type] = parte.value;
    });

    return (
        valores.year + "-" +
        valores.month + "-" +
        valores.day
    );
}


// ============================================
// PRODUCTOS DESTACADOS DE LA PORTADA
// ============================================

async function cargarProductos() {
    const productGrid =
        document.getElementById("product-grid");

    if (!productGrid) {
        return;
    }

    productGrid.replaceChildren(
        crearElemento(
            "p",
            "loading-message",
            "Cargando productos..."
        )
    );

    try {
        const respuesta = await db
            .from("products")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (respuesta.error) {
            throw respuesta.error;
        }

        const productos = (
            respuesta.data || []
        )
            .filter(function (producto) {
                return producto.available !== false;
            })
            .slice(0, 3);

        productGrid.replaceChildren();

        if (productos.length === 0) {
            productGrid.appendChild(
                crearElemento(
                    "p",
                    "empty-message",
                    "Pronto tendremos productos disponibles."
                )
            );

            return;
        }

        // Consultar las valoraciones de los productos destacados.
        const ids = productos.map(function (producto) {
            return producto.id;
        });

        let resumenes = [];

        if (ids.length > 0) {
            const resultadoResenas = await db
                .from("product_review_summary")
                .select("*")
                .in("product_id", ids);

            if (!resultadoResenas.error) {
                resumenes =
                    resultadoResenas.data || [];
            }
        }

        productos.forEach(function (producto) {
            const tarjeta =
                crearElemento("article", "product-card");

            const imagen = crearImagen(
                producto.image_url,
                producto.name
            );

            tarjeta.appendChild(imagen);

            const informacion =
                crearElemento("div", "product-info");

            informacion.appendChild(
                crearElemento(
                    "span",
                    "product-category",
                    producto.category || "Limpieza"
                )
            );

            informacion.appendChild(
                crearElemento(
                    "h3",
                    "",
                    producto.name || "Producto"
                )
            );

            informacion.appendChild(
                crearElemento(
                    "p",
                    "product-description",
                    producto.description || ""
                )
            );

            // Mostrar la valoración, si existe.
            const resumen = resumenes.find(
                function (fila) {
                    return String(fila.product_id) ===
                        String(producto.id);
                }
            );

            if (resumen) {
                const promedio = Number(
                    resumen.average_rating ??
                    resumen.avg_rating ??
                    resumen.promedio ??
                    0
                );

                const cantidad = Number(
                    resumen.review_count ??
                    resumen.total_reviews ??
                    resumen.cantidad ??
                    0
                );

                if (cantidad > 0) {
                    const valoracion =
                        crearElemento(
                            "div",
                            "product-rating"
                        );

                    valoracion.appendChild(
                        crearElemento(
                            "span",
                            "rating-stars",
                            "★".repeat(
                                Math.max(
                                    0,
                                    Math.min(
                                        5,
                                        Math.round(promedio)
                                    )
                                )
                            ) +
                            "☆".repeat(
                                Math.max(
                                    0,
                                    5 - Math.round(promedio)
                                )
                            )
                        )
                    );

                    valoracion.appendChild(
                        crearElemento(
                            "span",
                            "rating-number",
                            promedio.toFixed(1)
                        )
                    );

                    valoracion.appendChild(
                        crearElemento(
                            "span",
                            "rating-count",
                            "(" + cantidad + ")"
                        )
                    );

                    informacion.appendChild(
                        valoracion
                    );
                }
            }

            informacion.appendChild(
                crearElemento(
                    "p",
                    "product-price",
                    formatearPrecio(producto.price)
                )
            );

            informacion.appendChild(
                crearElemento(
                    "p",
                    "product-availability",
                    "Disponible"
                )
            );

            tarjeta.appendChild(informacion);

            productGrid.appendChild(tarjeta);
        });

    } catch (error) {
        console.error(
            "Error al cargar los productos:",
            error
        );

        productGrid.replaceChildren(
            crearElemento(
                "p",
                "error-message",
                "No se pudieron cargar los productos. Inténtalo más tarde."
            )
        );
    }
}


// ============================================
// OFERTAS ACTIVAS
// ============================================

async function cargarOfertas() {
    const offersGrid =
        document.getElementById("offers-grid");

    if (!offersGrid) {
        return;
    }

    offersGrid.replaceChildren(
        crearElemento(
            "p",
            "loading-message",
            "Buscando ofertas..."
        )
    );

    try {
        const respuesta = await db
            .from("products")
            .select("*")
            .eq("on_sale", true)
            .order("created_at", {
                ascending: false
            });

        if (respuesta.error) {
            throw respuesta.error;
        }

        const fechaActual =
            obtenerFechaHabana();

        const ofertas = (
            respuesta.data || []
        ).filter(function (producto) {
            if (producto.available === false) {
                return false;
            }

            const precioOferta =
                Number(producto.sale_price);

            const precioNormal =
                Number(producto.price);

            if (
                !Number.isFinite(precioOferta) ||
                !Number.isFinite(precioNormal) ||
                precioOferta <= 0 ||
                precioNormal <= 0 ||
                precioOferta >= precioNormal
            ) {
                return false;
            }

            if (
                producto.sale_start &&
                producto.sale_start > fechaActual
            ) {
                return false;
            }

            if (
                producto.sale_end &&
                producto.sale_end < fechaActual
            ) {
                return false;
            }

            return true;
        });

        offersGrid.replaceChildren();

        if (ofertas.length === 0) {
            offersGrid.appendChild(
                crearElemento(
                    "p",
                    "empty-message",
                    "Ahora mismo no hay ofertas activas. ¡Vuelve pronto!"
                )
            );

            return;
        }

        ofertas.forEach(function (producto) {
            const tarjeta =
                crearElemento("article", "product-card");

            tarjeta.appendChild(
                crearImagen(
                    producto.image_url,
                    producto.name
                )
            );

            const informacion =
                crearElemento("div", "product-info");

            informacion.appendChild(
                crearElemento(
                    "span",
                    "product-category",
                    "OFERTA"
                )
            );

            informacion.appendChild(
                crearElemento(
                    "h3",
                    "",
                    producto.name || "Producto"
                )
            );

            informacion.appendChild(
                crearElemento(
                    "p",
                    "product-description",
                    producto.description || ""
                )
            );

            const precioAnterior =
                crearElemento(
                    "p",
                    "old-price",
                    formatearPrecio(producto.price)
                );

            precioAnterior.style.textDecoration =
                "line-through";

            informacion.appendChild(precioAnterior);

            informacion.appendChild(
                crearElemento(
                    "p",
                    "product-price offer-price",
                    formatearPrecio(producto.sale_price)
                )
            );

            if (producto.sale_end) {
                informacion.appendChild(
                    crearElemento(
                        "p",
                        "offer-end-date",
                        "Oferta válida hasta: " +
                        producto.sale_end
                    )
                );
            }

            tarjeta.appendChild(informacion);

            offersGrid.appendChild(tarjeta);
        });

    } catch (error) {
        console.error(
            "Error al cargar las ofertas:",
            error
        );

        offersGrid.replaceChildren(
            crearElemento(
                "p",
                "error-message",
                "No se pudieron cargar las ofertas."
            )
        );
    }
}


// ============================================
// ESTADO DEL NEGOCIO: ABIERTO O CERRADO
// ============================================

async function cargarEstadoNegocio() {
    const estado =
        document.getElementById("business-status");

    if (!estado) {
        return;
    }

    try {
        const fechaActual =
            obtenerFechaHabana();

        const respuesta = await db
            .from("business_hours")
            .select("*")
            .eq("date", fechaActual)
            .maybeSingle();

        if (respuesta.error) {
            throw respuesta.error;
        }

        if (!respuesta.data) {
            estado.textContent =
                "Horario no disponible";

            return;
        }

        const horario = respuesta.data;

        if (horario.is_closed === true) {
            estado.textContent = "Cerrado";
            return;
        }

        const apertura =
            horario.open_time;

        const cierre =
            horario.close_time;

        if (!apertura || !cierre) {
            estado.textContent =
                "Horario no configurado";

            return;
        }

        estado.textContent =
            "Horario: " +
            apertura.slice(0, 5) +
            " - " +
            cierre.slice(0, 5);

    } catch (error) {
        console.error(
            "Error al consultar el horario:",
            error
        );

        estado.textContent =
            "Horario no disponible";
    }
}


// ============================================
// MENÚ PARA TELÉFONOS
// ============================================

function configurarMenuMovil() {
    const boton =
        document.getElementById("menu-toggle");

    const menu =
        document.getElementById("main-nav");

    if (!boton || !menu) {
        return;
    }

    boton.addEventListener("click", function () {
        const abierto =
            menu.classList.toggle("menu-abierto");

        boton.setAttribute(
            "aria-expanded",
            String(abierto)
        );
    });

    menu.querySelectorAll("a").forEach(
        function (enlace) {
            enlace.addEventListener(
                "click",
                function () {
                    menu.classList.remove(
                        "menu-abierto"
                    );

                    boton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        }
    );
}


// ============================================
// ANIMACIONES AL DESPLAZARSE
// ============================================

function configurarAnimaciones() {
    const elementos =
        document.querySelectorAll(".scroll-reveal");

    if (!("IntersectionObserver" in window)) {
        elementos.forEach(function (elemento) {
            elemento.classList.add("visible");
        });

        return;
    }

    const observador =
        new IntersectionObserver(
            function (entradas) {
                entradas.forEach(function (entrada) {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add(
                            "visible"
                        );

                        // La animación se realiza una sola vez.
                        observador.unobserve(
                            entrada.target
                        );
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

    elementos.forEach(function (elemento) {
        observador.observe(elemento);
    });
}


// ============================================
// INICIO
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        cargarProductos();
        cargarOfertas();
        cargarEstadoNegocio();

        configurarMenuMovil();
        configurarAnimaciones();
    }
);