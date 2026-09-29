// ==========================================
// PRECIOS DE LOS PRODUCTOS
// ==========================================

const precios = {

    res: {
        2: 7000,
        4: 14000,
        6: 21000,
        8: 28000
    },

    cerdo: {
        2: 7000,
        4: 14000,
        6: 21000,
        8: 28000
    },

    mixto: {
        2: 8000,
        4: 16000,
        6: 24000,
        8: 32000
    }

};

// ==========================================
// NOMBRES DE LOS PRODUCTOS
// ==========================================

const nombresProductos = {

    res: "Carne de res",
    cerdo: "Carne de cerdo",
    mixto: "Medallón mixto"

};


// ==========================================
// ACTUALIZAR PRECIO
// ==========================================

function actualizarPrecio(producto, selector, precio) {

    const pack = selector.value;

    const valor = precios[producto][pack];

    if (valor === 0) {

        precio.textContent = "Precio por definir";

    } else {

        precio.textContent =
            "$" + valor.toLocaleString("es-CO");

    }

}


// ==========================================
// SELECTOR DE RES
// ==========================================

const selectorRes = document.getElementById("pack-res");
const precioRes = document.getElementById("precio-res");

if (selectorRes) {

    selectorRes.addEventListener("change", function () {

        actualizarPrecio(
            "res",
            selectorRes,
            precioRes
        );

    });

}


// ==========================================
// SELECTOR DE CERDO
// ==========================================

const selectorCerdo = document.getElementById("pack-cerdo");
const precioCerdo = document.getElementById("precio-cerdo");

if (selectorCerdo) {

    selectorCerdo.addEventListener("change", function () {

        actualizarPrecio(
            "cerdo",
            selectorCerdo,
            precioCerdo
        );

    });

}


// ==========================================
// SELECTOR MIXTO
// ==========================================

const selectorMixto = document.getElementById("pack-mixto");
const precioMixto = document.getElementById("precio-mixto");

if (selectorMixto) {

    selectorMixto.addEventListener("change", function () {

        actualizarPrecio(
            "mixto",
            selectorMixto,
            precioMixto
        );

    });

}
// ==========================================
// MOSTRAR PRECIOS INICIALES
// ==========================================

if (selectorRes && precioRes) {
    actualizarPrecio(
        "res",
        selectorRes,
        precioRes
    );
}

if (selectorCerdo && precioCerdo) {
    actualizarPrecio(
        "cerdo",
        selectorCerdo,
        precioCerdo
    );
}

if (selectorMixto && precioMixto) {
    actualizarPrecio(
        "mixto",
        selectorMixto,
        precioMixto
    );
}


// ==========================================
// AGREGAR PRODUCTO AL CARRITO
// ==========================================

function agregarAlCarrito(producto) {

    let carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];

    const selector =
        document.getElementById("pack-" + producto);

    const pack = selector.value;

    const precio =
        precios[producto][pack];

    const nombre =
        nombresProductos[producto];


    const productoExistente = carrito.find(item =>
        item.producto === producto &&
        item.pack === pack
    );


    if (productoExistente) {

        productoExistente.cantidad++;

    } else {

        carrito.push({

            producto: producto,
            nombre: nombre,
            pack: pack,
            precio: precio,
            cantidad: 1

        });

    }


    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );


    alert(
        nombre +
        " - Pack x" +
        pack +
        " agregado al pedido."
    );

}


// ==========================================
// MOSTRAR CARRITO
// ==========================================

function mostrarCarrito() {

    const contenedor =
        document.getElementById("lista-pedido");

    const totalElemento =
        document.getElementById("total");


    if (!contenedor) {
        return;
    }


    let carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];


    contenedor.innerHTML = "";


    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <p class="carrito-vacio">
                No tienes productos en tu pedido.
            </p>

            <a href="productos.html"
               class="boton-volver">
                Ver productos
            </a>
        `;

        totalElemento.textContent = "$0";

        return;
    }


    let total = 0;


    carrito.forEach((item, index) => {

        const subtotal =
            item.precio * item.cantidad;

        total += subtotal;


        const productoHTML =
            document.createElement("div");

        productoHTML.className =
            "item-pedido";


        productoHTML.innerHTML = `

            <div>

                <h2>
                    ${item.nombre}
                </h2>

                <p>
                    Pack x${item.pack}
                    — ${Number(item.pack) * 100} g
                </p>

                <p>
                    Precio:
                    $${item.precio.toLocaleString("es-CO")}
                </p>

            </div>


            <div class="controles-pedido">

                <button
                    onclick="cambiarCantidad(${index}, -1)">
                    -
                </button>

                <span>
                    ${item.cantidad}
                </span>

                <button
                    onclick="cambiarCantidad(${index}, 1)">
                    +
                </button>

                <button
                    onclick="eliminarProducto(${index})">
                    Eliminar
                </button>

            </div>

        `;


        contenedor.appendChild(productoHTML);

    });


    totalElemento.textContent =
        "$" + total.toLocaleString("es-CO");

}


// ==========================================
// CAMBIAR CANTIDAD
// ==========================================

function cambiarCantidad(index, cambio) {

    let carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];


    carrito[index].cantidad += cambio;


    if (carrito[index].cantidad <= 0) {

        carrito.splice(index, 1);

    }


    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );


    mostrarCarrito();

}


// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

function eliminarProducto(index) {

    let carrito =
        JSON.parse(localStorage.getItem("carrito")) || [];


    carrito.splice(index, 1);


    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );


    mostrarCarrito();

}


// ==========================================
// VACIAR CARRITO
// ==========================================

function vaciarCarrito() {

    localStorage.removeItem("carrito");

    mostrarCarrito();

}


// ==========================================
// CONFIRMAR Y ENVIAR PEDIDO
// ==========================================

const formulario =
    document.getElementById("formulario-pedido");


if (formulario) {

    formulario.addEventListener("submit", async function(event) {

        event.preventDefault();


        // Obtener carrito

        let carrito =
            JSON.parse(localStorage.getItem("carrito")) || [];


        // Comprobar que haya productos

        if (carrito.length === 0) {

            alert(
                "No puedes confirmar un pedido vacío."
            );

            return;

        }


        // Obtener datos del cliente

        const nombre =
            document.getElementById("nombre").value;

        const telefono =
            document.getElementById("telefono").value;

        const direccion =
            document.getElementById("direccion").value;

        const observaciones =
            document.getElementById("observaciones").value;


        // Calcular total

        let total = 0;

        carrito.forEach(item => {

            total +=
                item.precio * item.cantidad;

        });


        // Crear pedido

        const pedido = {

            cliente: {

                nombre: nombre,

                telefono: telefono,

                direccion: direccion,

                observaciones: observaciones

            },

            productos: carrito,

            total: total

        };


        try {

            // Enviar pedido al servidor

            const respuesta =
                await fetch("/api/pedidos", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(pedido)

                });


            // Convertir respuesta

            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

    throw new Error(
        resultado.mensaje ||
        "No se pudo guardar el pedido."
    );

}


            // Mostrar confirmación

           alert(`¡Pedido confirmado!

Número de pedido: #${resultado.pedido.id}

Número de guía: ${resultado.pedido.guia}

Gracias por comprar en BurguerTech.`);

window.open(
    `/api/pedidos/${resultado.pedido.id}/factura`,
    "_blank"
);

            // Vaciar carrito

            localStorage.removeItem("carrito");


            // Limpiar formulario

            formulario.reset();


            // Actualizar pantalla

            mostrarCarrito();


        } catch (error) {

            console.error(error);

            alert(
    "No se pudo enviar el pedido.\n\n" +
    error.message
);

        }

    });

}
// ==========================================
// PANEL ADMINISTRATIVO
// ==========================================

async function cargarPedidosAdmin() {

    const contenedor =
        document.getElementById("lista-admin");

    const contenedorEntregados =
        document.getElementById("lista-entregados");


    if (!contenedor && !contenedorEntregados) {
    return;
}


    try {

        const respuesta =
            await fetch("/api/pedidos");


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los pedidos."
            );

        }


        const pedidos =
            await respuesta.json();


        // Limpiar las dos listas

if (contenedor) {
    contenedor.innerHTML = "";
}

if (contenedorEntregados) {
    contenedorEntregados.innerHTML = "";
}

       // Separar pedidos que ya están autorizados para MES
const pedidosMES =
    pedidos.filter(pedido =>
        pedido.estado === "Autorizado para MES" ||
        pedido.estado === "En preparación" ||
        pedido.estado === "Listo"
    );

const pedidosEntregados =
    pedidos.filter(pedido =>
        pedido.estado === "Entregado"
    );


       // ==========================================
// GESTIÓN DE PRODUCCIÓN - MES
// ==========================================

const contadorMES =
    document.getElementById(
        "pedidos-autorizados-mes"
    );
if (contenedor) {
if (pedidosMES.length === 0) {

    contenedor.innerHTML = `
        <p class="sin-pedidos">
            No hay pedidos autorizados para MES.
        </p>
    `;

} else {

    pedidosMES.forEach(pedido => {

        const tarjeta =
            document.createElement("div");

        tarjeta.className =
            "pedido-admin";


        let productosHTML = "";


        pedido.productos.forEach(producto => {

            const medallones =
                Number(producto.pack) *
                Number(producto.cantidad);

            productosHTML += `

                <div class="producto-admin">

                    <strong>
                        ${producto.nombre}
                    </strong>

                    <span>
                        Pack x${producto.pack}
                    </span>

                    <span>
                        ${medallones} medallones
                    </span>

                </div>

            `;

        });


        tarjeta.innerHTML = `

            <div class="cabecera-pedido">

                <h2>
                    Pedido #${pedido.id}
                </h2>

                <span class="estado-pedido">
                    ${pedido.estado}
                </span>

            </div>


            <div class="datos-admin">

                <p>
                    <strong>Cliente:</strong>
                    ${pedido.cliente.nombre}
                </p>

                <p>
                    <strong>Teléfono:</strong>
                    ${pedido.cliente.telefono}
                </p>

                <p>
                    <strong>Dirección:</strong>
                    ${pedido.cliente.direccion}
                </p>

            </div>


            <h3>
                Producto
            </h3>


            <div class="productos-admin">

                ${productosHTML}

            </div>


            <div class="total-admin">

                Total:
                $${pedido.total.toLocaleString("es-CO")}

            </div>


            <div class="acciones-produccion-mes">

    ${
        pedido.estado === "Autorizado para MES"
        ? `
            <button
                onclick="cambiarEstado(
                    ${pedido.id},
                    'En preparación'
                )"
            >
                Iniciar producción
            </button>
        `
        : ""
    }

    ${
        pedido.estado === "En preparación"
        ? `
            <p class="produccion-en-curso">
                Producción en proceso
            </p>
        `
        : ""
    }

    ${
        pedido.estado === "Autorizado para MES" ||
        pedido.estado === "En preparación"
        ? `
            <button
                onclick="eliminarPedido(${pedido.id})"
                class="btn-eliminar-pedido"
            >
                Eliminar pedido
            </button>
        `
        : ""
    }

</div>
        `;


        contenedor.appendChild(tarjeta);

    });

}
// Actualizar otros módulos
}
cargarClientes();


        // ==========================================
        // PEDIDOS ENTREGADOS
        // ==========================================

        if (contenedorEntregados) {

            if (pedidosEntregados.length === 0) {

                contenedorEntregados.innerHTML = `
                    <p class="sin-pedidos">
                        No hay pedidos entregados.
                    </p>
                `;

            } else {

                pedidosEntregados.forEach(pedido => {

                    const tarjeta =
                        document.createElement("div");

                    tarjeta.className =
                        "pedido-admin pedido-entregado";


                    let productosHTML = "";


                    pedido.productos.forEach(producto => {

                        productosHTML += `

                            <div class="producto-admin">

                                <strong>
                                    ${producto.nombre}
                                </strong>

                                <span>
                                    Pack x${producto.pack}
                                </span>

                                <span>
                                    Cantidad: ${producto.cantidad}
                                </span>

                            </div>

                        `;

                    });


                    tarjeta.innerHTML = `

                        <div class="cabecera-pedido">

                            <h2>
                                Pedido #${pedido.id}
                            </h2>

                            <span class="estado-pedido estado-entregado">
                                Entregado
                            </span>

                        </div>


                        <div class="datos-admin">

                            <p>
                                <strong>Cliente:</strong>
                                ${pedido.cliente.nombre}
                            </p>

                            <p>
                                <strong>Teléfono:</strong>
                                ${pedido.cliente.telefono}
                            </p>

                            <p>
                                <strong>Dirección:</strong>
                                ${pedido.cliente.direccion}
                            </p>

                        </div>


                        <h3>
                            Productos
                        </h3>


                        <div class="productos-admin">

                            ${productosHTML}

                        </div>


                        <div class="total-admin">

                            Total:
                            $${pedido.total.toLocaleString("es-CO")}

                        </div>


                        <p class="mensaje-entregado">
                            Pedido entregado al cliente.
                        </p>

                    `;


                    contenedorEntregados.appendChild(tarjeta);

                });

            }

        }


    } catch (error) {

    console.error(error);

    if (contenedor) {

        contenedor.innerHTML = `

            <p class="error-admin">

                No se pudieron cargar los pedidos.

                <br><br>

                Comprueba que el servidor esté funcionando.

            </p>

        `;

    }

}

}

// ==========================================
// CAMBIAR ESTADO DEL PEDIDO
// ==========================================

async function cambiarEstado(id, estado) {

    try {

        const respuesta = await fetch(
            `/api/pedidos/${id}/estado`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    estado: estado
                })
            }
        );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo actualizar el estado."
            );

        }


        // ==========================================
        // PEDIDO ENTREGADO
        // ==========================================

        if (estado === "Entregado") {

            alert(
                `Pedido #${id} entregado al cliente.`
            );

            cargarPedidosAdmin();

            return;
        }


        // ==========================================
        // OTROS ESTADOS
        // ==========================================

        alert(
            `Pedido #${id} actualizado a: ${estado}`
        );


        cargarPedidosAdmin();

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo cambiar el estado del pedido."
        );

    }

}
// ==========================================
// ABRIR PROCESO DE PRODUCCIÓN
// ==========================================

let procesoActual = 0;

function abrirProcesoProduccion(id, procesoGuardado = 0) {

    const proceso =
        document.getElementById("proceso-produccion");

    const pedidoTexto =
        document.getElementById("proceso-pedido");

    if (!proceso || !pedidoTexto) return;

    procesoActual = procesoGuardado;

    pedidoTexto.textContent = `Pedido #${id}`;

    proceso.style.display = "block";

    actualizarProceso();
    actualizarEstadoRefrigeracionPorProceso(procesoActual);
    proceso.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
async function actualizarEstadoRefrigeracionPorProceso(proceso) {

    try {

        if (Number(proceso) === 4) {

            await fetch("/api/refrigeracion/activar", {
                method: "PUT"
            });

        } else if (Number(proceso) < 4) {

            await fetch("/api/refrigeracion/desactivar", {
                method: "PUT"
            });

        }

        cargarRefrigeracion();

    } catch (error) {

        console.error(
            "No se pudo actualizar la refrigeración:",
            error
        );
    }
}
async function siguienteProceso() {

        // Control de calidad obligatorio antes de pasar a enfriamiento
    if (procesoActual === 3) {

        if (!window.controlCalidadFinalizado) {

            alert(
                "El control de calidad aún no ha terminado.\n\n" +
                "Debes aprobar todos los medallones del lote antes " +
                "de pasar a enfriamiento."
            );

            return;
        }
    }
    // Control de refrigeración obligatorio antes de continuar
if (procesoActual === 5) {

    if (!window.controlRefrigeracionFinalizado) {

        alert(
            "El control de refrigeración aún no ha terminado.\n\n" +
            "Debes verificar que la temperatura del lote esté " +
            "entre 0 °C y 5 °C antes de continuar."
        );

        return;
    }
}

    // ==========================================
    // COMPROBAR LOTE SELECCIONADO
    // ==========================================

    if (!window.loteProcesoSeleccionado) {

        alert(
            "Primero debes seleccionar un lote de producción."
        );

        return;
    }

    const lote =
        window.loteProcesoSeleccionado;

    // ==========================================
    // COMPROBAR ÚLTIMA ETAPA
    // ==========================================

    if (procesoActual >= 7) {

    const controles = document.querySelector(".controles-proceso");

if (controles) {
    controles.style.display = "none";
}

    const animacion =
        document.getElementById("animacion-proceso");

    if (animacion) {

        animacion.innerHTML = `

            <h3>Producción terminada</h3>

            <p>
                El lote ha terminado correctamente todas
                las etapas de producción.
            </p>

            <button
                onclick="reportarProduccionMES()"
                class="btn-reportar-mes"
            >
                Enviar reporte a MES
            </button>

        `;

    }

    return;
}

    // ==========================================
    // CALCULAR SIGUIENTE ETAPA
    // ==========================================

    const nuevoProceso =
        procesoActual + 1;

    // ==========================================
    // GUARDAR EN BASE DE DATOS
    // ==========================================

    try {

        const respuesta =
            await fetch(
                `/api/lotes-produccion/${lote.id}/proceso`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        proceso: nuevoProceso
                    })
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo actualizar el proceso."
            );

        }

        // ==========================================
        // ACTUALIZAR PROCESO EN PANTALLA
        // ==========================================

        procesoActual =
            nuevoProceso;

        actualizarProceso();

        console.log(
            "Lote actualizado:",
            resultado.lote
        );

    } catch (error) {

        console.error(
            "Error actualizando proceso:",
            error
        );

        alert(
            "No se pudo avanzar el proceso.\n\n" +
            error.message
        );

    }

}
// ==========================================
// REPORTAR PRODUCCIÓN TERMINADA A MES
// ==========================================

