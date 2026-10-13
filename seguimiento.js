
 // @ts-nocheck

const SUPABASE_URL =
    "https://tlzmkxszlnvywhchcfwf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_HAZbvQxqGBNfMLPeHthvoQ_Vdj6qCK8";

const { createClient } = window.supabase;

const seguimientoDb = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const trackingForm = document.getElementById("tracking-form");
const trackingInput = document.getElementById("tracking-code");
const trackingResult = document.getElementById("tracking-result");

const ESTADOS = {
    pending: {
        texto: "Pendiente",
        descripcion: "Hemos recibido tu pedido.",
        paso: 1
    },
    preparing: {
        texto: "En preparación",
        descripcion: "Estamos preparando tu pedido.",
        paso: 2
    },
    ready: {
        texto: "Listo para recoger",
        descripcion: "Tu pedido está preparado.",
        paso: 3
    },
    delivered: {
        texto: "Entregado",
        descripcion: "Tu pedido ha sido entregado.",
        paso: 4
    },
    cancelled: {
        texto: "Cancelado",
        descripcion: "Este pedido ha sido cancelado.",
        paso: 0
    }
};

function crearElemento(tag, clase, texto) {
    const elemento = document.createElement(tag);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined && texto !== null) {
        elemento.textContent = String(texto);
    }

    return elemento;
}

function mostrarMensaje(texto, tipo = "error") {
    trackingResult.replaceChildren();

    trackingResult.appendChild(
        crearElemento("p", `tracking-message ${tipo}`, texto)
    );
}

function obtenerEstadoPedido(estado) {
    return ESTADOS[estado] || {
        texto: estado || "Sin estado",
        descripcion: "Consulta el estado con el negocio.",
        paso: 0
    };
}

function crearBarraProgreso(estado) {
    const informacion = obtenerEstadoPedido(estado);

    const seccion = crearElemento("section", "progress-section");

    seccion.appendChild(
        crearElemento("h3", "", "Progreso de tu pedido")
    );

    seccion.appendChild(
        crearElemento(
            "p",
            "progress-description",
            informacion.descripcion
        )
    );

    if (estado === "cancelled") {
        seccion.appendChild(
            crearElemento(
                "div",
                "progress-cancelled",
                "✕ Pedido cancelado"
            )
        );

        return seccion;
    }

    const pasos = [
        { estado: "pending", texto: "Pendiente" },
        { estado: "preparing", texto: "Preparando" },
        { estado: "ready", texto: "Listo" },
        { estado: "delivered", texto: "Entregado" }
    ];

    const barra = crearElemento("div", "progress-bar");

    pasos.forEach((paso, indice) => {
        const completado = indice + 1 <= informacion.paso;

        const segmento = crearElemento(
            "div",
            completado
                ? "progress-segment completed"
                : "progress-segment"
        );

        segmento.setAttribute("aria-hidden", "true");
        barra.appendChild(segmento);
    });

    seccion.appendChild(barra);

    const lista = crearElemento("ol", "progress-steps");

    pasos.forEach((paso, indice) => {
        const numero = indice + 1;
        const completado = numero <= informacion.paso;
        const actual = numero === informacion.paso;

        const item = crearElemento(
            "li",
            [
                "progress-step",
                completado ? "completed" : "",
                actual ? "current" : ""
            ].filter(Boolean).join(" ")
        );

        item.appendChild(
            crearElemento(
                "span",
                "step-number",
                completado ? "✓" : String(numero)
            )
        );

        item.appendChild(
            crearElemento("span", "step-label", paso.texto)
        );

        if (actual) {
            item.setAttribute("aria-current", "step");
        }

        lista.appendChild(item);
    });

    seccion.appendChild(lista);

    return seccion;
}

function crearFila(etiqueta, valor) {
    const fila = crearElemento("div", "tracking-row");

    fila.append(
        crearElemento("span", "tracking-label", etiqueta),
        crearElemento(
            "span",
            "tracking-value",
            valor === undefined || valor === null || valor === ""
                ? "No disponible"
                : valor
        )
    );

    return fila;
}

