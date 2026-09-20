const express = require("express");
const session = require("express-session");
const { Pool } = require("pg");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);


// ==========================================
// CONEXIÓN A POSTGRESQL
// ==========================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// ==========================================
// CONFIGURACIÓN
// ==========================================

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 4
}
    })
);


// ==========================================
// PROTEGER PANEL ADMINISTRATIVO
// ==========================================

app.use((req, res, next) => {

    if (req.path === "/admin.html") {

        if (!req.session.usuario) {
            return res.redirect("/admin-login.html");
        }

    }

    next();

});


// ==========================================
// ARCHIVOS DE LA PÁGINA
// ==========================================

app.use(express.static("../"));


// ==========================================
// CREAR TABLA DE PEDIDOS
// ==========================================

// ==========================================
// CREAR TABLA DE INVENTARIO
// ==========================================

async function crearTablaInventario() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS inventario (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL UNIQUE,
            cantidad_gramos NUMERIC NOT NULL DEFAULT 0,
            minimo_gramos NUMERIC NOT NULL DEFAULT 0
        )
    `);

    console.log("Tabla de inventario lista.");

}
// ==========================================
// CREAR TABLA DE INVENTARIO
// ==========================================

// ==========================================
// CREAR TABLA DE REFRIGERACIÓN
// ==========================================

async function crearTablaRefrigeracion() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS refrigeracion (
            id SERIAL PRIMARY KEY,
            temperatura NUMERIC NOT NULL DEFAULT 3,
            limite_maximo NUMERIC NOT NULL DEFAULT 4,
            activo BOOLEAN NOT NULL DEFAULT false,
            estado VARCHAR(50) NOT NULL DEFAULT 'Normal',
            fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        INSERT INTO refrigeracion
            (temperatura, limite_maximo, activo, estado)
        SELECT 3, 4, false, 'Normal'
        WHERE NOT EXISTS (
            SELECT 1 FROM refrigeracion
        )
    `);

    console.log("Tabla de refrigeración lista.");

}
// ==========================================
// CARGAR INVENTARIO INICIAL
// ==========================================

async function cargarInventarioInicial() {

    const materiasPrimas = [
        ["Carne de res", 10000, 2000],
        ["Carne de cerdo", 10000, 2000],
        ["Grasa de res", 1000, 200],
        ["Grasa de cerdo", 1000, 200],
        ["Grasa para mixto", 1000, 200],
        ["Sal", 500, 100],
        ["Pimienta negra", 100, 20],
        ["Ajo en polvo", 100, 20],
        ["Cebolla en polvo", 100, 20],
        ["Agua/hielo", 1000, 200]
    ];

    for (const materia of materiasPrimas) {

    await pool.query(`
        INSERT INTO inventario
            (nombre, cantidad_gramos, minimo_gramos)
        VALUES
            ($1, $2, $3)
        ON CONFLICT (nombre) DO NOTHING
    `, materia);

}

    console.log("Inventario inicial cargado.");

}

// ==========================================
// COMPROBAR SESIÓN
// ==========================================

app.get("/api/sesion", (req, res) => {

    if (req.session.usuario) {

        return res.json({
            sesion: true,
            usuario: req.session.usuario
        });

    }

    res.json({
        sesion: false
    });

});
// ==========================================
// RUTA DE PRUEBA
// ==========================================

app.get("/api", (req, res) => {

    res.json({
        mensaje:
            "Servidor de BurguerTech funcionando correctamente"
    });

});


// ==========================================
// INICIAR SESIÓN
// ==========================================

app.post("/api/login", (req, res) => {

    const usuario = req.body.usuario;
    const password = req.body.password;

    if (
        usuario === process.env.ADMIN_USER &&
        password === process.env.ADMIN_PASSWORD
    ) {

        req.session.usuario = usuario;

        return res.json({

            correcto: true,

            mensaje:
                "Inicio de sesión correcto."

        });

    }

    res.status(401).json({

        correcto: false,

        mensaje:
            "Usuario o contraseña incorrectos."

    });

});


// ==========================================
// CERRAR SESIÓN
// ==========================================

app.post("/api/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            return res.status(500).json({

                mensaje:
                    "No se pudo cerrar la sesión."

            });

        }

        res.json({

            mensaje:
                "Sesión cerrada correctamente."

        });

    });

});


