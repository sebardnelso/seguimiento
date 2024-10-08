const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// Crear conexión a la base de datos
const pool = mysql.createPool({
  host: '190.228.29.61',      // Cambia esto si tu base de datos está en otro servidor
  user: 'kalel2016',     // Reemplaza con tu usuario de MySQL
  password: 'Kalel2016', // Reemplaza con tu contraseña de MySQL
  database: 'ausol'       // Nombre de la base de datos
});

const app = express();
app.use(express.json());
app.use(cors());

// Ruta de login
app.post('/login', (req, res) => {
    const { nombre, clave } = req.body;
    
    console.log('Datos recibidos:', { nombre, clave }); // Verificar datos recibidos

    if (!nombre || !clave) {
        return res.status(400).json({ success: false, message: 'Nombre y clave son requeridos' });
    }

    const query = 'SELECT id, nombre FROM aus_ven WHERE nombre = ? AND Pass = ?';
    pool.query(query, [nombre, clave], (err, results) => {
        if (err) {
            console.error('Error ejecutando la consulta:', err);
            return res.status(500).json({ success: false, message: 'Error en la base de datos' });
        }

        if (results.length > 0) {
            const { id, nombre } = results[0];
            res.json({ success: true, id, nombre });
        } else {
            res.json({ success: false, message: 'Usuario o clave incorrectos' });
        }
    });
});

app.post('/location_error', (req, res) => {
  const { vendedor_id, error, timestamp } = req.body;

  // Mostrar el error en la consola (o en logs si tienes configurado)
  console.error(`Error de ubicación recibido para vendedor ${vendedor_id}`);
  console.error(`Error: ${error}`);
  console.error(`Timestamp: ${timestamp}`);

  // Responder al cliente que el error fue recibido
  res.status(200).json({ message: 'Error recibido correctamente' });
});

// Ruta para recibir la ubicación
app.post('/location', (req, res) => {
    const { vendedor_id, latitud, longitud } = req.body;

    if (!vendedor_id || latitud === undefined || longitud === undefined) {
        return res.status(400).json({ message: 'Faltan datos para guardar la ubicación' });
    }

    if (isNaN(latitud) || isNaN(longitud)) {
        return res.status(400).json({ message: 'Latitud y longitud deben ser valores numéricos' });
    }

    const query = 'INSERT INTO aus_ven_ubicaciones (vendedor_id, latitud, longitud) VALUES (?, ?, ?)';
    
    pool.query(query, [vendedor_id, latitud, longitud], (err, results) => {
        if (err) {
            console.error('Error al guardar la ubicación:', err);
            return res.status(500).json({ message: 'Error al guardar la ubicación' });
        }

        // Imprimir latitud y longitud en la consola
        console.log(`Ubicación guardada: Latitud ${latitud}, Longitud ${longitud}`);
        
        res.status(200).json({ 
            message: 'Ubicación guardada correctamente', 
            vendedor_id: vendedor_id, 
            location_id: results.insertId // ID de la ubicación insertada
        });
    });
});


// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
