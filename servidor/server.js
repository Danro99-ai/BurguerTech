const express = require("express");
const session = require("express-session");
const { Pool } = require("pg");
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

async function crearTablaPedidos() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id SERIAL PRIMARY KEY,
            cliente JSONB NOT NULL,
            productos JSONB NOT NULL,
            total NUMERIC NOT NULL,
            estado VARCHAR(50) NOT NULL,
            fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Tabla de pedidos lista.");

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
// GUARDAR PEDIDO
// ==========================================

app.post("/api/pedidos", async (req, res) => {

    try {

        const nuevoPedido = req.body;

        const cliente = nuevoPedido.cliente;

        const productos = nuevoPedido.productos;

        const total = nuevoPedido.total;

        const estado = "Pendiente";


        const resultado = await pool.query(`
            INSERT INTO pedidos
                (cliente, productos, total, estado)
            VALUES
                ($1, $2, $3, $4)
            RETURNING id, cliente, productos, total, estado, fecha
        `, [
            cliente,
            JSON.stringify(productos),
            total,
            estado
        ]);


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
                "Pedido guardado correctamente",

            pedido:
                pedidoRespuesta

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            mensaje:
                "No se pudo guardar el pedido."

        });

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


        const pedido =
            resultado.rows[0];


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
// INICIAR SERVIDOR
// ==========================================

async function iniciarServidor() {

    try {

        await crearTablaPedidos();

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