// @ts-nocheck

// =========================
// PEDIDOS A GRANEL
// =========================

const SUPABASE_URL =
    "https://tlzmkxszlnvywhchcfwf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_HAZbvQxqGBNfMLPeHthvoQ_Vdj6qCK8";

const { createClient } =
    window.supabase;

const bulkDb =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// ELEMENTOS
// =========================

const bulkForm =
    document.getElementById(
        "bulk-order-form"
    );

const bulkProduct =
    document.getElementById(
        "bulk-product"
    );

const bulkMessage =
    document.getElementById(
        "bulk-order-message"
    );

const bulkLiters =
    document.getElementById(
        "bulk-liters"
    );


// =========================
// MOSTRAR PRECIO Y TOTAL
// =========================

let productosGranel = {};


// =========================
// CARGAR PRODUCTOS A GRANEL
// =========================

async function cargarProductosGranel() {

    if (!bulkProduct) return;

    const {
        data,
        error
    } = await bulkDb
        .from("products")
        .select(
            "id, name, bulk_price, bulk_available"
        )
        .eq(
            "bulk_available",
            true
        )
        .order(
            "name"
        );

    if (error) {

        console.error(error);

        bulkProduct.innerHTML =
            `
            <option value="">
                No se pudieron cargar los productos
            </option>
            `;

        return;
    }


    bulkProduct.innerHTML =
        `
        <option value="">
            Selecciona un producto
        </option>
        `;


    productosGranel = {};


    if (!data || data.length === 0) {

        bulkProduct.innerHTML =
            `
            <option value="">
                No hay productos a granel disponibles
            </option>
            `;

        mostrarPrecio();

        return;
    }


    data.forEach(producto => {

        productosGranel[
            producto.id
        ] = producto;


        const option =
            document.createElement(
                "option"
            );


        option.value =
            producto.id;


        option.textContent =
            producto.name +
            " — " +
            Number(
                producto.bulk_price || 0
            ).toFixed(2) +
            " CUP/L";


        bulkProduct.appendChild(
            option
        );

    });

}


// =========================
// CREAR ZONA DE PRECIO
// =========================

function prepararZonaPrecio() {

    if (!bulkProduct) return;


    let priceBox =
        document.getElementById(
            "bulk-price-box"
        );


    if (!priceBox) {

        priceBox =
            document.createElement(
                "div"
            );

        priceBox.id =
            "bulk-price-box";

        priceBox.style.margin =
            "15px 0";

        priceBox.style.padding =
            "12px";

        priceBox.style.borderRadius =
            "10px";

        priceBox.style.background =
            "#f5f5f5";


        bulkProduct.parentNode.insertBefore(
            priceBox,
            bulkProduct.nextSibling
        );

    }


    return priceBox;

}


// =========================
// MOSTRAR PRECIO
// =========================

function mostrarPrecio() {

    const priceBox =
        prepararZonaPrecio();


    if (!priceBox) return;


    const productId =
        bulkProduct.value;


    if (!productId) {

        priceBox.innerHTML =
            "Selecciona un producto para ver su precio.";

        return;
    }


    const producto =
        productosGranel[
            productId
        ];


    if (!producto) {

        priceBox.innerHTML =
            "";

        return;
    }


    const precio =
        Number(
            producto.bulk_price || 0
        );


    priceBox.innerHTML =
        `
        <strong>
            Precio:
        </strong>
        ${precio.toFixed(2)} CUP por litro

        <br>

        <strong>
            Total:
        </strong>
        <span id="bulk-total">
            0.00
        </span>
        CUP
        `;


    calcularTotal();

}


// =========================
// CALCULAR TOTAL
// =========================

function calcularTotal() {

    const totalElement =
        document.getElementById(
            "bulk-total"
        );


    if (!totalElement) return;


    const productId =
        bulkProduct.value;


    const litros =
        Number(
            bulkLiters
                ? bulkLiters.value
                : 0
        );


    const producto =
        productosGranel[
            productId
        ];


    if (
        !producto ||
        !litros ||
        litros <= 0
    ) {

        totalElement.textContent =
            "0.00";

        return;
    }


    const precio =
        Number(
            producto.bulk_price || 0
        );


    const total =
        precio * litros;


    totalElement.textContent =
        total.toFixed(2);

}


