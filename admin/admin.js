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


// ELEMENTOS

const loginSection =
    document.getElementById("login-section");

const forgotSection =
    document.getElementById("forgot-section");

const recoverySection =
    document.getElementById("recovery-section");

const dashboardSection =
    document.getElementById("dashboard-section");


const loginForm =
    document.getElementById("login-form");

const forgotForm =
    document.getElementById("forgot-form");

const recoveryForm =
    document.getElementById("recovery-form");


const loginMessage =
    document.getElementById("login-message");

const forgotMessage =
    document.getElementById("forgot-message");

const recoveryMessage =
    document.getElementById("recovery-message");


const logoutButton =
    document.getElementById("logout-button");


const forgotPasswordButton =
    document.getElementById(
        "forgot-password-button"
    );


const backLoginButton =
    document.getElementById(
        "back-login-button"
    );


const productForm =
    document.getElementById("product-form");


const productMessage =
    document.getElementById("product-message");


const productList =
    document.getElementById(
        "admin-products-list"
    );
const productSearch =
    document.getElementById(
        "product-search"
    );

const productFilter =
    document.getElementById(
        "product-filter"
    );


const cancelEdit =
    document.getElementById(
        "cancel-edit"
    );


const formTitle =
    document.getElementById(
        "form-title"
    );


// MOSTRAR LOGIN

function mostrarLogin() {

    loginSection.style.display =
        "block";

    forgotSection.style.display =
        "none";

    recoverySection.style.display =
        "none";

    dashboardSection.style.display =
        "none";
}


// MOSTRAR RECUPERACIÓN

function mostrarRecuperacion() {

    loginSection.style.display =
        "none";

    forgotSection.style.display =
        "none";

    recoverySection.style.display =
        "block";

    dashboardSection.style.display =
        "none";
}


// MOSTRAR PANEL

async function mostrarPanel() {

    const {
        data: {
            session
        }
    } = await db.auth.getSession();


    if (!session) {

        mostrarLogin();

        return;
    }


    loginSection.style.display =
        "none";

    forgotSection.style.display =
        "none";

    recoverySection.style.display =
        "none";

    dashboardSection.style.display =
        "block";


    cargarProductos();
  cargarPedidosGranelAdmin();
  cargarProductosGranelAdmin();
  cargarValoracionesAdmin();
}


// LOGIN

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        loginMessage.textContent =
            "Iniciando sesión...";


        const email =
            document.getElementById(
                "login-email"
            ).value;


        const password =
            document.getElementById(
                "login-password"
            ).value;


        const {
            error
        } =
            await db.auth.signInWithPassword({

                email,

                password

            });


        if (error) {

            loginMessage.textContent =
                "Error: " +
                error.message;

            return;
        }


        loginMessage.textContent =
            "";


        mostrarPanel();

    }
);


// BOTÓN OLVIDÉ MI CONTRASEÑA

forgotPasswordButton.addEventListener(
    "click",
    () => {

        loginSection.style.display =
            "none";

        forgotSection.style.display =
            "block";

        recoverySection.style.display =
            "none";

        dashboardSection.style.display =
            "none";

        forgotMessage.textContent =
            "";

    }
);


// VOLVER AL LOGIN

backLoginButton.addEventListener(
    "click",
    () => {

        mostrarLogin();

        forgotMessage.textContent =
            "";

    }
);


// ENVIAR RECUPERACIÓN

forgotForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        forgotMessage.textContent =
            "Enviando enlace...";


        const email =
            document.getElementById(
                "forgot-email"
            ).value.trim();


        const redirectUrl =
            window.location.origin +
            "/admin/index.html";


        const {
            error
        } =
            await db.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        redirectUrl
                }
            );


        if (error) {

            forgotMessage.textContent =
                "Error: " +
                error.message;

            return;
        }


        forgotMessage.textContent =
            "Listo. Revisa tu correo y abre el enlace para cambiar la contraseña.";

    }
);


// DETECTAR RECUPERACIÓN

db.auth.onAuthStateChange(
    (event, session) => {

        if (
            event ===
            "PASSWORD_RECOVERY"
        ) {

            mostrarRecuperacion();

        }

    }
);


// CAMBIAR CONTRASEÑA

recoveryForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const password =
            document.getElementById(
                "new-password"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirm-password"
            ).value;


        if (
            password !==
            confirmPassword
        ) {

            recoveryMessage.textContent =
                "Las contraseñas no coinciden.";

            return;
        }


        recoveryMessage.textContent =
            "Cambiando contraseña...";


        const {
            error
        } =
            await db.auth.updateUser({

                password

            });


        if (error) {

            recoveryMessage.textContent =
                "Error: " +
                error.message;

            return;
        }


        recoveryMessage.textContent =
            "Contraseña cambiada correctamente. Ya puedes entrar.";

        recoveryForm.reset();


        setTimeout(
            () => {

                mostrarLogin();

            },
            2000
        );

    }
);


// CERRAR SESIÓN

logoutButton.addEventListener(
    "click",
    async () => {

        logoutButton.disabled =
            true;

        logoutButton.textContent =
            "Cerrando sesión...";


        const {
            error
        } =
            await db.auth.signOut();


        if (error) {

            alert(
                "No se pudo cerrar la sesión: " +
                error.message
            );

            logoutButton.disabled =
                false;

            logoutButton.textContent =
                "Cerrar sesión";

            return;
        }


        mostrarLogin();


        loginForm.reset();


        loginMessage.textContent =
            "Sesión cerrada correctamente.";


        logoutButton.disabled =
            false;

        logoutButton.textContent =
            "Cerrar sesión";

    }
);


// CARGAR PRODUCTOS

async function cargarProductos() {

    productList.innerHTML =
        "Cargando productos...";


    const {
        data,
        error
    } =
        await db
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        productList.innerHTML =
            "Error cargando productos: " +
            error.message;

        console.error(error);

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        productList.innerHTML =
            "<p>No hay productos todavía.</p>";

        return;
    }


    productList.innerHTML =
        "";


    data.forEach(
        product => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-product";


            const image =
                product.image_url ||
                "../images/logo.jpg";


            const status =
                product.available
                    ? "Disponible"
                    : "Agotado";


            item.innerHTML = `

                <img
                    src="${image}"
                    alt="${product.name}"
                >

                <div class="admin-product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.category || ""}
                    </p>

                    <p>
                        ${product.description || ""}
                    </p>

                    <p class="admin-product-price">
                        ${product.price || ""}
                    </p>

                    <p
                        class="admin-product-status
                        ${product.available ? "" : "off"}"
                    >
                        ${status}
                    </p>

                </div>

                <div class="admin-product-actions">

                    <button
                        class="edit-button"
                        onclick="editarProducto('${product.id}')"
                    >
                        Editar
                    </button>

                    <button
                        class="delete-button"
                        onclick="eliminarProducto('${product.id}')"
                    >
                        Eliminar
                    </button>

                </div>

            `;


            productList.appendChild(
                item
            );

        }
    );

}
// GUARDAR PRODUCTO

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        productMessage.textContent =
            "Guardando...";


        const id =
            document.getElementById(
                "product-id"
            ).value;


        const name =
            document.getElementById(
                "product-name"
            ).value.trim();


        const category =
            document.getElementById(
                "product-category"
            ).value.trim();


        const description =
            document.getElementById(
                "product-description"
            ).value.trim();


        const price =
            document.getElementById(
                "product-price"
            ).value.trim();


        const available =
            document.getElementById(
                "product-available"
            ).value === "true";
      

const onSale =
    document.getElementById("product-on-sale").value === "true";

const salePriceInput =
    document.getElementById("product-sale-price").value;

const salePrice =
    salePriceInput === "" ? null : Number(salePriceInput);

const saleStart =
    document.getElementById("product-sale-start").value || null;

const saleEnd =
    document.getElementById("product-sale-end").value || null;

// Convertir el precio normal, incluso si está escrito como "$200"
const precioNormal = Number(
    price.replace(/[^\d,.-]/g, "").replace(",", ".")
);

if (onSale) {
    if (
        salePrice === null ||
        !Number.isFinite(salePrice) ||
        salePrice <= 0
    ) {
        productMessage.textContent =
            "Introduce un precio de oferta válido.";
        return;
    }

    if (
        !Number.isFinite(precioNormal) ||
        precioNormal <= 0 ||
        salePrice >= precioNormal
    ) {
        productMessage.textContent =
            "El precio de oferta debe ser menor que el precio normal.";
        return;
    }
}

