const mongoose = require('mongoose');

const carModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  carType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarType',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique model names per car type
carModelSchema.index({ name: 1, carType: 1 }, { unique: true });

module.exports = mongoose.model('CarModel', carModelSchema);
