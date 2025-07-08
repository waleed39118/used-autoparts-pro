const express = require('express');
const router = express.Router();
const CarModel = require('../models/CarModel');

// GET /api/car-models?typeId=...
router.get('/car-models', async (req, res) => {
  try {
    const { typeId } = req.query;
    if (!typeId) {
      return res.status(400).json({ error: 'Missing typeId parameter' });
    }

    const models = await CarModel.find({ carType: typeId }).sort({ name: 1 });
    res.json(models);
  } catch (err) {
    console.error('Failed to fetch car models:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