// =========================
// CAMBIO DE PRODUCTO
// =========================

if (bulkProduct) {

    bulkProduct.addEventListener(
        "change",
        function () {

            mostrarPrecio();

        }
    );

}


// =========================
// CAMBIO DE LITROS
// =========================

if (bulkLiters) {

    bulkLiters.addEventListener(
        "input",
        function () {

            calcularTotal();

        }
    );

}


// =========================
// ENVIAR PEDIDO
// =========================

if (bulkForm) {

    bulkForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            bulkMessage.textContent =
                "Enviando pedido...";


            const productId =
                bulkProduct.value;


            const liters =
                Number(
                    bulkLiters.value
                );


            const name =
                document.getElementById(
                    "bulk-name"
                ).value.trim();


            const identity =
                document.getElementById(
                    "bulk-identity"
                ).value.trim();


            const phone =
                document.getElementById(
                    "bulk-phone"
                ).value.trim();


            const notes =
                document.getElementById(
                    "bulk-notes"
                ).value.trim();


            // =========================
            // VALIDACIONES
            // =========================

            const identityLimpio =
                identity.replace(
                    /\D/g,
                    ""
                );


            const phoneLimpio =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                identityLimpio.length !== 11
            ) {

                bulkMessage.textContent =
                    "El carnet de identidad debe tener exactamente 11 dígitos.";

                return;

            }


            if (
                phoneLimpio.length !== 8
            ) {

                bulkMessage.textContent =
                    "El teléfono debe tener exactamente 8 dígitos.";

                return;

            }


            if (!productId) {

                bulkMessage.textContent =
                    "Selecciona un producto.";

                return;

            }


            if (
                !liters ||
                liters <= 0
            ) {

                bulkMessage.textContent =
                    "Indica una cantidad válida de litros.";

                return;

            }


            // =========================
            // COMPROBAR PRODUCTO
            // =========================

            const producto =
                productosGranel[
                    productId
                ];


            if (!producto) {

                bulkMessage.textContent =
                    "El producto seleccionado no está disponible a granel.";

                return;

            }


            const precio =
                Number(
                    producto.bulk_price || 0
                );


            const total =
                precio * liters;


            // =========================
            // ENVIAR PEDIDO
            // =========================

            const {
                data,
                error
            } =
                await bulkDb.rpc(
                    "crear_pedido_granel",
                    {

                        p_product_id:
                            productId,

                        p_quantity_liters:
                            liters,

                        p_customer_name:
                            name,

                        p_identity_card:
                            identity,

                        p_phone:
                            phone,

                        p_notes:
                            notes || null

                    }
                );


            if (error) {

                console.error(error);

                bulkMessage.textContent =
                    "No se pudo enviar el pedido: " +
                    error.message;

                return;

            }


            const pedido =
                data[0];


            bulkMessage.innerHTML =
                `
                <strong>
                    ✅ Pedido enviado correctamente.
                </strong>

                <br><br>

                Número de pedido:
                <strong>
                    ${pedido.order_number}
                </strong>

                <br>

                Producto:
                <strong>
                    ${producto.name}
                </strong>

                <br>

                Cantidad:
                <strong>
                    ${liters} litros
                </strong>

                <br>

                Precio:
                <strong>
                    ${precio.toFixed(2)} CUP/L
                </strong>

                <br>

                Total:
                <strong>
                    ${total.toFixed(2)} CUP
                </strong>

                <br><br>

                Código privado:
                <strong>
                    ${pedido.tracking_code}
                </strong>

                <br><br>

                Guarda estos datos para consultar tu pedido.
                `;


            bulkForm.reset();


            mostrarPrecio();

        }
    );

}


// =========================
// INICIAR
// =========================

prepararZonaPrecio();

cargarProductosGranel();