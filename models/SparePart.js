const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  partLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartLocation',
    required: true
  },
  carType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarType',
    required: true
  },
  carModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarModel',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SparePart', sparePartSchema);
