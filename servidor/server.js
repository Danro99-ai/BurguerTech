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
// CONSULTAR STOCK DE PRODUCTOS TERMINADOS
// ==========================================

app.get("/api/stock-productos", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const resultado = await pool.query(`
            SELECT
                producto,
                nombre,
                pack,
                peso_gramos,
                cantidad_packs
            FROM stock_productos
            ORDER BY id ASC
        `);

        const stock = resultado.rows.map(item => ({
            producto: item.producto,
            nombre: item.nombre,
            pack: Number(item.pack),
            pesoGramos: Number(item.peso_gramos),
            cantidadPacks: Number(item.cantidad_packs)
        }));

        res.json(stock);

    } catch (error) {

        console.error(
            "Error consultando stock:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudo consultar el stock."
        });

    }

});
// ==========================================
// RESUMEN COMERCIAL DEL ERP
// ==========================================

app.get("/api/resumen-comercial", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const resultado =
            await pool.query(`
                SELECT
                    id,
                    productos,
                    total
                FROM pedidos
                WHERE estado = 'Entregado'
                ORDER BY fecha ASC
            `);

        const pedidos = resultado.rows;

        let ventasRegistradas = pedidos.length;

        let ingresosGenerados = 0;

        let pedidosEntregados = pedidos.length;

        const ventasPorProducto = {
            res: {
                nombre: "Carne de res",
                cantidad: 0
            },

            cerdo: {
                nombre: "Carne de cerdo",
                cantidad: 0
            },

            mixto: {
                nombre: "Medallón mixto",
                cantidad: 0
            }
        };


        pedidos.forEach(pedido => {

            ingresosGenerados += Number(pedido.total);

            pedido.productos.forEach(producto => {

                const cantidadMedallones =
                    Number(producto.pack) *
                    Number(producto.cantidad);

                if (
                    ventasPorProducto[producto.producto]
                ) {

                    ventasPorProducto[
                        producto.producto
                    ].cantidad += cantidadMedallones;

                }

            });

        });


        res.json({

            ventasRegistradas,

            ingresosGenerados,

            pedidosEntregados,

            ventasPorProducto:
                Object.values(ventasPorProducto)

        });

    } catch (error) {

        console.error(
            "Error consultando resumen comercial:",
            error
        );

        res.status(500).json({

            mensaje:
                "No se pudo consultar el resumen comercial."

        });

    }

});
// ==========================================
// DESPACHAR PEDIDO DESDE ERP
// ==========================================

app.put("/api/pedidos/:id/despachar", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            mensaje: "El número de pedido no es válido."
        });
    }

    const cliente = await pool.connect();

    try {

        await cliente.query("BEGIN");

        // Buscar pedido
        const pedidoResultado = await cliente.query(`
            SELECT
                id,
                productos,
                estado
            FROM pedidos
            WHERE id = $1
            FOR UPDATE
        `, [id]);

        if (pedidoResultado.rows.length === 0) {

            await cliente.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pedido no encontrado."
            });
        }

        const pedido =
            pedidoResultado.rows[0];

        // Solo se pueden despachar pedidos pendientes
        if (pedido.estado !== "Pendiente") {

            await cliente.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    "El pedido no está disponible para despacho."
            });
        }

        const productos =
            pedido.productos;

        // ==========================================
        // COMPROBAR TODO EL STOCK ANTES DE DESCONTAR
        // ==========================================

        for (const producto of productos) {

            const cantidadNecesaria =
                Number(producto.pack) *
                Number(producto.cantidad);

            const stockResultado =
    await cliente.query(`
        SELECT
            producto,
            nombre,
            pack,
            cantidad_packs
        FROM stock_productos
        WHERE producto = $1
          AND pack = $2
        FOR UPDATE
    `, [
        producto.producto,
        Number(producto.pack)
    ]);

            if (stockResultado.rows.length === 0) {

                await cliente.query("ROLLBACK");

                return res.status(400).json({
                    mensaje:
                        `No existe stock configurado para ${producto.nombre}.`
                });
            }

            const stock =
    Number(
        stockResultado.rows[0]
            .cantidad_packs
    );

const paquetesNecesarios =
    Number(producto.cantidad);

if (stock < paquetesNecesarios) {

                await cliente.query("ROLLBACK");

                return res.status(400).json({
                    mensaje:
    `Stock insuficiente de ${producto.nombre} Pack x${producto.pack}. ` +
    `Disponible: ${stock} paquetes. ` +
    `Necesario: ${paquetesNecesarios} paquetes.`
                });
            }
        }

        // ==========================================
        // DESCONTAR STOCK
        // ==========================================

        for (const producto of productos) {

            const cantidadNecesaria =
                Number(producto.pack) *
                Number(producto.cantidad);

           await cliente.query(`
    UPDATE stock_productos
    SET cantidad_packs =
        cantidad_packs - $1
    WHERE producto = $2
      AND pack = $3
`, [
    Number(producto.cantidad),
    producto.producto,
    Number(producto.pack)
]);
        }

        // ==========================================
        // ACTUALIZAR ESTADO DEL PEDIDO
        // ==========================================

        const pedidoActualizado =
            await cliente.query(`
                UPDATE pedidos
SET estado = 'Entregado'
WHERE id = $1
                RETURNING id, estado
            `, [id]);

        await cliente.query("COMMIT");

        res.json({
            mensaje:
                "Pedido despachado correctamente.",
            pedido:
                pedidoActualizado.rows[0]
        });

    } catch (error) {

        await cliente.query("ROLLBACK");

        console.error(
            "Error despachando pedido:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudo despachar el pedido."
        });

    } finally {

        cliente.release();

    }

});
// ==========================================
// CREAR ORDEN DE PRODUCCIÓN PARA MES
// ==========================================