async function reportarProduccionMES() {

    if (!window.loteProcesoSeleccionado) {

        alert("No hay un lote de producción seleccionado.");

        return;
    }

    const lote =
        window.loteProcesoSeleccionado;

    try {

        const respuesta = await fetch(
            `/api/lotes-produccion/${lote.id}/reportar-mes`,
            {
                method: "PUT"
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo reportar la producción a MES."
            );
        }

        alert(
            "Producción reportada a MES correctamente."
        );

        const proceso =
            document.getElementById("proceso-produccion");

        if (proceso) {
            proceso.style.display = "none";
        }

        if (typeof cargarOrdenesProduccionMES === "function") {
            await cargarOrdenesProduccionMES();
        }

        if (typeof cargarLotesProduccion === "function") {
            await cargarLotesProduccion();
        }

    } catch (error) {

        console.error(
            "Error reportando producción a MES:",
            error
        );

        alert(
            "No se pudo reportar la producción a MES.\n\n" +
            error.message
        );
    }
}
function actualizarProceso() {

    const etapas = document.querySelectorAll(".etapa-proceso");

    // ==========================================
    // ETAPAS DEL PROCESO
    // ==========================================

    const titulos = [
    "Preparación",
    "Molido",
    "Mezclado",
    "Formado",
    "Control de calidad",
    "Enfriamiento",
    "Control de refrigeración",
    "Empaquetado",
    "Etiquetado"
];

    const descripciones = [
    "Preparando las materias primas para iniciar la producción.",
    "La carne está pasando por el proceso de molido.",
    "Mezclando la carne con los ingredientes para obtener una mezcla homogénea.",
    "Formando los medallones de hamburguesa de 100 gramos.",
    "Verificando automáticamente el peso de los medallones.",
    "Enfriando los medallones para conservar su calidad.",
    "Verificando automáticamente la temperatura antes del empaquetado.",
    "Empaquetando los medallones según la presentación solicitada.",
    "Colocando la etiqueta de identificación en cada bandeja."
];

    // ==========================================
    // ACTUALIZAR INDICADORES DE ETAPAS
    // ==========================================

    etapas.forEach((etapa, indice) => {

        if (indice <= procesoActual) {
            etapa.classList.add("activa");
        } else {
            etapa.classList.remove("activa");
        }

    });

    // ==========================================
    // CONTENEDOR DE LA ANIMACIÓN
    // ==========================================

    const animacion =
        document.getElementById("animacion-proceso");

    if (!animacion) {
        return;
    }

    // ==========================================
    // 1. MOLIDO
    // ==========================================

    if (Number(procesoActual) === 0) {

        animacion.innerHTML = `

            <h3>Molido</h3>

            <svg
                class="svg-molino"
                viewBox="0 0 500 260"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Animación del proceso de molido"
            >

                <!-- Tolva -->

                <path
                    class="molino-tolva"
                    d="M80 35 H190 L170 100 H100 Z"
                />

                <rect
                    class="molino-borde"
                    x="80"
                    y="35"
                    width="110"
                    height="12"
                    rx="5"
                />

                <!-- Carne dentro de la tolva -->

                <circle
                    class="carne carne-1"
                    cx="105"
                    cy="58"
                    r="9"
                />

                <circle
                    class="carne carne-2"
                    cx="125"
                    cy="65"
                    r="9"
                />

                <circle
                    class="carne carne-3"
                    cx="145"
                    cy="58"
                    r="9"
                />

                <circle
                    class="carne carne-4"
                    cx="115"
                    cy="82"
                    r="9"
                />

                <circle
                    class="carne carne-5"
                    cx="140"
                    cy="82"
                    r="9"
                />

                <!-- Cuerpo del molino -->

                <rect
                    class="molino-cuerpo"
                    x="90"
                    y="100"
                    width="300"
                    height="85"
                    rx="12"
                />

                <!-- Ventana del molino -->

                <rect
                    class="molino-ventana"
                    x="115"
                    y="120"
                    width="250"
                    height="45"
                    rx="8"
                />

                <!-- Salida -->

                <rect
                    class="salida-molino"
                    x="380"
                    y="125"
                    width="45"
                    height="35"
                    rx="5"
                />

                <!-- Carne molida saliendo -->

                <circle
                    class="medallon-molido medallon-m1"
                    cx="440"
                    cy="142"
                    r="8"
                />

                <circle
                    class="medallon-molido medallon-m2"
                    cx="460"
                    cy="142"
                    r="8"
                />

                <circle
                    class="medallon-molido medallon-m3"
                    cx="480"
                    cy="142"
                    r="8"
                />

                <!-- Base -->

                <rect
                    class="molino-base"
                    x="70"
                    y="185"
                    width="350"
                    height="12"
                    rx="5"
                />

            </svg>

            <p>
                La carne está pasando por el proceso de molido.
            </p>

        `;

    }

    // ==========================================
    // 2. MEZCLADO
    // ==========================================

    else if (Number(procesoActual) === 1) {

        animacion.innerHTML = `

            <h3>Mezclado</h3>

            <svg
                class="svg-mezcladora"
                viewBox="0 0 500 300"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Animación del proceso de mezclado"
            >

                <!-- Tolva superior -->

                <rect
                    class="mezcladora-tapa"
                    x="145"
                    y="35"
                    width="210"
                    height="25"
                    rx="8"
                />

                <!-- Recipiente -->

                <path
                    class="mezcladora-recipiente"
                    d="M110 60 H390 L360 220 H140 Z"
                />

                <!-- Mezcla -->

                <path
                    class="mezcla-svg"
                    d="M140 150 Q250 125 360 150 L350 205 H150 Z"
                />

                <!-- Ingredientes -->

                <circle
                    class="ingrediente ingrediente-1"
                    cx="175"
                    cy="145"
                    r="10"
                />

                <circle
                    class="ingrediente ingrediente-2"
                    cx="210"
                    cy="160"
                    r="9"
                />

                <circle
                    class="ingrediente ingrediente-3"
                    cx="250"
                    cy="145"
                    r="10"
                />

                <circle
                    class="ingrediente ingrediente-4"
                    cx="290"
                    cy="165"
                    r="9"
                />

                <circle
                    class="ingrediente ingrediente-5"
                    cx="330"
                    cy="145"
                    r="10"
                />

                <!-- Agitador -->

                <g class="agitador-svg">

                    <rect
                        class="eje-agitador"
                        x="244"
                        y="65"
                        width="12"
                        height="105"
                        rx="6"
                    />

                    <path
                        class="paleta"
                        d="M200 155 Q250 180 300 155 L292 175 Q250 200 208 175 Z"
                    />

                </g>

                <!-- Base -->

                <rect
                    class="mezcladora-base"
                    x="100"
                    y="220"
                    width="300"
                    height="15"
                    rx="6"
                />

                <!-- Patas -->

                <rect
                    class="pata-mezcladora"
                    x="135"
                    y="235"
                    width="18"
                    height="35"
                    rx="4"
                />

                <rect
                    class="pata-mezcladora"
                    x="347"
                    y="235"
                    width="18"
                    height="35"
                    rx="4"
                />

            </svg>

            <p>
                Mezclando la carne con los ingredientes
                para obtener una mezcla homogénea.
            </p>

        `;

    }

    // ==========================================
    // 3. FORMADO
    // ==========================================

    else if (Number(procesoActual) === 2) {

        animacion.innerHTML = `

            <h3>Formado de medallones</h3>

            <div class="maquina-formadora">

                <div class="tolva-formadora">
                    Mezcla
                </div>

                <div class="prensa">

                    <div class="placa-prensa"></div>

                </div>

                <div class="medallon-formado">
                    100 g
                </div>

            </div>

            <p>
                Formando los medallones de hamburguesa
                con un peso objetivo de 100 gramos.
            </p>

        `;

    }

    // ==========================================
    // 4. CONTROL DE CALIDAD
    // ==========================================

    else if (Number(procesoActual) === 3) {

    animacion.innerHTML = `
        <div class="panel-control-calidad">

            <div class="cabecera-control-calidad">
                <div>
                    <h3>Control de peso en el formado</h3>
                    <p>
                        Verificación automática del peso de los medallones.
                    </p>
                </div>

                <div class="modo-automatico">
                    ● AUTOMÁTICO
                </div>
            </div>

            <div class="datos-control-calidad">

                <div class="dato-peso">
                    <span>Peso actual</span>
                    <strong id="peso-actual-calidad">--.- g</strong>
                    <small id="estado-peso-calidad">
                        Esperando pesaje
                    </small>
                </div>

                <div class="dato-peso">
                    <span>Peso objetivo</span>
                    <strong>100 g</strong>
                    <small>Rango permitido: 98 - 102 g</small>
                </div>

                <div class="dato-peso">
                    <span>Medallones producidos</span>
                    <strong id="contador-medallones-calidad">
                        0 / ${window.loteProcesoSeleccionado?.cantidadMedallones || 0}
                    </strong>

                    <div class="barra-progreso-calidad">
                        <div id="barra-calidad"></div>
                    </div>
                </div>

            </div>

            <div class="estado-general-calidad" id="estado-general-calidad">
                <strong>Preparando control de calidad...</strong>
            </div>

            <div class="grafica-peso-calidad">

    <div class="titulo-grafica-calidad">

    <div>
    <div class="indicadores-hmi-calidad">

    <div class="indicador-hmi aceptados">

        <span class="indicador-hmi-titulo">
            Medallones aceptados
        </span>

        <strong id="indicador-aceptados">
            0
        </strong>

        <small>
            Dentro de especificación
        </small>

    </div>


    <div class="indicador-hmi rechazados">

        <span class="indicador-hmi-titulo">
    Medallones reprocesados
</span>

        <strong id="indicador-rechazados">
            0
        </strong>

        <small>
    Requirieron ajuste de peso
</small>

    </div>


    <div class="indicador-hmi calidad">

        <span class="indicador-hmi-titulo">
    Aceptación a la primera
</span>

<strong id="indicador-calidad">
    0 %
</strong>

<small>
    Medallones sin reproceso
</small>

    </div>


    <div class="indicador-hmi promedio">

        <span class="indicador-hmi-titulo">
            Peso promedio
        </span>

        <strong id="indicador-peso-promedio">
            --.- g
        </strong>

        <small>
            Promedio del lote
        </small>

    </div>

</div>
        <strong>Tendencia del peso</strong>
        <span>Control de peso de los medallones</span>
    </div>

    <div class="leyenda-grafica">
        <span>● Medición</span>
        <span>— Objetivo 100 g</span>
    </div>

</div>
    <div class="grafica-contenedor">
        <canvas id="grafica-peso-calidad"></canvas>
    </div>

</div>

            <div class="medallon-control-calidad">

                <div class="numero-medallon-calidad">
                    MEDALLÓN
                    <strong id="numero-medallon-calidad">#1</strong>
                </div>

                <div class="peso-digital-calidad" id="peso-digital-calidad">
                    --.- g
                </div>

                <div class="accion-calidad" id="accion-calidad">
                    Preparando balanza...
                </div>

            </div>

            <div class="historial-calidad">

                <h4>Últimos medallones</h4>

                <div class="tabla-calidad">
                    <div class="fila-tabla-calidad encabezado">
                        <span>#</span>
                        <span>Peso</span>
                        <span>Estado</span>
                    </div>

                    <div id="historial-medallones-calidad">
                        <div class="fila-tabla-calidad">
                            <span>--</span>
                            <span>--.- g</span>
                            <span>Pendiente</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    iniciarControlCalidadAutomatico();

}

    // ==========================================
    // 5. ENFRIAMIENTO
    // ==========================================

    else if (Number(procesoActual) === 4) {

        animacion.innerHTML = `

            <h3>Enfriamiento</h3>

            <div class="maquina-refrigeracion">

                <div class="cuerpo-refrigerador">

                    <div class="puerta-refrigerador">

                        <span>
                            ❄
                        </span>

                    </div>

                    <div class="medallon-frio medallon-1">
                        100 g
                    </div>

                    <div class="medallon-frio medallon-2">
                        100 g
                    </div>

                    <div class="medallon-frio medallon-3">
                        100 g
                    </div>

                </div>

                <div class="aire-frio">
                    ❄ ❄ ❄
                </div>

            </div>

            <p>
                Enfriando los medallones para conservar
                su calidad antes de continuar con el proceso.
            </p>

            <div id="control-refrigeracion-proceso"></div>

        `;

    }

    else if (Number(procesoActual) === 5) {

    animacion.innerHTML = `
        <div class="panel-control-refrigeracion">

            <div class="cabecera-control-refrigeracion">

                <div>
                    <h3>Control de refrigeración</h3>

                    <p>
                        Verificación automática de la temperatura
                        del lote antes del empaquetado.
                    </p>
                </div>

                <div class="modo-automatico">
                    ● AUTOMÁTICO
                </div>

            </div>

            <div class="datos-refrigeracion">

                <div class="dato-refrigeracion">

                    <span>Temperatura actual</span>

                    <strong id="temperatura-actual">
                        --.- °C
                    </strong>

                    <small id="estado-temperatura">
                        Esperando medición
                    </small>

                </div>

                <div class="dato-refrigeracion">

                    <span>Temperatura objetivo</span>

                    <strong>
                        3.0 °C
                    </strong>

                    <small>
                        Rango permitido: 0 - 5 °C
                    </small>

                </div>

                <div class="dato-refrigeracion">

                    <span>Tiempo de control</span>

                    <strong id="tiempo-refrigeracion">
                        00:00
                    </strong>

                    <small>
                        Tiempo requerido: 00:30
                    </small>

                </div>

            </div>

            <div class="indicadores-hmi-refrigeracion">

    <div class="indicador-frio">
        <span>Estado del compresor</span>

        <strong id="estado-compresor">
            ACTIVO
        </strong>

        <small>
            Sistema de refrigeración
        </small>
    </div>


    <div class="indicador-frio">
        <span>Estado de temperatura</span>

        <strong id="indicador-rango">
            FUERA DE RANGO
        </strong>

        <small>
            Límite: 0 - 5 °C
        </small>
    </div>


    <div class="indicador-frio">
        <span>Alarmas</span>

        <strong id="indicador-alarma">
            0
        </strong>

        <small>
            Eventos registrados
        </small>
    </div>


    <div class="indicador-frio">
        <span>Reajustes</span>

        <strong id="indicador-reajustes">
            0
        </strong>

        <small>
            Correcciones automáticas
        </small>
    </div>

</div>

            <div
                id="estado-general-refrigeracion"
                class="estado-general-refrigeracion"
            >
                <strong>
                    Preparando control de temperatura...
                </strong>

                <span>
                    El sistema iniciará la verificación automáticamente.
                </span>
            </div>

            <div class="control-temperatura">

                <div class="icono-temperatura">
                    ❄
                </div>

                <div
                    id="temperatura-digital"
                    class="temperatura-digital"
                >
                    --.- °C
                </div>

                <div
                    id="accion-refrigeracion"
                    class="accion-refrigeracion"
                >
                    Preparando sistema de refrigeración...
                </div>

            </div>

            <div class="grafica-refrigeracion">

    <div class="titulo-grafica">
        <div>
            <h4>
                Comportamiento de la temperatura
            </h4>

            <span>
                Monitoreo en tiempo real
            </span>
        </div>

        <div class="leyenda-grafica">

            <span>
                <i class="punto-temperatura"></i>
                Temperatura
            </span>

            <span>
                <i class="punto-objetivo"></i>
                Objetivo 3 °C
            </span>

        </div>
    </div>

    <canvas
        id="grafica-temperatura-refrigeracion"
    ></canvas>

</div>

            <div class="historial-temperatura">

                <h4>
                    Historial de temperatura
                </h4>

                <div id="lista-historial-temperatura">

                    <div class="fila-temperatura">
                        <span>--:--</span>
                        <span>--.- °C</span>
                        <span>Pendiente</span>
                    </div>

                </div>

            </div>

        </div>
    `;
        iniciarControlRefrigeracionAutomatico();

} // ==========================================
// 7. EMPAQUETADO
// ==========================================

else if (Number(procesoActual) === 6) {

    const lote = window.loteProcesoSeleccionado;

    if (!lote) {
        return;
    }

    // ------------------------------------------
    // DATOS DEL LOTE
    // ------------------------------------------

    const totalMedallones =
        Number(lote.cantidadMedallones) || 0;

    // Por ahora utilizamos Pack x2
    const medallonesPorPack = 2;

    const totalPacks =
        Math.ceil(
            totalMedallones / medallonesPorPack
        );


    animacion.innerHTML = `

        <div class="panel-empaquetado">

            <div class="cabecera-empaquetado">

                <div>

                    <h3>
                        📦 Control de empaquetado
                    </h3>

                    <p>
                        Empaquetado automático del lote
                        de producción.
                    </p>

                </div>

                <div class="modo-automatico">
                    ● AUTOMÁTICO
                </div>

            </div>


            <div class="datos-empaquetado">

                <div class="dato-empaquetado">

                    <span>
                        Producto
                    </span>

                    <strong>
                        ${lote.nombre || "Carne de res"}
                    </strong>

                </div>


                <div class="dato-empaquetado">

                    <span>
                        Presentación
                    </span>

                    <strong>
                        Pack x${medallonesPorPack}
                    </strong>

                </div>


                <div class="dato-empaquetado">

                    <span>
                        Paquetes
                    </span>

                    <strong id="contador-packs-empaque">
                        0 / ${totalPacks}
                    </strong>

                </div>


                <div class="dato-empaquetado">

                    <span>
                        Medallones
                    </span>

                    <strong id="contador-medallones-empaque">
                        0 / ${totalMedallones}
                    </strong>

                </div>

            </div>


            <div
                class="estado-empaquetado"
                id="estado-empaquetado"
            >

                <strong>
                    Preparando empaquetado...
                </strong>

                <span>
                    El sistema iniciará automáticamente.
                </span>

            </div>


            <div class="bandeja-empaque">

                <div
                    class="medallones-empaque"
                    id="medallones-empaque"
                >

                    <div class="medallon-empaque">
                        100 g
                    </div>

                    <div class="medallon-empaque">
                        100 g
                    </div>

                </div>


                <div class="etiqueta-bandeja">

                    BANDEJA
                    <br>
                    DE EMPAQUE

                </div>

            </div>


            <div
                class="texto-progreso-empaque"
                id="texto-progreso-empaque"
            >
                Preparando...
            </div>


            <div class="barra-progreso-empaque">

                <div
                    id="barra-empaque"
                    style="width: 0%;"
                ></div>

            </div>


            <div
                class="porcentaje-empaque"
                id="porcentaje-empaque"
            >
                0 %
            </div>

        </div>

    `;


    // ------------------------------------------
    // INICIAR EMPAQUETADO
    // ------------------------------------------

    iniciarEmpaquetadoAutomatico(
        totalMedallones,
        medallonesPorPack,
        totalPacks
    );

}
// ==========================================
// 8. ETIQUETADO
// ==========================================

else if (Number(procesoActual) === 7) {

    const lote =
        window.loteProcesoSeleccionado;

    if (!lote) {
        return;
    }


    // ------------------------------------------
    // DATOS DEL LOTE
    // ------------------------------------------

    const totalMedallones =
        Number(lote.cantidadMedallones) || 0;

    const medallonesPorPack = 2;

    const totalPacks =
        Math.ceil(
            totalMedallones /
            medallonesPorPack
        );

    const pesoNeto =
        medallonesPorPack * 100;


    // ------------------------------------------
    // TIPO DE CARNE
    // ------------------------------------------

    let tipoCarne =
        lote.producto;

    if (tipoCarne === "res") {

        tipoCarne = "Res";

    } else if (tipoCarne === "cerdo") {

        tipoCarne = "Cerdo";

    } else if (tipoCarne === "mixto") {

        tipoCarne = "Mixta";

    } else {

        tipoCarne =
            lote.nombre || "Producto";

    }


    // ------------------------------------------
// FECHA DE PRODUCCIÓN Y VENCIMIENTO
// ------------------------------------------

const fechaProduccionDate = new Date();

const fechaVencimientoDate = new Date(
    fechaProduccionDate
);

// Agregar 2 meses
fechaVencimientoDate.setMonth(
    fechaVencimientoDate.getMonth() + 2
);

const fechaProduccion =
    fechaProduccionDate
        .toLocaleDateString("es-CO");

const fechaVencimiento =
    fechaVencimientoDate
        .toLocaleDateString("es-CO");


    // ------------------------------------------
    // MOSTRAR ETIQUETADO
    // ------------------------------------------

    animacion.innerHTML = `

        <div class="panel-etiquetado">

            <div class="cabecera-etiquetado">

                <div>

                    <h3>
                        🏷️ Etiquetado del producto
                    </h3>

                    <p>
                        Identificación automática
                        de cada bandeja.
                    </p>

                </div>

                <div class="modo-automatico">
                    ● AUTOMÁTICO
                </div>

            </div>


            <div class="datos-etiquetado">

                <div>

                    <span>
                        Producto
                    </span>

                    <strong>
                        ${tipoCarne}
                    </strong>

                </div>


                <div>

                    <span>
                        Presentación
                    </span>

                    <strong>
                        Pack x${medallonesPorPack}
                    </strong>

                </div>


                <div>

                    <span>
                        Bandejas
                    </span>

                    <strong>
                        <span id="contador-etiquetas">
                            0 / ${totalPacks}
                        </span>
                    </strong>

                </div>

            </div>


            <div
                class="estado-etiquetado"
                id="estado-etiquetado"
            >

                <strong>
                    Preparando etiquetado...
                </strong>

                <span>
                    El sistema iniciará automáticamente.
                </span>

            </div>


            <div class="area-etiqueta">

                <div
                    class="etiqueta-burger-tech"
                    id="etiqueta-burger-tech"
                >

                    <div class="logo-etiqueta">
                        BURGER TECH
                    </div>

                    <div class="titulo-etiqueta">
                        PRODUCTO TERMINADO
                    </div>

                    <div class="linea-etiqueta">
                        <span>
                            Tipo de carne
                        </span>

                        <strong>
                            ${tipoCarne}
                        </strong>
                    </div>

                    <div class="linea-etiqueta">
                        <span>
                            Número de unidades
                        </span>

                        <strong>
                            ${medallonesPorPack}
                        </strong>
                    </div>

                    <div class="linea-etiqueta">
                        <span>
                            Peso neto
                        </span>

                        <strong>
                            ${pesoNeto} g
                        </strong>
                    </div>

                    <div class="linea-etiqueta">
                        <span>
                            Fecha de producción
                        </span>

                        <strong>
                            ${fechaProduccion}
                        </strong>
                    </div>

                    <div class="linea-etiqueta">

    <span>
        Fecha de vencimiento
    </span>

    <strong>
        ${fechaVencimiento}
    </strong>

</div>

                    <div class="linea-etiqueta">
                        <span>
                            Lote
                        </span>

                        <strong>
                            ${lote.codigoLote}
                        </strong>
                    </div>

                    <div class="conservacion-etiqueta">

                        <strong>
                            Instrucciones de conservación
                        </strong>

                        <span>
                            Conservar refrigerado
                            entre 0 °C y 5 °C.
                        </span>

                    </div>

                </div>

            </div>


            <div
                class="texto-etiquetado"
                id="texto-etiquetado"
            >
                Preparando etiqueta...
            </div>


            <div class="barra-progreso-etiquetado">

                <div
                    id="barra-etiquetado"
                    style="width: 0%;"
                ></div>

            </div>


            <div
                class="porcentaje-etiquetado"
                id="porcentaje-etiquetado"
            >
                0 %
            </div>

        </div>

    `;


    iniciarEtiquetadoAutomatico(
        totalPacks,
        tipoCarne,
        medallonesPorPack,
        pesoNeto
    );

}

    // ==========================================
    // ETAPA NO DEFINIDA
    // ==========================================

    else {

        animacion.innerHTML = `

            <h3>
                ${titulos[procesoActual] || "Proceso"}
            </h3>

            <p>
                ${descripciones[procesoActual] || ""}
            </p>

        `;

    }

}
// ==========================================
// EMPAQUETADO AUTOMÁTICO
// ==========================================

function iniciarEmpaquetadoAutomatico(
    totalMedallones,
    medallonesPorPack,
    totalPacks
) {

    // Evitar que se inicie varias veces
    if (window.empaquetadoActivo) {
        return;
    }

    window.empaquetadoActivo = true;


    let packActual = 0;

    let medallonesEmpaquetados = 0;


    function empaquetarSiguientePack() {

        // ------------------------------------------
        // TERMINAR EMPAQUETADO
        // ------------------------------------------

        if (packActual >= totalPacks) {

            const estado =
                document.getElementById(
                    "estado-empaquetado"
                );

            const texto =
                document.getElementById(
                    "texto-progreso-empaque"
                );

            const barra =
                document.getElementById(
                    "barra-empaque"
                );

            const porcentaje =
                document.getElementById(
                    "porcentaje-empaque"
                );

            const contadorPacks =
                document.getElementById(
                    "contador-packs-empaque"
                );

            const contadorMedallones =
                document.getElementById(
                    "contador-medallones-empaque"
                );


            if (estado) {

                estado.innerHTML = `

                    <strong>
                        ✓ LOTE COMPLETAMENTE EMPAQUETADO
                    </strong>

                    <span>
                        Todos los paquetes fueron preparados
                        correctamente.
                    </span>

                `;

            }


            if (texto) {

                texto.textContent =
                    `Empaquetado completado`;

            }


            if (barra) {

                barra.style.width = "100%";

            }


            if (porcentaje) {

                porcentaje.textContent =
                    "100 %";

            }


            if (contadorPacks) {

                contadorPacks.textContent =
                    `${totalPacks} / ${totalPacks}`;

            }


            if (contadorMedallones) {

                contadorMedallones.textContent =
                    `${totalMedallones} / ${totalMedallones}`;

            }


            window.empaquetadoFinalizado = true;

            return;

        }


        // ------------------------------------------
        // NUEVO PACK
        // ------------------------------------------

        packActual++;


        const inicioMedallon =
            medallonesEmpaquetados + 1;


        const finMedallon =
            Math.min(
                medallonesEmpaquetados +
                medallonesPorPack,
                totalMedallones
            );


        const cantidadEnPack =
            finMedallon -
            inicioMedallon +
            1;


        const contadorPacks =
            document.getElementById(
                "contador-packs-empaque"
            );


        const contadorMedallones =
            document.getElementById(
                "contador-medallones-empaque"
            );


        const texto =
            document.getElementById(
                "texto-progreso-empaque"
            );


        const barra =
            document.getElementById(
                "barra-empaque"
            );


        const porcentaje =
            document.getElementById(
                "porcentaje-empaque"
            );


        const estado =
            document.getElementById(
                "estado-empaquetado"
            );


        // ------------------------------------------
        // ACTUALIZAR INFORMACIÓN
        // ------------------------------------------

        if (contadorPacks) {

            contadorPacks.textContent =
                `${packActual} / ${totalPacks}`;

        }


        if (contadorMedallones) {

            contadorMedallones.textContent =
                `${finMedallon} / ${totalMedallones}`;

        }


        if (texto) {

            texto.textContent =
                `Empaquetando Pack #${packActual}`;

        }


        if (estado) {

            estado.innerHTML = `

                <strong>
                    Empaquetando Pack #${packActual}
                </strong>

                <span>
                    Medallones
                    #${inicioMedallon}
                    y
                    #${finMedallon}
                    entrando en la bandeja.
                </span>

            `;

        }


        const progreso =
            (
                finMedallon /
                totalMedallones
            ) * 100;


        if (barra) {

            barra.style.width =
                `${progreso}%`;

        }


        if (porcentaje) {

            porcentaje.textContent =
                `${Math.round(progreso)} %`;

        }


        // ------------------------------------------
        // ANIMAR MEDALLONES
        // ------------------------------------------

        const contenedor =
            document.getElementById(
                "medallones-empaque"
            );


        if (contenedor) {

            contenedor.innerHTML = "";

            for (
                let i = 0;
                i < cantidadEnPack;
                i++
            ) {

                const medallon =
                    document.createElement(
                        "div"
                    );

                medallon.className =
                    "medallon-empaque";

                medallon.textContent =
                    "100 g";

                medallon.style.animation =
                    `entradaMedallon 0.3s ease ${
                        i * 0.1
                    }s both`;

                contenedor.appendChild(
                    medallon
                );

            }

        }


        medallonesEmpaquetados =
            finMedallon;


        // ------------------------------------------
        // PASAR AL SIGUIENTE PACK
        // ------------------------------------------

        setTimeout(
            empaquetarSiguientePack,
            100
        );

    }


    // Iniciar
    empaquetarSiguientePack();

}
// ==========================================
// ETIQUETADO AUTOMÁTICO
// ==========================================

function iniciarEtiquetadoAutomatico(
    totalPacks,
    tipoCarne,
    medallonesPorPack,
    pesoNeto
) {

    if (window.etiquetadoActivo) {
        return;
    }

    window.etiquetadoActivo = true;

    let packActual = 0;


    function etiquetarSiguiente() {

        // ------------------------------------------
        // FINALIZAR
        // ------------------------------------------

        if (packActual >= totalPacks) {

            const estado =
                document.getElementById(
                    "estado-etiquetado"
                );

            const texto =
                document.getElementById(
                    "texto-etiquetado"
                );

            const barra =
                document.getElementById(
                    "barra-etiquetado"
                );

            const porcentaje =
                document.getElementById(
                    "porcentaje-etiquetado"
                );


            if (estado) {

                estado.innerHTML = `

                    <strong>
                        ✓ LOTE ETIQUETADO
                    </strong>

                    <span>
                        Todas las bandejas fueron
                        identificadas correctamente.
                    </span>

                `;

            }


            if (texto) {

                texto.textContent =
                    "Etiquetado completado";

            }


            if (barra) {

                barra.style.width =
                    "100%";

            }


            if (porcentaje) {

                porcentaje.textContent =
                    "100 %";

            }


            window.etiquetadoFinalizado =
                true;

            return;

        }


        // ------------------------------------------
        // SIGUIENTE BANDEJA
        // ------------------------------------------

        packActual++;


        const contador =
            document.getElementById(
                "contador-etiquetas"
            );

        const estado =
            document.getElementById(
                "estado-etiquetado"
            );

        const texto =
            document.getElementById(
                "texto-etiquetado"
            );

        const barra =
            document.getElementById(
                "barra-etiquetado"
            );

        const porcentaje =
            document.getElementById(
                "porcentaje-etiquetado"
            );


        // ------------------------------------------
        // ACTUALIZAR INFORMACIÓN
        // ------------------------------------------

        if (contador) {

            contador.textContent =
                `${packActual} / ${totalPacks}`;

        }


        if (estado) {

            estado.innerHTML = `

                <strong>
                    Etiquetando bandeja #${packActual}
                </strong>

                <span>
                    Colocando etiqueta Burger Tech.
                </span>

            `;

        }


        if (texto) {

            texto.textContent =
                `Etiquetando bandeja #${packActual}`;

        }


        const progreso =
            (
                packActual /
                totalPacks
            ) * 100;


        if (barra) {

            barra.style.width =
                `${progreso}%`;

        }


        if (porcentaje) {

            porcentaje.textContent =
                `${Math.round(progreso)} %`;

        }


        // ------------------------------------------
        // CAMBIAR TEXTO DE LA ETIQUETA
        // ------------------------------------------

        const etiqueta =
            document.getElementById(
                "etiqueta-burger-tech"
            );

        if (etiqueta) {

            etiqueta.style.animation =
                "entradaEtiqueta 0.7s ease";

        }


        // ------------------------------------------
        // SIGUIENTE BANDEJA
        // ------------------------------------------

        setTimeout(
            etiquetarSiguiente,
            100
        );

    }


    etiquetarSiguiente();

}

