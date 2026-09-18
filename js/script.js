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
                    "No se pudo guardar el pedido."
                );

            }


            // Mostrar confirmación

            alert(
                "¡Pedido confirmado!\n\n" +
                "Número de pedido: #" +
                resultado.pedido.id +
                "\n\n" +
                "Gracias por comprar en BurguerTech."
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
                "Verifica que el servidor de BurguerTech esté funcionando."
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


        contenedor.innerHTML = "";


        if (pedidos.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-pedidos">
                    No hay pedidos registrados.
                </p>
            `;

            return;

        }


        pedidos.forEach(pedido => {

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

</div>

            `;


            contenedor.appendChild(tarjeta);

        });


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

comprobarSesion();