app.post("/api/ordenes-produccion", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    const {
    producto,
    nombre,
    cantidad,
    pack,
    cantidadPacks
} = req.body;

    const cantidadMedallones =
    Number(cantidad);

const packNumero =
    Number(pack);

const cantidadPacksNumero =
    Number(cantidadPacks);

    if (!producto || !nombre) {
        return res.status(400).json({
            mensaje: "Faltan datos del producto."
        });
    }

    if (
        !Number.isInteger(cantidadMedallones) ||
        cantidadMedallones <= 0
    ) {
        return res.status(400).json({
            mensaje: "La cantidad de medallones no es válida."
        });
    }
    if (
    !Number.isInteger(packNumero) ||
    ![2, 4, 6, 8].includes(packNumero)
) {
    return res.status(400).json({
        mensaje: "La presentación Pack no es válida."
    });
}

if (
    !Number.isInteger(cantidadPacksNumero) ||
    cantidadPacksNumero <= 0
) {
    return res.status(400).json({
        mensaje: "La cantidad de paquetes no es válida."
    });
}

    try {

        const resultado = await pool.query(`
            INSERT INTO ordenes_produccion
(
    producto,
    nombre,
    cantidad_medallones,
    pack,
    cantidad_packs,
    estado
)
VALUES ($1, $2, $3, $4, $5, 'Pendiente')
            RETURNING
                id,
                producto,
                nombre,
                cantidad_medallones,
                estado,
                fecha
        `, [
    producto,
    nombre,
    cantidadMedallones,
    packNumero,
    cantidadPacksNumero
]);

        res.status(201).json({
            mensaje: "Orden de producción creada correctamente.",
            orden: resultado.rows[0]
        });

    } catch (error) {

        console.error(
            "Error creando orden de producción:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudo crear la orden de producción."
        });

    }

});
// ==========================================
// CONSULTAR ÓRDENES DE PRODUCCIÓN PARA MES
// ==========================================

app.get("/api/ordenes-produccion", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    try {

        const resultado = await pool.query(`
    SELECT
        op.id,
        op.producto,
        op.nombre,
        op.cantidad_medallones,
        op.estado,
        op.fecha,
        lp.codigo_lote
    FROM ordenes_produccion op
    LEFT JOIN lotes_produccion lp
        ON lp.id_orden_produccion = op.id
    WHERE op.estado NOT IN (
        'Producción terminada'
    )
    ORDER BY op.id ASC
`);

        res.json(resultado.rows);

    } catch (error) {

        console.error(
            "Error consultando órdenes de producción:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudieron consultar las órdenes de producción."
        });

    }

});
// ==========================================
// TRAZABILIDAD DE PRODUCCIÓN POR CÓDIGO DE LOTE
// ==========================================

app.get("/api/lotes-produccion/trazabilidad/:codigo", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No autorizado."
        });
    }

    const codigo = req.params.codigo.trim();

    if (!codigo) {
        return res.status(400).json({
            mensaje: "Debes ingresar un código de lote."
        });
    }

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                codigo_lote,
                id_orden_produccion,
                producto,
                nombre,
                cantidad_medallones,
                pack,
                cantidad_packs,
                fecha_inicio,
                estado,
                proceso,
                stock_actualizado
            FROM lotes_produccion
            WHERE codigo_lote = $1
        `, [codigo]);

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "No se encontró un lote con ese código."
            });

        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(
            "Error consultando trazabilidad del lote:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudo consultar la trazabilidad del lote."
        });

    }

});

app.get("/api/lotes-produccion", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No autorizado."
        });
    }

    try {

        const resultado = await pool.query(`
    SELECT
        id,
        codigo_lote,
        id_orden_produccion,
        producto,
        nombre,
        cantidad_medallones,
        pack,
        cantidad_packs,
        fecha_inicio,
        estado,
        proceso,
        stock_actualizado
    FROM lotes_produccion
    WHERE estado NOT IN (
        'Producción reportada',
        'Stock actualizado'
    )
    ORDER BY id ASC
`);

        res.json(resultado.rows);

    } catch (error) {

        console.error(
            "Error obteniendo lotes de producción:",
            error
        );

        res.status(500).json({
            mensaje: "Error al obtener los lotes de producción."
        });

    }

});
// ==========================================
// ACTUALIZAR PROCESO DEL LOTE
// ==========================================

app.put("/api/lotes-produccion/:id/proceso", async (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "No autorizado."
        });

    }

    try {

        const id =
            Number(req.params.id);

        const proceso =
            Number(req.body.proceso);

        // ==========================================
        // VALIDAR ID
        // ==========================================

        if (!Number.isInteger(id) || id <= 0) {

            return res.status(400).json({
                mensaje: "ID de lote no válido."
            });

        }

        // ==========================================
        // VALIDAR PROCESO
        // ==========================================

        if (
            !Number.isInteger(proceso) ||
            proceso < 0 ||
            proceso > 7
        ) {

            return res.status(400).json({
                mensaje: "Etapa de proceso no válida."
            });

        }

        // ==========================================
        // ACTUALIZAR LOTE
        // ==========================================

        const resultado = await pool.query(`
            UPDATE lotes_produccion
            SET proceso = $1
            WHERE id = $2
            RETURNING
                id,
                codigo_lote,
                producto,
                nombre,
                cantidad_medallones,
                proceso,
                estado
        `, [
            proceso,
            id
        ]);

        // ==========================================
        // LOTE NO ENCONTRADO
        // ==========================================

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Lote de producción no encontrado."
            });

        }

        // ==========================================
        // RESPUESTA
        // ==========================================

        res.json({

            mensaje:
                "Proceso del lote actualizado correctamente.",

            lote:
                resultado.rows[0]

        });

    } catch (error) {

        console.error(
            "Error actualizando proceso del lote:",
            error
        );

        res.status(500).json({

            mensaje:
                "No se pudo actualizar el proceso del lote."

        });

    }

});
// ==========================================
// REPORTAR PRODUCCIÓN TERMINADA A MES
// ==========================================

app.put("/api/lotes-produccion/:id/reportar-mes", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No autorizado."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: "ID de lote no válido."
        });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // ==========================================
        // BUSCAR Y BLOQUEAR EL LOTE
        // ==========================================

        const loteResult = await client.query(`
    SELECT
        id,
        codigo_lote,
        id_orden_produccion,
        producto,
        nombre,
        cantidad_medallones,
        pack,
        cantidad_packs,
        estado,
        proceso,
        stock_actualizado
    FROM lotes_produccion
    WHERE id = $1
    FOR UPDATE