function iniciarControlRefrigeracionAutomatico() { 
 
    // Evitar reiniciar el proceso si la pantalla se actualiza 
    if (window.controlRefrigeracionActivo) { 
        return; 
    } 
 
    window.controlRefrigeracionActivo = true; 
    window.controlRefrigeracionFinalizado = false; 
 
    const botonSiguiente = 
        document.querySelector(".controles-proceso button"); 
 
    if (botonSiguiente) { 
        botonSiguiente.disabled = true; 
        botonSiguiente.textContent = "Controlando temperatura..."; 
    } 
 
    window.controlRefrigeracion = { 
        segundos: 0, 
        total: 30, 
 
        // Temperatura inicial 
        temperatura: 6.5, 
 
        // Rango permitido 
        temperaturaMinima: 0, 
        temperaturaMaxima: 5, 
 
        // Temperatura objetivo 
        temperaturaObjetivo: 3, 
 
        historial: [], 
 
        reajustes: 0, 
 
        // Estado del sistema 
        refrigerando: true, 
        alarma: false, 
        perturbacionActiva: false 
    }; 
 
    actualizarControlRefrigeracion(); 
}

function actualizarControlRefrigeracion() {

    const control = window.controlRefrigeracion;

    if (!control) {
        return;
    }

    const temperaturaElemento =
        document.getElementById("temperatura-actual");

    const temperaturaDigital =
        document.getElementById("temperatura-digital");

    const tiempoElemento =
        document.getElementById("tiempo-refrigeracion");

    const estadoTemperatura =
        document.getElementById("estado-temperatura");

    const estadoGeneral =
        document.getElementById(
            "estado-general-refrigeracion"
        );

    const accion =
        document.getElementById(
            "accion-refrigeracion"
        );

    const historial =
        document.getElementById(
            "lista-historial-temperatura"
        );

    if (!temperaturaElemento) {
        return;
    }

    // ==========================================
// CONTROL AUTOMÁTICO DE TEMPERATURA
// ==========================================

if (control.segundos > 0) {

    // Enfriamiento normal
    const descenso =
        Math.random() * 0.25 + 0.10;

    control.temperatura =
        Math.max(
            0.5,
            control.temperatura - descenso
        );


    // ==========================================
    // PERTURBACIÓN DEL SISTEMA
    // ==========================================

    // En el segundo 15 se presenta una
    // perturbación que aumenta la temperatura.
    if (
        control.segundos === 15 &&
        !control.perturbacionActiva
    ) {

        control.perturbacionActiva = true;

        control.temperatura += 3.5;
    }


    // ==========================================
    // RECUPERACIÓN DESPUÉS DE LA PERTURBACIÓN
    // ==========================================

    if (
        control.perturbacionActiva &&
        control.temperatura > 5
    ) {

        // El sistema continúa refrigerando
        // hasta volver al rango permitido.
        control.temperatura =
            Math.max(
                0.5,
                control.temperatura - 0.20
            );
    }
}

    const temperatura =
        Number(
            control.temperatura.toFixed(1)
        );
    
    // ==========================================
// ACTUALIZAR INDICADORES HMI
// ==========================================

const compresor =
    document.getElementById(
        "estado-compresor"
    );

const indicadorRango =
    document.getElementById(
        "indicador-rango"
    );

const indicadorAlarma =
    document.getElementById(
        "indicador-alarma"
    );

const indicadorReajustes =
    document.getElementById(
        "indicador-reajustes"
    );


if (compresor) {

    compresor.textContent =
        temperatura > 5
            ? "MÁXIMA POTENCIA"
            : "REFRIGERANDO";
}


if (indicadorRango) {

    const tarjetaRango =
        indicadorRango.closest(".indicador-frio");

    if (
        temperatura >= 0 &&
        temperatura <= 5
    ) {

        indicadorRango.textContent =
            "✓ EN RANGO";

        if (tarjetaRango) {
            tarjetaRango.classList.add(
                "temperatura-ok"
            );

            tarjetaRango.classList.remove(
                "temperatura-alerta"
            );
        }

    } else {

        indicadorRango.textContent =
            "⚠ FUERA DE RANGO";

        if (tarjetaRango) {
            tarjetaRango.classList.add(
                "temperatura-alerta"
            );

            tarjetaRango.classList.remove(
                "temperatura-ok"
            );
        }
    }
}


if (indicadorAlarma) {

    const tarjetaAlarma =
        indicadorAlarma.closest(".indicador-frio");

    if (temperatura > 5) {

        indicadorAlarma.textContent = "⚠ 1";

        if (tarjetaAlarma) {
            tarjetaAlarma.classList.add(
                "alarma-activa"
            );
        }

    } else {

        indicadorAlarma.textContent = "0";

        if (tarjetaAlarma) {
            tarjetaAlarma.classList.remove(
                "alarma-activa"
            );
        }
    }
}


if (indicadorReajustes) {

    indicadorReajustes.textContent =
        control.reajustes;
}

    // Mostrar temperatura
    temperaturaElemento.textContent =
        `${temperatura.toFixed(1)} °C`;

    temperaturaDigital.textContent =
        `${temperatura.toFixed(1)} °C`;

        if (temperatura > 5) {

    temperaturaDigital.classList.add(
        "temperatura-en-alarma"
    );

} else {

    temperaturaDigital.classList.remove(
        "temperatura-en-alarma"
    );
}

    // Mostrar tiempo
    const minutos =
        Math.floor(control.segundos / 60)
            .toString()
            .padStart(2, "0");

    const segundos =
        (control.segundos % 60)
            .toString()
            .padStart(2, "0");

    tiempoElemento.textContent =
        `${minutos}:${segundos}`;

    // Guardar lectura
    control.historial.unshift({
        tiempo: control.segundos,
        temperatura: temperatura
    });
    actualizarGraficaTemperatura();

    // Mostrar historial
    if (historial) {

        const ultimas =
            control.historial.slice(0, 6);

        historial.innerHTML =
            ultimas.map(lectura => {

                const estado =
                    lectura.temperatura >= 0 &&
                    lectura.temperatura <= 5
                        ? "✓ En rango"
                        : "⚠ Fuera de rango";

                return `
                    <div class="fila-temperatura">
                        <span>
                            00:${lectura.tiempo
                                .toString()
                                .padStart(2, "0")}
                        </span>

                        <span>
                            ${lectura.temperatura.toFixed(1)} °C
                        </span>

                        <span>
                            ${estado}
                        </span>
                    </div>
                `;

            }).join("");
    }

    // ==========================================
// ESTADO ACTUAL DEL SISTEMA
// ==========================================

if (
    temperatura >= 0 &&
    temperatura <= 5
) {

    estadoTemperatura.textContent =
        "✓ En rango";

    accion.textContent =
        "Temperatura controlada correctamente.";

    estadoGeneral.innerHTML = `
        <strong>✓ TEMPERATURA CONTROLADA</strong>

        <span>
            La temperatura se encuentra dentro del rango
            permitido de 0 °C a 5 °C.
        </span>
    `;

    estadoGeneral.classList.remove(
        "estado-alarma"
    );

    estadoGeneral.classList.add(
        "estado-ok"
    );

} else {

    estadoTemperatura.textContent =
        "⚠ FUERA DE RANGO";

    accion.textContent =
        "Sistema aumentando la refrigeración...";

    estadoGeneral.innerHTML = `
        <strong>⚠ ALARMA DE TEMPERATURA</strong>

        <span>
            Temperatura superior al límite de 5 °C.
            El sistema está aumentando la refrigeración
            para recuperar el rango permitido.
        </span>
    `;

    estadoGeneral.classList.remove(
        "estado-ok"
    );

    estadoGeneral.classList.add(
        "estado-alarma"
    );
}

    // ¿Ya terminaron los 30 segundos?
    if (control.segundos >= control.total) {

        finalizarControlRefrigeracion();

        return;
    }

    // Siguiente segundo
    control.segundos++;

    setTimeout(() => {

        actualizarControlRefrigeracion();

    }, 1000);
}

function actualizarGraficaTemperatura() {

    const canvas =
        document.getElementById(
            "grafica-temperatura-refrigeracion"
        );

    const control =
        window.controlRefrigeracion;

    if (!canvas || !control) {
        return;
    }

    const ctx =
        canvas.getContext("2d");

    const rect =
        canvas.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        rect.width * dpr;

    canvas.height =
        rect.height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    const datos =
        control.historial
            .slice()
            .reverse();

    if (datos.length === 0) {
        return;
    }

    const margenIzq = 42;
    const margenDer = 15;
    const margenSup = 15;
    const margenInf = 30;

    const graficaW =
        w -
        margenIzq -
        margenDer;

    const graficaH =
        h -
        margenSup -
        margenInf;

    const minTemp = 0;
    const maxTemp = 8;

    function x(i) {

        if (datos.length === 1) {
            return margenIzq +
                graficaW / 2;
        }

        return margenIzq +
            (
                i /
                (datos.length - 1)
            ) *
            graficaW;
    }

    function y(temp) {

        return margenSup +
            (
                (maxTemp - temp) /
                (maxTemp - minTemp)
            ) *
            graficaH;
    }


    // ======================================
    // ZONA 0 - 5 °C
    // ======================================

    const y5 = y(5);
    const y0 = y(0);

    ctx.fillStyle =
        "rgba(24, 169, 87, 0.08)";

    ctx.fillRect(
        margenIzq,
        y5,
        graficaW,
        y0 - y5
    );


    // ======================================
    // CUADRÍCULA
    // ======================================

    ctx.font =
        "10px Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";

    for (
        let temp = 0;
        temp <= 8;
        temp++
    ) {

        const yy = y(temp);

        ctx.beginPath();

        ctx.moveTo(
            margenIzq,
            yy
        );

        ctx.lineTo(
            w - margenDer,
            yy
        );

        ctx.strokeStyle =
            temp === 5
                ? "#777"
                : "#e5e5e5";

        ctx.lineWidth =
            temp === 5
                ? 1.5
                : 1;

        ctx.stroke();

        ctx.fillStyle =
            "#666";

        ctx.fillText(
            `${temp}°`,
            margenIzq - 7,
            yy
        );
    }


    // ======================================
    // LÍNEA OBJETIVO 3 °C
    // ======================================

    const yObjetivo =
        y(3);

    ctx.beginPath();

    ctx.moveTo(
        margenIzq,
        yObjetivo
    );

    ctx.lineTo(
        w - margenDer,
        yObjetivo
    );

    ctx.strokeStyle =
        "#2878d0";

    ctx.lineWidth = 1.5;

    ctx.setLineDash([
        6,
        4
    ]);

    ctx.stroke();

    ctx.setLineDash([]);


    // ======================================
    // LÍNEA DE TEMPERATURA
    // ======================================

    ctx.beginPath();

    datos.forEach(
        (dato, i) => {

            const xx =
                x(i);

            const yy =
                y(dato.temperatura);

            if (i === 0) {

                ctx.moveTo(
                    xx,
                    yy
                );

            } else {

                ctx.lineTo(
                    xx,
                    yy
                );
            }
        }
    );

    ctx.strokeStyle =
        "#2878d0";

    ctx.lineWidth = 2;

    ctx.stroke();


    // ======================================
    // PUNTOS
    // ======================================

    datos.forEach(
        (dato, i) => {

            const xx =
                x(i);

            const yy =
                y(dato.temperatura);

            const correcto =
                dato.temperatura >= 0 &&
                dato.temperatura <= 5;

            ctx.beginPath();

            ctx.arc(
                xx,
                yy,
                3.5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                correcto
                    ? "#18a957"
                    : "#e32626";

            ctx.fill();
        }
    );
}

function finalizarControlRefrigeracion() {

    const control = window.controlRefrigeracion;

    const temperatura =
        Number(
            control.temperatura.toFixed(1)
        );

    const estadoGeneral =
        document.getElementById(
            "estado-general-refrigeracion"
        );

    const accion =
        document.getElementById(
            "accion-refrigeracion"
        );

    const estadoTemperatura =
        document.getElementById(
            "estado-temperatura"
        );

    // Temperatura correcta
    if (
        temperatura >= 0 &&
        temperatura <= 5
    ) {

        estadoTemperatura.textContent =
            "✓ Aceptado";

        accion.textContent =
            "Temperatura correcta.";

        estadoGeneral.innerHTML = `
            <strong>✓ CONTROL DE REFRIGERACIÓN APROBADO</strong>

            <span>
                El lote se encuentra entre 0 °C y 5 °C.
                Puede continuar al siguiente proceso.
            </span>
        `;

        window.controlRefrigeracionFinalizado = true;

const botonSiguiente =
    document.querySelector(".controles-proceso button");

if (botonSiguiente) {
    botonSiguiente.disabled = false;
    botonSiguiente.textContent =
        "Siguiente proceso";
}

return;
    }

    // Temperatura incorrecta
    control.reajustes++;

    estadoTemperatura.textContent =
        "✕ Rechazado";

    accion.textContent =
        "Reajustando sistema de refrigeración...";

    estadoGeneral.innerHTML = `
        <strong>✕ TEMPERATURA FUERA DE ESPECIFICACIÓN</strong>

        <span>
            Reajuste automático de refrigeración.
            Se realizará una nueva medición.
        </span>
    `;

    setTimeout(() => {

        reajustarRefrigeracion();

    }, 3000);
}
function reajustarRefrigeracion() {

    const control =
        window.controlRefrigeracion;

    const estadoGeneral =
        document.getElementById(
            "estado-general-refrigeracion"
        );

    const accion =
        document.getElementById(
            "accion-refrigeracion"
        );

    estadoGeneral.innerHTML = `
        <strong>
            Ajustando sistema de refrigeración...
        </strong>

        <span>
            Corrigiendo la temperatura del lote.
        </span>
    `;

    accion.textContent =
        "Reajustando refrigeración...";

    // Después del reajuste,
    // la temperatura vuelve a un rango correcto.
    setTimeout(() => {

        control.temperatura =
            Number(
                (2.5 + Math.random() * 1.5)
                    .toFixed(1)
            );

        control.segundos = 0;

        estadoGeneral.innerHTML = `
            <strong>
                Nueva medición iniciada
            </strong>

            <span>
                Verificando nuevamente la temperatura.
            </span>
        `;

        accion.textContent =
            "Volviendo a medir temperatura...";

        actualizarControlRefrigeracion();

    }, 2500);
}
function iniciarControlCalidadAutomatico() {

    if (!window.loteProcesoSeleccionado) {
        return;
    }

    // Evitar que el proceso se reinicie cada vez que se actualiza la pantalla
    if (window.controlCalidadActivo) {
        return;
    }

    window.controlCalidadActivo = true;

    const cantidadTotal =
        Number(window.loteProcesoSeleccionado.cantidadMedallones) || 0;

    // ==========================================
// VELOCIDAD DEL CONTROL DE CALIDAD
// ==========================================

const modoRapido =
    cantidadTotal > 30;

window.velocidadCalidad = {

    rapido: modoRapido,

    // Tiempo para obtener el pesaje
    medicion:
        modoRapido ? 30 : 200,

    // Pausa entre medallones
    siguiente:
        modoRapido ? 20 : 100,

    // Tiempos de reproceso
    ajuste:
        modoRapido ? 40 : 200,

    reformado:
        modoRapido ? 150 : 1800,

    nuevoPesaje:
        modoRapido ? 250 : 2600,

    resultado:
        modoRapido ? 80 : 1200
};

    window.controlCalidad = {
    actual: 0,
    total: cantidadTotal,

    historial: [],
    pesosGrafica: [],

    // Indicadores HMI
    aceptadosFinales: 0,
    reprocesados: 0,

    procesando: false
};

    procesarSiguienteMedallonCalidad();
}


function procesarSiguienteMedallonCalidad() {

    const control = window.controlCalidad;

    if (!control) {
        return;
    }

    // Si ya se completaron todos los medallones,
    // detener completamente el proceso.
    if (control.actual >= control.total) {

        const contadorElemento =
            document.getElementById(
                "contador-medallones-calidad"
            );

        const barraElemento =
            document.getElementById(
                "barra-calidad"
            );

        const numeroElemento =
            document.getElementById(
                "numero-medallon-calidad"
            );

        const pesoElemento =
            document.getElementById(
                "peso-digital-calidad"
            );

        const estadoElemento =
            document.getElementById(
                "estado-peso-calidad"
            );

        const accionElemento =
            document.getElementById(
                "accion-calidad"
            );

        const generalElemento =
            document.getElementById(
                "estado-general-calidad"
            );

        if (contadorElemento) {
            contadorElemento.textContent =
                `${control.total} / ${control.total}`;
        }

        if (barraElemento) {
            barraElemento.style.width = "100%";
        }

        if (numeroElemento) {
            numeroElemento.textContent =
                `#${control.total}`;
        }

        if (pesoElemento) {
            pesoElemento.textContent =
                "✓ 100 g";
        }

        if (estadoElemento) {
            estadoElemento.textContent =
                "✓ Aceptado";
        }

        if (accionElemento) {
            accionElemento.textContent =
                "Control de calidad finalizado.";
        }

        if (generalElemento) {
            generalElemento.innerHTML = `
                <strong>✓ LOTE COMPLETADO</strong>
                <span>
                    Todos los ${control.total}
                    medallones fueron aprobados.
                </span>
            `;
        }

        // Marcar el control como terminado
        window.controlCalidadFinalizado = true;

        return;
    }

    // Crear el siguiente medallón
    control.actual++;

    const numeroMedallon = control.actual;

    const numeroElemento =
        document.getElementById(
            "numero-medallon-calidad"
        );

    const pesoElemento =
        document.getElementById(
            "peso-digital-calidad"
        );

    const estadoElemento =
        document.getElementById(
            "estado-peso-calidad"
        );

    const accionElemento =
        document.getElementById(
            "accion-calidad"
        );

    const generalElemento =
        document.getElementById(
            "estado-general-calidad"
        );

    const contadorElemento =
        document.getElementById(
            "contador-medallones-calidad"
        );

    const barraElemento =
        document.getElementById(
            "barra-calidad"
        );

    if (!numeroElemento) {
        return;
    }

    numeroElemento.textContent =
        `#${numeroMedallon}`;

    // Mostrar cuántos ya fueron aprobados
    contadorElemento.textContent =
        `${numeroMedallon - 1} / ${control.total}`;

    const porcentaje =
        ((numeroMedallon - 1) / control.total) * 100;

    barraElemento.style.width =
        `${porcentaje}%`;

    pesoElemento.textContent =
        "--.- g";

    estadoElemento.textContent =
        "Pesando automáticamente...";

    accionElemento.textContent =
        "Balanza en proceso de medición";

    generalElemento.innerHTML = `
        <strong>
            Controlando medallón #${numeroMedallon}
        </strong>
        <span>
            Esperando resultado de la balanza...
        </span>
    `;

    setTimeout(() => {

        let peso;

if (Math.random() < 0.85) {

    // 85 % de los medallones quedan dentro del rango
    peso = Number(
        (98 + Math.random() * 5).toFixed(1)
    );

} else {

    // 15 % quedan fuera del rango
    peso = Number(
        (97 + Math.random() * 9).toFixed(1)
    );
}

            control.pesosGrafica.push({
    numero: numeroMedallon,
    peso: peso
});

actualizarGraficaPesoCalidad();

        pesoElemento.textContent =
            `${peso.toFixed(1)} g`;

        const aceptado =
            peso >= 98 && peso <= 102;

        if (aceptado) {

            aceptarMedallonCalidad(
                numeroMedallon,
                peso
            );

        } else {

            rechazarMedallonCalidad(
                numeroMedallon,
                peso
            );

        }

    }, window.velocidadCalidad?.medicion || 200);
}

function actualizarGraficaPesoCalidad() {

    const canvas = document.getElementById("grafica-peso-calidad");
    const control = window.controlCalidad;

    if (!canvas || !control) {
        return;
    }

    const ctx = canvas.getContext("2d");

    // Tamaño visual del canvas
    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const datos = control.pesosGrafica || [];

    if (datos.length === 0) {
        return;
    }

    // ==========================================
    // CONFIGURACIÓN DE LA GRÁFICA
    // ==========================================

    const margenIzquierdo = 45;
    const margenDerecho = 20;
    const margenSuperior = 20;
    const margenInferior = 35;

    const graficaW =
        w - margenIzquierdo - margenDerecho;

    const graficaH =
        h - margenSuperior - margenInferior;

    const minPeso = 96;
    const maxPeso = 104;

    // ==========================================
    // CONVERSIÓN DE COORDENADAS
    // ==========================================

    function convertirX(i) {

        if (datos.length === 1) {
            return margenIzquierdo + graficaW / 2;
        }

        return margenIzquierdo +
            (i / (datos.length - 1)) * graficaW;
    }

    function convertirY(peso) {

        return margenSuperior +
            ((maxPeso - peso) /
            (maxPeso - minPeso)) *
            graficaH;
    }

    // ==========================================
    // FONDO
    // ==========================================

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        margenIzquierdo,
        margenSuperior,
        graficaW,
        graficaH
    );

    // ==========================================
    // CUADRÍCULA
    // ==========================================

    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let peso = 96; peso <= 104; peso += 1) {

        const y = convertirY(peso);

        ctx.beginPath();

        ctx.moveTo(
            margenIzquierdo,
            y
        );

        ctx.lineTo(
            w - margenDerecho,
            y
        );

        ctx.strokeStyle =
            peso === 100
                ? "#b8b8b8"
                : "#e8e8e8";

        ctx.lineWidth =
            peso === 100 ? 1.5 : 1;

        ctx.stroke();

        // Etiqueta del eje Y
        ctx.fillStyle = "#666";

        ctx.fillText(
            `${peso}`,
            margenIzquierdo - 8,
            y
        );
    }

    // ==========================================
    // ZONA ACEPTABLE 98 - 102 g
    // ==========================================

    const y102 = convertirY(102);
    const y98 = convertirY(98);

    ctx.fillStyle = "rgba(24, 169, 87, 0.06)";

    ctx.fillRect(
        margenIzquierdo,
        y102,
        graficaW,
        y98 - y102
    );

    // ==========================================
    // LÍNEA OBJETIVO 100 g
    // ==========================================

    const y100 = convertirY(100);

    ctx.beginPath();

    ctx.moveTo(
        margenIzquierdo,
        y100
    );

    ctx.lineTo(
        w - margenDerecho,
        y100
    );

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);

    ctx.stroke();

    ctx.setLineDash([]);

    // ==========================================
    // LÍMITES 98 Y 102
    // ==========================================

    [98, 102].forEach(peso => {

        const y = convertirY(peso);

        ctx.beginPath();

        ctx.moveTo(
            margenIzquierdo,
            y
        );

        ctx.lineTo(
            w - margenDerecho,
            y
        );

        ctx.strokeStyle = "#d8d8d8";
        ctx.lineWidth = 1;

        ctx.setLineDash([3, 3]);

        ctx.stroke();

        ctx.setLineDash([]);
    });

    // ==========================================
    // EJE X
    // ==========================================

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const cantidadEtiquetas =
        Math.min(datos.length, 10);

    const paso =
        Math.max(
            1,
            Math.ceil(
                datos.length / cantidadEtiquetas
            )
        );

    for (
        let i = 0;
        i < datos.length;
        i += paso
    ) {

        const x = convertirX(i);

        ctx.fillStyle = "#666";

        ctx.fillText(
            `${datos[i].numero}`,
            x,
            h - margenInferior + 10
        );
    }

    // ==========================================
    // LÍNEA DE TENDENCIA
    // ==========================================

    if (datos.length > 1) {

        ctx.beginPath();

        datos.forEach((dato, i) => {

            const x = convertirX(i);
            const y = convertirY(dato.peso);

            if (i === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        });

        ctx.strokeStyle = "#2878d0";
        ctx.lineWidth = 2;

        ctx.stroke();
    }

    // ==========================================
    // PUNTOS
    // ==========================================

    datos.forEach((dato, i) => {

        const x = convertirX(i);
        const y = convertirY(dato.peso);

        const aceptado =
            dato.peso >= 98 &&
            dato.peso <= 102;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            aceptado
                ? "#18a957"
                : "#e32626";

        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;

        ctx.stroke();
    });

    // ==========================================
    // BORDE
    // ==========================================

    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        margenIzquierdo,
        margenSuperior,
        graficaW,
        graficaH
    );
}

