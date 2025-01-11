const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');  // Importación corregida
const expensesRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors(
  {
    origin: true,
    credentials: true,
  }
));
app.use(express.json());

app.use('/api/expenses', expensesRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

// Inicializar la base de datos antes de iniciar el servidor
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
