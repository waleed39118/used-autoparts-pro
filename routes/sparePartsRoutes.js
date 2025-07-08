const express = require('express');
const router = express.Router();
const sparePartController = require('../controllers/sparePartController');
const { isLoggedIn } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Debug route (optional)
router.get('/debug/locations', sparePartController.debugLocations);

// View all spare parts (public)
router.get('/', sparePartController.getAllSpareParts);

// View spare parts by logged-in user
router.get('/mine', isLoggedIn, sparePartController.getMySpareParts);

// Render form to create a new part
router.get('/new', isLoggedIn, sparePartController.renderCreateForm);

// Handle creation of new part
router.post(
  '/',
  isLoggedIn,
  upload.single('image'),
  sparePartController.createSparePart
);

// Show a single spare part by ID
router.get('/:id', sparePartController.getSparePartById);

// Render form to edit a part
router.get('/:id/edit', isLoggedIn, sparePartController.renderEditForm);

// Update part
router.put(
  '/:id',
  isLoggedIn,
  upload.single('image'),
  sparePartController.updateSparePart
);

// Delete part
router.delete('/:id', isLoggedIn, sparePartController.deleteSparePart);

module.exports = router;