`, [id]);

        if (loteResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Lote de producción no encontrado."
            });
        }

        const lote = loteResult.rows[0];

        const pack = Number(lote.pack);
const cantidadPacks = Number(lote.cantidad_packs);

if (
    !Number.isInteger(pack) ||
    ![2, 4, 6, 8].includes(pack)
) {
    await client.query("ROLLBACK");

    return res.status(400).json({
        mensaje: "La presentación del lote no es válida."
    });
}

if (
    !Number.isInteger(cantidadPacks) ||
    cantidadPacks <= 0
) {
    await client.query("ROLLBACK");

    return res.status(400).json({
        mensaje: "La cantidad de packs del lote no es válida."
    });
}


        // ==========================================
        // VERIFICAR QUE LA PRODUCCIÓN TERMINÓ
        // ==========================================

        if (Number(lote.proceso) !== 7) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    "La producción todavía no ha terminado."
            });
        }

        // ==========================================
        // EVITAR REPORTAR DOS VECES
        // ==========================================

        if (lote.estado === "Producción reportada") {

            await client.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    "Esta producción ya fue reportada a MES."
            });
        }

        // ==========================================
        // ACTUALIZAR ESTADO DEL LOTE
        // ==========================================

        const loteActualizado = await client.query(`
            UPDATE lotes_produccion
            SET estado = 'Producción reportada'
            WHERE id = $1
            RETURNING
                id,
                codigo_lote,
                id_orden_produccion,
                producto,
                nombre,
                cantidad_medallones,
                pack,
                cantidad_packs,
                fecha_inicio,
                estado,
                proceso,
                stock_actualizado
        `, [id]);

        // ==========================================
        // ACTUALIZAR ORDEN DE PRODUCCIÓN
        // ==========================================

        await client.query(`
            UPDATE ordenes_produccion
            SET estado = 'Producción terminada'
            WHERE id = $1
        `, [lote.id_orden_produccion]);

        await client.query("COMMIT");

        res.json({
            mensaje:
                "Producción reportada a MES correctamente.",
            lote:
                loteActualizado.rows[0]
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Error reportando producción a MES:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudo reportar la producción a MES."
        });

    } finally {

        client.release();

    }

});
// ==========================================
// LOTES DE PRODUCCIÓN REPORTADOS A MES
// ==========================================

app.get("/api/lotes-produccion/reportados-mes", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No autorizado."
        });
    }

    try {

        const resultado = await pool.query(`
    SELECT
        lp.id,
        lp.codigo_lote,
        lp.producto,
        lp.nombre,

        COALESCE(lp.pack, op.pack) AS pack,

        COALESCE(
            lp.cantidad_packs,
            op.cantidad_packs
        ) AS cantidad_packs,

        lp.cantidad_medallones,
        lp.fecha_inicio,
        lp.estado,
        lp.proceso,
        lp.stock_actualizado

    FROM lotes_produccion lp

    LEFT JOIN ordenes_produccion op
        ON op.id = lp.id_orden_produccion

    WHERE lp.estado IN (
        'Producción reportada',
        'Stock actualizado'
    )

    ORDER BY lp.id DESC
`);

        res.json(resultado.rows);

    } catch (error) {

        console.error(
            "Error cargando lotes reportados a MES:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudieron cargar las producciones terminadas."
        });
    }
});
// ACTUALIZAR STOCK DESDE MES
app.put("/api/lotes-produccion/:id/actualizar-stock", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No autorizado."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: "ID de lote no válido."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Buscar el lote y bloquearlo para evitar actualizaciones duplicadas
        const loteResult = await client.query(`
    SELECT
        id,
        codigo_lote,
        id_orden_produccion,
        producto,
        nombre,
        pack,
        cantidad_packs,
        estado,
        stock_actualizado
    FROM lotes_produccion
    WHERE id = $1
    FOR UPDATE
`, [id]);
        if (loteResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Lote de producción no encontrado."
            });
        }

        const lote = loteResult.rows[0];

        // El lote debe haber terminado producción y haber sido reportado a MES
        if (lote.estado !== "Producción reportada") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "Este lote todavía no está reportado a MES."
            });
        }

        // Evitar que el mismo lote incremente el stock dos veces
        if (lote.stock_actualizado === true) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "El stock de este lote ya fue actualizado."
            });
        }

        const pack = Number(lote.pack);
        const cantidadPacks = Number(lote.cantidad_packs);

        if (!Number.isInteger(pack) || pack <= 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "El lote no tiene un pack válido."
            });
        }

        if (!Number.isInteger(cantidadPacks) || cantidadPacks <= 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                error: "El lote no tiene una cantidad de packs válida."
            });
        }

        // Buscar el producto correspondiente en el stock
        const stockResult = await client.query(`
            SELECT
                id,
                producto,
                nombre,
                pack,
                cantidad_packs
            FROM stock_productos
            WHERE producto = $1
              AND pack = $2
            FOR UPDATE
        `, [lote.producto, pack]);

        if (stockResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: `No existe stock configurado para ${lote.producto} Pack x${pack}.`
            });
        }

        const stock = stockResult.rows[0];

        // Sumar los packs producidos al stock existente
        const stockActualizado = await client.query(`
            UPDATE stock_productos
            SET cantidad_packs = cantidad_packs + $1
            WHERE id = $2
            RETURNING
                producto,
                nombre,
                pack,
                cantidad_packs
        `, [cantidadPacks, stock.id]);

        // Marcar el lote como actualizado
        const loteActualizado = await client.query(`
            UPDATE lotes_produccion
            SET
                stock_actualizado = TRUE,
                estado = 'Stock actualizado'
            WHERE id = $1
            RETURNING
                id,
                codigo_lote,
                producto,
                nombre,
                pack,
                cantidad_packs,
                estado,
                stock_actualizado
        `, [id]);
        // ==========================================
// ELIMINAR ORDEN DE PRODUCCIÓN COMPLETADA
// ==========================================

await client.query(`
    DELETE FROM ordenes_produccion
    WHERE id = $1
