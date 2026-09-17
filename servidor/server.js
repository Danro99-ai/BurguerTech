const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const app = express();

const PORT = 3000;


// ==========================================
// ARCHIVO DE PEDIDOS
// ==========================================

const archivoPedidos = path.join(
    __dirname,
    "pedidos.json"
);


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

app.get("/api/pedidos", (req, res) => {

    // Solo administradores

    if (!req.session.usuario) {

        return res.status(401).json({

            mensaje:
                "Debes iniciar sesión."

        });

    }


    try {

        const datos = fs.readFileSync(
            archivoPedidos,
            "utf8"
        );

        const pedidos = JSON.parse(datos);

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

app.post("/api/pedidos", (req, res) => {

    try {

        const nuevoPedido = req.body;


        let pedidos = [];

        try {

            const datos =
                fs.readFileSync(
                    archivoPedidos,
                    "utf8"
                );

            pedidos = JSON.parse(datos);

        } catch (error) {

            pedidos = [];

        }


        nuevoPedido.id =
            pedidos.length + 1;


        nuevoPedido.estado =
            "Pendiente";


        nuevoPedido.fecha =
            new Date().toLocaleString("es-CO");


        pedidos.push(nuevoPedido);


        fs.writeFileSync(

            archivoPedidos,

            JSON.stringify(
                pedidos,
                null,
                4
            )

        );


        res.json({

            mensaje:
                "Pedido guardado correctamente",

            pedido:
                nuevoPedido

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

app.put("/api/pedidos/:id/estado", (req, res) => {

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


        const datos =
            fs.readFileSync(
                archivoPedidos,
                "utf8"
            );


        const pedidos =
            JSON.parse(datos);


        const pedido =
            pedidos.find(
                item => item.id === id
            );


        if (!pedido) {

            return res.status(404).json({

                mensaje:
                    "Pedido no encontrado."

            });

        }


        pedido.estado =
            nuevoEstado;


        fs.writeFileSync(

            archivoPedidos,

            JSON.stringify(
                pedidos,
                null,
                4
            )

        );


        res.json({

            mensaje:
                "Estado actualizado correctamente",

            pedido:
                pedido

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

app.listen(PORT, () => {

    console.log(
        `Servidor BurguerTech funcionando en http://localhost:${PORT}`
    );

});