// ==========================================
// OBTENER PEDIDOS
// ==========================================

app.get("/api/pedidos", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({

            mensaje:
                "Debes iniciar sesión."

        });

    }

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                cliente,
                productos,
                total,
                estado,
                proceso,
                fecha
            FROM pedidos
            ORDER BY id ASC
        `);

        const pedidos = resultado.rows.map(pedido => ({

            id: pedido.id,

            cliente: pedido.cliente,

            productos: pedido.productos,

            total: Number(pedido.total),

            estado: pedido.estado,

            proceso: pedido.proceso,

            fecha: new Date(pedido.fecha)
                .toLocaleString("es-CO")

        }));

        res.json(pedidos);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje:
                "No se pudieron cargar los pedidos."

        });

    }

});

// ==========================================
// FORMULACIONES POR MEDALLÓN
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
// ==========================================
// GUARDAR PEDIDO Y DESCONTAR INVENTARIO
// ==========================================

app.post("/api/pedidos", async (req, res) => {

    const client = await pool.connect();

    try {

        const nuevoPedido = req.body;

        const cliente = nuevoPedido.cliente;
        const productos = nuevoPedido.productos;
        const total = nuevoPedido.total;

        const estado = "Pendiente";


        // ------------------------------------------
        // CALCULAR MATERIAS PRIMAS NECESARIAS
        // ------------------------------------------

        const consumo = {};


        for (const producto of productos) {

            const tipo = producto.producto;

            const pack = Number(producto.pack);

            const cantidad = Number(producto.cantidad);


            if (!formulaciones[tipo]) {

                return res.status(400).json({
                    mensaje:
                        "Tipo de producto no válido."
                });

            }


            if (
                !Number.isFinite(pack) ||
                !Number.isFinite(cantidad) ||
                pack <= 0 ||
                cantidad <= 0
            ) {

                return res.status(400).json({
                    mensaje:
                        "Cantidad de producto no válida."
                });

            }


            const numeroMedallones =
                pack * cantidad;


            const formulacion =
                formulaciones[tipo];


            for (
                const materia in formulacion
            ) {

                const cantidadNecesaria =
                    formulacion[materia] *
                    numeroMedallones;


                if (!consumo[materia]) {
                    consumo[materia] = 0;
                }


                consumo[materia] +=
                    cantidadNecesaria;

            }

        }


        // ------------------------------------------
        // INICIAR TRANSACCIÓN
        // ------------------------------------------

        await client.query("BEGIN");


        // ------------------------------------------
        // COMPROBAR INVENTARIO
        // ------------------------------------------

        for (
            const materia in consumo
        ) {

            const resultado =
                await client.query(`
                    SELECT
                        id,
                        nombre,
                        cantidad_gramos
                    FROM inventario
                    WHERE nombre = $1
                    FOR UPDATE
                `, [
                    materia
                ]);


            if (resultado.rows.length === 0) {

                throw new Error(
                    `Materia prima no encontrada: ${materia}`
                );

            }


            const disponible =
                Number(
                    resultado.rows[0].cantidad_gramos
                );


            const necesario =
                consumo[materia];


            if (disponible < necesario) {

                await client.query("ROLLBACK");


                return res.status(400).json({

                    mensaje:
                        `Inventario insuficiente de ${materia}. ` +
                        `Disponible: ${disponible} g. ` +
                        `Necesario: ${necesario} g.`

                });

            }

        }


        // ------------------------------------------
        // DESCONTAR INVENTARIO
        // ------------------------------------------

        for (
            const materia in consumo
        ) {

            await client.query(`
                UPDATE inventario
                SET cantidad_gramos =
                    cantidad_gramos - $1
                WHERE nombre = $2
            `, [
                consumo[materia],
                materia
            ]);

        }


        // ------------------------------------------
// GUARDAR PEDIDO
// ------------------------------------------

const resultado = await client.query(`
    INSERT INTO pedidos
        (cliente, productos, total, estado, guia)
    VALUES
        ($1, $2, $3, $4, NULL)
    RETURNING
        id,
        cliente,
        productos,
        total,
        estado,
        guia,
        fecha