function aceptarMedallonCalidad(numero, peso) {

    const control = window.controlCalidad;

    const estadoElemento =
        document.getElementById("estado-peso-calidad");

    const accionElemento =
        document.getElementById("accion-calidad");

    const generalElemento =
        document.getElementById("estado-general-calidad");

    const barraElemento =
        document.getElementById("barra-calidad");

    estadoElemento.textContent =
        "✓ Aceptado";

    accionElemento.textContent =
        "Medallón dentro de especificación";

    generalElemento.innerHTML = `
        <strong>✓ MEDALLÓN ACEPTADO</strong>
        <span>El peso está dentro del rango permitido.</span>
    `;

    control.historial.unshift({
    numero,
    peso,
    estado: "Aceptado"
});

// Registrar aceptación final
control.aceptadosFinales++;

actualizarHistorialCalidad();

actualizarIndicadoresHMI();

    const porcentaje =
    (numero / control.total) * 100;

barraElemento.style.width =
    `${porcentaje}%`;

contadorElemento =
    document.getElementById(
        "contador-medallones-calidad"
    );

if (contadorElemento) {
    contadorElemento.textContent =
        `${numero} / ${control.total}`;
}

setTimeout(() => {

    procesarSiguienteMedallonCalidad();

}, window.velocidadCalidad?.siguiente || 100);
}


function rechazarMedallonCalidad(numero, peso) {

    const control = window.controlCalidad;

    const estadoElemento =
        document.getElementById("estado-peso-calidad");

    const accionElemento =
        document.getElementById("accion-calidad");

    const generalElemento =
        document.getElementById("estado-general-calidad");

    estadoElemento.textContent =
        "✕ Rechazado";

    accionElemento.textContent =
        "Peso fuera de especificación";

    generalElemento.innerHTML = `
        <strong>✕ MEDALLÓN RECHAZADO</strong>
        <span>Se requiere ajustar el peso y reformar.</span>
    `;

    control.historial.unshift({
    numero,
    peso,
    estado: "Rechazado"
});

// Registrar que este medallón necesitó reproceso
control.reprocesados++;

actualizarHistorialCalidad();

actualizarIndicadoresHMI();
    setTimeout(() => {

        accionElemento.textContent =
            "Ajustando peso...";

        generalElemento.innerHTML = `
            <strong>Ajustando peso</strong>
            <span>Corrigiendo el medallón antes de reformar.</span>
        `;

    }, window.velocidadCalidad?.ajuste || 200);

    setTimeout(() => {

        accionElemento.textContent =
            "Reformando medallón...";

        generalElemento.innerHTML = `
            <strong>Reformando</strong>
            <span>El medallón volverá al proceso de formado.</span>
        `;

    }, window.velocidadCalidad?.reformado || 1800);

    setTimeout(() => {

        accionElemento.textContent =
            "Volviendo a pesar...";

        generalElemento.innerHTML = `
            <strong>Nuevo pesaje</strong>
            <span>Verificando nuevamente el peso.</span>
        `;

        // Segundo pesaje después del ajuste.
        // Se genera un valor dentro del rango.
        const nuevoPeso =
            Number((99.5 + Math.random() * 1).toFixed(1));

        document.getElementById(
            "peso-digital-calidad"
        ).textContent =
            `${nuevoPeso.toFixed(1)} g`;

        setTimeout(() => {

    aceptarMedallonCalidad(
        numero,
        nuevoPeso
    );

}, window.velocidadCalidad?.resultado || 1200);

    }, window.velocidadCalidad?.nuevoPesaje || 2600);
}


function actualizarHistorialCalidad() {

    const contenedor =
        document.getElementById(
            "historial-medallones-calidad"
        );

    if (!contenedor || !window.controlCalidad) {
        return;
    }

    const historial =
        window.controlCalidad.historial.slice(0, 5);

    contenedor.innerHTML =
        historial.map(item => {

            const clase =
                item.estado === "Aceptado"
                    ? "aceptado"
                    : "rechazado";

            const icono =
                item.estado === "Aceptado"
                    ? "✓"
                    : "✕";

            return `
                <div class="fila-tabla-calidad ${clase}">
                    <span>${item.numero}</span>
                    <span>${item.peso.toFixed(1)} g</span>
                    <span>${icono} ${item.estado}</span>
                </div>
            `;

        }).join("");
}

function actualizarIndicadoresHMI() {

    const control = window.controlCalidad;

    if (!control) {
        return;
    }

    const aceptados =
        control.aceptadosFinales || 0;

    const reprocesados =
        control.reprocesados || 0;

    // Medallones que ya terminaron su ciclo
    const procesados =
        aceptados;


    // ==========================================
    // CALIDAD FINAL
    // ==========================================

    const aceptadosPrimera =
    Math.max(
        0,
        control.total - reprocesados
    );

const calidad =
    control.total > 0
        ? (aceptadosPrimera / control.total) * 100
        : 0;


    // ==========================================
    // PESO PROMEDIO
    // ==========================================

    const pesos =
        control.pesosGrafica || [];

    let pesoPromedio = 0;

    if (pesos.length > 0) {

        const suma =
            pesos.reduce(
                (total, dato) =>
                    total + Number(dato.peso),
                0
            );

        pesoPromedio =
            suma / pesos.length;
    }


    // ==========================================
    // ACEPTADOS
    // ==========================================

    const aceptadosElemento =
        document.getElementById(
            "indicador-aceptados"
        );

    if (aceptadosElemento) {

        aceptadosElemento.textContent =
            aceptados;
    }


    // ==========================================
    // REPROCESADOS
    // ==========================================

    const reprocesadosElemento =
        document.getElementById(
            "indicador-rechazados"
        );

    if (reprocesadosElemento) {

        reprocesadosElemento.textContent =
            reprocesados;
    }


    // ==========================================
    // CALIDAD
    // ==========================================

    const calidadElemento =
        document.getElementById(
            "indicador-calidad"
        );

    if (calidadElemento) {

        calidadElemento.textContent =
            `${calidad.toFixed(1)} %`;
    }


    // ==========================================
    // PESO PROMEDIO
    // ==========================================

    const promedioElemento =
        document.getElementById(
            "indicador-peso-promedio"
        );

    if (promedioElemento) {

        promedioElemento.textContent =
            pesos.length > 0
                ? `${pesoPromedio.toFixed(1)} g`
                : "--.- g";
    }

}

// ==========================================
// ELIMINAR PEDIDO
// ==========================================

async function eliminarPedido(id) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar este pedido?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/api/pedidos/${id}`,
            {
                method: "DELETE"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            alert(
                datos.mensaje ||
                "No se pudo eliminar el pedido."
            );

            return;
        }

        alert("Pedido eliminado correctamente.");

// Actualizar pedidos e inventario
cargarPedidosAdmin();
cargarInventario();

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );

    }

}

// ==========================================
// MOSTRAR INVENTARIO
// ==========================================

async function cargarInventario() {

    const contenedor = document.getElementById("lista-inventario");

    if (!contenedor) {
        return;
    }

    try {

        const respuesta = await fetch("/api/inventario");

        const inventario = await respuesta.json();

        if (!respuesta.ok) {

            contenedor.innerHTML = `
                <p>${inventario.mensaje || "No se pudo cargar el inventario."}</p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        inventario.forEach(materia => {

            const cantidadKg = materia.cantidad / 1000;
            const minimoKg = materia.minimo / 1000;

            let estado = "Disponible";
            let claseEstado = "inventario-disponible";

            if (materia.cantidad <= materia.minimo) {

                estado = "Comprar materia prima";
                claseEstado = "inventario-alerta";

            }

            const elemento = document.createElement("div");

            elemento.className = "materia-prima";

            elemento.innerHTML = `
    <h3>${materia.nombre}</h3>

    <p>
        Cantidad disponible:
        <strong>${cantidadKg} kg</strong>
    </p>

    <p>
        Mínimo:
        <strong>${minimoKg} kg</strong>
    </p>

    <span class="${claseEstado}">
        ${estado}
    </span>

    <div class="reponer-inventario">

        <input
            type="number"
            id="reponer-${materia.id}"
            min="0.001"
            step="0.001"
            placeholder="Cantidad en kg"
        >

        <button
            onclick="reponerInventario(${materia.id})">
            Reponer
        </button>

    </div>
`;

            contenedor.appendChild(elemento);

        });

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <p>No se pudo conectar con el servidor.</p>
        `;

    }

}
// ==========================================
// CARGAR STOCK DE PRODUCTOS TERMINADOS
// ==========================================

async function cargarStockProductos() {

    const contenedor =
        document.getElementById("lista-stock-productos");

    if (!contenedor) return;

    contenedor.innerHTML =
        "<p>Cargando stock...</p>";

    try {

        const respuesta =
            await fetch("/api/stock-productos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo consultar el stock."
            );
        }

        const stock =
            await respuesta.json();

        contenedor.innerHTML = "";

        stock.forEach(item => {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "tarjeta-stock-producto";

            tarjeta.innerHTML = `

                <div>
                    <h3>${item.nombre}</h3>

                    <p>
                        Producto terminado
                    </p>

                    <p>
                        <strong>Pack x${item.pack}</strong>
                        · ${item.pesoGramos} g
                    </p>
                </div>

                <div class="cantidad-stock-producto">

                    <strong>
                        ${item.cantidadPacks}
                    </strong>

                    <span>
                        paquetes disponibles
                    </span>

                </div>

                <button
                    class="boton-produccion-mes"
                    onclick="
                        solicitarProduccionMES(
                            '${item.producto}',
                            '${item.nombre}',
                            ${item.pack}
                        )
                    "
                >
                    Enviar a producción MES
                </button>

            `;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(
            "Error cargando stock de productos:",
            error
        );

        contenedor.innerHTML = `
            <p class="error-admin">
                No se pudo cargar el stock de productos.
            </p>
        `;
    }
}
// ==========================================
// CARGAR SOLICITUDES DE COMPRA
// ==========================================

async function cargarSolicitudesCompra() {

    const contenedor =
        document.getElementById("lista-solicitudes-compra");

    if (!contenedor) {
        return;
    }

    try {

        const respuesta =
            await fetch("/api/solicitudes-compra");

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron consultar las solicitudes de compra."
            );

        }

        const solicitudes =
            await respuesta.json();

        if (solicitudes.length === 0) {

            contenedor.innerHTML = `
                <div class="sin-solicitudes-compra">
                    <p>No hay solicitudes de compra pendientes.</p>
                </div>
            `;

            return;
        }

        contenedor.innerHTML =
            solicitudes.map(solicitud => {

                const cantidadKg =
                    solicitud.cantidadFaltante / 1000;

                return `
                    <div class="tarjeta-solicitud-compra">

                        <div class="info-solicitud-compra">

                            <span class="numero-solicitud">
                                Solicitud #${solicitud.id}
                            </span>

                            <h3>
                                ${solicitud.materiaPrima}
                            </h3>

                            <p>
                                Orden de producción:
                                <strong>
                                    #${solicitud.idOrdenProduccion}
                                </strong>
                            </p>

                            <p>
                                Cantidad faltante:
                                <strong>
                                    ${cantidadKg.toFixed(2)} kg
                                </strong>
                            </p>

                            <small>
                                Solicitud registrada:
                                ${solicitud.fecha}
                            </small>

                        </div>

                        <div class="acciones-solicitud-compra">

    <div class="estado-solicitud-compra">
        ${solicitud.estado}
    </div>

    ${
        solicitud.estado === "Pendiente"
            ? `
                <button
                    class="boton-recibir-compra"
                    onclick="registrarRecepcionCompra(${solicitud.id}, '${solicitud.materiaPrima}', ${solicitud.cantidadFaltante})"
                >
                    Registrar recepción
                </button>
            `
            : ""
    }

</div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Error cargando solicitudes de compra:",
            error
        );

        contenedor.innerHTML = `
            <p>
                No se pudieron cargar las solicitudes de compra.
            </p>
        `;

    }

}
// ==========================================
// REGISTRAR RECEPCIÓN DE COMPRA
// ==========================================

async function registrarRecepcionCompra(
    idSolicitud,
    materiaPrima,
    cantidadFaltante
) {

    const cantidadKg =
        cantidadFaltante / 1000;

    const cantidad =
        prompt(
            `Materia prima: ${materiaPrima}\n\n` +
            `Cantidad faltante: ${cantidadKg.toFixed(2)} kg\n\n` +
            `¿Cuántos kg recibiste?`
        );

    if (cantidad === null) {
        return;
    }

    const cantidadKgRecibida =
        Number(cantidad);

    if (
        !Number.isFinite(cantidadKgRecibida) ||
        cantidadKgRecibida <= 0
    ) {

        alert(
            "Ingresa una cantidad válida mayor que cero."
        );

        return;
    }

    const cantidadGramos =
        cantidadKgRecibida * 1000;

    const confirmar =
        confirm(
            `¿Confirmas la recepción?\n\n` +
            `Materia prima: ${materiaPrima}\n` +
            `Cantidad recibida: ${cantidadKgRecibida.toFixed(2)} kg`
        );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta =
            await fetch(
                `/api/solicitudes-compra/${idSolicitud}/recibir`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        cantidad: cantidadGramos
                    })
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo registrar la recepción."
            );

        }

        alert(
            "Recepción registrada correctamente.\n\n" +
            `${materiaPrima}: ` +
            `${cantidadKgRecibida.toFixed(2)} kg agregados al inventario.`
        );

        cargarSolicitudesCompra();

        cargarInventario();

    } catch (error) {

        console.error(
            "Error registrando recepción:",
            error
        );

        alert(
            "No se pudo registrar la recepción.\n\n" +
            error.message
        );

    }

}
// ==========================================
// CARGAR PEDIDOS DE CLIENTES EN ERP
// ==========================================

async function cargarPedidosERP() {

    const contenedor =
        document.getElementById("lista-pedidos-erp");

    if (!contenedor) return;

    contenedor.innerHTML =
        "<p>Cargando pedidos...</p>";

    try {

        // Consultar pedidos
        const respuestaPedidos =
            await fetch("/api/pedidos");

        if (!respuestaPedidos.ok) {
            throw new Error(
                "No se pudieron consultar los pedidos."
            );
        }

        const pedidos =
            await respuestaPedidos.json();

        // Consultar stock terminado
        const respuestaStock =
            await fetch("/api/stock-productos");

        if (!respuestaStock.ok) {
            throw new Error(
                "No se pudo consultar el stock."
            );
        }

        const stock =
            await respuestaStock.json();

        // Mostrar solamente pedidos pendientes
        const pedidosPendientes =
            pedidos.filter(pedido =>
                pedido.estado === "Pendiente"
            );

        if (pedidosPendientes.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-pedidos">
                    No hay pedidos pendientes de despacho.
                </p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        pedidosPendientes.forEach(pedido => {

            let pedidoDisponible = true;

            let productosHTML = "";

            pedido.productos.forEach(producto => {

                // Cantidad de paquetes solicitados
const cantidadPacks =
    Number(producto.cantidad);

// Buscar stock de la presentación exacta
const stockProducto =
    stock.find(item =>
        item.producto === producto.producto &&
        Number(item.pack) === Number(producto.pack)
    );

const cantidadDisponible =
    stockProducto
        ? Number(stockProducto.cantidadPacks)
        : 0;

// Comparar paquetes solicitados contra paquetes disponibles
const suficiente =
    cantidadDisponible >= cantidadPacks;

                if (!suficiente) {
                    pedidoDisponible = false;
                }

                productosHTML += `
                    <div class="producto-pedido-erp">

                        <div>
                            <strong>
                                ${producto.nombre}
                            </strong>

                            <span>
    Pack x${producto.pack}
</span>
                        </div>

                        <div class="${
    suficiente
        ? "stock-suficiente"
        : "stock-insuficiente"
}">

    <div>
        Solicitado:
        ${cantidadPacks} packs
    </div>

    <div>
        Stock disponible:
        ${cantidadDisponible} packs
    </div>

</div>

                    </div>
                `;

            });

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "pedido-erp";

            tarjeta.innerHTML = `

                <div class="cabecera-pedido-erp">

                    <div>

                        <h3>
                            Pedido #${pedido.id}
                        </h3>

                        <p>
                            Cliente:
                            <strong>
                                ${pedido.cliente.nombre}
                            </strong>
                        </p>

                    </div>

                    <span class="estado-pedido-erp">
                        ${pedido.estado}
                    </span>

                </div>

                <div class="productos-pedido-erp">

                    ${productosHTML}

                </div>

                <div class="resultado-stock-erp">

                    ${
                        pedidoDisponible
                            ? `
                                <div class="pedido-disponible">

                                    <strong>
                                        ✓ Producto disponible
                                    </strong>

                                    <span>
                                        El pedido puede pasar a despacho.
                                    </span>

                                </div>

                                <button
                                    class="boton-despachar-erp"
                                    onclick="despacharPedidoERP(${pedido.id})"
                                >
                                    Despachar pedido
                                </button>
                             `
    : `
    <div class="pedido-bloqueado">

        <strong>
            ⚠ Stock insuficiente
        </strong>

        <span>
            El pedido permanece bloqueado
            hasta que haya suficiente producto.
        </span>

    </div>
`
                    }

                </div>

            `;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(
            "Error cargando pedidos del ERP:",
            error
        );

        contenedor.innerHTML = `
            <p class="error-admin">
                No se pudieron cargar los pedidos.
            </p>
        `;
    }
}
// ==========================================
// RESUMEN COMERCIAL DEL ERP
// ==========================================

async function cargarResumenComercial() {

    try {

        const respuesta =
            await fetch("/api/resumen-comercial");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar el resumen comercial."
            );
        }

        const datos =
            await respuesta.json();


        // ==========================================
        // ACTUALIZAR INDICADORES
        // ==========================================

        const ventas =
            document.getElementById(
                "ventas-registradas"
            );

        const ingresos =
            document.getElementById(
                "ingresos-generados"
            );

        const pedidos =
            document.getElementById(
                "pedidos-entregados-contabilidad"
            );


        if (ventas) {
            ventas.textContent =
                datos.ventasRegistradas;
        }

        if (ingresos) {

            ingresos.textContent =
                "$" +
                Number(
                    datos.ingresosGenerados
                ).toLocaleString("es-CO");

        }

        if (pedidos) {
            pedidos.textContent =
                datos.pedidosEntregados;
        }
        // Actualizar indicadores del paso "Registrar venta"

const ventasPaso =
    document.getElementById("ventas-paso");

const ingresosPaso =
    document.getElementById("ingresos-paso");

const medallonesPaso =
    document.getElementById("medallones-paso");

if (ventasPaso) {
    ventasPaso.textContent =
        datos.ventasRegistradas;
}

if (ingresosPaso) {
    ingresosPaso.textContent =
        "$" +
        Number(datos.ingresosGenerados)
            .toLocaleString("es-CO");
}

if (medallonesPaso) {

    const totalMedallones =
        datos.ventasPorProducto.reduce(
            (total, producto) =>
                total + Number(producto.cantidad),
            0
        );

    medallonesPaso.textContent =
        totalMedallones;
}

// ==========================================
// ACTUALIZAR INDICADORES DE CONTABILIDAD
// ==========================================

const ingresosContabilidad =
    document.getElementById(
        "ingresos-contabilidad"
    );

const operacionesContabilidad =
    document.getElementById(
        "operaciones-contabilidad"
    );

const promedioContabilidad =
    document.getElementById(
        "promedio-contabilidad"
    );

if (ingresosContabilidad) {
    ingresosContabilidad.textContent =
        "$" +
        Number(datos.ingresosGenerados).toLocaleString("es-CO")
}

if (operacionesContabilidad) {
    operacionesContabilidad.textContent =
        Number(datos.ventasRegistradas)
}

// ==========================================
// ACTUALIZAR GRÁFICA CIRCULAR
// ==========================================

const grafica =
    document.getElementById(
        "grafica-ventas-productos"
    );

if (!grafica) {
    return;
}


// Productos que tienen ventas

const productos =
    datos.ventasPorProducto.filter(
        producto =>
            Number(producto.cantidad) > 0
    );


// Si no hay ventas

if (productos.length === 0) {

    grafica.innerHTML = `
        <p class="sin-ventas-grafica">
            No hay ventas registradas todavía.
        </p>
    `;

    return;
}


// Calcular total

const totalMedallones =
    productos.reduce(
        (total, producto) =>
            total + Number(producto.cantidad),
        0
    );


// Colores de los segmentos

const colores = [
    "#e50909",
    "#f59e0b",
    "#2563eb"
];


// Crear segmentos del círculo

let acumulado = 0;

const segmentos =
    productos.map(
        (producto, index) => {

            const porcentaje =
                (
                    Number(producto.cantidad) /
                    totalMedallones
                ) * 100;

            const inicio =
                acumulado;

            acumulado += porcentaje;

            const fin =
                acumulado;

            return `
                ${colores[index]}
                ${inicio}%
                ${fin}%
            `;

        }
    ).join(", ");


// Crear gráfica

grafica.innerHTML = `

    <div class="grafica-circular-contenedor">

        <div
            class="grafica-circular"
            style="
                background:
                conic-gradient(
                    ${segmentos}
                );
            "
        >

            <div class="centro-grafica">

                <strong>
                    ${totalMedallones}
                </strong>

                <span>
                    medallones
                </span>

            </div>

        </div>


        <div class="leyenda-grafica">

            ${productos.map(
                (producto, index) => {

                    const porcentaje =
                        (
                            Number(producto.cantidad) /
                            totalMedallones
                        ) * 100;

                    return `

                        <div class="item-leyenda">

                            <span
                                class="punto-leyenda"
                                style="
                                    background:
                                    ${colores[index]};
                                "
                            ></span>

                            <div>

                                <strong>
                                    ${producto.nombre}
                                </strong>

                                <span>
                                    ${producto.cantidad}
                                    medallones
                                    (${porcentaje.toFixed(1)}%)
                                </span>

                            </div>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    </div>

`;

    } catch (error) {

        console.error(
            "Error cargando resumen comercial:",
            error
        );

    }

}
// ==========================================
// VENTANA DE GENERACIÓN DE REPORTES
// ==========================================

function mostrarGeneradorReportes() {

    const modal = document.createElement("div");

    modal.className = "modal-generador-reportes";

    modal.innerHTML = `

        <div class="ventana-generador-reportes">

            <div class="cabecera-generador-reportes">

                <div>
                    <h2>Generar reportes</h2>

                    <p>
                        Selecciona el tipo de información
                        que deseas consultar.
                    </p>
                </div>

                <button
                    class="cerrar-generador-reportes"
                    onclick="this.closest('.modal-generador-reportes').remove()">
                    ×
                </button>

            </div>


           <div class="tipo-reporte">

    <div>
        <strong>Reporte de ventas</strong>

        <span>
            Ventas, ingresos y medallones vendidos.
        </span>
    </div>

    <button onclick="generarReporteVentas()">
        Generar
    </button>

</div>


                <div class="tipo-reporte">

                    <div>
                        <strong>Reporte de pedidos</strong>

                        <span>
                            Estado y cantidad de pedidos.
                        </span>
                    </div>

                    <button onclick="generarReportePedidos()">
    Generar
</button>

                </div>


                <div class="tipo-reporte">

                    <div>
                        <strong>Reporte de productos</strong>

                        <span>
                            Ventas por tipo de medallón.
                        </span>
                    </div>

                    <button onclick="generarReporteProductos()">
    Generar
</button>

                </div>


                <div class="tipo-reporte">

                    <div>
                        <strong>Reporte de inventario</strong>

                        <span>
                            Existencias y materias primas.
                        </span>
                    </div>

                    <button onclick="generarReporteInventario()">
    Generar
</button>

                </div>


                <div class="tipo-reporte">

                    <div>
                        <strong>Reporte financiero</strong>

                        <span>
                            Ingresos y operaciones comerciales.
                        </span>
                    </div>

                    <button onclick="generarReporteFinanciero()">
    Generar
</button>

                </div>


            <div class="tipo-reporte">

                <div>
                    <strong>Reporte completo</strong>

                    <span>
                        Reúne la información comercial
                        y financiera del ERP.
                    </span>
                </div>

                <button onclick="generarReporteCompleto()">
    Generar
</button>

            </div>

        </div>

    `;

    document.body.appendChild(modal);
}
// ==========================================
// GENERAR REPORTE COMERCIAL
// ==========================================

async function generarReporteComercial() {

    try {

        const respuesta =
            await fetch("/api/resumen-comercial");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información del reporte."
            );
        }

        const datos =
            await respuesta.json();


        // Calcular total de medallones

        const totalMedallones =
            datos.ventasPorProducto.reduce(
                (total, producto) =>
                    total + Number(producto.cantidad),
                0
            );


        // Crear contenido del reporte

        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-comercial-generado";


        reporte.innerHTML = `

            <div class="cabecera-reporte">

                <div>

                    <h2>
                        Reporte comercial
                    </h2>

                    <p>
                        BurguerTech
                    </p>

                </div>

                <span>
                    ERP
                </span>

            </div>


            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>


            <div class="resumen-reporte">

                <div>

                    <span>
                        Ventas registradas
                    </span>

                    <strong>
                        ${datos.ventasRegistradas}
                    </strong>

                </div>


                <div>

                    <span>
                        Pedidos entregados
                    </span>

                    <strong>
                        ${datos.pedidosEntregados}
                    </strong>

                </div>


                <div>

                    <span>
                        Ingresos generados
                    </span>

                    <strong>
                        $${Number(
                            datos.ingresosGenerados
                        ).toLocaleString("es-CO")}
                    </strong>

                </div>


                <div>

                    <span>
                        Medallones vendidos
                    </span>

                    <strong>
                        ${totalMedallones}
                    </strong>

                </div>

            </div>


            <div class="detalle-reporte">

                <h3>
                    Ventas por producto
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Producto
                        </strong>

                        <strong>
                            Medallones
                        </strong>

                        <strong>
                            Participación
                        </strong>

                    </div>


                    ${datos.ventasPorProducto.map(
                        producto => {

                            const porcentaje =
                                totalMedallones > 0
                                    ? (
                                        Number(
                                            producto.cantidad
                                        ) /
                                        totalMedallones
                                    ) * 100
                                    : 0;

                            return `

                                <div
                                    class="fila-reporte"
                                >

                                    <span>
                                        ${producto.nombre}
                                    </span>

                                    <span>
                                        ${producto.cantidad}
                                    </span>

                                    <span>
                                        ${porcentaje.toFixed(1)}%
                                    </span>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>

            </div>


            <div class="pie-reporte">

                <span>
                    BurguerTech · Gestión ERP
                </span>

                <strong>
                    Información generada a partir
                    de pedidos entregados.
                </strong>

            </div>

        `;


        // Buscar reporte anterior

        const reporteAnterior =
            document.getElementById(
                "reporte-comercial-generado"
            );

        if (reporteAnterior) {
            reporteAnterior.remove();
        }


        // Identificar la sección comercial

        const seccionComercial =
            document.querySelector(
                ".seccion-comercial-erp"
            );

        if (!seccionComercial) {
            return;
        }


        reporte.id =
            "reporte-comercial-generado";


        // Insertar después de la gráfica

        const grafica =
            seccionComercial.querySelector(
                ".grafica-ventas-erp"
            );

        if (grafica) {

            grafica.insertAdjacentElement(
                "afterend",
                reporte
            );

        } else {

            seccionComercial.appendChild(
                reporte
            );

        }


        // Llevar la pantalla hasta el reporte

        reporte.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "Error generando reporte:",
            error
        );

        alert(
            "No se pudo generar el reporte.\n\n" +
            error.message
        );

    }

}    

// ==========================================
// DESPACHAR PEDIDO DESDE ERP
// ==========================================

async function despacharPedidoERP(id) {

    const confirmar = confirm(
        `¿Confirmar el despacho del pedido #${id}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/api/pedidos/${id}/despachar`,
            {
                method: "PUT"
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                "No se pudo despachar el pedido."
            );
        }

        alert(
            `Pedido #${id} despachado correctamente.`
        );

        // Actualizar stock, pedidos pendientes y pedidos entregados
await cargarStockProductos();
await cargarPedidosERP();
await cargarPedidosAdmin();

    } catch (error) {

        console.error(
            "Error despachando pedido:",
            error
        );

        alert(
            "No se pudo despachar el pedido.\n\n" +
            error.message
        );

    }

}
// ==========================================
// SOLICITAR PRODUCCIÓN DE PRODUCTO TERMINADO
// ==========================================

async function solicitarProduccionMES(
    producto,
    nombre,
    pack
) {

    const cantidad =
        prompt(
            `¿Cuántos paquetes x${pack} de ${nombre} deseas producir?`
        );

    if (cantidad === null) {
        return;
    }

    const cantidadPacks =
        Number(cantidad);

    if (
        !Number.isInteger(cantidadPacks) ||
        cantidadPacks <= 0
    ) {

        alert(
            "Ingresa una cantidad válida de paquetes."
        );

        return;
    }

    const cantidadMedallones =
        cantidadPacks * Number(pack);

    const pesoTotal =
        cantidadMedallones * 100;

    const confirmar = confirm(

        `¿Enviar una orden de producción al MES?\n\n` +

        `Producto: ${nombre}\n` +
        `Presentación: Pack x${pack}\n` +
        `Paquetes: ${cantidadPacks}\n` +
        `Medallones necesarios: ${cantidadMedallones}\n` +
        `Peso total: ${pesoTotal} g`

    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta =
            await fetch(
                "/api/ordenes-produccion",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        producto: producto,
                        nombre: nombre,

                        cantidad:
                            cantidadMedallones,

                        pack:
                            Number(pack),

                        cantidadPacks:
                            cantidadPacks

                    })
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo crear la orden de producción."
            );

        }

        alert(

            `Orden de producción creada correctamente.\n\n` +

            `Orden #${resultado.orden.id}\n` +
            `Producto: ${resultado.orden.nombre}\n` +
            `Presentación: Pack x${pack}\n` +
            `Paquetes: ${cantidadPacks}\n` +
            `Medallones: ${resultado.orden.cantidad_medallones}\n` +
            `Estado: ${resultado.orden.estado}`

        );

    } catch (error) {

        console.error(
            "Error creando orden de producción:",
            error
        );

        alert(

            "No se pudo crear la orden de producción.\n\n" +
            error.message

        );

    }
}
// ==========================================
// CARGAR ÓRDENES DE PRODUCCIÓN EN MES
// ==========================================