`, [
    lote.id_orden_produccion
]);

        await client.query("COMMIT");

        const stockFinal = stockActualizado.rows[0];
        const loteFinal = loteActualizado.rows[0];

        res.json({
            mensaje: "Stock actualizado correctamente.",

            stock: {
                producto: stockFinal.producto,
                nombre: stockFinal.nombre,
                pack: Number(stockFinal.pack),
                cantidadPacks: Number(stockFinal.cantidad_packs)
            },

            lote: {
                id: loteFinal.id,
                codigoLote: loteFinal.codigo_lote,
                producto: loteFinal.producto,
                nombre: loteFinal.nombre,
                pack: Number(loteFinal.pack),
                cantidadPacks: Number(loteFinal.cantidad_packs),
                estado: loteFinal.estado,
                stockActualizado: loteFinal.stock_actualizado
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error actualizando stock desde MES:", error);

        res.status(500).json({
            error: "Error al actualizar el stock."
        });

    } finally {
        client.release();
    }
});
// ==========================================
// CREAR SOLICITUD DE COMPRA
// ==========================================

app.post("/api/solicitudes-compra", async (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    const {
        idOrdenProduccion
    } = req.body;

    const idOrden = Number(idOrdenProduccion);

    if (!Number.isInteger(idOrden) || idOrden <= 0) {

        return res.status(400).json({
            mensaje: "ID de orden de producción no válido."
        });

    }

    try {

        // Buscar la orden de producción
        const resultadoOrden = await pool.query(`
            SELECT
                id,
                producto,
                nombre,
                cantidad_medallones,
                estado
            FROM ordenes_produccion
            WHERE id = $1
        `, [idOrden]);

        if (resultadoOrden.rows.length === 0) {

            return res.status(404).json({
                mensaje: "No se encontró la orden de producción."
            });

        }

        const orden = resultadoOrden.rows[0];

        // Obtener las materias primas necesarias
        const formulacion =
            formulaciones[orden.producto];

        if (!formulacion) {

            return res.status(400).json({
                mensaje:
                    "No existe una formulación para este producto."
            });

        }

        const gramosTotales =
            Number(orden.cantidad_medallones) * 100;

        // Crear una solicitud por cada materia prima insuficiente
        for (const [materia, porcentaje] of Object.entries(formulacion)) {

            const necesaria =
                gramosTotales *
                Number(porcentaje) /
                100;

            const resultadoInventario =
                await pool.query(`
                    SELECT
                        id,
                        cantidad_gramos
                    FROM inventario
                    WHERE nombre = $1
                `, [materia]);

            const disponible =
                resultadoInventario.rows.length > 0
                    ? Number(
                        resultadoInventario.rows[0].cantidad_gramos
                    )
                    : 0;

            const faltante =
                necesaria - disponible;

            if (faltante > 0) {

    // Verificar si ya existe una solicitud pendiente
    // para esta orden y esta materia prima
    const solicitudExistente = await pool.query(`
        SELECT id
        FROM solicitudes_compra
        WHERE id_orden_produccion = $1
          AND materia_prima = $2
          AND estado = 'Pendiente'
        LIMIT 1
    `, [
        idOrden,
        materia
    ]);

    // Solo crear la solicitud si no existe
    if (solicitudExistente.rows.length === 0) {

        await pool.query(`
            INSERT INTO solicitudes_compra
            (
                id_orden_produccion,
                materia_prima,
                cantidad_faltante_gramos,
                estado
            )
            VALUES ($1, $2, $3, 'Pendiente')
        `, [
            idOrden,
            materia,
            faltante
        ]);

    }

}

        }

        res.status(201).json({
            mensaje:
                "Solicitud de compra registrada correctamente."
        });

    } catch (error) {

        console.error(
            "Error creando solicitud de compra:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudo crear la solicitud de compra."
        });

    }

});
// ==========================================
// CONSULTAR SOLICITUDES DE COMPRA
// ==========================================

app.get("/api/solicitudes-compra", async (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                id_orden_produccion,
                materia_prima,
                cantidad_faltante_gramos,
                estado,
                fecha
            FROM solicitudes_compra
            ORDER BY id DESC
        `);

        res.json(
            resultado.rows.map(solicitud => ({
                id: solicitud.id,
                idOrdenProduccion: solicitud.id_orden_produccion,
                materiaPrima: solicitud.materia_prima,
                cantidadFaltante: Number(
                    solicitud.cantidad_faltante_gramos
                ),
                estado: solicitud.estado,
                fecha: new Date(
                    solicitud.fecha
                ).toLocaleString("es-CO")
            }))
        );

    } catch (error) {

        console.error(
            "Error consultando solicitudes de compra:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudieron consultar las solicitudes de compra."
        });

    }

});
// ==========================================
// REGISTRAR RECEPCIÓN DE COMPRA
// ==========================================

