
const db_mongoose = require('./config/db_mongoose');
const routes = require('./routers/route');
const mongoose = require('mongoose');
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const app = express();

const swaggerDocument = require('./swagger.json');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs",swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use(routes);

mongoose.connect(db_mongoose.connection, {})
.then(() => {
    console.log('Conectado com o BD');
})
.catch((error) => {
    console.error('Erro ao conectar com o MongoDB:', error);
});

app.use(
    express.urlencoded({
        extended: true
    })
)

app.listen(8081, function () {
    console.log("Servidor no http://localhost:8081")
});