`, [
    cliente,
    JSON.stringify(productos),
    total,
    estado
]);


const pedidoCreado = resultado.rows[0];


const guia =
    `BT-${new Date().getFullYear()}-${String(pedidoCreado.id).padStart(5, "0")}`;


await client.query(`
    UPDATE pedidos
    SET guia = $1
    WHERE id = $2
`, [
    guia,
    pedidoCreado.id
]);


const pedidoActualizado = await client.query(`
    SELECT
        id,
        cliente,
        productos,
        total,
        estado,
        guia,
        fecha
    FROM pedidos
    WHERE id = $1
`, [
    pedidoCreado.id
]);


const pedido = pedidoActualizado.rows[0];

// ------------------------------------------
// GENERAR FACTURA PDF
// ------------------------------------------

app.get("/api/pedidos/:id/factura", async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await pool.query(`
            SELECT
                id,
                cliente,
                productos,
                total,
                guia,
                fecha
            FROM pedidos
            WHERE id = $1
        `, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).send("Pedido no encontrado.");
        }

        const pedido = resultado.rows[0];

        const doc = new PDFDocument({
            margin: 50
        });

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="factura-${pedido.guia}.pdf"`
        );

        doc.pipe(res);

        // LOGO
        const logo = path.join(
            __dirname,
            "..",
            "img",
            "logo.png"
        );

        if (fs.existsSync(logo)) {
            doc.image(logo, 50, 45, {
                width: 80
            });
        }

        doc
            .fontSize(24)
            .text("BurguerTech", 150, 55);

        doc
            .fontSize(10)
            .text("Sabor que se produce con precisión.", 150, 85);

        doc.moveDown(3);

        // TÍTULO
        doc
            .fontSize(20)
            .text("FACTURA DE PEDIDO", {
                align: "center"
            });

        doc.moveDown();

        // INFORMACIÓN DEL PEDIDO
        doc.fontSize(12);

        doc.text(`Número de pedido: #${pedido.id}`);
        doc.text(`Número de guía: ${pedido.guia}`);
        doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleString("es-CO")}`);

        doc.moveDown();

        // DATOS DEL CLIENTE
        doc
            .fontSize(15)
            .text("Datos del cliente");

        doc.moveDown(0.5);

        doc.fontSize(11);

        doc.text(`Nombre: ${pedido.cliente.nombre}`);
        doc.text(`Teléfono: ${pedido.cliente.telefono}`);
        doc.text(`Dirección: ${pedido.cliente.direccion}`);

        if (pedido.cliente.observaciones) {
            doc.text(
                `Observaciones: ${pedido.cliente.observaciones}`
            );
        }

        doc.moveDown();

        // PRODUCTOS
        doc
            .fontSize(15)
            .text("Productos");

        doc.moveDown(0.5);

        doc.fontSize(11);

        pedido.productos.forEach((producto) => {

            doc.text(
                `${producto.nombre} - Pack x${producto.pack} - Cantidad: ${producto.cantidad}`
            );

            doc.text(
                `Precio: $${Number(producto.precio).toLocaleString("es-CO")}`
            );

            doc.moveDown(0.5);

        });

        doc.moveDown();

        // TOTAL
        doc
            .fontSize(16)
            .text(
                `TOTAL: $${Number(pedido.total).toLocaleString("es-CO")}`
            );

        doc.moveDown(2);

        doc
            .fontSize(11)
            .text(
                "Gracias por comprar en BurguerTech.",
                {
                    align: "center"
                }
            );

        doc.end();

    } catch (error) {

        console.error(
            "Error generando factura:",
            error
        );

        res.status(500).send(
            "No se pudo generar la factura."
        );

    }

});

// ------------------------------------------
// CONFIRMAR TRANSACCIÓN
// ------------------------------------------

await client.query("COMMIT");


        const pedidoRespuesta = {

    id: pedido.id,

    cliente: pedido.cliente,

    productos: pedido.productos,

    total: Number(pedido.total),

    estado: pedido.estado,

    guia: pedido.guia,

    fecha: new Date(pedido.fecha)
        .toLocaleString("es-CO")

};


        res.json({

            mensaje:
                "Pedido guardado correctamente",

            pedido:
                pedidoRespuesta

        });


    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            mensaje:
                "No se pudo guardar el pedido."

        });

    } finally {

        client.release();

    }

});


// ==========================================
// CAMBIAR ESTADO DEL PEDIDO
// ==========================================

app.put("/api/pedidos/:id/estado", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({

            mensaje:
                "Debes iniciar sesión."

        });

    }

    try {

        const id =
            Number(req.params.id);

        const nuevoEstado =
            req.body.estado;


        const estadosPermitidos = [

            "Pendiente",

            "En preparación",

            "Listo",

            "Entregado"

        ];


        if (
            !estadosPermitidos.includes(
                nuevoEstado
            )
        ) {

            return res.status(400).json({

                mensaje:
                    "Estado no válido."

            });

        }


        const resultado = await pool.query(`
            UPDATE pedidos
            SET estado = $1
            WHERE id = $2
            RETURNING id, cliente, productos, total, estado, fecha
        `, [
            nuevoEstado,
            id
        ]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({

                mensaje:
                    "Pedido no encontrado."

            });

        }


        const pedido = resultado.rows[0];

        const pedidoRespuesta = {

            id: pedido.id,

            cliente: pedido.cliente,

            productos: pedido.productos,

            total: Number(pedido.total),

            estado: pedido.estado,

            fecha: new Date(pedido.fecha)
                .toLocaleString("es-CO")

        };


        res.json({

            mensaje:
                "Estado actualizado correctamente",

            pedido:
                pedidoRespuesta

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje:
                "No se pudo actualizar el estado."

        });

    }

});
// ==========================================
// ACTUALIZAR PROCESO DE PRODUCCIÓN
// ==========================================

app.put("/api/pedidos/:id/proceso", async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {
        const id = Number(req.params.id);
        const proceso = Number(req.body.proceso);

        if (!Number.isInteger(proceso) || proceso < 0 || proceso > 6) {
            return res.status(400).json({
                mensaje: "Etapa de proceso no válida."
            });
        }

        const resultado = await pool.query(`
            UPDATE pedidos
            SET proceso = $1
            WHERE id = $2
            RETURNING id, proceso
        `, [proceso, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado."
            });
        }

        res.json({
            mensaje: "Proceso actualizado correctamente.",
            id: resultado.rows[0].id,
            proceso: resultado.rows[0].proceso
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo actualizar el proceso."
        });
    }
});
// ==========================================
// ELIMINAR PEDIDO Y DEVOLVER INVENTARIO
// ==========================================

app.delete("/api/pedidos/:id", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }


    const client = await pool.connect();


    try {

        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            return res.status(400).json({
                mensaje: "ID de pedido no válido."
            });

        }


        // ------------------------------------------
        // INICIAR TRANSACCIÓN
        // ------------------------------------------

        await client.query("BEGIN");


        // ------------------------------------------
        // BUSCAR EL PEDIDO
        // ------------------------------------------

        const resultado = await client.query(`
            SELECT
                id,
                productos
            FROM pedidos
            WHERE id = $1
            FOR UPDATE
        `, [id]);


        if (resultado.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pedido no encontrado."
            });

        }


        const pedido = resultado.rows[0];

        // ------------------------------------------
        // CALCULAR LAS MATERIAS PRIMAS A DEVOLVER
        // ------------------------------------------

        const devolucion = {};


        for (const producto of pedido.productos) {

            const tipo = producto.producto;

            const pack = Number(producto.pack);

            const cantidad = Number(producto.cantidad);


            if (!formulaciones[tipo]) {

                throw new Error(
                    `Formulación no encontrada para: ${tipo}`
                );

            }


            const numeroMedallones =
                pack * cantidad;


            const formulacion =
                formulaciones[tipo];


            for (const materia in formulacion) {

                const cantidadDevuelta =
                    formulacion[materia] *
                    numeroMedallones;


                if (!devolucion[materia]) {

                    devolucion[materia] = 0;

                }


                devolucion[materia] +=
                    cantidadDevuelta;

            }

        }


        // ------------------------------------------
        // DEVOLVER LAS MATERIAS PRIMAS
        // ------------------------------------------
        console.log("DEVOLUCIÓN DEL PEDIDO:", devolucion);

        for (const materia in devolucion) {

            const resultadoInventario =
                await client.query(`
                    UPDATE inventario
                    SET cantidad_gramos =
                        cantidad_gramos + $1
                    WHERE nombre = $2
                    RETURNING nombre
                `, [
                    devolucion[materia],
                    materia
                ]);
                console.log(
    `Devuelto ${devolucion[materia]} g de ${materia}`
);


            if (resultadoInventario.rows.length === 0) {

                throw new Error(
                    `Materia prima no encontrada: ${materia}`
                );

            }

        }


        // ------------------------------------------
        // ELIMINAR PEDIDO
        // ------------------------------------------

        await client.query(`
            DELETE FROM pedidos
            WHERE id = $1
        `, [id]);


        // ------------------------------------------
        // CONFIRMAR CAMBIOS
        // ------------------------------------------

        await client.query("COMMIT");


        res.json({

            mensaje:
                "Pedido eliminado y materias primas devueltas correctamente."

        });


    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({

            mensaje:
                "No se pudo eliminar el pedido."

        });

    } finally {

        client.release();

    }

});
// ==========================================
// OBTENER INVENTARIO
// ==========================================

app.get("/api/inventario", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                nombre,
                cantidad_gramos,
                minimo_gramos
            FROM inventario
            ORDER BY id ASC
        `);

        const inventario = resultado.rows.map(materia => ({

            id: materia.id,

            nombre: materia.nombre,

            cantidad: Number(materia.cantidad_gramos),

            minimo: Number(materia.minimo_gramos)

        }));

        res.json(inventario);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo cargar el inventario."
        });

    }

});
// ==========================================
// OBTENER ESTADO DE REFRIGERACIÓN
// ==========================================