app.put("/api/solicitudes-compra/:id/recibir", async (req, res) => {

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    const idSolicitud =
        Number(req.params.id);

    const cantidadRecibida =
        Number(req.body.cantidad);

    if (
        !Number.isInteger(idSolicitud) ||
        idSolicitud <= 0
    ) {

        return res.status(400).json({
            mensaje: "ID de solicitud no válido."
        });

    }

    if (
        !Number.isFinite(cantidadRecibida) ||
        cantidadRecibida <= 0
    ) {

        return res.status(400).json({
            mensaje:
                "La cantidad recibida debe ser mayor que cero."
        });

    }

    const cliente = await pool.connect();

    try {

        await cliente.query("BEGIN");

        // Buscar y bloquear la solicitud
        const resultadoSolicitud =
            await cliente.query(`
                SELECT
                    id,
                    materia_prima,
                    cantidad_faltante_gramos,
                    estado
                FROM solicitudes_compra
                WHERE id = $1
                FOR UPDATE
            `, [idSolicitud]);

        if (resultadoSolicitud.rows.length === 0) {

            await cliente.query("ROLLBACK");

            return res.status(404).json({
                mensaje:
                    "No se encontró la solicitud de compra."
            });

        }

        const solicitud =
            resultadoSolicitud.rows[0];

        if (solicitud.estado !== "Pendiente") {

            await cliente.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    "Esta solicitud ya fue recibida."
            });

        }

        // Buscar la materia prima en inventario
        const resultadoInventario =
            await cliente.query(`
                SELECT
                    id,
                    nombre,
                    cantidad_gramos
                FROM inventario
                WHERE nombre = $1
                FOR UPDATE
            `, [solicitud.materia_prima]);

        if (resultadoInventario.rows.length === 0) {

            await cliente.query("ROLLBACK");

            return res.status(404).json({
                mensaje:
                    "La materia prima no existe en el inventario."
            });

        }

        // Actualizar inventario
        const resultadoActualizacion =
            await cliente.query(`
                UPDATE inventario
                SET cantidad_gramos =
                    cantidad_gramos + $1
                WHERE id = $2
                RETURNING
                    id,
                    nombre,
                    cantidad_gramos
            `, [
                cantidadRecibida,
                resultadoInventario.rows[0].id
            ]);

        // Marcar solicitud como recibida
        await cliente.query(`
            UPDATE solicitudes_compra
            SET estado = 'Recibida'
            WHERE id = $1
        `, [idSolicitud]);

        await cliente.query("COMMIT");

        res.json({
            mensaje:
                "Recepción registrada correctamente.",
            solicitud: {
                id: idSolicitud,
                materiaPrima:
                    solicitud.materia_prima,
                cantidadRecibida:
                    cantidadRecibida,
                estado: "Recibida"
            },
            inventario: {
                nombre:
                    resultadoActualizacion.rows[0].nombre,
                cantidad:
                    Number(
                        resultadoActualizacion.rows[0]
                            .cantidad_gramos
                    )
            }
        });

    } catch (error) {

        await cliente.query("ROLLBACK");

        console.error(
            "Error registrando recepción de compra:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudo registrar la recepción."
        });

    } finally {

        cliente.release();

    }

});
// ==========================================
// INICIAR PRODUCCIÓN DESDE MES
// ==========================================

