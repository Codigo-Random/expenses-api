// src/routes/expenses.js
const express = require('express');
const router = express.Router();
const {pool} = require('../config/database');
const auth = require('../middleware/auth');



// Crear un nuevo gasto/ingreso
router.post('/', auth, async (req, res) => {
    try {
      const { amount, type, description } = req.body;
      const userId = req.userData.userId;
  
      const result = await pool.query(
        'INSERT INTO expenses (user_id, amount, type, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, amount, type, description]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el registro', error });
    }
  });
  
  // Obtener todos los gastos/ingresos del usuario
  router.get('/', auth, async (req, res) => {
    try {
      const userId = req.userData.userId;
      const result = await pool.query(
        'SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los registros', error });
    }
  });
  
  // Actualizar un gasto/ingreso
  router.put('/:id', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, type, description } = req.body;
      const userId = req.userData.userId;
  
      const result = await pool.query(
        `UPDATE expenses 
         SET amount = $1, type = $2, description = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4 AND user_id = $5 
         RETURNING *`,
        [amount, type, description, id, userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Registro no encontrado o no autorizado' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el registro', error });
    }
  });
  
  // Eliminar un gasto/ingreso
  router.delete('/:id', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userData.userId;
  
      const result = await pool.query(
        'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Registro no encontrado o no autorizado' });
      }
  
      res.json({ message: 'Registro eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el registro', error });
    }
  });
  
  module.exports = router;
  