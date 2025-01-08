// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');  // Asegúrate de que esta ruta sea correcta

router.post('/register', async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y password son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'El email ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: user,
      token: token
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ 
      message: 'Error en el registro',
      error: error.message 
    });
  }
});

module.exports = router;

  
  // Login de usuario
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Auth failed' });
      }
  
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
  
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Auth failed' });
      }
  
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'your_jwt_secret',
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error en el login', error });
    }
  });
  
  module.exports = router;
  
  