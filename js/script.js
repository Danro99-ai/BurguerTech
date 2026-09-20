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


    if (!contenedor) {
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
        contenedor.innerHTML = "";

        if (contenedorEntregados) {
            contenedorEntregados.innerHTML = "";
        }


        // Separar pedidos entregados
        const pedidosPendientes =
            pedidos.filter(pedido => pedido.estado !== "Entregado");

        const pedidosEntregados =
            pedidos.filter(pedido => pedido.estado === "Entregado");


        // ==========================================
        // PEDIDOS PENDIENTES
        // ==========================================

        if (pedidosPendientes.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-pedidos">
                    No hay pedidos pendientes.
                </p>
            `;

        } else {

            pedidosPendientes.forEach(pedido => {

                const tarjeta =
                    document.createElement("div");

                tarjeta.className =
                    "pedido-admin";


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

                        <span class="estado-pedido estado-${(pedido.estado || "Pendiente").toLowerCase().replace(" ", "-")}">
                            ${pedido.estado || "Pendiente"}
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

                        <p>
                            <strong>Observaciones:</strong>
                            ${pedido.cliente.observaciones || "Ninguna"}
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


                    <div class="acciones-admin">

                        <button
                            onclick="cambiarEstado(${pedido.id}, 'En preparación')">
                            En preparación
                        </button>

                        <button
                            onclick="cambiarEstado(${pedido.id}, 'Listo')">
                            Listo
                        </button>

                        <button
                            onclick="cambiarEstado(${pedido.id}, 'Entregado')">
                            Entregado
                        </button>

                        <button
                            onclick="eliminarPedido(${pedido.id})"
                            class="boton-eliminar">
                            Eliminar
                        </button>

                    </div>

                `;


                contenedor.appendChild(tarjeta);


                // Recuperar el proceso guardado del pedido
                if (pedido.estado === "En preparación") {

                    abrirProcesoProduccion(
                        pedido.id,
                        pedido.proceso || 0
                    );

                }

            });

        }


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

        contenedor.innerHTML = `

            <p class="error-admin">

                No se pudieron cargar los pedidos.

                <br><br>

                Comprueba que el servidor esté funcionando.

            </p>

        `;

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


        if (estado === "En preparación") {

            abrirProcesoProduccion(id);

        }


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

    const pedidoTexto =
        document.getElementById("proceso-pedido");

    if (!pedidoTexto) return;

    const texto = pedidoTexto.textContent;
    const id = Number(texto.replace("Pedido #", ""));

    // Si ya estamos en Etiquetado, finalizar el pedido
    if (procesoActual >= 6) {

        try {

            const respuesta = await fetch(`/api/pedidos/${id}/estado`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    estado: "Listo"
                })
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                alert(
                    resultado.mensaje ||
                    "No se pudo marcar el pedido como listo."
                );
                return;
            }

            alert(`Pedido #${id} listo para entregar.`);

            document.getElementById("proceso-produccion").style.display = "none";

            cargarPedidosAdmin();

        } catch (error) {

            console.error(error);

            alert(
                "No se pudo conectar con el servidor."
            );
        }

        return;
    }

    const nuevoProceso = procesoActual + 1;

    try {

        const respuesta = await fetch(`/api/pedidos/${id}/proceso`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                proceso: nuevoProceso
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(
                resultado.mensaje ||
                "No se pudo guardar el proceso."
            );
            return;
        }

        procesoActual = nuevoProceso;

        actualizarProceso();

        // Activar refrigeración al llegar a Enfriamiento
        if (procesoActual === 4) {
            await activarRefrigeracion();
        }

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo conectar con el servidor."
        );
    }
}
function actualizarProceso() {

    const etapas = document.querySelectorAll(".etapa-proceso");

    const titulos = [
        "Preparación",
        "Molido",
        "Mezclado",
        "Formado",
        "Enfriamiento",
        "Empaque",
        "Etiquetado"
    ];

    const descripciones = [
        "Preparando las materias primas para iniciar la producción.",
        "La carne está pasando por el proceso de molido.",
        "Mezclando la carne con los ingredientes para obtener una mezcla homogénea.",
        "Formando los medallones de hamburguesa de 100 gramos.",
        "Enfriando los medallones para conservar su calidad.",
        "Empacando los medallones para su almacenamiento y entrega.",
        "Colocando la etiqueta con la información del producto."
    ];

    etapas.forEach((etapa, indice) => {

        if (indice <= procesoActual) {
            etapa.classList.add("activa");
        } else {
            etapa.classList.remove("activa");
        }

    });

    const animacion =
        document.getElementById("animacion-proceso");

    if (Number(procesoActual) === 1) {

    animacion.innerHTML = `
        <h3>Molido</h3>

        <svg
            class="svg-molino"
            viewBox="0 0 500 260"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Animación del proceso de molido">

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
            <circle class="carne carne-1" cx="105" cy="58" r="9"/>
            <circle class="carne carne-2" cx="125" cy="65" r="9"/>
            <circle class="carne carne-3" cx="145" cy="58" r="9"/>
            <circle class="carne carne-4" cx="115" cy="82" r="9"/>
            <circle class="carne carne-5" cx="140" cy="82" r="9"/>

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

            <g class="tornillo-svg">

            <!-- Salida -->
            <rect
                class="salida-molino"
                x="380"
                y="125"
                width="45"
                height="35"
                rx="5"
            />

            <!-- Medallones saliendo -->
            <circle class="medallon-molido medallon-m1" cx="440" cy="142" r="8"/>
            <circle class="medallon-molido medallon-m2" cx="460" cy="142" r="8"/>
            <circle class="medallon-molido medallon-m3" cx="480" cy="142" r="8"/>

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
} else if (Number(procesoActual) === 2) {

    animacion.innerHTML = `
        <h3>Mezclado</h3>

        <svg
            class="svg-mezcladora"
            viewBox="0 0 500 300"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Animación del proceso de mezclado">

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

            <!-- Carne dentro de la mezcla -->
            <circle class="ingrediente ingrediente-1" cx="175" cy="145" r="10"/>
            <circle class="ingrediente ingrediente-2" cx="210" cy="160" r="9"/>
            <circle class="ingrediente ingrediente-3" cx="250" cy="145" r="10"/>
            <circle class="ingrediente ingrediente-4" cx="290" cy="165" r="9"/>
            <circle class="ingrediente ingrediente-5" cx="330" cy="145" r="10"/>

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
            Mezclando la carne con los ingredientes para obtener una mezcla homogénea.
        </p>
    `;
} else if (Number(procesoActual) === 3) {

    animacion.innerHTML = `
        <h3>Formado</h3>

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
            Formando los medallones de hamburguesa de 100 gramos.
        </p>
    `;
} else if (Number(procesoActual) === 4) {

    animacion.innerHTML = `
        <h3>Enfriamiento</h3>

        <div class="maquina-refrigeracion">

            <div class="cuerpo-refrigerador">

                <div class="puerta-refrigerador">
                    <span>❄</span>
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
            Enfriando los medallones para conservar su calidad.
        </p>

        <div id="control-refrigeracion-proceso"></div>
    `;
} else if (Number(procesoActual) === 5) {

    animacion.innerHTML = `
        <h3>Empaque</h3>

        <div class="maquina-empaque">

            <div class="banda-empaque">
                <div class="medallon-empaque medallon-e1">
                    100 g
                </div>

                <div class="medallon-empaque medallon-e2">
                    100 g
                </div>

                <div class="medallon-empaque medallon-e3">
                    100 g
                </div>
            </div>

            <div class="empaque-caja">
                <div class="tapa-empaque"></div>
                <div class="interior-empaque">
                    BURGUERTECH
                </div>
            </div>

        </div>

        <p>
            Empacando los medallones para proteger y conservar el producto.
        </p>
    `;
} else if (Number(procesoActual) === 6) {

    animacion.innerHTML = `
        <h3>Etiquetado</h3>

        <div class="maquina-etiquetado">

            <div class="producto-etiquetado">

                <div class="empaque-final">
                    <strong>BURGUERTECH</strong>
                    <span>Medallón de hamburguesa</span>
                    <span>100 g</span>
                </div>

                <div class="etiqueta">
                    <strong>BURGUERTECH</strong>
                    <span>CARNE DE RES</span>
                    <span>100 g</span>
                </div>

            </div>

            <div class="aplicador-etiqueta">
                ↓
            </div>

        </div>

        <p>
            Colocando la etiqueta de identificación y control del producto.
        </p>
    `;
} else {

    animacion.innerHTML = `
        <h3>${titulos[procesoActual]}</h3>
        <p>${descripciones[procesoActual]}</p>
    `;
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