if (saleStart && saleEnd && saleEnd < saleStart) {
    productMessage.textContent =
        "La fecha final no puede ser anterior a la inicial.";
    return;
}

const promotionData = {
    on_sale: onSale,
    sale_price: onSale ? salePrice : null,
    sale_start: onSale ? saleStart : null,
    sale_end: onSale ? saleEnd : null
};


        const imageInput =
            document.getElementById(
                "product-image"
            );


        let imageUrl =
            null;


        // SUBIR FOTO

        if (
            imageInput.files &&
            imageInput.files.length > 0
        ) {

            const file =
                imageInput.files[0];


            const extension =
                file.name
                    .split(".")
                    .pop();


            const fileName =
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2) +
                "." +
                extension;


            const {
                error:
                uploadError
            } =
                await db
                    .storage
                    .from(
                        "product-images"
                    )
                    .upload(
                        fileName,
                        file,
                        {
                            upsert:
                                false
                        }
                    );


            if (uploadError) {

                productMessage.textContent =
                    "Error subiendo imagen: " +
                    uploadError.message;

                return;
            }


            const {
                data:
                publicData
            } =
                db
                    .storage
                    .from(
                        "product-images"
                    )
                    .getPublicUrl(
                        fileName
                    );


            imageUrl =
                publicData.publicUrl;

        }


        // EDITAR

        if (id) {

            
const updateData = {
    name,
    category,
    description,
    price,
    available,
    ...promotionData
};


            if (imageUrl) {

                updateData.image_url =
                    imageUrl;

            }


            const {
                error
            } =
                await db
                    .from(
                        "products"
                    )
                    .update(
                        updateData
                    )
                    .eq(
                        "id",
                        id
                    );


            if (error) {

                productMessage.textContent =
                    "Error: " +
                    error.message;

                return;
            }


        } else {

            // NUEVO PRODUCTO

            const {
                error
            } =
                await db
                    .from(
                        "products"
                    )
                    
.insert({
    name,
    category,
    description,
    price,
    image_url: imageUrl,
    available,
    ...promotionData
});



            if (error) {

                productMessage.textContent =
                    "Error: " +
                    error.message;

                return;
            }

        }


        productMessage.textContent =
            "Producto guardado correctamente.";


        limpiarFormulario();


        cargarProductos();

    }
);


// EDITAR PRODUCTO

window.editarProducto =
    async function (id) {

        const {
            data,
            error
        } =
            await db
                .from("products")
                .select("*")
                .eq(
                    "id",
                    id
                )
                .single();


        if (error) {

            alert(
                "Error: " +
                error.message
            );

            return;
        }


        document.getElementById(
            "product-id"
        ).value =
            data.id;


        document.getElementById(
            "product-name"
        ).value =
            data.name;


        document.getElementById(
            "product-category"
        ).value =
            data.category || "";


        document.getElementById(
            "product-description"
        ).value =
            data.description || "";


        document.getElementById(
            "product-price"
        ).value =
            data.price || "";
      
document.getElementById("product-on-sale").value =
    String(data.on_sale ?? false);

document.getElementById("product-sale-price").value =
    data.sale_price ?? "";

document.getElementById("product-sale-start").value =
    data.sale_start ?? "";

document.getElementById("product-sale-end").value =
    data.sale_end ?? "";



        document.getElementById(
            "product-available"
        ).value =
            String(
                data.available
            );


        formTitle.textContent =
            "Editar producto";


        cancelEdit.style.display =
            "block";


        window.scrollTo({
    top: 0,
    behavior: "smooth"
});

};

// ELIMINAR PRODUCTO

window.eliminarProducto =
    async function (id) {

        const confirmar =
            confirm(
                "¿Seguro que quieres eliminar este producto?"
            );


        if (!confirmar) {

            return;

        }


        const {
            error
        } =
            await db
                .from(
                    "products"
                )
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            alert(
                "Error eliminando: " +
                error.message
            );

            return;
        }


        cargarProductos();

    };


// CANCELAR EDICIÓN

cancelEdit.addEventListener(
    "click",
    () => {

        limpiarFormulario();

    }
);

