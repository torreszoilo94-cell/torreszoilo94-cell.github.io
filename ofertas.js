// @ts-nocheck
const SUPABASE_URL = "https://tlzmkxszlnvywhchcfwf.supabase.co";
const SUPABASE_KEY = "sb_publishable_HAZbvQxqGBNfMLPeHthvoQ_Vdj6qCK8";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const offersGrid = document.getElementById("offers-grid");

async function cargarOfertas() {
    const hoyCuba = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Havana"
    }).format(new Date());

    const { data, error } = await db
        .from("products")
        .select("*")
        .eq("on_sale", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando ofertas:", error);
        offersGrid.innerHTML = "<p>No se pudieron cargar las ofertas.</p>";
        return;
    }

    const ofertas = (data || []).filter(product => {
        const precioNormal = Number(
            String(product.price || "").replace(/[^\d.-]/g, "")
        );
        const precioOferta = Number(product.sale_price);

        return (
            product.on_sale === true &&
            product.available !== false &&
            Number.isFinite(precioNormal) &&
            precioNormal > 0 &&
            Number.isFinite(precioOferta) &&
            precioOferta > 0 &&
            precioOferta < precioNormal &&
            (!product.sale_start || product.sale_start <= hoyCuba) &&
            (!product.sale_end || product.sale_end >= hoyCuba)
        );
    });

    if (ofertas.length === 0) {
        offersGrid.innerHTML = `
            <div class="offers-empty">
                <h3>Próximamente nuevas ofertas</h3>
                <p>Estamos preparando promociones para ti.</p>
            </div>
        `;
        return;
    }

    offersGrid.innerHTML = "";

    ofertas.forEach(product => {
        const card = document.createElement("article");
        card.className = "offer-card";

        const badge = document.createElement("span");
        badge.className = "offer-tag";
        badge.textContent = "🏷️ OFERTA";

        const image = document.createElement("img");
        image.src = product.image_url || "images/logo.jpg";
        image.alt = product.name || "Producto en oferta";
        image.loading = "lazy";
        image.onerror = () => {
            image.onerror = null;
            image.src = "images/logo.jpg";
        };

        const info = document.createElement("div");
        info.className = "offer-info";

        const category = document.createElement("p");
        category.className = "offer-category";
        category.textContent = product.category || "";

        const name = document.createElement("h3");
        name.textContent = product.name || "";

        const description = document.createElement("p");
        description.className = "offer-description";
        description.textContent = product.description || "";

        const oldPrice = document.createElement("p");
        oldPrice.className = "offer-old-price";
        oldPrice.textContent = "Precio anterior: " + product.price;

        const newPrice = document.createElement("p");
        newPrice.className = "offer-new-price";
        newPrice.textContent = "Precio de oferta: $" + product.sale_price;

        const deadline = document.createElement("p");
        deadline.className = "offer-deadline";
        deadline.textContent = product.sale_end
            ? "Válida hasta: " + product.sale_end
            : "Oferta por tiempo limitado";

        info.append(
            category,
            name,
            description,
            oldPrice,
            newPrice,
            deadline
        );

        card.append(badge, image, info);
        offersGrid.appendChild(card);
    });
}

cargarOfertas();