async function cargarOrdenesProduccionMES() {

    const contenedor =
        document.getElementById(
            "lista-ordenes-produccion-mes"
        );

    if (!contenedor) return;

    contenedor.innerHTML =
        "<p>Cargando órdenes de producción...</p>";

    try {

        const respuesta =
            await fetch("/api/ordenes-produccion");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron consultar las órdenes."
            );
        }

        const ordenes =
            await respuesta.json();

        if (ordenes.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-pedidos">
                    No hay órdenes de producción pendientes.
                </p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        ordenes.forEach(orden => {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "orden-produccion-mes";

            tarjeta.innerHTML = `

                <div>

                    <h3>
                        Orden #${orden.id}
                    </h3>

                    <p>
                        <strong>Producto:</strong>
                        ${orden.nombre}
                    </p>

                    <p>
                        <strong>Cantidad:</strong>
                        ${orden.cantidad_medallones}
                        medallones
                    </p>

                    <p>
    <strong>Código de lote:</strong>
    ${orden.codigo_lote || "Sin lote"}
</p>
                    <button
    class="boton-verificar-materias"
    onclick="verificarMateriasPrimasMES(${orden.id}, '${orden.producto}', ${orden.cantidad_medallones})">
    Verificar materias primas
</button>

                </div>

            `;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(
            "Error cargando órdenes de producción:",
            error
        );

        contenedor.innerHTML = `
            <p class="error-admin">
                No se pudieron cargar las órdenes
                de producción.
            </p>
        `;
    }
}

// ==========================================
// CARGAR PRODUCCIÓN TERMINADA EN MES
// ==========================================

async function cargarProduccionTerminadaMES() {

    const contenedor =
        document.getElementById(
            "lista-produccion-terminada-mes"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML =
        "<p>Cargando producción terminada...</p>";

    try {

        const respuesta =
            await fetch(
                "/api/lotes-produccion/reportados-mes"
            );

        const lotes =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                lotes.mensaje ||
                "No se pudieron cargar las producciones terminadas."
            );
        }

        if (lotes.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-pedidos">
                    No hay producciones terminadas
                    reportadas al MES.
                </p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        lotes.forEach(lote => {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "produccion-terminada-mes";

            const stockActualizado =
                lote.stock_actualizado === true;

            tarjeta.innerHTML = `

    <div class="produccion-header">

        <span class="etiqueta-mes">
            MES
        </span>

        <h3>
            Lote ${lote.codigo_lote}
        </h3>

    </div>

    <div class="produccion-datos">

        <div class="dato-produccion">
            <span class="dato-titulo">
                Producto
            </span>

            <span class="dato-valor">
                ${lote.nombre}
            </span>
        </div>

        <div class="dato-produccion">
            <span class="dato-titulo">
                Presentación
            </span>

            <span class="dato-valor">
                Pack x${lote.pack}
            </span>
        </div>

        <div class="dato-produccion">
            <span class="dato-titulo">
                Medallones producidos
            </span>

            <span class="dato-valor">
                ${lote.cantidad_medallones}
            </span>
        </div>

        <div class="dato-produccion">
            <span class="dato-titulo">
                Packs producidos
            </span>

            <span class="dato-valor">
                ${lote.cantidad_packs}
            </span>
        </div>

    </div>

    <div class="produccion-estado">

        <span class="
            ${stockActualizado
                ? "estado-stock-ok"
                : "estado-stock-pendiente"}
        ">

            ${
                stockActualizado
                    ? "✓ Stock actualizado"
                    : "● Producción reportada"
            }

        </span>

    </div>

    ${
        stockActualizado

        ? `
            <button
                class="boton-stock-actualizado"
                disabled
            >
                Stock actualizado
            </button>
        `

        : `
            <button
                class="boton-actualizar-stock-mes"
                onclick="
                    actualizarStockMES(
                        ${lote.id}
                    )
                "
            >
                Actualizar stock
            </button>
        `
    }

`;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(
            "Error cargando producción terminada:",
            error
        );

        contenedor.innerHTML = `
            <p class="error-admin">
                ${error.message}
            </p>
        `;
    }
}
// ==========================================
// ACTUALIZAR STOCK DESDE MES
// ==========================================

async function actualizarStockMES(idLote) {

    const confirmar = confirm(
        "¿Actualizar el stock con la producción de este lote?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta =
            await fetch(
                `/api/lotes-produccion/${idLote}/actualizar-stock`,
                {
                    method: "PUT"
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se pudo actualizar el stock."
            );
        }

        alert(
            "Stock actualizado correctamente."
        );

        // Actualizar la sección MES
        await cargarProduccionTerminadaMES();

        // Actualizar el stock mostrado en ERP
        if (
            typeof cargarStockProductos ===
            "function"
        ) {
            await cargarStockProductos();
        }

        // Actualizar las órdenes de producción
if (
    typeof cargarOrdenesProduccionMES ===
    "function"
) {
    await cargarOrdenesProduccionMES();
}

    } catch (error) {

        console.error(
            "Error actualizando stock:",
            error
        );

        alert(
            "No se pudo actualizar el stock.\n\n" +
            error.message
        );
    }
}
// ==========================================
// VERIFICAR MATERIAS PRIMAS EN MES
// ==========================================

async function verificarMateriasPrimasMES(
    idOrden,
    producto,
    cantidadMedallones
) {

    try {

        const respuesta =
            await fetch("/api/inventario");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo consultar el inventario."
            );
        }

        const inventario =
            await respuesta.json();


        // ==========================================
        // FORMULACIONES
        // ==========================================

        const formulaciones = {

            res: {
                "Carne de res": 90,
                "Grasa de res": 7,
                "Sal": 1.5,
                "Pimienta negra": 0.3,
                "Ajo en polvo": 0.3,
                "Cebolla en polvo": 0.4,
                "Agua/hielo": 0.5
            },

            cerdo: {
                "Carne de cerdo": 91,
                "Grasa de cerdo": 6,
                "Sal": 1.5,
                "Pimienta negra": 0.3,
                "Ajo en polvo": 0.4,
                "Cebolla en polvo": 0.3,
                "Agua/hielo": 0.5
            },

            mixto: {
                "Carne de res": 55,
                "Carne de cerdo": 37,
                "Grasa para mixto": 6,
                "Sal": 1.5,
                "Pimienta negra": 0.2,
                "Ajo en polvo": 0.2,
                "Cebolla en polvo": 0.1
            }

        };


        const formulacion =
            formulaciones[producto];


        if (!formulacion) {

            throw new Error(
                "No existe una formulación para este producto."
            );

        }


        // ==========================================
        // CANTIDAD TOTAL A PRODUCIR
        // ==========================================

        const gramosTotales =
            Number(cantidadMedallones) * 100;


        // ==========================================
        // CALCULAR NECESIDADES
        // ==========================================

        const materiasNecesarias =
            Object.entries(formulacion).map(
                ([nombre, porcentaje]) => {

                    const necesaria =
                        gramosTotales *
                        Number(porcentaje) /
                        100;


                    const materia =
                        inventario.find(
                            item =>
                                item.nombre.trim().toLowerCase() ===
                                nombre.trim().toLowerCase()
                        );


                    const disponible =
                        materia
                            ? Number(materia.cantidad)
                            : 0;


                    const suficiente =
                        disponible >= necesaria;


                    return {

                        nombre,
                        porcentaje,
                        necesaria,
                        disponible,
                        suficiente

                    };

                }
            );


        // ==========================================
        // COMPROBAR TODAS LAS MATERIAS
        // ==========================================

        const todasDisponibles =
            materiasNecesarias.every(
                materia =>
                    materia.suficiente
            );


        // ==========================================
        // CREAR VENTANA
        // ==========================================

        const ventanaAnterior =
            document.getElementById(
                "ventana-verificacion-materias"
            );

        if (ventanaAnterior) {
            ventanaAnterior.remove();
        }


        const ventana =
            document.createElement("div");

        ventana.id =
            "ventana-verificacion-materias";

        ventana.style.position = "fixed";
        ventana.style.inset = "0";
        ventana.style.background =
            "rgba(0,0,0,.55)";
        ventana.style.display = "flex";
        ventana.style.alignItems = "center";
        ventana.style.justifyContent = "center";
        ventana.style.zIndex = "10000";
        ventana.style.padding = "20px";


        ventana.innerHTML = `

            <div style="
                width:min(850px,100%);
                max-height:85vh;
                overflow-y:auto;
                background:#fff;
                border-radius:14px;
                box-shadow:0 20px 50px rgba(0,0,0,.25);
            ">

                <div style="
                    background:#202124;
                    color:#fff;
                    padding:22px 26px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                ">

                    <div>

                        <h2 style="
                            margin:0;
                            color:#fff;
                        ">
                            Verificación de materias primas
                        </h2>

                        <p style="
                            margin:5px 0 0;
                            color:#d1d5db;
                        ">
                            Orden #${idOrden} · ${producto}
                        </p>

                    </div>


                    <button
                        onclick="document.getElementById('ventana-verificacion-materias').remove()"
                        style="
                            width:32px;
                            height:32px;
                            border:none;
                            border-radius:8px;
                            background:#e50909;
                            color:#fff;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>


                <div style="
                    padding:24px;
                ">

                    <div style="
                        background:#f5f5f5;
                        border-radius:10px;
                        padding:16px;
                        margin-bottom:20px;
                    ">

                        <strong>
                            Producción solicitada
                        </strong>

                        <p style="
    margin:7px 0 0;
">
    ${cantidadMedallones}
    medallones × 100 g =
    <strong>
        ${
            gramosTotales >= 1000
                ? (gramosTotales / 1000).toLocaleString("es-CO", {
                    maximumFractionDigits: 2
                }) + " kg"
                : gramosTotales.toLocaleString("es-CO", {
                    maximumFractionDigits: 2
                }) + " g"
        }
    </strong>
</p>

                    </div>


                    <div style="
                        overflow-x:auto;
                    ">

                        <table style="
                            width:100%;
                            border-collapse:collapse;
                        ">

                            <thead>

                                <tr style="
                                    background:#202124;
                                    color:#fff;
                                ">

                                    <th style="padding:12px;text-align:left;">
    Materia prima
</th>

<th style="padding:12px;text-align:center;">
    Porcentaje
</th>

<th style="padding:12px;text-align:center;">
    Cantidad necesaria
</th>

                                    <th style="padding:12px;text-align:center;">
                                        Disponible
                                    </th>

                                    <th style="padding:12px;text-align:center;">
                                        Estado
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                ${materiasNecesarias.map(
                                    materia => `

                                    <tr>

                                        <td style="
                                            padding:12px;
                                            border-bottom:1px solid #e5e7eb;
                                        ">
                                            ${materia.nombre}
                                        </td>

                                        <td style="
    padding:12px;
    text-align:center;
    border-bottom:1px solid #e5e7eb;
">
    ${materia.porcentaje}%
</td>

<td style="
    padding:12px;
    text-align:center;
    border-bottom:1px solid #e5e7eb;
">
    ${
        materia.necesaria >= 1000
            ? (materia.necesaria / 1000).toLocaleString("es-CO", {
                maximumFractionDigits: 2
            }) + " kg"
            : materia.necesaria.toLocaleString("es-CO", {
                maximumFractionDigits: 2
            }) + " g"
    }
</td>

                                        <td style="
    padding:12px;
    text-align:center;
    border-bottom:1px solid #e5e7eb;
">
    ${
        materia.disponible >= 1000
            ? (materia.disponible / 1000).toLocaleString("es-CO", {
                maximumFractionDigits: 2
            }) + " kg"
            : materia.disponible.toLocaleString("es-CO", {
                maximumFractionDigits: 2
            }) + " g"
    }
</td>

                                        <td style="
                                            padding:12px;
                                            text-align:center;
                                            border-bottom:1px solid #e5e7eb;
                                            font-weight:700;
                                            color:${materia.suficiente ? "#15803d" : "#dc2626"};
                                        ">
                                            ${materia.suficiente
                                                ? "Disponible"
                                                : "Insuficiente"}
                                        </td>

                                    </tr>

                                `).join("")}

                            </tbody>

                        </table>

                    </div>


                    <div style="
                        margin-top:20px;
                        padding:15px;
                        border-radius:10px;
                        background:${todasDisponibles ? "#ecfdf5" : "#fef2f2"};
                        color:${todasDisponibles ? "#166534" : "#991b1b"};
                        font-weight:700;
                    ">

                        ${
                            todasDisponibles
                                ? "✓ Todas las materias primas están disponibles para esta producción."
                                : "✕ No hay suficiente materia prima para realizar esta producción."
                        }

                    </div>
                    ${
    !todasDisponibles
        ? `
            <div style="
                margin-top:15px;
                display:flex;
                justify-content:flex-end;
            ">

                <button
                    onclick="solicitarCompraMES(${idOrden})"
                    style="
                        border:none;
                        border-radius:8px;
                        background:#d97706;
                        color:#fff;
                        padding:11px 22px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Solicitar compra
                </button>

            </div>
        `
        : ""
}
                    ${
    todasDisponibles
        ? `
            <div style="
                margin-top:15px;
                display:flex;
                justify-content:flex-end;
            ">

                <button
                    onclick="iniciarProduccionMES(
                        ${idOrden}
                    )"
                    style="
                        border:none;
                        border-radius:8px;
                        background:#15803d;
                        color:#fff;
                        padding:11px 22px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Iniciar producción
                </button>

            </div>
        `
        : ""
}


                    <div style="
                        display:flex;
                        justify-content:flex-end;
                        margin-top:20px;
                    ">

                        <button
                            onclick="document.getElementById('ventana-verificacion-materias').remove()"
                            style="
                                border:none;
                                border-radius:8px;
                                background:#e50909;
                                color:#fff;
                                padding:11px 22px;
                                cursor:pointer;
                                font-weight:600;
                            "
                        >
                            Cerrar
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(ventana);


    } catch (error) {

        console.error(
            "Error verificando materias primas:",
            error
        );

        alert(
            "No se pudo verificar el inventario."
        );

    }

}
// ==========================================
// INICIAR PRODUCCIÓN EN MES
// ==========================================

async function iniciarProduccionMES(idOrden) {

    const confirmar = confirm(
        `¿Iniciar la producción de la Orden #${idOrden}?\n\n` +
        `Las materias primas serán descontadas del inventario.`
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta =
            await fetch(
                `/api/ordenes-produccion/${idOrden}/iniciar`,
                {
                    method: "PUT"
                }
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo iniciar la producción."
            );

        }

        alert(
            `Producción iniciada correctamente.\n\n` +
            `Orden #${resultado.orden.id}\n` +
            `Producto: ${resultado.orden.nombre}\n` +
            `Cantidad: ${resultado.orden.cantidad_medallones} medallones\n` +
            `Estado: ${resultado.orden.estado}`
        );

        // Cerrar ventana de verificación
        const ventana =
            document.getElementById(
                "ventana-verificacion-materias"
            );

        if (ventana) {
            ventana.remove();
        }

        // Actualizar órdenes del MES
        await cargarOrdenesProduccionMES();

    } catch (error) {

        console.error(
            "Error iniciando producción:",
            error
        );

        alert(
            "No se pudo iniciar la producción.\n\n" +
            error.message
        );

    }

}
// ==========================================
// COMPROBAR SESIÓN DEL ADMINISTRADOR
// ==========================================

async function comprobarSesion() {

    try {

        const respuesta = await fetch("/api/sesion");

        const datos = await respuesta.json();

        const enlacesAdmin =
            document.querySelectorAll(".enlace-login");

        enlacesAdmin.forEach(enlace => {

            if (datos.sesion) {

                enlace.textContent = "Panel administrativo";
                enlace.href = "admin.html";

            } else {

                enlace.textContent = "Iniciar sesión";
                enlace.href = "admin-login.html";

            }

        });

    } catch (error) {

        console.error(
            "No se pudo comprobar la sesión:",
            error
        );

    }

}
// ==========================================
// CARGAR REFRIGERACIÓN
// ==========================================

