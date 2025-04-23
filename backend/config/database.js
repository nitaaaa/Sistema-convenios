const mysql = require('mysql2');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pm20aps016',
    database: 'comisiones_de_servicio'
});

module.exports = connection.promise();  // Exporta la conexión para usarla con promesas