// LIMPIAR FORMULARIO

function limpiarFormulario() {

    productForm.reset();
  
document.getElementById("product-on-sale").value = "false";
document.getElementById("product-sale-price").value = "";
document.getElementById("product-sale-start").value = "";
document.getElementById("product-sale-end").value = "";


    document.getElementById(
        "product-id"
    ).value = "";

    document.getElementById(
        "product-available"
    ).value = "true";

    formTitle.textContent =
        "Agregar producto";

    cancelEdit.style.display =
        "none";

    productMessage.textContent =
        "";
}

// BUSCAR PRODUCTOS

if (productSearch) {

    productSearch.addEventListener(
        "input",
        () => {

            cargarProductos();

        }
    );

}


// FILTRAR PRODUCTOS

if (productFilter) {

    productFilter.addEventListener(
        "change",
        () => {

            cargarProductos();

        }
    );

}
// =========================
// HORARIO DEL NEGOCIO
// =========================

const businessHoursForm =
    document.getElementById(
        "business-hours-form"
    );

const businessDate =
    document.getElementById(
        "business-date"
    );

const businessOpen =
    document.getElementById(
        "business-open"
    );

const businessOpenTime =
    document.getElementById(
        "business-open-time"
    );

const businessCloseTime =
    document.getElementById(
        "business-close-time"
    );

const businessHoursMessage =
    document.getElementById(
        "business-hours-message"
    );


// GUARDAR HORARIO

if (businessHoursForm) {

    businessHoursForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            businessHoursMessage.textContent =
                "Guardando horario...";

            const date =
                businessDate.value;

            const isOpen =
                businessOpen.value === "true";

            const openTime =
                businessOpenTime.value ||
                null;

            const closeTime =
                businessCloseTime.value ||
                null;


            // BUSCAR SI YA EXISTE ESA FECHA

            const {
                data: existente,
                error: buscarError
            } =
                await db
                    .from("business_hours")
                    .select("id")
                    .eq("date", date)
                    .maybeSingle();


            if (buscarError) {

                businessHoursMessage.textContent =
                    "Error: " +
                    buscarError.message;

                return;
            }


            let error;


            // SI EXISTE → ACTUALIZAR

            if (existente) {

                const resultado =
                    await db
                        .from("business_hours")
                        .update({
                            is_open: isOpen,
                            open_time: openTime,
                            close_time: closeTime
                        })
                        .eq(
                            "id",
                            existente.id
                        );

                error =
                    resultado.error;


            } else {

                // SI NO EXISTE → CREAR

                const resultado =
                    await db
                        .from("business_hours")
                        .insert({
                            date: date,
                            is_open: isOpen,
                            open_time: openTime,
                            close_time: closeTime
                        });

                error =
                    resultado.error;
            }


            if (error) {

                businessHoursMessage.textContent =
                    "Error: " +
                    error.message;

                return;
            }


                                    businessHoursMessage.textContent =
                "Horario guardado correctamente.";
        }
    );
}
// =========================
// PEDIDOS A GRANEL - ADMIN
// =========================

const bulkOrdersList =
    document.getElementById(
        "admin-bulk-orders-list"
    );

const bulkOrderFilter =
    document.getElementById(
        "bulk-order-filter"
    );

async function cargarPedidosGranelAdmin() {

    if (!bulkOrdersList) return;

    bulkOrdersList.innerHTML =
        "<p>Cargando pedidos...</p>";

    const {
        data,
        error
    } = await db
        .from("bulk_orders")
        .select("*")
        .order(
            "created_at",
            { ascending: false }
        );

    if (error) {

        console.error(error);

        bulkOrdersList.innerHTML =
            "<p>No se pudieron cargar los pedidos.</p>";

        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        bulkOrdersList.innerHTML =
            "<p>No hay pedidos a granel todavía.</p>";

        return;
    }

    mostrarPedidosGranelAdmin(data);
  prepararBotonesEliminarPedidos();
}


// =========================
// MOSTRAR PEDIDOS
// =========================