async function cargarRefrigeracion() {

    const contenedor =
        document.getElementById("control-refrigeracion-proceso");

    if (!contenedor) return;

    try {

        const respuesta =
            await fetch("/api/refrigeracion");

        const refrigeracion =
            await respuesta.json();

        if (!respuesta.ok) {

            contenedor.innerHTML = `
                <div class="refrigeracion-proceso">
                    <p>
                        ${refrigeracion.mensaje ||
                        "No se pudo cargar la refrigeración."}
                    </p>
                </div>
            `;

            return;
        }

        // Refrigeración inactiva
        if (!refrigeracion.activo) {

            contenedor.innerHTML = `
                <div class="refrigeracion-proceso inactiva">

                    <h4>Control de refrigeración</h4>

                    <p>
                        La refrigeración está inactiva.
                    </p>

                    <p>
                        Se activará cuando el proceso llegue a
                        <strong>Enfriamiento</strong>.
                    </p>

                </div>
            `;

            return;
        }

        // Refrigeración activa
        const temperatura =
            refrigeracion.temperatura;

        const limite =
            refrigeracion.limiteMaximo;

        let claseEstado =
            "refrigeracion-normal";

        let mensaje =
            "Temperatura dentro del límite.";

        if (temperatura > limite) {

            claseEstado =
                "refrigeracion-alerta";

            mensaje =
                "Temperatura fuera del límite. Revisar el sistema de refrigeración.";
        }

        contenedor.innerHTML = `
            <div class="refrigeracion-proceso activa">

                <h4>Control de refrigeración</h4>

                <p class="temperatura-proceso">
                    ${temperatura.toFixed(1)} °C
                </p>

                <p>
                    Límite máximo:
                    <strong>
                        ${limite.toFixed(1)} °C
                    </strong>
                </p>

                <span class="${claseEstado}">
                    ${refrigeracion.estado}
                </span>

                <p>
                    ${mensaje}
                </p>

                <div class="controles-temperatura">

                    <button
                        onclick="cambiarTemperatura(-1)">
                        −1 °C
                    </button>

                    <button
                        onclick="cambiarTemperatura(1)">
                        +1 °C
                    </button>

                </div>

            </div>
        `;

    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `
            <div class="refrigeracion-proceso">
                <p>
                    No se pudo conectar con el sistema
                    de refrigeración.
                </p>
            </div>
        `;
    }
}
// ==========================================
// CAMBIAR TEMPERATURA - SIMULACIÓN
// ==========================================

async function cambiarTemperatura(cambio) {

    try {

        const respuesta =
            await fetch("/api/refrigeracion");

        const refrigeracion =
            await respuesta.json();

        const nuevaTemperatura =
            refrigeracion.temperatura + cambio;

        const actualizar =
            await fetch("/api/refrigeracion/temperatura", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    temperatura: nuevaTemperatura
                })
            });

        const resultado =
            await actualizar.json();

        if (!actualizar.ok) {
    alert(resultado.mensaje || "No se pudo cambiar la temperatura.");
    return;
}

if (resultado.estado === "Alerta") {
    alert(
        `⚠️ ALERTA DE REFRIGERACIÓN\n\n` +
        `Temperatura actual: ${Number(resultado.temperatura).toFixed(1)} °C\n` +
        `Límite máximo: ${Number(resultado.limiteMaximo).toFixed(1)} °C`
    );
}

cargarRefrigeracion();

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor.");

    }
}
// ==========================================
// ACTIVAR REFRIGERACIÓN
// ==========================================

async function activarRefrigeracion() {

    try {

        const respuesta = await fetch("/api/refrigeracion/activar", {
            method: "PUT"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(
                resultado.mensaje ||
                "No se pudo activar la refrigeración."
            );
            return;
        }

        cargarRefrigeracion();

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el sistema de refrigeración."
        );
    }
}
comprobarSesion();
cargarInventario();
cargarRefrigeracion();
// ==========================================
// REPONER INVENTARIO
// ==========================================

async function reponerInventario(id) {

    const campo =
        document.getElementById("reponer-" + id);

    const cantidadKg =
        Number(campo.value);

    if (!Number.isFinite(cantidadKg) || cantidadKg <= 0) {

        alert("Ingresa una cantidad válida.");

        return;

    }

    const cantidadGramos =
        cantidadKg * 1000;


    try {

        const respuesta = await fetch(
            `/api/inventario/${id}/reponer`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    cantidad: cantidadGramos
                })
            }
        );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "No se pudo reponer el inventario."
            );

            return;

        }


        alert(
            `${resultado.materia.nombre} repuesta correctamente.`
        );


        // Actualizar el inventario
        cargarInventario();


    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );

    }

}
// ------------------------------------------
// CONSULTAR ESTADO DEL PEDIDO
// ------------------------------------------

async function consultarPedido() {

    const campoGuia = document.getElementById("numero-guia");
    const resultado = document.getElementById("resultado-seguimiento");

    const guia = campoGuia.value.trim();

    if (!guia) {
        resultado.innerHTML = `
            <p>Ingresa un número de guía.</p>
        `;
        return;
    }

    resultado.innerHTML = `
        <p>Consultando pedido...</p>
    `;

    try {

        const respuesta = await fetch(
            `/api/seguimiento/${encodeURIComponent(guia)}`
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            resultado.innerHTML = `
                <p>${datos.error}</p>
            `;

            return;
        }

        const procesos = [
            "Preparación",
            "Molido",
            "Mezclado",
            "Formado",
            "Enfriamiento",
            "Empaque",
            "Etiquetado"
        ];

        let progresoHTML = "";

        procesos.forEach((nombre, indice) => {

            let clase = "";
            let texto = "Pendiente";

            if (datos.estado === "Entregado") {

                clase = "proceso-completado";
                texto = "Completado";

            } else if (datos.estado === "Listo") {

                clase = "proceso-completado";
                texto = "Completado";

            } else if (indice < datos.proceso) {

                clase = "proceso-completado";
                texto = "Completado";

            } else if (indice === datos.proceso) {

                clase = "proceso-actual";
                texto = "En proceso";

            }

            progresoHTML += `
                <div class="item-proceso ${clase}">
                    <span>${nombre}</span>
                    <strong>${texto}</strong>
                </div>
            `;

        });

        resultado.innerHTML = `
            <div class="resultado-pedido">

                <h3>Pedido encontrado</h3>

                <p>
                    <strong>Número de pedido:</strong>
                    #${datos.id}
                </p>

                <p>
                    <strong>Número de guía:</strong>
                    ${datos.guia}
                </p>

                <p>
                    <strong>Estado:</strong>
                    ${datos.estado}
                </p>

                <h4>Progreso de producción</h4>

                <div class="progreso-produccion">
                    ${progresoHTML}
                </div>

            </div>
        `;

    } catch (error) {

        console.error(
            "Error consultando pedido:",
            error
        );

        resultado.innerHTML = `
            <p>
                No se pudo consultar el pedido.
            </p>
        `;
    }
}
// ------------------------------------------
// FORMULACIONES DE PRODUCCIÓN
// ------------------------------------------

const formulaciones = {

    res: {
        "Carne de res": 90,
        "Grasa de res": 7,
        "Sal": 1.5,
        "Pimienta negra": 0.3,
        "Ajo en polvo": 0.3,
        "Cebolla en polvo": 0.4,
        "Agua/hielo": 0.5
    },

    cerdo: {
        "Carne de cerdo": 91,
        "Grasa de cerdo": 6,
        "Sal": 1.5,
        "Pimienta negra": 0.3,
        "Ajo en polvo": 0.4,
        "Cebolla en polvo": 0.3,
        "Agua/hielo": 0.5
    },

    mixto: {
        "Carne de res": 55,
        "Carne de cerdo": 37,
        "Grasa para mixto": 6,
        "Sal": 1.5,
        "Pimienta negra": 0.2,
        "Ajo en polvo": 0.2,
        "Cebolla en polvo": 0.1
    }

};

// ------------------------------------------
// DISPONIBILIDAD DE MATERIAS PRIMAS EN MES
// ------------------------------------------

async function cargarDisponibilidadMES() {

    const lista =
        document.getElementById(
            "lista-disponibilidad-materias"
        );

    if (!lista) {
        return;
    }

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los pedidos."
            );
        }

        const pedidos =
            await respuesta.json();

        // Solo pedidos que ya fueron autorizados
        // por ERP para pasar al MES.
        const pedidosMES =
            pedidos.filter(pedido =>
                pedido.estado === "Autorizado para MES" ||
                pedido.estado === "En preparación"
            );

        const materiasNecesarias = {};

        pedidosMES.forEach(pedido => {

            pedido.productos.forEach(producto => {

                const medallones =
                    Number(producto.pack) *
                    Number(producto.cantidad);

                const gramosTotales =
                    medallones * 100;

                const formulacion =
                    formulaciones[producto.producto];

                if (!formulacion) {
                    return;
                }

                Object.entries(formulacion).forEach(
                    ([materia, porcentaje]) => {

                        const gramos =
                            gramosTotales *
                            Number(porcentaje) /
                            100;

                        if (!materiasNecesarias[materia]) {
                            materiasNecesarias[materia] = 0;
                        }

                        materiasNecesarias[materia] +=
                            gramos;

                    }
                );

            });

        });

        if (
            Object.keys(materiasNecesarias).length === 0
        ) {

            lista.innerHTML = `
                <p>
                    No hay pedidos autorizados para MES.
                </p>
            `;

            return;
        }

        // Consultar inventario actual
        const respuestaInventario =
            await fetch("/api/inventario");

        if (!respuestaInventario.ok) {
            throw new Error(
                "No se pudo consultar el inventario."
            );
        }

        const inventario =
            await respuestaInventario.json();

        let disponibilidadHTML = "";

        Object.entries(materiasNecesarias).forEach(
            ([materia, necesaria]) => {

                const elementoInventario =
                    inventario.find(
                        item =>
                            item.nombre === materia
                    );

                const disponible =
                    elementoInventario
                        ? Number(
                            elementoInventario.cantidad
                        )
                        : 0;

                const suficiente =
                    disponible >= necesaria;

                const faltante =
                    necesaria - disponible;

                const estadoTexto =
                    suficiente
                        ? "Disponible"
                        : `Insuficiente — faltan ${faltante.toFixed(1)} g`;

                const estadoClase =
                    suficiente
                        ? "materia-disponible"
                        : "materia-insuficiente";

                disponibilidadHTML += `
                    <div class="disponibilidad-materia">

                        <strong>
                            ${materia}
                        </strong>

                        <span>
                            Necesaria:
                            ${necesaria.toFixed(1)} g
                        </span>

                        <span>
                            Disponible:
                            ${disponible.toFixed(1)} g
                        </span>

                        <strong class="${estadoClase}">
                            ${estadoTexto}
                        </strong>

                    </div>
                `;

            }
        );

        lista.innerHTML =
            disponibilidadHTML;

    } catch (error) {

        console.error(
            "Error cargando disponibilidad MES:",
            error
        );

        lista.innerHTML = `
            <p>
                No se pudo consultar la disponibilidad
                de materias primas.
            </p>
        `;

    }

}
// ------------------------------------------
// TRAZABILIDAD DE PRODUCCIÓN
// ------------------------------------------

async function cargarTrazabilidad() {

    const lista =
        document.getElementById(
            "lista-trazabilidad"
        );

    if (!lista) {
        return;
    }

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los pedidos."
            );
        }

        const pedidos =
            await respuesta.json();

        if (pedidosTrazabilidad.length === 0) {

            lista.innerHTML = `
                <p>
                    No hay pedidos registrados.
                </p>
            `;

            return;
        }

        let trazabilidadHTML = "";

        pedidosTrazabilidad.forEach(pedido => {

            const etapas = [
                "Preparación",
                "Molido",
                "Mezclado",
                "Formado",
                "Enfriamiento",
                "Empaque",
                "Etiquetado"
            ];

            let etapaActual = Number(
                pedido.proceso || 0
            );

            let etapasHTML = "";

            etapas.forEach((etapa, indice) => {

                let estadoEtapa = "Pendiente";

                if (
                    pedido.estado === "Listo" ||
                    pedido.estado === "Entregado"
                ) {

                    estadoEtapa = "Completado";

                } else if (
                    indice < etapaActual
                ) {

                    estadoEtapa = "Completado";

                } else if (
                    indice === etapaActual &&
                    pedido.estado === "En preparación"
                ) {

                    estadoEtapa = "En proceso";

                }

                etapasHTML += `
                    <div class="trazabilidad-etapa">

                        <span>
                            ${indice + 1}.
                            ${etapa}
                        </span>

                        <strong>
                            ${estadoEtapa}
                        </strong>

                    </div>
                `;

            });

            trazabilidadHTML += `

                <div class="trazabilidad-pedido">

                    <div class="cabecera-trazabilidad">

                        <h3>
                            Pedido #${pedido.id}
                        </h3>

                        <span>
                            ${pedido.estado}
                        </span>

                    </div>

                    <p>
                        <strong>Guía:</strong>
                        ${pedido.guia || "Sin guía"}
                    </p>

                    <p>
                        <strong>Fecha:</strong>
                        ${pedido.fecha}
                    </p>

                    <h4>
                        Recorrido de producción
                    </h4>

                    <div class="lista-trazabilidad-etapas">

                        ${etapasHTML}

                    </div>

                </div>

            `;

        });

        lista.innerHTML =
            trazabilidadHTML;

    } catch (error) {

        console.error(
            "Error cargando trazabilidad:",
            error
        );

        lista.innerHTML = `
            <p>
                No se pudo cargar la trazabilidad.
            </p>
        `;

    }

}

// ------------------------------------------
// GESTIÓN DE CLIENTES
// ------------------------------------------

async function cargarClientes() {

    const lista =
        document.getElementById("lista-clientes");

    if (!lista) {
        return;
    }

    try {

        const respuesta =
            await fetch("/api/clientes");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los clientes."
            );
        }

        const clientes =
            await respuesta.json();

        if (clientes.length === 0) {

            lista.innerHTML = `
                <p>
                    No hay clientes registrados.
                </p>
            `;

            return;
        }

        let clientesHTML = "";

        clientes.forEach(cliente => {

            clientesHTML += `
                <div class="cliente-admin">

                    <h3>
                        ${cliente.nombre}
                    </h3>

                    <p>
                        <strong>Teléfono:</strong>
                        ${cliente.telefono}
                    </p>

                    <p>
                        <strong>Dirección:</strong>
                        ${cliente.direccion}
                    </p>

                    <p>
                        <strong>Pedidos realizados:</strong>
                        ${cliente.pedidos}
                    </p>

                    <p>
                        <strong>Último pedido:</strong>
                        ${cliente.ultimoPedido}
                    </p>
                    <button
    class="btn-historial-cliente"
    onclick="verHistorialCliente('${cliente.telefono}')"
>
    Ver pedidos
</button>

                </div>
            `;

        });

        lista.innerHTML = clientesHTML;

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        lista.innerHTML = `
            <p>
                No se pudieron cargar los clientes.
            </p>
        `;

    }

}
// ------------------------------------------
// HISTORIAL DE PEDIDOS DEL CLIENTE
// ------------------------------------------

async function verHistorialCliente(telefono) {

    const modal =
        document.getElementById(
            "modal-historial-cliente"
        );

    const contenido =
        document.getElementById(
            "contenido-historial-cliente"
        );

    modal.style.display = "flex";

    contenido.innerHTML = `
        <p>Cargando pedidos...</p>
    `;

    try {

        const respuesta =
            await fetch(
                `/api/clientes/${encodeURIComponent(telefono)}/pedidos`
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los pedidos."
            );

        }

        const pedidos =
            await respuesta.json();

        if (pedidos.length === 0) {

            contenido.innerHTML = `
                <p>
                    Este cliente no tiene pedidos registrados.
                </p>
            `;

            return;
        }

        let historialHTML = "";

        pedidos.forEach(pedido => {

            let productosHTML = "";

            pedido.productos.forEach(producto => {

                productosHTML += `
                    <div class="producto-historial">

                        <strong>
                            ${producto.nombre}
                        </strong>

                        <span>
                            Pack x${producto.pack}
                        </span>

                        <span>
                            Cantidad:
                            ${producto.cantidad}
                        </span>

                    </div>
                `;

            });

            historialHTML += `
                <div class="pedido-historial">

                    <div class="encabezado-pedido-historial">

                        <h3>
                            Pedido #${pedido.id}
                        </h3>

                        <span class="estado-historial estado-${pedido.estado
    .toLowerCase()
    .replace(/\s+/g, "-")}">
    ${pedido.estado}
</span>

                    </div>

                    <p>
                        <strong>Guía:</strong>
                        ${pedido.guia || "Sin guía"}
                    </p>

                    <p>
                        <strong>Fecha:</strong>
                        ${pedido.fecha}
                    </p>

                    <div class="productos-historial">

                        <strong>Productos</strong>

                        ${productosHTML}

                    </div>

                    <div class="total-historial">

                        Total:
                        $${Number(pedido.total)
                            .toLocaleString("es-CO")}

                    </div>

                </div>
            `;

        });

        contenido.innerHTML =
            historialHTML;

    } catch (error) {

        console.error(
            "Error cargando historial:",
            error
        );

        contenido.innerHTML = `
            <p>
                No se pudo cargar el historial
                del cliente.
            </p>
        `;

    }

}
function cerrarHistorialCliente() {

    const modal =
        document.getElementById(
            "modal-historial-cliente"
        );

    modal.style.display = "none";

}
// ==========================================
// TRAZABILIDAD DE PRODUCCIÓN
// ==========================================

async function cargarTrazabilidad() {

    const lista =
        document.getElementById("lista-trazabilidad");

    if (!lista) {
        return;
    }

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los pedidos."
            );
        }

        const pedidos =
            await respuesta.json();

        // Mostrar solamente pedidos que están
        // actualmente en el flujo MES → PROCESO
        const pedidosTrazabilidad =
            pedidos.filter(pedido =>
                pedido.estado === "Autorizado para MES" ||
                pedido.estado === "En preparación"
            );

        if (pedidosTrazabilidad.length === 0) {

            lista.innerHTML = `
                <p>
                    No hay pedidos activos en producción.
                </p>
            `;

            return;
        }

        let trazabilidadHTML = "";

        pedidosTrazabilidad.forEach(pedido => {

            const etapas = [
                "Preparación",
                "Molido",
                "Mezclado",
                "Formado",
                "Enfriamiento",
                "Empaque",
                "Etiquetado"
            ];

            const procesoActual =
                Number(pedido.proceso || 0);

            let etapasHTML = "";

            etapas.forEach((etapa, indice) => {

                let texto = "Pendiente";
                let clase = "trazabilidad-pendiente";

                if (pedido.estado === "En preparación") {

                    if (indice < procesoActual) {

                        texto = "Completado";
                        clase = "trazabilidad-completado";

                    } else if (indice === procesoActual) {

                        texto = "En proceso";
                        clase = "trazabilidad-actual";

                    }

                }

                if (pedido.estado === "Autorizado para MES") {

                    if (indice === 0) {

                        texto = "Pendiente de iniciar";
                        clase = "trazabilidad-actual";

                    }

                }

                etapasHTML += `
                    <div class="trazabilidad-etapa">

                        <span>
                            ${indice + 1}. ${etapa}
                        </span>

                        <strong class="${clase}">
                            ${texto}
                        </strong>

                    </div>
                `;

            });

            trazabilidadHTML += `

                <div class="trazabilidad-pedido">

                    <div class="cabecera-trazabilidad">

                        <h3>
                            Pedido #${pedido.id}
                        </h3>

                        <span>
                            ${pedido.estado}
                        </span>

                    </div>

                    <p>
                        <strong>Guía:</strong>
                        ${pedido.guia || "Sin guía"}
                    </p>

                    <p>
                        <strong>Fecha:</strong>
                        ${pedido.fecha}
                    </p>

                    <h4>
                        Recorrido de producción
                    </h4>

                    <div class="lista-trazabilidad-etapas">

                        ${etapasHTML}

                    </div>

                </div>

            `;

        });

        lista.innerHTML =
            trazabilidadHTML;

    } catch (error) {

        console.error(
            "Error cargando trazabilidad:",
            error
        );

        lista.innerHTML = `
            <p>
                No se pudo cargar la trazabilidad.
            </p>
        `;

    }

}
// ==========================================
// CONTROL DE INVENTARIO EN MES
// ==========================================

async function cargarControlInventarioMES() {

    const lista =
        document.getElementById(
            "lista-control-inventario"
        );

    if (!lista) {
        return;
    }

    try {

        const respuestaPedidos =
            await fetch("/api/pedidos");

        if (!respuestaPedidos.ok) {
            throw new Error(
                "No se pudieron cargar los pedidos."
            );
        }

        const pedidos =
            await respuestaPedidos.json();

        // Pedidos que MES está gestionando
        const pedidosMES =
            pedidos.filter(pedido =>
                pedido.estado === "Autorizado para MES" ||
                pedido.estado === "En preparación"
            );

        if (pedidosMES.length === 0) {

            lista.innerHTML = `
                <p>
                    No hay pedidos activos para controlar inventario.
                </p>
            `;

            return;
        }

        // Calcular materias primas necesarias
        const materiasNecesarias = {};

        pedidosMES.forEach(pedido => {

            pedido.productos.forEach(producto => {

                const medallones =
                    Number(producto.pack) *
                    Number(producto.cantidad);

                const gramosTotales =
                    medallones * 100;

                const formulacion =
                    formulaciones[producto.producto];

                if (!formulacion) {
                    return;
                }

                Object.entries(formulacion).forEach(
                    ([materia, porcentaje]) => {

                        const gramos =
                            gramosTotales *
                            Number(porcentaje) /
                            100;

                        if (!materiasNecesarias[materia]) {
                            materiasNecesarias[materia] = 0;
                        }

                        materiasNecesarias[materia] +=
                            gramos;

                    }
                );

            });

        });

        // Consultar inventario actual
        const respuestaInventario =
            await fetch("/api/inventario");

        if (!respuestaInventario.ok) {
            throw new Error(
                "No se pudo consultar el inventario."
            );
        }

        const inventario =
            await respuestaInventario.json();

        let html = "";

        Object.entries(materiasNecesarias).forEach(
            ([materia, necesaria]) => {

                const elemento =
                    inventario.find(
                        item =>
                            item.nombre === materia
                    );

                const disponible =
                    elemento
                        ? Number(elemento.cantidad)
                        : 0;

                const despues =
                    disponible - necesaria;

                const suficiente =
                    disponible >= necesaria;

                const estado =
                    suficiente
                        ? "Disponible"
                        : "Insuficiente";

                const clase =
                    suficiente
                        ? "inventario-disponible"
                        : "inventario-insuficiente";

                html += `

                    <div class="control-inventario-item">

                        <div>
                            <strong>
                                ${materia}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Disponible:
                            </span>

                            <strong>
                                 ${(disponible / 1000).toFixed(3)} kg
                            </strong>
                        </div>

                        <div>
                            <span>
                                Necesaria:
                            </span>

                            <strong>
                                ${(necesaria / 1000).toFixed(3)} kg
                            </strong>
                        </div>

                        <div>
                            <span>
                                Después de producir:
                            </span>

                            <strong>
                                ${(
    Math.max(despues, 0) / 1000
).toFixed(3)} kg
                            </strong>
                        </div>

                        <span class="${clase}">
                            ${estado}
                        </span>

                    </div>

                `;

            }
        );

        lista.innerHTML = html;

    } catch (error) {

        console.error(
            "Error cargando control de inventario MES:",
            error
        );

        lista.innerHTML = `
            <p>
                No se pudo cargar el control de inventario.
            </p>
        `;

    }

}
// ==========================================
// CARGAR PEDIDOS PARA PROCESO
// ==========================================

