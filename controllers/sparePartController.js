const SparePart = require('../models/SparePart');
const PartLocation = require('../models/PartLocation');
const CarType = require('../models/CarType');
const CarModel = require('../models/CarModel');
const fs = require('fs');
const path = require('path');

// Debug route to check locations
exports.debugLocations = async (req, res) => {
  try {
    const locations = await PartLocation.find({});
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all spare parts
exports.getAllSpareParts = async (req, res) => {
  try {
    const spareParts = await SparePart.find({})
      .populate('partLocation carType carModel owner')
      .sort({ createdAt: -1 });

    res.render('spare-parts/index', {
      title: 'All Spare Parts',
      spareParts,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    req.flash('error', 'Error loading spare parts');
    res.redirect('/');
  }
};

// Get spare parts by current user
exports.getMySpareParts = async (req, res) => {
  try {
    const spareParts = await SparePart.find({ owner: req.session.userId })
      .populate('partLocation carType carModel')
      .sort({ createdAt: -1 });

    res.render('spare-parts/my-parts', {
      title: 'My Spare Parts',
      spareParts,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error fetching user spare parts:', error);
    req.flash('error', 'Error loading your spare parts');
    res.redirect('/spare-parts');
  }
};

// Render create form
exports.renderCreateForm = async (req, res) => {
  try {
    const [partLocations, carTypes] = await Promise.all([
      PartLocation.find({}).sort({ name: 1 }),
      CarType.find({}).sort({ name: 1 })
    ]);

    res.render('spare-parts/new', {
      title: 'Add New Spare Part',
      partLocations,
      carTypes,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading create form:', error);
    req.flash('error', 'Error loading form');
    res.redirect('/spare-parts');
  }
};

// Create spare part
exports.createSparePart = async (req, res) => {
  try {
    const { sparePart } = req.body;
    
    // Validate required fields
    if (!sparePart.name || !sparePart.partLocation || !sparePart.carType || !sparePart.carModel || !sparePart.price) {
      req.flash('error', 'Please fill in all required fields');
      return res.redirect('/spare-parts/new');
    }

    const newSparePart = new SparePart({
      name: sparePart.name,
      description: sparePart.description,
      partLocation: sparePart.partLocation,
      carType: sparePart.carType,
      carModel: sparePart.carModel,
      price: sparePart.price,
      owner: req.session.userId
    });

    // Handle image upload
    if (req.file) {
      newSparePart.image = `/uploads/${req.file.filename}`;
    }

    await newSparePart.save();
    req.flash('success', 'Spare part added successfully!');
    res.redirect('/spare-parts');
  } catch (error) {
    console.error('Error creating spare part:', error);
    req.flash('error', 'Error creating spare part. Please try again.');
    res.redirect('/spare-parts/new');
  }
};

// Get spare part by ID
exports.getSparePartById = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id)
      .populate('partLocation carType carModel owner');

    if (!sparePart) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spare-parts');
    }

    res.render('spare-parts/show', {
      title: sparePart.name,
      sparePart,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error fetching spare part:', error);
    req.flash('error', 'Error loading spare part');
    res.redirect('/spare-parts');
  }
};

// Render edit form
exports.renderEditForm = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spare-parts');
    }

    // Check if user owns this part
    if (sparePart.owner.toString() !== req.session.userId) {
      req.flash('error', 'You can only edit your own spare parts');
      return res.redirect('/spare-parts');
    }

    const [partLocations, carTypes, carModels] = await Promise.all([
      PartLocation.find({}).sort({ name: 1 }),
      CarType.find({}).sort({ name: 1 }),
      CarModel.find({ carType: sparePart.carType }).sort({ name: 1 })
    ]);

    res.render('spare-parts/edit', {
      title: 'Edit Spare Part',
      sparePart,
      partLocations,
      carTypes,
      carModels,
      messages: req.flash()
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    req.flash('error', 'Error loading edit form');
    res.redirect('/spare-parts');
  }
};

// Update spare part
exports.updateSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spare-parts');
    }

    // Check if user owns this part
    if (sparePart.owner.toString() !== req.session.userId) {
      req.flash('error', 'You can only edit your own spare parts');
      return res.redirect('/spare-parts');
    }

    const { sparePart: updateData } = req.body;
    
    // Update fields
    sparePart.name = updateData.name;
    sparePart.description = updateData.description;
    sparePart.partLocation = updateData.partLocation;
    sparePart.carType = updateData.carType;
    sparePart.carModel = updateData.carModel;
    sparePart.price = updateData.price;

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (sparePart.image) {
        const oldImagePath = path.join(__dirname, '../public', sparePart.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      sparePart.image = `/uploads/${req.file.filename}`;
    }

    await sparePart.save();
    req.flash('success', 'Spare part updated successfully!');
    res.redirect(`/spare-parts/${sparePart._id}`);
  } catch (error) {
    console.error('Error updating spare part:', error);
    req.flash('error', 'Error updating spare part. Please try again.');
    res.redirect(`/spare-parts/${req.params.id}/edit`);
  }
};

// Delete spare part
exports.deleteSparePart = async (req, res) => {
  try {
    const sparePart = await SparePart.findById(req.params.id);
    
    if (!sparePart) {
      req.flash('error', 'Spare part not found');
      return res.redirect('/spare-parts');
    }

    // Check if user owns this part or is admin
    const User = require('../models/User');
    const user = await User.findById(req.session.userId);
    
    if (sparePart.owner.toString() !== req.session.userId && user.role !== 'admin') {
      req.flash('error', 'You can only delete your own spare parts');
      return res.redirect('/spare-parts');
    }

    // Delete image if it exists
    if (sparePart.image) {
      const imagePath = path.join(__dirname, '../public', sparePart.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await SparePart.findByIdAndDelete(req.params.id);
    req.flash('success', 'Spare part deleted successfully!');
    res.redirect('/spare-parts');
  } catch (error) {
    console.error('Error deleting spare part:', error);
    req.flash('error', 'Error deleting spare part. Please try again.');
    res.redirect('/spare-parts');
  }
};