function mostrarPedido(pedido, articulos) {
    trackingResult.replaceChildren();

    const tarjeta = crearElemento("article", "tracking-card");

    tarjeta.appendChild(
        crearElemento(
            "h2",
            "tracking-title",
            `📦 Pedido ${pedido.order_number || ""}`.trim()
        )
    );

    const estado = pedido.status;
    const informacionEstado = obtenerEstadoPedido(estado);

    const bloqueEstado = crearElemento("div", "tracking-status");

    bloqueEstado.append(
        crearElemento("span", "tracking-label", "Estado actual"),
        crearElemento(
            "span",
            `status-badge status-${estado || "unknown"}`,
            informacionEstado.texto
        )
    );

    tarjeta.appendChild(bloqueEstado);
    tarjeta.appendChild(crearBarraProgreso(estado));

    const detalles = crearElemento("section", "tracking-details");

    detalles.appendChild(
        crearElemento("h3", "", "Detalles del pedido")
    );

    if (articulos.length > 1) {
        detalles.appendChild(
            crearElemento("p", "tracking-products-title", "Productos")
        );

        const lista = crearElemento("div", "tracking-products");

        articulos.forEach(articulo => {
            const producto = crearElemento("div", "tracking-product");

            producto.append(
                crearElemento(
                    "strong",
                    "tracking-product-name",
                    articulo.product_name || "Producto"
                ),
                crearElemento(
                    "span",
                    "tracking-product-quantity",
                    `${Number(articulo.quantity_liters) || 0} litros`
                )
            );

            lista.appendChild(producto);
        });

        detalles.appendChild(lista);
    } else {
        const articulo = articulos[0] || pedido;

        detalles.append(
            crearFila("Producto", articulo.product_name),
            crearFila(
                "Cantidad",
                `${Number(articulo.quantity_liters) || 0} litros`
            )
        );
    }

    if (pedido.estimated_date) {
        detalles.appendChild(
            crearFila("Fecha estimada", pedido.estimated_date)
        );
    }

    tarjeta.appendChild(detalles);
    trackingResult.appendChild(tarjeta);
}

if (trackingForm && trackingInput && trackingResult) {
    trackingForm.addEventListener("submit", async event => {
        event.preventDefault();

        const codigo = trackingInput.value.trim();

        if (!codigo) {
            mostrarMensaje("Introduce tu código privado.");
            return;
        }

        const boton = trackingForm.querySelector(
            'button[type="submit"], button:not([type])'
        );

        if (boton) {
            boton.disabled = true;
        }

        mostrarMensaje("🔎 Consultando tu pedido...", "loading");

        try {
            const { data, error } = await seguimientoDb.rpc(
                "consultar_pedido_granel",
                {
                    p_tracking_code: codigo
                }
            );

            if (error) {
                console.error("Error consultando pedido:", error);

                mostrarMensaje(
                    "No se pudo consultar el pedido. Inténtalo de nuevo más tarde."
                );

                return;
            }

            if (!data || !Array.isArray(data) || data.length === 0) {
                mostrarMensaje(
                    "No encontramos un pedido con ese código privado."
                );

                return;
            }

            const articulos = data;
            const pedido = articulos[0];

            if (!pedido || !pedido.status) {
                mostrarMensaje(
                    "La información del pedido no está disponible correctamente."
                );

                return;
            }

            // La función SQL devuelve un artículo por fila.
            // Se agrupan los artículos del mismo pedido para mostrarlos juntos.
            const mismoPedido = articulos.filter(
                articulo =>
                    articulo.order_number === pedido.order_number &&
                    articulo.status === pedido.status
            );

            mostrarPedido(pedido, mismoPedido);

        } catch (error) {
            console.error("Error inesperado:", error);

            mostrarMensaje(
                "Ocurrió un error al consultar. Comprueba tu conexión e inténtalo otra vez."
            );
        } finally {
            if (boton) {
                boton.disabled = false;
            }
        }
    });
}