async function cargarPedidosProceso() {

    const contenedor =
        document.getElementById("lista-pedidos-proceso");

    if (!contenedor) return;

    contenedor.innerHTML =
        "<p>Cargando pedidos en producción...</p>";

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los pedidos.");
        }

        const pedidos =
            await respuesta.json();

        const pedidosEnProduccion =
            pedidos.filter(pedido =>
                pedido.estado === "En preparación"
            );

        if (pedidosEnProduccion.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-pedidos">
                    No hay pedidos en producción actualmente.
                </p>
            `;

            return;
        }

        contenedor.innerHTML = "";

        pedidosEnProduccion.forEach(pedido => {

            const tarjeta =
                document.createElement("div");

            tarjeta.className =
                "pedido-proceso";

            tarjeta.innerHTML = `

                <div>
                    <h3>
                        Pedido #${pedido.id}
                    </h3>

                    <p>
                        <strong>Cliente:</strong>
                        ${pedido.cliente.nombre}
                    </p>

                    <p>
                        <strong>Estado:</strong>
                        En preparación
                    </p>

                    <p>
                        <strong>Proceso:</strong>
                        ${Number(pedido.proceso || 0) + 1} de 7
                    </p>
                </div>

                <button
                    onclick="abrirProcesoProduccion(
                        ${pedido.id},
                        ${pedido.proceso || 0}
                    )"
                >
                    Abrir proceso
                </button>

            `;

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error(
            "Error cargando pedidos para proceso:",
            error
        );

        contenedor.innerHTML = `
            <p class="error-admin">
                No se pudieron cargar los pedidos
                en producción.
            </p>
        `;
    }
}
// ==========================================
// CAMBIO ENTRE MÓDULOS ERP, MES Y PROCESO
// ==========================================

function mostrarModulo(modulo) {

    const secciones =
        document.querySelectorAll("[data-modulo]");

    secciones.forEach(seccion => {

        if (seccion.dataset.modulo === modulo) {
            seccion.style.display = "";
        } else {
            seccion.style.display = "none";
        }

    });

    const botones =
        document.querySelectorAll(".boton-modulo");

    botones.forEach(boton => {

        boton.classList.remove("activo");

    });

    const botonActivo =
        document.querySelector(
            `.boton-modulo[onclick="mostrarModulo('${modulo}')"]`
        );

    if (botonActivo) {
        botonActivo.classList.add("activo");
    }
    if (modulo === "mes") {

    cargarDisponibilidadMES();

    cargarTrazabilidad();

    cargarOrdenesProduccionMES();

    cargarProduccionTerminadaMES();

}
if (modulo === "erp") {

    cargarStockProductos();

    cargarPedidosERP();

    cargarPedidosAdmin();

    cargarResumenComercial();

    cargarIndicadoresDespacho();
    
    cargarSolicitudesCompra();

}
if (modulo === "proceso") {

    cargarPedidosProceso();
    cargarLotesProceso();

}

}
// Mostrar ERP al abrir el panel

document.addEventListener("DOMContentLoaded", () => {

    mostrarModulo("erp");

});
// ==========================================
// AUTORIZAR PEDIDO PARA MES
// ==========================================

async function autorizarPedidoMES(id) {

    const confirmar = confirm(
        `¿Autorizar el pedido #${id} para pasar al MES?`
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `/api/pedidos/${id}/estado`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    estado: "Autorizado para MES"
                })
            }
        );

        const resultado = await respuesta.json();

if (!respuesta.ok) {

            alert(
                resultado.mensaje ||
                "No se pudo autorizar el pedido."
            );

            return;
        }

        alert(
            `Pedido #${id} autorizado para pasar al MES.`
        );

        cargarPlanificacion();


    } catch (error) {

        console.error(
            "Error autorizando pedido para MES:",
            error
        );

        alert(
            "No se pudo autorizar el pedido para MES."
        );
    }
}

function descargarReportePDF() {

    if (!window.reporteCompletoHTML) {

        alert("Primero debes generar el reporte completo.");

        return;
    }

    const ventanaPDF = window.open(
        "",
        "_blank",
        "width=1000,height=800"
    );

    if (!ventanaPDF) {

        alert(
            "El navegador bloqueó la ventana. Permite ventanas emergentes."
        );

        return;
    }

    ventanaPDF.document.open();

    ventanaPDF.document.write(`

        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <title>BurguerTech - Reporte completo</title>

            <style>

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: white;
                    color: #202124;
                    font-family: Arial, Helvetica, sans-serif;
                }

                body {
                    padding: 30px;
                }

                #reporte-completo-generado {

                    display: block !important;

                    position: relative !important;

                    width: 100% !important;

                    max-width: 900px !important;

                    margin: 0 auto !important;

                    padding: 0 !important;

                    background: white !important;

                    color: #202124 !important;

                    border: 1px solid #e5e7eb;

                    border-radius: 14px;

                    overflow: visible !important;

                    box-shadow: none !important;

                }


                /* ENCABEZADO */

                .cabecera-reporte {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    padding: 24px 28px;

                    background: #202124;

                    color: white;

                    border-radius: 14px 14px 0 0;

                }


                .cabecera-reporte h2 {

                    margin: 0;

                    color: white;

                    font-size: 22px;

                }


                .cabecera-reporte p {

                    margin: 5px 0 0;

                    color: #d1d5db;

                    font-size: 12px;

                }


                .acciones-reporte {

                    display: flex;

                    align-items: center;

                    gap: 10px;

                }


                .acciones-reporte span {

                    padding: 7px 13px;

                    background: #e50909;

                    color: white;

                    border-radius: 20px;

                    font-size: 11px;

                    font-weight: bold;

                }


                .cerrar-reporte {

                    display: none !important;

                }


                /* FECHA */

                .fecha-reporte {

                    padding: 14px 28px;

                    font-size: 12px;

                    color: #6b7280;

                    border-bottom: 1px solid #e5e7eb;

                }


                /* RESUMEN */

                .resumen-reporte {

                    display: grid;

                    grid-template-columns:
                        repeat(4, 1fr);

                    gap: 12px;

                    padding: 22px 28px;

                }


                .resumen-reporte > div {

                    padding: 16px;

                    background: #f8fafc;

                    border: 1px solid #e5e7eb;

                    border-radius: 12px;

                }


                .resumen-reporte span {

                    display: block;

                    margin-bottom: 8px;

                    font-size: 12px;

                    color: #6b7280;

                }


                .resumen-reporte strong {

                    font-size: 20px;

                    color: #202124;

                }


                /* SECCIONES */

                .detalle-reporte {

                    padding: 0 28px 22px;

                }


                .detalle-reporte h3 {

                    margin: 0 0 10px;

                    font-size: 16px;

                    color: #202124;

                }


                /* TABLAS */

                .tabla-reporte {

                    width: 100%;

                    border: 1px solid #e5e7eb;

                    border-radius: 12px;

                    overflow: hidden;

                }


                .fila-reporte {

                    display: grid;

                    grid-template-columns:
                        repeat(2, 1fr);

                    min-height: 40px;

                    border-bottom: 1px solid #e5e7eb;

                }


                .fila-reporte:last-child {

                    border-bottom: none;

                }


                .fila-reporte > span,

                .fila-reporte > strong {

                    padding: 11px 15px;

                    font-size: 12px;

                }


                .fila-reporte.encabezado {

                    background: #f8fafc;

                }


                /* TABLA DE PRODUCTOS */

                .detalle-reporte:nth-of-type(4)
                .fila-reporte {

                    grid-template-columns:
                        2fr 1fr 1fr;

                }


                /* PIE */

                .pie-reporte {

                    display: flex;

                    justify-content: space-between;

                    gap: 20px;

                    padding: 18px 28px;

                    background: #f8fafc;

                    border-top: 1px solid #e5e7eb;

                    border-radius: 0 0 14px 14px;

                    font-size: 11px;

                }


                .pie-reporte span {

                    font-weight: bold;

                }


                .pie-reporte strong {

                    color: #6b7280;

                    font-weight: normal;

                }


                @media print {

                    @page {

                        size: A4;

                        margin: 12mm;

                    }

                    html,
                    body {

                        padding: 0 !important;

                        margin: 0 !important;

                        background: white !important;

                    }

                    #reporte-completo-generado {

                        width: 100% !important;

                        max-width: none !important;

                        border: none !important;

                        border-radius: 0 !important;

                    }

                    .cabecera-reporte {

                        border-radius: 0 !important;

                    }

                    .pie-reporte {

                        border-radius: 0 !important;

                    }

                }

            </style>

        </head>


        <body>

            ${window.reporteCompletoHTML}

        </body>


        </html>

    `);

    ventanaPDF.document.close();


    setTimeout(() => {

        ventanaPDF.focus();

        ventanaPDF.print();

    }, 100);

}
// ==========================================
// MOSTRAR VENTAS COMERCIALES
// ==========================================

async function mostrarVentasComerciales() {

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron consultar las ventas."
            );
        }

        const pedidos =
            await respuesta.json();

        const ventas =
            pedidos.filter(
                pedido =>
                    pedido.estado === "Entregado"
            );

        let contenido = "";

        if (ventas.length === 0) {

            contenido = `
                <p class="sin-ventas">
                    No hay ventas registradas.
                </p>
            `;

        } else {

            ventas.forEach(venta => {

                const productos =
                    venta.productos
                        .map(producto => {

                            const cantidad =
                                Number(producto.pack) *
                                Number(producto.cantidad);

                            return `
                                <div class="producto-venta">
                                    <strong>
                                        ${producto.nombre}
                                    </strong>

                                    <span>
                                        ${cantidad}
                                        medallones
                                    </span>
                                </div>
                            `;

                        })
                        .join("");

                contenido += `
                    <div class="venta-comercial">

                        <div class="cabecera-venta">

                            <div>
                                <strong>
                                    Pedido #${venta.id}
                                </strong>

                                <span>
                                    ${venta.cliente.nombre}
                                </span>
                            </div>

                            <strong class="total-venta">
                                $${Number(venta.total)
                                    .toLocaleString("es-CO")}
                            </strong>

                        </div>

                        <div class="productos-venta">
                            ${productos}
                        </div>

                    </div>
                `;
            });
        }

        const modal =
            document.createElement("div");

        modal.className =
            "modal-ventas-comerciales";

        modal.innerHTML = `

            <div class="ventana-ventas">

                <div class="cabecera-modal-ventas">

                    <div>
                        <h2>Ventas registradas</h2>

                        <p>
                            Historial de pedidos entregados
                        </p>
                    </div>

                    <button
                        class="cerrar-modal-ventas"
                        onclick="this.closest('.modal-ventas-comerciales').remove()"
                    >
                        ×
                    </button>

                </div>

                <div class="lista-ventas-comerciales">
                    ${contenido}
                </div>

            </div>

        `;

        document.body.appendChild(modal);

    } catch (error) {

        console.error(
            "Error mostrando ventas:",
            error
        );

        alert(
            "No se pudieron cargar las ventas."
        );
    }
}
// ==========================================
// MOSTRAR MOVIMIENTOS CONTABLES
// ==========================================

async function mostrarMovimientosContables() {

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron consultar los movimientos."
            );
        }

        const pedidos =
            await respuesta.json();

        const movimientos =
            pedidos.filter(
                pedido =>
                    pedido.estado === "Entregado"
            );

        let contenido = "";

        if (movimientos.length === 0) {

            contenido = `
                <p class="sin-movimientos">
                    No hay movimientos contables registrados.
                </p>
            `;

        } else {

            movimientos.forEach(movimiento => {

                const fecha =
    movimiento.fecha ||
    "Sin fecha";

                contenido += `
                    <div class="movimiento-contable">

                        <div class="cabecera-movimiento">

                            <div>
                                <strong>
                                    Pedido #${movimiento.id}
                                </strong>

                                <span>
                                    ${movimiento.cliente.nombre}
                                </span>
                            </div>

                            <strong class="valor-movimiento">
                                $${Number(
                                    movimiento.total
                                ).toLocaleString("es-CO")}
                            </strong>

                        </div>

                        <div class="detalle-movimiento">

                            <div>
                                <span>Concepto</span>
                                <strong>
                                    Venta de productos
                                </strong>
                            </div>

                            <div>
                                <span>Fecha</span>
                                <strong>
                                    ${fecha}
                                </strong>
                            </div>

                            <div>
                                <span>Estado</span>
                                <strong class="estado-contabilizado">
                                    Contabilizado
                                </strong>
                            </div>

                        </div>

                    </div>
                `;
            });
        }

        const modal =
            document.createElement("div");

        modal.className =
            "modal-movimientos-contables";

        modal.innerHTML = `

            <div class="ventana-movimientos">

                <div class="cabecera-modal-movimientos">

                    <div>
                        <h2>
                            Movimientos contables
                        </h2>

                        <p>
                            Registro de ingresos por
                            ventas entregadas
                        </p>
                    </div>

                    <button
                        class="cerrar-modal-movimientos"
                        onclick="
                            this.closest(
                                '.modal-movimientos-contables'
                            ).remove()
                        "
                    >
                        ×
                    </button>

                </div>

                <div class="lista-movimientos-contables">
                    ${contenido}
                </div>

            </div>

        `;

        document.body.appendChild(modal);

    } catch (error) {

        console.error(
            "Error mostrando movimientos:",
            error
        );

        alert(
            "No se pudieron cargar los movimientos contables."
        );
    }
}
// ==========================================
// INDICADORES DEL PASO "DESPACHAR PEDIDO"
// ==========================================

async function cargarIndicadoresDespacho() {

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron consultar los pedidos."
            );
        }

        const pedidos =
            await respuesta.json();

        // Pedidos listos para despacho
        const pedidosListos =
            pedidos.filter(
                pedido =>
                    pedido.estado ===
                    "Listo para despacho"
            );

        // Pedidos entregados
        const pedidosEntregados =
            pedidos.filter(
                pedido =>
                    pedido.estado ===
                    "Entregado"
            );

        // Total de medallones entregados
        let medallonesDespachados = 0;

        pedidosEntregados.forEach(pedido => {

            pedido.productos.forEach(producto => {

                medallonesDespachados +=
                    Number(producto.pack) *
                    Number(producto.cantidad);

            });

        });

        const indicadorListos =
            document.getElementById(
                "pedidos-listos"
            );

        const indicadorEntregados =
            document.getElementById(
                "pedidos-entregados"
            );

        const indicadorMedallones =
            document.getElementById(
                "medallones-despachados"
            );

        if (indicadorListos) {
            indicadorListos.textContent =
                pedidosListos.length;
        }

        if (indicadorEntregados) {
            indicadorEntregados.textContent =
                pedidosEntregados.length;
        }

        if (indicadorMedallones) {
            indicadorMedallones.textContent =
                medallonesDespachados;
        }

    } catch (error) {

        console.error(
            "Error cargando indicadores de despacho:",
            error
        );

    }

}
// ==========================================
// VENTANA DE DESPACHOS COMERCIALES
// ==========================================

async function mostrarDespachosComerciales() {

    try {

        const respuesta = await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los pedidos.");
        }

        const pedidos = await respuesta.json();

        // Mostrar únicamente pedidos listos para despacho o entregados
        const despachos = pedidos.filter(pedido =>
            pedido.estado === "Listo para despacho" ||
            pedido.estado === "Entregado"
        );

        // Crear ventana
        const modal = document.createElement("div");
        modal.className = "modal-despachos-comerciales";

        let contenido = "";

        if (despachos.length === 0) {

            contenido = `
                <div class="sin-despachos">
                    <p>No hay despachos registrados.</p>
                </div>
            `;

        } else {

            contenido = despachos.map(pedido => {

                let totalMedallones = 0;

                pedido.productos.forEach(producto => {
                    totalMedallones +=
                        Number(producto.pack) *
                        Number(producto.cantidad);
                });

                const productosHTML = pedido.productos.map(producto => `
                    <div class="producto-despacho">
                        <span>
                            ${producto.nombre}
                        </span>
                        <strong>
                            ${Number(producto.pack) * Number(producto.cantidad)}
                            medallones
                        </strong>
                    </div>
                `).join("");

                return `
                    <div class="tarjeta-despacho">

                        <div class="cabecera-despacho">

                            <div>
                                <strong>Pedido #${pedido.id}</strong>
                                <span>${pedido.cliente.nombre}</span>
                            </div>

                            <span class="estado-despacho 
                                ${pedido.estado === "Entregado"
                                    ? "entregado"
                                    : "listo"}">
                                ${pedido.estado}
                            </span>

                        </div>

                        <div class="productos-despacho">
                            ${productosHTML}
                        </div>

                        <div class="resumen-despacho">

                            <div>
                                <small>Medallones</small>
                                <strong>${totalMedallones}</strong>
                            </div>

                            <div>
                                <small>Total</small>
                                <strong>
                                    $${Number(pedido.total).toLocaleString("es-CO")}
                                </strong>
                            </div>

                            <div>
                                <small>Cliente</small>
                                <strong>
                                    ${pedido.cliente.nombre}
                                </strong>
                            </div>

                        </div>

                    </div>
                `;

            }).join("");

        }

        modal.innerHTML = `
            <div class="ventana-despachos">

                <div class="cabecera-modal-despachos">

                    <div>
                        <h2>Despachos comerciales</h2>
                        <p>Pedidos listos para despacho y pedidos entregados.</p>
                    </div>

                    <button
                        class="cerrar-modal-despachos"
                        onclick="this.closest('.modal-despachos-comerciales').remove()">
                        ×
                    </button>

                </div>

                <div class="lista-despachos">
                    ${contenido}
                </div>

            </div>
        `;

        document.body.appendChild(modal);

    } catch (error) {

        console.error(
            "Error cargando despachos:",
            error
        );

        alert("No se pudieron cargar los despachos.");

    }

}
// ==========================================
// REPORTE DE VENTAS
// ==========================================

async function generarReporteVentas() {

    try {

        const respuesta =
            await fetch("/api/resumen-comercial");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información de ventas."
            );
        }

        const datos =
            await respuesta.json();

        const totalMedallones =
            datos.ventasPorProducto.reduce(
                (total, producto) =>
                    total + Number(producto.cantidad),
                0
            );

        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-ventas-generado";

        reporte.innerHTML = `

            <div class="cabecera-reporte">

    <div>
        <h2>Reporte de ventas</h2>

        <p>
            BurguerTech · Gestión ERP
        </p>
    </div>

    <div class="acciones-reporte">

        <span>VENTAS</span>

        <button
            class="cerrar-reporte"
            onclick="document.getElementById('reporte-ventas-generado').remove()">
            ×
        </button>

    </div>

</div>

            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>

            <div class="resumen-reporte">

                <div>
                    <span>Ventas registradas</span>
                    <strong>
                        ${datos.ventasRegistradas}
                    </strong>
                </div>

                <div>
                    <span>Pedidos entregados</span>
                    <strong>
                        ${datos.pedidosEntregados}
                    </strong>
                </div>

                <div>
                    <span>Ingresos generados</span>
                    <strong>
                        $${Number(
                            datos.ingresosGenerados
                        ).toLocaleString("es-CO")}
                    </strong>
                </div>

                <div>
                    <span>Medallones vendidos</span>
                    <strong>
                        ${totalMedallones}
                    </strong>
                </div>

            </div>

            <div class="detalle-reporte">

                <h3>Ventas por producto</h3>

                <div class="tabla-reporte">

                    <div class="encabezado-tabla-reporte">

                        <strong>Producto</strong>

                        <strong>Medallones</strong>

                        <strong>Participación</strong>

                    </div>

                    ${datos.ventasPorProducto.map(
                        producto => {

                            const porcentaje =
                                totalMedallones > 0
                                    ? (
                                        Number(
                                            producto.cantidad
                                        ) /
                                        totalMedallones
                                    ) * 100
                                    : 0;

                            return `

                                <div class="fila-reporte">

                                    <span>
                                        ${producto.nombre}
                                    </span>

                                    <span>
                                        ${producto.cantidad}
                                    </span>

                                    <span>
                                        ${porcentaje.toFixed(1)}%
                                    </span>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>

            </div>

            <div class="pie-reporte">

                <span>
                    BurguerTech · Reporte de ventas
                </span>

                <strong>
                    Información basada en pedidos entregados.
                </strong>

            </div>

        `;

        const reporteAnterior =
            document.getElementById(
                "reporte-ventas-generado"
            );

        if (reporteAnterior) {
            reporteAnterior.remove();
        }

        reporte.id =
            "reporte-ventas-generado";

        document.body.appendChild(reporte);

        reporte.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        console.error(
            "Error generando reporte de ventas:",
            error
        );

        alert(
            "No se pudo generar el reporte de ventas."
        );

    }

}
// ==========================================
// REPORTE DE PEDIDOS
// ==========================================

async function generarReportePedidos() {

    try {

        const respuesta =
            await fetch("/api/pedidos");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información de pedidos."
            );
        }

        const pedidos =
            await respuesta.json();

        // Contar pedidos por estado
        const pendientes =
            pedidos.filter(
                pedido => pedido.estado === "Pendiente"
            ).length;

        const autorizados =
            pedidos.filter(
                pedido => pedido.estado === "Autorizado para MES"
            ).length;

        const preparacion =
            pedidos.filter(
                pedido => pedido.estado === "En preparación"
            ).length;

        const listos =
            pedidos.filter(
                pedido => pedido.estado === "Listo para despacho"
            ).length;

        const entregados =
            pedidos.filter(
                pedido => pedido.estado === "Entregado"
            ).length;

        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-pedidos-generado";

        reporte.id =
            "reporte-pedidos-generado";

        reporte.innerHTML = `

            <div class="cabecera-reporte">

                <div>

                    <h2>
                        Reporte de pedidos
                    </h2>

                    <p>
                        BurguerTech · Gestión ERP
                    </p>

                </div>

                <div class="acciones-reporte">

                    <span>
                        PEDIDOS
                    </span>

                    <button
    class="cerrar-reporte"
    onclick="
        document
        .getElementById(
            'reporte-completo-generado'
        )
        .style.display = 'none'
    ">
    ×