function mostrarPedidosGranelAdmin(
    pedidos
) {

    if (!bulkOrdersList) return;

    const filtro =
        bulkOrderFilter
            ? bulkOrderFilter.value
            : "all";

    let pedidosFiltrados =
        pedidos;

    if (filtro !== "all") {

        pedidosFiltrados =
            pedidos.filter(
                pedido =>
                    pedido.status === filtro
            );
    }

    if (
        pedidosFiltrados.length === 0
    ) {

        bulkOrdersList.innerHTML =
            "<p>No hay pedidos con este estado.</p>";

        return;
    }

    bulkOrdersList.innerHTML = "";

    pedidosFiltrados.forEach(
        pedido => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "bulk-order-admin-card";


            const estado =
                obtenerNombreEstado(
                    pedido.status
                );


            card.innerHTML = `

                <div class="bulk-order-admin-header">

                    <h3>
                        📦 ${pedido.order_number || "Pedido"}
                    </h3>

                    <span>
                        ${estado}
                    </span>

                </div>


                <div class="bulk-order-admin-info">

                    <p>
                        <strong>Cliente:</strong>
                        ${pedido.customer_name || ""}
                    </p>

                    <p>
                        <strong>Teléfono:</strong>
                        ${pedido.phone || ""}
                    </p>

                    <p>
                        <strong>Carnet:</strong>
                        ${pedido.identity_card || ""}
                    </p>

                    <p>
                        <strong>Observaciones:</strong>
                        ${pedido.notes || "Ninguna"}
                    </p>

                    <p>
                        <strong>Código privado:</strong>
                        ${pedido.tracking_code || ""}
                    </p>

                    <p>
                        <strong>Fecha:</strong>
                        ${
                            pedido.created_at
                                ? new Date(
                                    pedido.created_at
                                  ).toLocaleString(
                                    "es-CU"
                                  )
                                : ""
                        }
                    </p>

                </div>


                <div class="bulk-order-admin-actions">

                    <label>
                        Estado del pedido
                    </label>

                    <select
                        class="bulk-status-select"
                        data-id="${pedido.id}"
                    >

                        <option
                            value="pending"
                            ${
                                pedido.status === "pending"
                                    ? "selected"
                                    : ""
                            }
                        >
                            🟡 Pendiente
                        </option>

                        <option
                            value="preparing"
                            ${
                                pedido.status === "preparing"
                                    ? "selected"
                                    : ""
                            }
                        >
                            🔵 En preparación
                        </option>

                        <option
                            value="ready"
                            ${
                                pedido.status === "ready"
                                    ? "selected"
                                    : ""
                            }
                        >
                            🟢 Listo para recoger
                        </option>

                        <option
                            value="delivered"
                            ${
                                pedido.status === "delivered"
                                    ? "selected"
                                    : ""
                            }
                        >
                            ⚫ Entregado
                        </option>

                        <option
                            value="cancelled"
                            ${
                                pedido.status === "cancelled"
                                    ? "selected"
                                    : ""
                            }
                        >
                            🔴 Cancelado
                        </option>

                    </select>


                    <button
                        type="button"
                        class="bulk-save-status"
                        data-id="${pedido.id}"
                    >
                        Guardar estado
                    </button>
                    <button
    type="button"
    class="bulk-delete-order"
    data-id="${pedido.id}"
>
    🗑️ Eliminar pedido
</button>

                </div>

            `;

            bulkOrdersList.appendChild(
                card
            );
        }
    );

    prepararBotonesEstados();
}


// =========================
// NOMBRES DE ESTADOS
// =========================

function obtenerNombreEstado(
    estado
) {

    const estados = {

        pending:
            "🟡 Pendiente",

        preparing:
            "🔵 En preparación",

        ready:
            "🟢 Listo para recoger",

        delivered:
            "⚫ Entregado",

        cancelled:
            "🔴 Cancelado"

    };

    return (
        estados[estado] ||
        estado ||
        "Sin estado"
    );
}


// =========================
// GUARDAR ESTADO
// =========================