app.put("/api/ordenes-produccion/:id/iniciar", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });
    }

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: "La orden no es válida."
        });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // ==========================================
        // OBTENER Y BLOQUEAR LA ORDEN
        // ==========================================

        const resultadoOrden = await client.query(`
            SELECT
    id,
    producto,
    nombre,
    cantidad_medallones,
    pack,
    cantidad_packs,
    estado
FROM ordenes_produccion
WHERE id = $1
FOR UPDATE
        `, [id]);


        if (resultadoOrden.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Orden de producción no encontrada."
            });

        }


        const orden = resultadoOrden.rows[0];


        // ==========================================
        // VERIFICAR ESTADO
        // ==========================================

        if (orden.estado !== "Pendiente") {

            await client.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    `La orden ya está en estado "${orden.estado}".`
            });

        }


        // ==========================================
        // CALCULAR MATERIAS PRIMAS
        // ==========================================

        const gramosTotales =
            Number(orden.cantidad_medallones) * 100;

        const formulacion =
            formulaciones[orden.producto];


        if (!formulacion) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                mensaje:
                    "No existe una formulación para este producto."
            });

        }


        const consumo = {};


        Object.entries(formulacion).forEach(
            ([materia, porcentaje]) => {

                consumo[materia] =
                    gramosTotales *
                    Number(porcentaje) /
                    100;

            }
        );


        // ==========================================
        // COMPROBAR INVENTARIO
        // ==========================================

        for (const materia in consumo) {

            const resultadoInventario =
                await client.query(`
                    SELECT
                        cantidad_gramos
                    FROM inventario
                    WHERE nombre = $1
                    FOR UPDATE
                `, [materia]);


            if (resultadoInventario.rows.length === 0) {

                throw new Error(
                    `No existe la materia prima: ${materia}.`
                );

            }


            const disponible =
                Number(
                    resultadoInventario
                        .rows[0]
                        .cantidad_gramos
                );


            if (disponible < consumo[materia]) {

                throw new Error(
                    `Inventario insuficiente de ${materia}.`
                );

            }

        }


        // ==========================================
        // DESCONTAR INVENTARIO
        // ==========================================

        for (const materia in consumo) {

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


        // ==========================================
        // CAMBIAR ESTADO DE LA ORDEN
        // ==========================================

        const resultado =
            await client.query(`
                UPDATE ordenes_produccion
                SET estado = 'En producción'
                WHERE id = $1
                RETURNING
                    id,
                    producto,
                    nombre,
                    cantidad_medallones,
                    estado,
                    fecha
            `, [id]);


        // ==========================================
// REGISTRAR LOTE DE PRODUCCIÓN
// ==========================================

const fechaLote = new Date();

const codigoLote =
    `LT-OP${orden.id}-` +
    `${fechaLote.getFullYear()}` +
    `${String(fechaLote.getMonth() + 1).padStart(2, "0")}` +
    `${String(fechaLote.getDate()).padStart(2, "0")}-` +
    `${String(fechaLote.getHours()).padStart(2, "0")}` +
    `${String(fechaLote.getMinutes()).padStart(2, "0")}` +
    `${String(fechaLote.getSeconds()).padStart(2, "0")}`;

const resultadoLote =
    await client.query(`
        INSERT INTO lotes_produccion
        (
            codigo_lote,
            id_orden_produccion,
            producto,
            nombre,
            cantidad_medallones,
            pack,
            cantidad_packs,
            estado
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, 'En producción')
        RETURNING
            id,
            codigo_lote,
            id_orden_produccion,
            producto,
            nombre,
            cantidad_medallones,
            pack,
            cantidad_packs,
            fecha_inicio,
            estado
    `, [
        codigoLote,
        orden.id,
        orden.producto,
        orden.nombre,
        orden.cantidad_medallones,
        orden.pack,
        orden.cantidad_packs
    ]);

await client.query("COMMIT");

res.json({
    mensaje:
        "Producción iniciada correctamente.",
    orden: resultado.rows[0],
    lote: resultadoLote.rows[0]
});


    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Error iniciando producción:",
            error
        );

        res.status(400).json({
            mensaje:
                error.message ||
                "No se pudo iniciar la producción."
        });

    } finally {

        client.release();

    }

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
                guia,
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

            guia: pedido.guia,

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

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    const client = await pool.connect();

    try {

        const id =
            Number(req.params.id);

        const nuevoEstado =
            req.body.estado;


        const estadosPermitidos = [

            "Pendiente",
            "Autorizado para MES",
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
                mensaje: "Estado no válido."
            });

        }


        await client.query("BEGIN");


        // ==========================================
        // OBTENER PEDIDO
        // ==========================================

        const resultadoPedido =
            await client.query(`
                SELECT
                    id,
                    cliente,
                    productos,
                    total,
                    estado,
                    proceso,
                    guia,
                    fecha,
                    inventario_descontado
                FROM pedidos
                WHERE id = $1
                FOR UPDATE
            `, [id]);


        if (resultadoPedido.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pedido no encontrado."
            });

        }


        const pedido =
            resultadoPedido.rows[0];


        // ==========================================
        // DESCONTAR INVENTARIO AL INICIAR PRODUCCIÓN
        // ==========================================

        if (
            nuevoEstado === "En preparación" &&
            !pedido.inventario_descontado
        ) {

            const consumo = {};


            pedido.productos.forEach(producto => {

                const medallones =
                    Number(producto.pack) *
                    Number(producto.cantidad);

                const gramosTotales =
                    medallones * 100;

                const formulacion =
                    formulaciones[producto.producto];


                if (!formulacion) {
                    throw new Error(
                        `No existe formulación para ${producto.producto}.`
                    );
                }


                Object.entries(formulacion).forEach(
                    ([materia, porcentaje]) => {

                        const gramos =
                            gramosTotales *
                            Number(porcentaje) /
                            100;


                        if (!consumo[materia]) {
                            consumo[materia] = 0;
                        }


                        consumo[materia] +=
                            gramos;

                    }
                );

            });


            // ==========================================
            // COMPROBAR INVENTARIO
            // ==========================================

            for (
                const materia in consumo
            ) {

                const resultadoInventario =
                    await client.query(`
                        SELECT
                            cantidad_gramos
                        FROM inventario
                        WHERE nombre = $1
                        FOR UPDATE
                    `, [materia]);


                if (
                    resultadoInventario.rows.length === 0
                ) {

                    throw new Error(
                        `No existe la materia prima ${materia}.`
                    );

                }


                const disponible =
                    Number(
                        resultadoInventario
                            .rows[0]
                            .cantidad_gramos
                    );


                if (
                    disponible <
                    consumo[materia]
                ) {

                    throw new Error(
                        `Inventario insuficiente de ${materia}.`
                    );

                }

            }


            // ==========================================
            // DESCONTAR INVENTARIO
            // ==========================================

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


            // Marcar inventario como descontado

            await client.query(`
                UPDATE pedidos
                SET
                    inventario_descontado = TRUE
                WHERE id = $1
            `, [id]);

        }


        // ==========================================
        // ACTUALIZAR ESTADO
        // ==========================================

        const resultado =
            await client.query(`
                UPDATE pedidos
                SET estado = $1
                WHERE id = $2
                RETURNING
                    id,
                    cliente,
                    productos,
                    total,
                    estado,
                    proceso,
                    guia,
                    fecha,
                    inventario_descontado
            `, [
                nuevoEstado,
                id
            ]);


        await client.query("COMMIT");


        const pedidoActualizado =
            resultado.rows[0];


        const pedidoRespuesta = {

            id: pedidoActualizado.id,

            cliente:
                pedidoActualizado.cliente,

            productos:
                pedidoActualizado.productos,

            total:
                Number(
                    pedidoActualizado.total
                ),

            estado:
                pedidoActualizado.estado,

            proceso:
                pedidoActualizado.proceso,

            guia:
                pedidoActualizado.guia,

            inventario_descontado:
                pedidoActualizado
                    .inventario_descontado,

            fecha:
                new Date(
                    pedidoActualizado.fecha
                ).toLocaleString("es-CO")

        };


        res.json({

            mensaje:
                "Estado actualizado correctamente",

            pedido:
                pedidoRespuesta

        });


    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Error cambiando estado del pedido:",
            error
        );


        res.status(500).json({

            mensaje:
                error.message ||
                "No se pudo actualizar el estado."

        });


    } finally {

        client.release();

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

        if (!Number.isInteger(id)) {

            return res.status(400).json({
                mensaje: "ID de pedido no válido."
            });

        }

        if (
            !Number.isInteger(proceso) ||
            proceso < 0 ||
            proceso > 7
        ) {

            return res.status(400).json({
                mensaje: "Proceso no válido."
            });

        }

        const resultado = await pool.query(`
            UPDATE pedidos
            SET proceso = $1
            WHERE id = $2
            RETURNING
                id,
                proceso,
                estado
        `, [
            proceso,
            id
        ]);

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "Pedido no encontrado."
            });

        }

        res.json({

            mensaje:
                "Proceso actualizado correctamente.",

            pedido: {
                id: resultado.rows[0].id,
                proceso: resultado.rows[0].proceso,
                estado: resultado.rows[0].estado
            }

        });

    } catch (error) {

        console.error(
            "Error actualizando proceso:",
            error
        );

        res.status(500).json({

            mensaje:
                "No se pudo actualizar el proceso."

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
        productos,
        inventario_descontado
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
        if (!pedido.inventario_descontado) {
    // El pedido nunca descontó inventario,
    // por lo tanto no se debe devolver materia prima.
}

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
// SOLO SI EL INVENTARIO FUE DESCONTADO
// ------------------------------------------

if (pedido.inventario_descontado) {

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
// OBTENER CLIENTES
// ==========================================

app.get("/api/clientes", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    try {

        const resultado = await pool.query(`
            SELECT
                cliente,
                fecha
            FROM pedidos
            ORDER BY fecha DESC
        `);

        const clientesMap = new Map();

        resultado.rows.forEach(pedido => {

            const cliente = pedido.cliente;

            const telefono =
                String(cliente.telefono || "").trim();

            if (!telefono) {
                return;
            }

            if (!clientesMap.has(telefono)) {

                clientesMap.set(telefono, {
                    nombre: cliente.nombre,
                    telefono: telefono,
                    direccion: cliente.direccion,
                    observaciones:
                        cliente.observaciones || "",
                    pedidos: 0,
                    ultimoPedido: pedido.fecha
                });

            }

            const clienteActual =
                clientesMap.get(telefono);

            clienteActual.pedidos++;

        });

        const clientes =
            Array.from(clientesMap.values()).map(cliente => ({

                nombre: cliente.nombre,

                telefono: cliente.telefono,

                direccion: cliente.direccion,

                observaciones:
                    cliente.observaciones,

                pedidos:
                    cliente.pedidos,

                ultimoPedido:
                    new Date(cliente.ultimoPedido)
                        .toLocaleString("es-CO")

            }));

        res.json(clientes);

    } catch (error) {

        console.error(
            "Error obteniendo clientes:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudieron cargar los clientes."
        });

    }

});
// ==========================================
// OBTENER PEDIDOS DE UN CLIENTE
// ==========================================

app.get("/api/clientes/:telefono/pedidos", async (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({
            mensaje: "Debes iniciar sesión."
        });

    }

    try {

        const { telefono } = req.params;

        const resultado = await pool.query(`
            SELECT
                id,
                cliente,
                productos,
                total,
                estado,
                proceso,
                guia,
                fecha
            FROM pedidos
            WHERE cliente->>'telefono' = $1
            ORDER BY fecha DESC
        `, [
            telefono
        ]);

        const pedidos = resultado.rows.map(pedido => ({

            id: pedido.id,

            cliente: pedido.cliente,

            productos: pedido.productos,

            total: Number(pedido.total),

            estado: pedido.estado,

            proceso: pedido.proceso,

            guia: pedido.guia,

            fecha:
                new Date(pedido.fecha)
                    .toLocaleString("es-CO")

        }));

        res.json(pedidos);

    } catch (error) {

        console.error(
            "Error obteniendo pedidos del cliente:",
            error
        );

        res.status(500).json({
            mensaje:
                "No se pudieron cargar los pedidos del cliente."
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
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    inventario_descontado BOOLEAN NOT NULL DEFAULT false
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

    await pool.query(`
    ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS inventario_descontado BOOLEAN
`);

await pool.query(`
    UPDATE pedidos
    SET inventario_descontado = TRUE
    WHERE inventario_descontado IS NULL
`);

await pool.query(`
    ALTER TABLE pedidos
    ALTER COLUMN inventario_descontado SET DEFAULT FALSE
`);

await pool.query(`
    ALTER TABLE pedidos
    ALTER COLUMN inventario_descontado SET NOT NULL
`);
    console.log("Tabla de pedidos lista.");
}
// ==========================================
// TABLA DE ÓRDENES DE PRODUCCIÓN
// ==========================================

async function crearTablaOrdenesProduccion() {

    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ordenes_produccion (
                id SERIAL PRIMARY KEY,
                producto VARCHAR(20) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                cantidad_medallones INTEGER NOT NULL,
                estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
                fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`
    ALTER TABLE ordenes_produccion
    ADD COLUMN IF NOT EXISTS pack INTEGER
`);

await pool.query(`
    ALTER TABLE ordenes_produccion
    ADD COLUMN IF NOT EXISTS cantidad_packs INTEGER
`);

        console.log(
            "Tabla de órdenes de producción lista."
        );

    } catch (error) {

        console.error(
            "Error creando tabla de órdenes de producción:",
            error
        );

    }
}
// ==========================================
// TABLA DE SOLICITUDES DE COMPRA
// ==========================================

async function crearTablaSolicitudesCompra() {

    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS solicitudes_compra (
                id SERIAL PRIMARY KEY,
                id_orden_produccion INTEGER,
                materia_prima VARCHAR(100) NOT NULL,
                cantidad_faltante_gramos NUMERIC NOT NULL,
                estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
                fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Tabla de solicitudes de compra lista.");

    } catch (error) {

        console.error(
            "Error creando tabla solicitudes_compra:",
            error
        );

    }

}
// ==========================================
// CREAR STOCK INICIAL DE PRODUCTOS TERMINADOS
// ==========================================

async function crearTablaStockProductos() {

    try {

        // ==========================================
        // CREAR TABLA
        // ==========================================

        await pool.query(`
            CREATE TABLE IF NOT EXISTS stock_productos (

                id SERIAL PRIMARY KEY,

                producto VARCHAR(20) NOT NULL,

                nombre VARCHAR(100) NOT NULL,

                pack INTEGER NOT NULL,

                peso_gramos INTEGER NOT NULL,

                cantidad_packs INTEGER NOT NULL DEFAULT 0,

                UNIQUE (producto, pack)

            )
        `);


        // ==========================================
        // ASEGURAR COLUMNAS
        // ==========================================

        await pool.query(`
            ALTER TABLE stock_productos
            ADD COLUMN IF NOT EXISTS pack INTEGER
        `);

        await pool.query(`
            ALTER TABLE stock_productos
            ADD COLUMN IF NOT EXISTS peso_gramos INTEGER
        `);

        await pool.query(`
            ALTER TABLE stock_productos
            ADD COLUMN IF NOT EXISTS cantidad_packs INTEGER
        `);


        // ==========================================
        // ELIMINAR RESTRICCIÓN ANTIGUA
        // ==========================================

        await pool.query(`
            ALTER TABLE stock_productos
            DROP CONSTRAINT IF EXISTS stock_productos_producto_key
        `);


        // ==========================================
        // CREAR ÍNDICE ÚNICO
        // producto + presentación
        // ==========================================

        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_stock_productos_producto_pack
            ON stock_productos (producto, pack)
        `);


        // ==========================================
        // CONVERTIR STOCK ANTIGUO
        // res_x2  -> res
        // res_x4  -> res
        // etc.
        // ==========================================

        await pool.query(`
            UPDATE stock_productos
            SET producto = 'res'
            WHERE producto IN (
                'res_x2',
                'res_x4',
                'res_x6',
                'res_x8'
            )
        `);


        await pool.query(`
            UPDATE stock_productos
            SET producto = 'cerdo'
            WHERE producto IN (
                'cerdo_x2',
                'cerdo_x4',
                'cerdo_x6',
                'cerdo_x8'
            )
        `);


        await pool.query(`
            UPDATE stock_productos
            SET producto = 'mixto'
            WHERE producto IN (
                'mixto_x2',
                'mixto_x4',
                'mixto_x6',
                'mixto_x8'
            )
        `);


        // ==========================================
        // CREAR PRESENTACIONES QUE NO EXISTAN
        // ==========================================

        await pool.query(`
            INSERT INTO stock_productos
                (
                    producto,
                    nombre,
                    pack,
                    peso_gramos,
                    cantidad_packs
                )
            VALUES

                ('res', 'Carne de res', 2, 200, 10),
                ('res', 'Carne de res', 4, 400, 10),
                ('res', 'Carne de res', 6, 600, 10),
                ('res', 'Carne de res', 8, 800, 10),

                ('cerdo', 'Carne de cerdo', 2, 200, 10),
                ('cerdo', 'Carne de cerdo', 4, 400, 10),
                ('cerdo', 'Carne de cerdo', 6, 600, 10),
                ('cerdo', 'Carne de cerdo', 8, 800, 10),

                ('mixto', 'Medallón mixto', 2, 200, 10),
                ('mixto', 'Medallón mixto', 4, 400, 10),
                ('mixto', 'Medallón mixto', 6, 600, 10),
                ('mixto', 'Medallón mixto', 8, 800, 10)

            ON CONFLICT (producto, pack)
            DO NOTHING
        `);


        console.log(
            "Stock de productos terminados por presentación listo."
        );


    } catch (error) {

        console.error(
            "Error creando stock de productos terminados:",
            error
        );

        throw error;

    }

}
// ==========================================
// TABLA DE LOTES DE PRODUCCIÓN
// ==========================================

async function crearTablaLotesProduccion() {

    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS lotes_produccion (
                id SERIAL PRIMARY KEY,
                codigo_lote VARCHAR(50) NOT NULL UNIQUE,
                id_orden_produccion INTEGER NOT NULL,
                producto VARCHAR(20) NOT NULL,
                nombre VARCHAR(100) NOT NULL,
                cantidad_medallones INTEGER NOT NULL,
                fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                estado VARCHAR(50) NOT NULL DEFAULT 'En producción',
                proceso INTEGER NOT NULL DEFAULT 0
            )
        `);

        // AGREGAR LA COLUMNA A TABLAS EXISTENTES

        await pool.query(`
            ALTER TABLE lotes_produccion
            ADD COLUMN IF NOT EXISTS proceso INTEGER NOT NULL DEFAULT 0
        `);

        await pool.query(`
    ALTER TABLE lotes_produccion
    ADD COLUMN IF NOT EXISTS pack INTEGER
`);
await pool.query(`
    ALTER TABLE lotes_produccion
    ADD COLUMN IF NOT EXISTS stock_actualizado BOOLEAN
    NOT NULL DEFAULT FALSE
`);
await pool.query(`
    ALTER TABLE lotes_produccion
    ADD COLUMN IF NOT EXISTS cantidad_packs INTEGER
`);
// ==========================================
// CORREGIR LOTE DE PRUEBA OP7
// ==========================================

await pool.query(`
    UPDATE ordenes_produccion
    SET
        pack = 2,
        cantidad_packs = 10
    WHERE id = 7
      AND pack IS NULL
`);

await pool.query(`
    UPDATE lotes_produccion
    SET
        pack = 2,
        cantidad_packs = 10
    WHERE id_orden_produccion = 7
      AND pack IS NULL
`);

        console.log(
            "Tabla de lotes de producción lista."
        );

    } catch (error) {

        console.error(
            "Error creando tabla de lotes de producción:",
            error
        );

    }

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

        await crearTablaOrdenesProduccion();

        await crearTablaInventario();

        await crearTablaLotesProduccion();

        await crearTablaSolicitudesCompra();

        await crearTablaStockProductos();

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
// ==========================================
// TRAZABILIDAD DE UN LOTE
// ==========================================

app.get("/api/lotes-produccion/trazabilidad/:codigo", async (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: "No autorizado."
        });
    }

    const codigo = req.params.codigo.trim();

    if (!codigo) {
        return res.status(400).json({
            mensaje: "Debes ingresar un código de lote."
        });
    }

    try {

        const resultado = await pool.query(`
            SELECT
                id,
                codigo_lote,
                id_orden_produccion,
                producto,
                nombre,
                cantidad_medallones,
                pack,
                cantidad_packs,
                fecha_inicio,
                estado,
                proceso,
                stock_actualizado
            FROM lotes_produccion
            WHERE codigo_lote = $1
        `, [codigo]);

        if (resultado.rows.length === 0) {

            return res.status(404).json({
                mensaje: "No se encontró un lote con ese código."
            });

        }

        res.json(resultado.rows[0]);

    } catch (error) {

        console.error(
            "Error consultando trazabilidad del lote:",
            error
        );

        res.status(500).json({
            mensaje: "No se pudo consultar la trazabilidad."
        });

    }

});

iniciarServidor();