</button>

                </div>

            </div>


            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>


            <div class="resumen-reporte">

                <div>

                    <span>
                        Total de pedidos
                    </span>

                    <strong>
                        ${pedidos.length}
                    </strong>

                </div>

                <div>

                    <span>
                        Pendientes
                    </span>

                    <strong>
                        ${pendientes}
                    </strong>

                </div>

                <div>

                    <span>
                        En preparación
                    </span>

                    <strong>
                        ${preparacion}
                    </strong>

                </div>

                <div>

                    <span>
                        Entregados
                    </span>

                    <strong>
                        ${entregados}
                    </strong>

                </div>

            </div>


            <div class="detalle-reporte">

                <h3>
                    Pedidos por estado
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Estado
                        </strong>

                        <strong>
                            Cantidad
                        </strong>

                        <strong>
                            Porcentaje
                        </strong>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Pendiente
                        </span>

                        <span>
                            ${pendientes}
                        </span>

                        <span>
                            ${pedidos.length > 0
                                ? ((pendientes / pedidos.length) * 100).toFixed(1)
                                : 0}%
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Autorizado para MES
                        </span>

                        <span>
                            ${autorizados}
                        </span>

                        <span>
                            ${pedidos.length > 0
                                ? ((autorizados / pedidos.length) * 100).toFixed(1)
                                : 0}%
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            En preparación
                        </span>

                        <span>
                            ${preparacion}
                        </span>

                        <span>
                            ${pedidos.length > 0
                                ? ((preparacion / pedidos.length) * 100).toFixed(1)
                                : 0}%
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Listo para despacho
                        </span>

                        <span>
                            ${listos}
                        </span>

                        <span>
                            ${pedidos.length > 0
                                ? ((listos / pedidos.length) * 100).toFixed(1)
                                : 0}%
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Entregado
                        </span>

                        <span>
                            ${entregados}
                        </span>

                        <span>
                            ${pedidos.length > 0
                                ? ((entregados / pedidos.length) * 100).toFixed(1)
                                : 0}%
                        </span>

                    </div>

                </div>

            </div>


            <div class="pie-reporte">

                <span>
                    BurguerTech · Gestión ERP
                </span>

                <strong>
                    Información basada en los pedidos registrados.
                </strong>

            </div>

        `;


        // Eliminar reporte anterior si existe

        const anterior =
            document.getElementById(
                "reporte-pedidos-generado"
            );

        if (anterior) {
            anterior.remove();
        }


        document.body.appendChild(reporte);

    } catch (error) {

        console.error(
            "Error generando reporte de pedidos:",
            error
        );

        alert(
            "No se pudo generar el reporte de pedidos."
        );

    }

}
// ==========================================
// REPORTE DE PRODUCTOS
// ==========================================

async function generarReporteProductos() {

    try {

        const respuesta =
            await fetch("/api/resumen-comercial");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información de productos."
            );
        }

        const datos =
            await respuesta.json();

        const productos =
            datos.ventasPorProducto || [];

        const totalMedallones =
            productos.reduce(
                (total, producto) =>
                    total + Number(producto.cantidad),
                0
            );

        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-productos-generado";

        reporte.id =
            "reporte-productos-generado";

        reporte.innerHTML = `

            <div class="cabecera-reporte">

                <div>

                    <h2>
                        Reporte de productos
                    </h2>

                    <p>
                        BurguerTech · Gestión ERP
                    </p>

                </div>

                <div class="acciones-reporte">

                    <span>
                        PRODUCTOS
                    </span>

                    <button
                        class="cerrar-reporte"
                        onclick="
                            document
                            .getElementById(
                                'reporte-productos-generado'
                            )
                            .remove()
                        ">
                        ×
                    </button>

                </div>

            </div>


            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>


            <div class="resumen-reporte">

                <div>

                    <span>
                        Total de medallones
                    </span>

                    <strong>
                        ${totalMedallones}
                    </strong>

                </div>

                <div>

                    <span>
                        Carne de res
                    </span>

                    <strong>
                        ${Number(
                            productos.find(
                                producto =>
                                    producto.nombre === "Carne de res"
                            )?.cantidad || 0
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Carne de cerdo
                    </span>

                    <strong>
                        ${Number(
                            productos.find(
                                producto =>
                                    producto.nombre === "Carne de cerdo"
                            )?.cantidad || 0
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Medallón mixto
                    </span>

                    <strong>
                        ${Number(
                            productos.find(
                                producto =>
                                    producto.nombre === "Medallón mixto"
                            )?.cantidad || 0
                        )}
                    </strong>

                </div>

            </div>


            <div class="detalle-reporte">

                <h3>
                    Ventas por producto
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Producto
                        </strong>

                        <strong>
                            Medallones
                        </strong>

                        <strong>
                            Participación
                        </strong>

                    </div>


                    ${productos.map(producto => {

                        const cantidad =
                            Number(producto.cantidad);

                        const porcentaje =
                            totalMedallones > 0
                                ? (
                                    cantidad /
                                    totalMedallones
                                ) * 100
                                : 0;

                        return `

                            <div class="fila-reporte">

                                <span>
                                    ${producto.nombre}
                                </span>

                                <span>
                                    ${cantidad}
                                </span>

                                <span>
                                    ${porcentaje.toFixed(1)}%
                                </span>

                            </div>

                        `;

                    }).join("")}

                </div>

            </div>


            <div class="pie-reporte">

                <span>
                    BurguerTech · Gestión ERP
                </span>

                <strong>
                    Información basada en productos vendidos.
                </strong>

            </div>

        `;


        const anterior =
            document.getElementById(
                "reporte-productos-generado"
            );

        if (anterior) {
            anterior.remove();
        }


        document.body.appendChild(reporte);


    } catch (error) {

        console.error(
            "Error generando reporte de productos:",
            error
        );

        alert(
            "No se pudo generar el reporte de productos."
        );

    }

}
// ==========================================
// REPORTE DE INVENTARIO
// ==========================================

async function generarReporteInventario() {

    try {

        const respuesta =
            await fetch("/api/inventario");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información del inventario."
            );
        }

        const inventario =
            await respuesta.json();

        const totalMateriasPrimas =
            inventario.length;

        const productosBajoMinimo =
            inventario.filter(item =>
                Number(item.cantidad) <= Number(item.minimo)
            ).length;

        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-inventario-generado";

        reporte.id =
            "reporte-inventario-generado";

        reporte.innerHTML = `

            <div class="cabecera-reporte">

                <div>

                    <h2>
                        Reporte de inventario
                    </h2>

                    <p>
                        BurguerTech · Gestión ERP
                    </p>

                </div>

                <div class="acciones-reporte">

                    <span>
                        INVENTARIO
                    </span>

                    <button
                        class="cerrar-reporte"
                        onclick="
                            document
                            .getElementById(
                                'reporte-inventario-generado'
                            )
                            .remove()
                        ">
                        ×
                    </button>

                </div>

            </div>


            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>


            <div class="resumen-reporte">

                <div>

                    <span>
                        Materias primas
                    </span>

                    <strong>
                        ${totalMateriasPrimas}
                    </strong>

                </div>

                <div>

                    <span>
                        Stock disponible
                    </span>

                    <strong>
                        ${inventario.filter(
                            item =>
                                Number(item.cantidad) >
                                Number(item.minimo)
                        ).length}
                    </strong>

                </div>

                <div>

                    <span>
                        Bajo mínimo
                    </span>

                    <strong>
                        ${productosBajoMinimo}
                    </strong>

                </div>

            </div>


            <div class="detalle-reporte">

                <h3>
                    Estado de materias primas
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Materia prima
                        </strong>

                        <strong>
                            Disponible
                        </strong>

                        <strong>
                            Mínimo
                        </strong>

                        <strong>
                            Estado
                        </strong>

                    </div>


                    ${inventario.map(item => {

                        const cantidad =
                            Number(item.cantidad);

                        const minimo =
                            Number(item.minimo);

                        const bajoMinimo =
                            cantidad <= minimo;

                        const estado =
                            bajoMinimo
                                ? "Bajo mínimo"
                                : "Disponible";

                        return `

                            <div class="fila-reporte">

                                <span>
                                    ${item.nombre}
                                </span>

                                <span>
                                    ${cantidad.toLocaleString("es-CO")} g
                                </span>

                                <span>
                                    ${minimo.toLocaleString("es-CO")} g
                                </span>

                                <span>
                                    ${estado}
                                </span>

                            </div>

                        `;

                    }).join("")}

                </div>

            </div>


            <div class="pie-reporte">

                <span>
                    BurguerTech · Gestión ERP
                </span>

                <strong>
                    Información basada en el inventario actual.
                </strong>

            </div>

        `;


        const anterior =
            document.getElementById(
                "reporte-inventario-generado"
            );

        if (anterior) {
            anterior.remove();
        }


        document.body.appendChild(reporte);


    } catch (error) {

        console.error(
            "Error generando reporte de inventario:",
            error
        );

        alert(
            "No se pudo generar el reporte de inventario."
        );

    }

}
// ==========================================
// REPORTE FINANCIERO
// ==========================================

async function generarReporteFinanciero() {

    try {

        const respuesta =
            await fetch("/api/resumen-comercial");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información financiera."
            );
        }

        const datos =
            await respuesta.json();

        const ingresos =
            Number(datos.ingresosGenerados) || 0;

        const ventas =
            Number(datos.ventasRegistradas) || 0;

        const pedidosEntregados =
            Number(datos.pedidosEntregados) || 0;

        const promedioVenta =
            ventas > 0
                ? ingresos / ventas
                : 0;

        const totalMedallones =
            datos.ventasPorProducto.reduce(
                (total, producto) =>
                    total + Number(producto.cantidad),
                0
            );


        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-financiero-generado";

        reporte.id =
            "reporte-financiero-generado";


        reporte.innerHTML = `

            <div class="cabecera-reporte">

                <div>

                    <h2>
                        Reporte financiero
                    </h2>

                    <p>
                        BurguerTech · Gestión ERP
                    </p>

                </div>

                <div class="acciones-reporte">

                    <span>
                        FINANZAS
                    </span>

                    <button
                        class="cerrar-reporte"
                        onclick="
                            document
                            .getElementById(
                                'reporte-financiero-generado'
                            )
                            .remove()
                        ">
                        ×
                    </button>

                </div>

            </div>


            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>


            <div class="resumen-reporte">

                <div>

                    <span>
                        Ingresos generados
                    </span>

                    <strong>
                        $${ingresos.toLocaleString("es-CO")}
                    </strong>

                </div>

                <div>

                    <span>
                        Ventas registradas
                    </span>

                    <strong>
                        ${ventas}
                    </strong>

                </div>

                <div>

                    <span>
                        Pedidos entregados
                    </span>

                    <strong>
                        ${pedidosEntregados}
                    </strong>

                </div>

                <div>

                    <span>
                        Promedio por venta
                    </span>

                    <strong>
                        $${promedioVenta.toLocaleString(
                            "es-CO",
                            {
                                maximumFractionDigits: 0
                            }
                        )}
                    </strong>

                </div>

            </div>


            <div class="detalle-reporte">

                <h3>
                    Resumen financiero
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Indicador
                        </strong>

                        <strong>
                            Valor
                        </strong>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Ingresos generados
                        </span>

                        <span>
                            $${ingresos.toLocaleString("es-CO")}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Ventas registradas
                        </span>

                        <span>
                            ${ventas}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Pedidos entregados
                        </span>

                        <span>
                            ${pedidosEntregados}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Medallones vendidos
                        </span>

                        <span>
                            ${totalMedallones}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Promedio por venta
                        </span>

                        <span>
                            $${promedioVenta.toLocaleString(
                                "es-CO",
                                {
                                    maximumFractionDigits: 0
                                }
                            )}
                        </span>

                    </div>

                </div>

            </div>


            <div class="pie-reporte">

                <span>
                    BurguerTech · Gestión ERP
                </span>

                <strong>
                    Información basada en pedidos entregados.
                </strong>

            </div>

        `;


        const anterior =
            document.getElementById(
                "reporte-financiero-generado"
            );

        if (anterior) {
            anterior.remove();
        }


        document.body.appendChild(reporte);


    } catch (error) {

        console.error(
            "Error generando reporte financiero:",
            error
        );

        alert(
            "No se pudo generar el reporte financiero."
        );

    }

}
// ==========================================
// REPORTE COMPLETO
// ==========================================

async function generarReporteCompleto() {

    try {

        const [respuestaComercial, respuestaPedidos, respuestaInventario] =
            await Promise.all([
                fetch("/api/resumen-comercial"),
                fetch("/api/pedidos"),
                fetch("/api/inventario")
            ]);


        if (
            !respuestaComercial.ok ||
            !respuestaPedidos.ok ||
            !respuestaInventario.ok
        ) {
            throw new Error(
                "No se pudo obtener toda la información del ERP."
            );
        }


        const datosComerciales =
            await respuestaComercial.json();

        const pedidos =
            await respuestaPedidos.json();

        const inventario =
            await respuestaInventario.json();


        // ------------------------------------------
        // DATOS COMERCIALES
        // ------------------------------------------

        const ingresos =
            Number(datosComerciales.ingresosGenerados) || 0;

        const ventas =
            Number(datosComerciales.ventasRegistradas) || 0;

        const pedidosEntregados =
            Number(datosComerciales.pedidosEntregados) || 0;


        const totalMedallones =
            datosComerciales.ventasPorProducto.reduce(
                (total, producto) =>
                    total + Number(producto.cantidad),
                0
            );


        const promedioVenta =
            ventas > 0
                ? ingresos / ventas
                : 0;


        // ------------------------------------------
        // ESTADOS DE PEDIDOS
        // ------------------------------------------

        const pendientes =
            pedidos.filter(
                pedido =>
                    pedido.estado === "Pendiente"
            ).length;

        const enPreparacion =
            pedidos.filter(
                pedido =>
                    pedido.estado === "En preparación"
            ).length;

        const listos =
            pedidos.filter(
                pedido =>
                    pedido.estado === "Listo para despacho"
            ).length;

        const entregados =
            pedidos.filter(
                pedido =>
                    pedido.estado === "Entregado"
            ).length;


        // ------------------------------------------
        // INVENTARIO
        // ------------------------------------------

        const materiasPrimas =
            inventario.length;

        const bajoMinimo =
            inventario.filter(
                item =>
                    Number(item.cantidad) <=
                    Number(item.minimo)
            ).length;


        // ------------------------------------------
        // CREAR REPORTE
        // ------------------------------------------

        const reporte =
            document.createElement("div");

        reporte.className =
            "reporte-completo-generado";

        reporte.id =
            "reporte-completo-generado";


        reporte.innerHTML = `

            <div class="cabecera-reporte">

                <div>

                    <h2>
                        Reporte completo
                    </h2>

                    <p>
                        BurguerTech · Gestión ERP
                    </p>

                </div>


                <div class="acciones-reporte">

                    <span>
                        ERP
                    </span>


                    <button
                        class="cerrar-reporte"
                        onclick="
                            document
                            .getElementById(
                                'reporte-completo-generado'
                            )
                            .remove()
                        ">
                        ×
                    </button>

                </div>

            </div>


            <div class="fecha-reporte">

                Generado:
                ${new Date().toLocaleString("es-CO")}

            </div>


            <!-- RESUMEN GENERAL -->

            <div class="resumen-reporte">

                <div>

                    <span>
                        Ingresos
                    </span>

                    <strong>
                        $${ingresos.toLocaleString("es-CO")}
                    </strong>

                </div>


                <div>

                    <span>
                        Ventas
                    </span>

                    <strong>
                        ${ventas}
                    </strong>

                </div>


                <div>

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        ${pedidos.length}
                    </strong>

                </div>


                <div>

                    <span>
                        Medallones vendidos
                    </span>

                    <strong>
                        ${totalMedallones}
                    </strong>

                </div>

            </div>


            <!-- PEDIDOS -->

            <div class="detalle-reporte">

                <h3>
                    Estado de pedidos
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Estado
                        </strong>

                        <strong>
                            Cantidad
                        </strong>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Pendientes
                        </span>

                        <span>
                            ${pendientes}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            En preparación
                        </span>

                        <span>
                            ${enPreparacion}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Listos para despacho
                        </span>

                        <span>
                            ${listos}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Entregados
                        </span>

                        <span>
                            ${entregados}
                        </span>

                    </div>

                </div>

            </div>


            <!-- PRODUCTOS -->

            <div class="detalle-reporte">

                <h3>
                    Productos vendidos
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Producto
                        </strong>

                        <strong>
                            Medallones
                        </strong>

                        <strong>
                            Participación
                        </strong>

                    </div>


                    ${datosComerciales.ventasPorProducto.map(
                        producto => {

                            const cantidad =
                                Number(producto.cantidad);

                            const porcentaje =
                                totalMedallones > 0
                                    ? (
                                        cantidad /
                                        totalMedallones
                                    ) * 100
                                    : 0;


                            return `

                                <div class="fila-reporte">

                                    <span>
                                        ${producto.nombre}
                                    </span>

                                    <span>
                                        ${cantidad}
                                    </span>

                                    <span>
                                        ${porcentaje.toFixed(1)}%
                                    </span>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>

            </div>


            <!-- INVENTARIO -->

            <div class="detalle-reporte">

                <h3>
                    Estado del inventario
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Indicador
                        </strong>

                        <strong>
                            Cantidad
                        </strong>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Materias primas registradas
                        </span>

                        <span>
                            ${materiasPrimas}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Materias primas bajo mínimo
                        </span>

                        <span>
                            ${bajoMinimo}
                        </span>

                    </div>

                </div>

            </div>


            <!-- FINANZAS -->

            <div class="detalle-reporte">

                <h3>
                    Información financiera
                </h3>


                <div class="tabla-reporte">

                    <div class="fila-reporte encabezado">

                        <strong>
                            Indicador
                        </strong>

                        <strong>
                            Valor
                        </strong>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Ingresos generados
                        </span>

                        <span>
                            $${ingresos.toLocaleString("es-CO")}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Pedidos entregados
                        </span>

                        <span>
                            ${pedidosEntregados}
                        </span>

                    </div>


                    <div class="fila-reporte">

                        <span>
                            Promedio por venta
                        </span>

                        <span>
                            $${promedioVenta.toLocaleString(
                                "es-CO",
                                {
                                    maximumFractionDigits: 0
                                }
                            )}
                        </span>

                    </div>

                </div>

            </div>


            <div class="pie-reporte">

                <span>
                    BurguerTech · Reporte completo ERP
                </span>

                <strong>
                    Información consolidada de ventas,
                    pedidos, productos, inventario y finanzas.
                </strong>

            </div>

        `;


        const anterior =
            document.getElementById(
                "reporte-completo-generado"
            );

        if (anterior) {
            anterior.remove();
        }


        window.reporteCompletoHTML = reporte.outerHTML;

document.body.appendChild(reporte);


    } catch (error) {

        console.error(
            "Error generando reporte completo:",
            error
        );

        alert(
            "No se pudo generar el reporte completo."
        );

    }

}
// ==========================================
// SOLICITAR COMPRA DE MATERIAS PRIMAS
// ==========================================

async function solicitarCompraMES(idOrden) {

    try {

        const respuesta =
            await fetch("/api/ordenes-produccion");

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron consultar las órdenes de producción."
            );

        }

        const ordenes =
            await respuesta.json();

        const orden =
            ordenes.find(
                item => Number(item.id) === Number(idOrden)
            );

        if (!orden) {

            alert(
                "No se encontró la orden de producción."
            );

            return;
        }

        const confirmar = confirm(
            `¿Deseas generar una solicitud de compra?\n\n` +
            `Orden: #${orden.id}\n` +
            `Producto: ${orden.nombre}\n` +
            `Cantidad: ${orden.cantidad_medallones} medallones`
        );

        if (!confirmar) {
            return;
        }

        const respuestaCompra =
            await fetch("/api/solicitudes-compra", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    idOrdenProduccion: orden.id
                })

            });

        const resultado =
            await respuestaCompra.json();

        if (!respuestaCompra.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo generar la solicitud de compra."
            );

        }

        alert(
            "Solicitud de compra registrada correctamente."
        );

    } catch (error) {

        console.error(
            "Error solicitando compra:",
            error
        );

        alert(
            "No se pudo generar la solicitud de compra.\n\n" +
            error.message
        );

    }

}
async function cargarLotesProceso() {

    try {

        const respuesta =
            await fetch("/api/lotes-produccion");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los lotes de producción."
            );
        }

        const lotes =
            await respuesta.json();

        const contenedor =
            document.getElementById(
                "lista-lotes-proceso"
            );

        if (!contenedor) {
            return;
        }

        if (lotes.length === 0) {

            contenedor.innerHTML = `
                <p>
                    No hay lotes de producción registrados.
                </p>
            `;

            return;
        }

        contenedor.innerHTML =
            lotes.map(lote => `

                <div class="tarjeta-lote-proceso">

                    <div class="cabecera-lote-proceso">

                        <div>
                            <span>
                                Lote de producción
                            </span>

                            <h3>
                                ${lote.codigo_lote}
                            </h3>
                        </div>

                        <span class="estado-lote-proceso">
                            ${lote.estado}
                        </span>

                    </div>

                    <div class="datos-lote-proceso">

                        <div>
                            <label>Producto</label>
                            <strong>
                                ${lote.nombre}
                            </strong>
                        </div>

                        <div>
                            <label>Cantidad</label>
                            <strong>
                                ${lote.cantidad_medallones}
                                medallones
                            </strong>
                        </div>

                    </div>

                    <div class="receta-lote-proceso">

                        <h4>
                            Receta / formulación
                        </h4>

                        <div class="lista-receta-lote">

                            ${obtenerRecetaProceso(lote.producto)}

                        </div>

                    </div>
                    <div class="accion-lote-proceso">

    <button
        class="boton-seleccionar-lote"
        onclick="seleccionarLoteProceso(
    ${lote.id},
    '${lote.codigo_lote}',
    '${lote.producto}',
    '${lote.nombre}',
    ${lote.cantidad_medallones},
    ${lote.proceso}
)"
    >
        Seleccionar lote
    </button>

</div>

                </div>

            `).join("");

    } catch (error) {

        console.error(
            "Error cargando lotes:",
            error
        );

    }

}
function seleccionarLoteProceso(
    id,
    codigoLote,
    producto,
    nombre,
    cantidadMedallones,
    procesoGuardado
) {

    const proceso =
        document.getElementById("proceso-produccion");

    const pedidoTexto =
        document.getElementById("proceso-pedido");

    if (!proceso || !pedidoTexto) {
        return;
    }

    // Guardar información del lote seleccionado
    window.loteProcesoSeleccionado = {
    id: id,
    codigoLote: codigoLote,
    producto: producto,
    nombre: nombre,
    cantidadMedallones: cantidadMedallones,
    proceso: 0
};

    // Mostrar información del lote
    pedidoTexto.textContent =
        `Lote ${codigoLote} · ${nombre} · ${cantidadMedallones} medallones`;

    // Mostrar el proceso
    proceso.style.display = "block";

    // Comenzar desde la primera etapa
    procesoActual =
    Number(procesoGuardado) || 0;

    actualizarProceso();

    // Llevar la pantalla hasta el proceso
    proceso.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
function obtenerRecetaProceso(producto) {

    const formulaciones = {

        res: {
            "Carne de res": 90,
            "Grasa de res": 7,
            "Sal": 1.5,
            "Pimienta negra": 0.3,
            "Ajo en polvo": 0.3,
            "Cebolla en polvo": 0.4,
            "Agua/hielo": 0.5
        },

        cerdo: {
            "Carne de cerdo": 91,
            "Grasa de cerdo": 6,
            "Sal": 1.5,
            "Pimienta negra": 0.3,
            "Ajo en polvo": 0.4,
            "Cebolla en polvo": 0.3,
            "Agua/hielo": 0.5
        },

        mixto: {
            "Carne de res": 55,
            "Carne de cerdo": 37,
            "Grasa para mixto": 6,
            "Sal": 1.5,
            "Pimienta negra": 0.2,
            "Ajo en polvo": 0.2,
            "Cebolla en polvo": 0.1
        }

    };

    const receta =
        formulaciones[producto];

    if (!receta) {

        return `
            <p>
                No hay una receta registrada
                para este producto.
            </p>
        `;

    }

    return Object.entries(receta)
        .map(([ingrediente, porcentaje]) => `

            <div class="ingrediente-receta-lote">

                <span>
                    ${ingrediente}
                </span>

                <strong>
                    ${porcentaje}%
                </strong>

            </div>

        `)
        .join("");

}
async function consultarTrazabilidadLote() {

    const input =
        document.getElementById(
            "codigo-lote-trazabilidad"
        );

    const lista =
        document.getElementById(
            "lista-trazabilidad"
        );

    const codigo =
        input.value.trim();

    if (!codigo) {

        lista.innerHTML = `
            <p>
                Ingresa un código de lote.
            </p>
        `;

        return;
    }

    lista.innerHTML = `
        <p>
            Consultando lote...
        </p>
    `;

    try {

        const respuesta =
            await fetch(
                `/api/lotes-produccion/trazabilidad/${encodeURIComponent(codigo)}`
            );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            lista.innerHTML = `
                <p>
                    ${resultado.mensaje}
                </p>
            `;

            return;
        }

        const etapas = [
            "Preparación",
            "Molido",
            "Mezclado",
            "Formado",
            "Enfriamiento",
            "Empaque",
            "Etiquetado"
        ];

        const procesoActual =
            Number(resultado.proceso || 0);

        let etapasHTML = "";

        etapas.forEach((etapa, indice) => {

            let texto = "Pendiente";
            let clase = "trazabilidad-pendiente";

            if (indice < procesoActual) {

                texto = "Completado";
                clase = "trazabilidad-completado";

            } else if (indice === procesoActual) {

                texto = "En proceso";
                clase = "trazabilidad-actual";

            }

            etapasHTML += `
                <div class="trazabilidad-etapa">

                    <span>
                        ${indice + 1}. ${etapa}
                    </span>

                    <strong class="${clase}">
                        ${texto}
                    </strong>

                </div>
            `;

        });

        lista.innerHTML = `

            <div class="trazabilidad-pedido">

                <div class="cabecera-trazabilidad">

                    <h3>
                        Lote ${resultado.codigo_lote}
                    </h3>

                    <span>
                        ${resultado.estado}
                    </span>

                </div>

                <p>
                    <strong>Producto:</strong>
                    ${resultado.nombre}
                </p>

                <p>
                    <strong>Medallones:</strong>
                    ${resultado.cantidad_medallones}
                </p>

                <p>
                    <strong>Pack:</strong>
                    x${resultado.pack}
                </p>

                <p>
                    <strong>Packs producidos:</strong>
                    ${resultado.cantidad_packs}
                </p>

                <h4>
                    Estado del proceso
                </h4>

                <div class="lista-trazabilidad-etapas">

                    ${etapasHTML}

                </div>

            </div>

        `;

    } catch (error) {

        console.error(
            "Error consultando trazabilidad:",
            error
        );

        lista.innerHTML = `
            <p>
                No se pudo consultar la trazabilidad del lote.
            </p>
        `;

    }

}