function prepararBotonesEstados() {

    const botones =
        document.querySelectorAll(
            ".bulk-save-status"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                async function () {

                    const id =
                        this.dataset.id;

                    const select =
    document.querySelector(
        ".bulk-status-select[data-id=\"" +
        id +
        "\"]"
    );                    if (!select) {
                        return;
                    }

                    const nuevoEstado =
                        select.value;

                    this.disabled = true;

                    this.textContent =
                        "Guardando...";

                    const {
                        error
                    } = await db
                        .from("bulk_orders")
                        .update({
                            status:
                                nuevoEstado
                        })
                        .eq(
                            "id",
                            id
                        );

                    if (error) {

                        console.error(
                            error
                        );

                        alert(
                            "No se pudo actualizar el estado: " +
                            error.message
                        );

                        this.disabled =
                            false;

                        this.textContent =
                            "Guardar estado";

                        return;
                    }

                    this.textContent =
                        "Guardado ✓";

                    setTimeout(
                        function () {

                            this.disabled =
                                false;

                            this.textContent =
                                "Guardar estado";

                            cargarPedidosGranelAdmin();

                        }.bind(this),
                        700
                    );

                }
            );

        }
    );
}


// =========================
// FILTRO
// =========================

if (bulkOrderFilter) {

    bulkOrderFilter.addEventListener(
        "change",
        cargarPedidosGranelAdmin
    );
}
// =========================
// ELIMINAR PEDIDO A GRANEL
// =========================

function prepararBotonesEliminarPedidos() {

    const botones =
        document.querySelectorAll(
            ".bulk-delete-order"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                async function () {

                    const id =
                        this.dataset.id;

                    const confirmar =
                        confirm(
                            "¿Seguro que quieres eliminar este pedido?"
                        );

                    if (!confirmar) {
                        return;
                    }

                    this.disabled = true;

                    this.textContent =
                        "Eliminando...";

                    const {
                        error
                    } = await db
                        .from("bulk_orders")
                        .delete()
                        .eq("id", id);

                    if (error) {

                        console.error(error);

                        alert(
                            "No se pudo eliminar el pedido: " +
                            error.message
                        );

                        this.disabled =
                            false;

                        this.textContent =
                            "🗑️ Eliminar pedido";

                        return;
                    }

                    cargarPedidosGranelAdmin();

                }
            );

        }
    );
}
// =========================
// PRODUCTOS A GRANEL - ADMIN
// =========================

const bulkProductsList =
    document.getElementById(
        "admin-bulk-products-list"
    );

async function cargarProductosGranelAdmin() {
  
    if (!bulkProductsList) {
        return;
    }

    bulkProductsList.innerHTML =
        "<p>⏳ Cargando productos a granel...</p>";


    const resultado =
        await db
            .from("products")
            .select(
                "id, name, bulk_price, bulk_available"
            )
            .order(
                "name",
                {
                    ascending: true
                }
            );


    if (resultado.error) {

        console.error(
            "Error productos a granel:",
            resultado.error
        );

        bulkProductsList.innerHTML =
            `
            <div style="
                padding:20px;
                color:#991b1b;
                background:#fff1f2;
                border:1px solid #fecdd3;
                border-radius:12px;
            ">

                <strong>
                    ❌ No se pudieron cargar
                    los productos a granel.
                </strong>

                <p>
                    ${resultado.error.message}
                </p>

            </div>
            `;

        return;
    }


    const productos =
        resultado.data;


    if (
        !productos ||
        productos.length === 0
    ) {

        bulkProductsList.innerHTML =
            `
            <p>
                No hay productos todavía.
            </p>
            `;

        return;
    }


    bulkProductsList.innerHTML =
        "";


    productos.forEach(
        producto => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "bulk-order-admin-card";


            card.innerHTML =
                `

                <h3>
                    🧴 ${producto.name}
                </h3>


                <label>
                    Precio por litro
                </label>


                <input
                    type="number"
                    class="bulk-price-input"
                    data-id="${producto.id}"
                    value="${
                        producto.bulk_price ?? 0
                    }"
                    min="0"
                    step="0.01"
                >


                <label
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        margin-top:15px;
                    "
                >

                    <input
                        type="checkbox"
                        class="bulk-available-input"
                        data-id="${producto.id}"
                        ${
                            producto.bulk_available
                                ? "checked"
                                : ""
                        }
                    >

                    Disponible para venta a granel

                </label>


                <button
                    type="button"
                    class="bulk-save-product"
                    data-id="${producto.id}"
                    style="margin-top:15px;"
                >
                    💾 Guardar configuración
                </button>


                <p
                    class="bulk-product-message"
                    id="bulk-message-${producto.id}"
                ></p>

                `;


            bulkProductsList.appendChild(
                card
            );

        }
    );


    prepararBotonesProductosGranel();

}
// =========================
// GUARDAR PRODUCTO A GRANEL
// =========================