app.get("/api/refrigeracion", async (req, res) => {

    // Solo administradores
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                temperatura,
                limite_maximo,
                activo,
                estado,
                fecha_actualizacion
            FROM refrigeracion
            WHERE id = 1
        `);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "No existe información de refrigeración."
            });
        }

        const refrigeracion = resultado.rows[0];

        res.json({
            id: refrigeracion.id,
            temperatura: Number(refrigeracion.temperatura),
            limiteMaximo: Number(refrigeracion.limite_maximo),
            activo: refrigeracion.activo,
            estado: refrigeracion.estado,
            fechaActualizacion: new Date(
                refrigeracion.fecha_actualizacion
            ).toLocaleString("es-CO")
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo cargar la información de refrigeración."
        });

    }

});
// ==========================================
// SIMULAR TEMPERATURA DE REFRIGERACIÓN
// ==========================================

app.put("/api/refrigeracion/temperatura", async (req, res) => {

    // Solo administradores
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const temperatura = Number(req.body.temperatura);

        if (!Number.isFinite(temperatura)) {
            return res.status(400).json({
                mensaje: "Temperatura no válida."
            });
        }

        const estado =
            temperatura > 3
                ? "Alerta"
                : "Normal";

        const resultado = await pool.query(`
            UPDATE refrigeracion
            SET temperatura = $1,
                estado = $2,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = 1
            RETURNING temperatura, limite_maximo, activo, estado, fecha_actualizacion
        `, [
            temperatura,
            estado
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "No existe información de refrigeración."
            });
        }

        res.json({
            mensaje: "Temperatura actualizada correctamente.",
            temperatura: Number(resultado.rows[0].temperatura),
            limiteMaximo: Number(resultado.rows[0].limite_maximo),
            activo: resultado.rows[0].activo,
            estado: resultado.rows[0].estado
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo actualizar la temperatura."
        });

    }

});
// ==========================================
// ACTIVAR REFRIGERACIÓN
// ==========================================

app.put("/api/refrigeracion/activar", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const resultado = await pool.query(`
            UPDATE refrigeracion
            SET temperatura = 3,
            limite_maximo = 3,
    activo = true,
    estado = 'Normal',
    fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = 1
            RETURNING temperatura, limite_maximo, activo, estado
        `);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "No existe información de refrigeración."
            });
        }

        res.json({
            mensaje: "Refrigeración activada correctamente.",
            temperatura: Number(resultado.rows[0].temperatura),
            limiteMaximo: Number(resultado.rows[0].limite_maximo),
            activo: resultado.rows[0].activo,
            estado: resultado.rows[0].estado
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo activar la refrigeración."
        });
    }
});
// ==========================================
// DESACTIVAR REFRIGERACIÓN
// ==========================================

app.put("/api/refrigeracion/desactivar", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const resultado = await pool.query(`
            UPDATE refrigeracion
            SET activo = false,
                estado = 'Normal',
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = 1
            RETURNING temperatura, limite_maximo, activo, estado
        `);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "No existe información de refrigeración."
            });
        }

        res.json({
            mensaje: "Refrigeración desactivada correctamente.",
            temperatura: Number(resultado.rows[0].temperatura),
            limiteMaximo: Number(resultado.rows[0].limite_maximo),
            activo: resultado.rows[0].activo,
            estado: resultado.rows[0].estado
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "No se pudo desactivar la refrigeración."
        });
    }
});
// ==========================================
// REPONER MATERIA PRIMA
// ==========================================

app.put("/api/inventario/:id/reponer", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    try {

        const id = Number(req.params.id);

        const cantidad = Number(req.body.cantidad);


        if (!Number.isInteger(id)) {

            return res.status(400).json({
                mensaje: "ID de materia prima no válido."
            });

        }


        if (!Number.isFinite(cantidad) || cantidad <= 0) {

            return res.status(400).json({
                mensaje: "La cantidad debe ser mayor que 0."
            });

        }


        const resultado = await pool.query(`
            UPDATE inventario
            SET cantidad_gramos =
                cantidad_gramos + $1
            WHERE id = $2
            RETURNING
                id,
                nombre,
                cantidad_gramos,
                minimo_gramos
        `, [
            cantidad,
            id
        ]);


        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Materia prima no encontrada."
            });

        }


        const materia = resultado.rows[0];


        res.json({

            mensaje:
                "Inventario actualizado correctamente.",

            materia: {

                id: materia.id,

                nombre: materia.nombre,

                cantidad:
                    Number(materia.cantidad_gramos),

                minimo:
                    Number(materia.minimo_gramos)

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje:
                "No se pudo actualizar el inventario."

        });

    }

});
async function crearTablaPedidos() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id SERIAL PRIMARY KEY,
            cliente JSONB NOT NULL,
            productos JSONB NOT NULL,
            total NUMERIC NOT NULL,
            estado VARCHAR(50) NOT NULL,
            proceso INTEGER NOT NULL DEFAULT 0,
            guia VARCHAR(30) UNIQUE,
            fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        ALTER TABLE pedidos
        ADD COLUMN IF NOT EXISTS proceso INTEGER NOT NULL DEFAULT 0
    `);

    await pool.query(`
        ALTER TABLE pedidos
        ADD COLUMN IF NOT EXISTS guia VARCHAR(30) UNIQUE
    `);

    console.log("Tabla de pedidos lista.");
}
// ------------------------------------------
// CONSULTAR PEDIDO POR NÚMERO DE GUÍA
// ------------------------------------------

app.get("/api/seguimiento/:guia", async (req, res) => {

    try {

        const { guia } = req.params;

        const resultado = await pool.query(`
            SELECT
                id,
                guia,
                estado,
                proceso,
                fecha
            FROM pedidos
            WHERE UPPER(guia) = UPPER($1)
        `, [guia]);

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                error: "No se encontró ningún pedido con ese número de guía."
            });

        }

        const pedido = resultado.rows[0];

        res.json({
            id: pedido.id,
            guia: pedido.guia,
            estado: pedido.estado,
            proceso: pedido.proceso,
            fecha: pedido.fecha
        });

    } catch (error) {

        console.error(
            "Error consultando seguimiento:",
            error
        );

        res.status(500).json({
            error: "No se pudo consultar el pedido."
        });

    }

});
// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function iniciarServidor() {

    try {

        await crearTablaPedidos();

        await crearTablaInventario();

        await cargarInventarioInicial();

        await crearTablaRefrigeracion();

        app.listen(PORT, "0.0.0.0", () => {

            console.log(
                `Servidor BurguerTech funcionando en http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "No se pudo conectar con PostgreSQL:",
            error
        );

    }

}

iniciarServidor();