function prepararBotonesProductosGranel() {

    const botones =
        document.querySelectorAll(
            ".bulk-save-product"
        );


    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                async function () {

                    const id =
                        this.dataset.id;


                    const priceInput =
                        document.querySelector(
                            '.bulk-price-input[data-id="' +
                            id +
                            '"]'
                        );


                    const availableInput =
                        document.querySelector(
                            '.bulk-available-input[data-id="' +
                            id +
                            '"]'
                        );


                    const message =
                        document.getElementById(
                            "bulk-message-" +
                            id
                        );


                    if (
                        !priceInput ||
                        !availableInput
                    ) {

                        return;

                    }


                    const precio =
                        Number(
                            priceInput.value
                        );


                    const disponible =
                        availableInput.checked;


                    if (
                        isNaN(precio) ||
                        precio < 0
                    ) {

                        message.textContent =
                            "❌ Introduce un precio válido.";

                        return;

                    }


                    this.disabled =
                        true;


                    this.textContent =
                        "Guardando...";


                    const {
                        error
                    } =
                        await db
                            .from("products")
                            .update({

                                bulk_price:
                                    precio,

                                bulk_available:
                                    disponible

                            })
                            .eq(
                                "id",
                                id
                            );


                    if (error) {

                        console.error(
                            error
                        );


                        message.textContent =
                            "❌ Error: " +
                            error.message;


                        this.disabled =
                            false;


                        this.textContent =
                            "💾 Guardar configuración";


                        return;

                    }


                    message.textContent =
                        "✅ Guardado correctamente.";


                    this.textContent =
                        "Guardado ✓";


                    setTimeout(
                        () => {

                            this.disabled =
                                false;

                            this.textContent =
                                "💾 Guardar configuración";

                        },
                        1000
                    );

                }
            );

        }
    );
}
// =========================
// AÑADIR PRODUCTO A GRANEL
// =========================

const bulkProductForm =
    document.getElementById(
        "bulk-product-form"
    );

const newBulkProductName =
    document.getElementById(
        "new-bulk-product-name"
    );

const newBulkProductPrice =
    document.getElementById(
        "new-bulk-product-price"
    );

const newBulkProductAvailable =
    document.getElementById(
        "new-bulk-product-available"
    );

const newBulkProductMessage =
    document.getElementById(
        "new-bulk-product-message"
    );

const newBulkProductButton =
    document.getElementById(
        "new-bulk-product-button"
    );


if (bulkProductForm) {

    bulkProductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nombre =
                newBulkProductName
                    .value
                    .trim();


            const precio =
                Number(
                    newBulkProductPrice.value
                );


            const disponible =
                newBulkProductAvailable
                    .checked;


            if (!nombre) {

                newBulkProductMessage.textContent =
                    "❌ Escribe el nombre del producto.";

                return;

            }


            if (
                isNaN(precio) ||
                precio < 0
            ) {

                newBulkProductMessage.textContent =
                    "❌ Introduce un precio válido.";

                return;

            }


            newBulkProductButton.disabled =
                true;


            newBulkProductButton.textContent =
                "Guardando...";


            newBulkProductMessage.textContent =
                "";


            const {
                data,
                error
            } =
                await db
                    .from("products")
                    .insert({

                        name:
                            nombre,

                        category:
                            "A granel",

                        description:
                            "Producto disponible para venta a granel.",

                        price:
                            0,

                        available:
                            false,

                        bulk_price:
                            precio,

                        bulk_available:
                            disponible

                    })
                    .select()
                    .single();


            if (error) {

                console.error(error);


                newBulkProductMessage.textContent =
                    "❌ No se pudo crear: " +
                    error.message;


                newBulkProductButton.disabled =
                    false;


                newBulkProductButton.textContent =
                    "➕ Añadir producto a granel";


                return;

            }


            newBulkProductMessage.textContent =
                "✅ Producto a granel añadido correctamente.";


            bulkProductForm.reset();


            newBulkProductAvailable.checked =
                true;


            newBulkProductButton.disabled =
                false;


            newBulkProductButton.textContent =
                "➕ Añadir producto a granel";


            if (
                typeof cargarProductosGranelAdmin ===
                "function"
            ) {

                cargarProductosGranelAdmin();

            }

        }
    );

}
// =========================
// INICIAR PANEL
// =========================

setTimeout(
    function () {
        mostrarPanel();
    },
    1000
);

/* =====================================
   MODERACIÓN DE VALORACIONES
===================================== */

let filtroValoraciones = "pending";

async function cargarValoracionesAdmin() {
    const lista = document.getElementById(
        "admin-reviews-list"
    );

    if (!lista) return;

    lista.innerHTML = "<p>Cargando valoraciones...</p>";

    let consulta = db
        .from("product_reviews")
        .select(`
            id,
            product_id,
            customer_name,
            rating,
            comment,
            approved,
            created_at,
            products(name)
        `)
        .order("created_at", { ascending: false });

    if (filtroValoraciones === "pending") {
        consulta = consulta.eq("approved", false);
    } else if (filtroValoraciones === "approved") {
        consulta = consulta.eq("approved", true);
    }

    const { data, error } = await consulta;

    if (error) {
        console.error(error);
        lista.innerHTML =
            "<p>No se pudieron cargar las valoraciones. Comprueba tu sesión de administrador y los permisos.</p>";
        return;
    }

    if (!data || data.length === 0) {
        lista.innerHTML =
            "<p>No hay valoraciones en esta categoría.</p>";
        return;
    }

    lista.innerHTML = "";

    data.forEach(opinion => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "admin-review-card";

        const tituloProducto =
            opinion.products?.name || "Producto eliminado";

        const fecha = opinion.created_at
            ? new Date(opinion.created_at).toLocaleDateString()
            : "";

        const estrellas = "★".repeat(opinion.rating) +
            "☆".repeat(5 - opinion.rating);

        const encabezado = document.createElement("h3");
        encabezado.textContent = tituloProducto;

        const autor = document.createElement("p");
        autor.textContent = "Cliente: " + opinion.customer_name;

        const puntuacion = document.createElement("p");
        puntuacion.textContent =
            estrellas + " (" + opinion.rating + "/5)";

        const comentario = document.createElement("p");
        comentario.textContent =
            opinion.comment || "Sin comentario escrito";

        const estado = document.createElement("p");
        estado.textContent = opinion.approved
            ? "Estado: Aprobada"
            : "Estado: Pendiente";

        const fechaElemento = document.createElement("small");
        fechaElemento.textContent = fecha;

        tarjeta.append(
            encabezado,
            autor,
            puntuacion,
            comentario,
            estado,
            fechaElemento
        );

        if (!opinion.approved) {
            const aprobar = document.createElement("button");
            aprobar.type = "button";
            aprobar.textContent = "Aprobar";

            aprobar.addEventListener("click", () => {
                moderarValoracion(opinion.id, {
                    approved: true
                });
            });

            tarjeta.appendChild(aprobar);
        }

        if (opinion.approved) {
            const rechazar = document.createElement("button");
            rechazar.type = "button";
            rechazar.textContent = "Retirar publicación";

            rechazar.addEventListener("click", () => {
                moderarValoracion(opinion.id, {
                    approved: false
                });
            });

            tarjeta.appendChild(rechazar);
        }

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";

        eliminar.addEventListener("click", async () => {
            if (!confirm("¿Seguro que quieres eliminar esta valoración?")) {
                return;
            }

            const { error } = await db
                .from("product_reviews")
                .delete()
                .eq("id", opinion.id);

            if (error) {
                console.error(error);
                alert("No se pudo eliminar la valoración.");
                return;
            }

            await cargarValoracionesAdmin();
        });

        tarjeta.appendChild(eliminar);
        lista.appendChild(tarjeta);
    });
}

async function moderarValoracion(id, cambios) {
    const { error } = await db
        .from("product_reviews")
        .update(cambios)
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("No se pudo actualizar la valoración.");
        return;
    }

    await cargarValoracionesAdmin();
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-review-filter]")
        .forEach(boton => {
            boton.addEventListener("click", () => {
                filtroValoraciones =
                    boton.dataset.reviewFilter;

                cargarValoracionesAdmin();
            });
        });
});
