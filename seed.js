require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const User = require('./models/User');
const PartLocation = require('./models/PartLocation');
const CarType = require('./models/CarType');
const CarModel = require('./models/CarModel');
const SparePart = require('./models/SparePart');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spareparts';

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      PartLocation.deleteMany({}),
      CarType.deleteMany({}),
      CarModel.deleteMany({}),
      SparePart.deleteMany({})
    ]);
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@spareparts.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👤 Admin user created');

    // Create regular user
    const regularUser = new User({
      username: 'testuser',
      email: 'user@spareparts.com',
      password: 'user123',
      role: 'user'
    });
    await regularUser.save();
    console.log('👤 Regular user created');

    // Create part locations
    const partLocations = [
      'Engine', 'Transmission', 'Brakes', 'Suspension', 'Tires', 'Battery',
      'Radiator', 'Exhaust System', 'Steering Wheel', 'Windshield', 'Lights',
      'Seats', 'Fuel Pump', 'Dashboard', 'Mirrors', 'Clutch', 'AC System',
      'Alternator', 'Starter Motor', 'Oil Filter', 'Air Filter', 'Spark Plugs'
    ];

    const createdLocations = await PartLocation.insertMany(
      partLocations.map(name => ({ name }))
    );
    console.log('📍 Part locations created');

    // Create car types and models
    const carTypesData = [
      { 
        name: 'Sedan', 
        models: ['Toyota Camry', 'Honda Accord', 'Hyundai Elantra', 'Nissan Altima', 'BMW 3 Series'] 
      },
      { 
        name: 'SUV', 
        models: ['Toyota Land Cruiser', 'Ford Explorer', 'Nissan Patrol', 'Honda CR-V', 'Mazda CX-5'] 
      },
      { 
        name: 'Coupe', 
        models: ['Ford Mustang', 'BMW M4', 'Audi TT', 'Chevrolet Camaro', 'Dodge Challenger'] 
      },
      { 
        name: 'Hatchback', 
        models: ['Volkswagen Golf', 'Ford Fiesta', 'Kia Picanto', 'Honda Civic', 'Hyundai i30'] 
      },
      { 
        name: 'Convertible', 
        models: ['Mazda MX-5', 'BMW Z4', 'Mercedes-Benz SL', 'Audi A5 Cabriolet', 'Ford Mustang Convertible'] 
      },
      { 
        name: 'Pickup', 
        models: ['Ford F-150', 'Toyota Hilux', 'Chevrolet Silverado', 'Nissan Navara', 'Isuzu D-Max'] 
      },
      { 
        name: 'Minivan', 
        models: ['Honda Odyssey', 'Toyota Sienna', 'Kia Carnival', 'Chrysler Pacifica', 'Volkswagen Touran'] 
      },
      { 
        name: 'Crossover', 
        models: ['Honda CR-V', 'Nissan Rogue', 'Hyundai Tucson', 'Mazda CX-5', 'Toyota RAV4'] 
      },
      { 
        name: 'Wagon', 
        models: ['Subaru Outback', 'Volvo V60', 'Audi A4 Allroad', 'BMW 3 Series Touring', 'Mercedes-Benz E-Class Estate'] 
      }
    ];

    const createdCarTypes = [];
    for (const typeData of carTypesData) {
      const carType = await CarType.create({ name: typeData.name });
      createdCarTypes.push(carType);
      
      const models = typeData.models.map(modelName => ({
        name: modelName,
        carType: carType._id
      }));
      await CarModel.insertMany(models);
    }
    console.log('🚗 Car types and models created');

    // Create sample spare parts
    const sampleParts = [
      {
        name: 'Brake Pads Set',
        description: 'High-quality ceramic brake pads for better stopping power',
        price: 45.99,
        partLocation: createdLocations.find(loc => loc.name === 'Brakes')._id,
        carType: createdCarTypes.find(type => type.name === 'Sedan')._id,
        owner: regularUser._id,
        image: '/uploads/brake-pads.jpg'
      },
      {
        name: 'Engine Oil Filter',
        description: 'Premium oil filter for engine protection',
        price: 12.50,
        partLocation: createdLocations.find(loc => loc.name === 'Engine')._id,
        carType: createdCarTypes.find(type => type.name === 'SUV')._id,
        owner: regularUser._id,
        image: '/uploads/sample-part.jpg'
      },
      {
        name: 'LED Headlight Bulbs',
        description: 'Bright LED headlight bulbs - pair',
        price: 89.99,
        partLocation: createdLocations.find(loc => loc.name === 'Lights')._id,
        carType: createdCarTypes.find(type => type.name === 'Coupe')._id,
        owner: adminUser._id,
        image: '/uploads/brake-pads.jpg'
      },
      {
        name: 'Radiator',
        description: 'Aluminum radiator for efficient cooling',
        price: 156.75,
        partLocation: createdLocations.find(loc => loc.name === 'Radiator')._id,
        carType: createdCarTypes.find(type => type.name === 'Pickup')._id,
        owner: regularUser._id,
        image: '/uploads/sample-part.jpg'
      },
      {
        name: 'Spark Plugs Set',
        description: 'High-performance spark plugs set of 4',
        price: 28.99,
        partLocation: createdLocations.find(loc => loc.name === 'Spark Plugs')._id,
        carType: createdCarTypes.find(type => type.name === 'Hatchback')._id,
        owner: adminUser._id,
        image: '/uploads/brake-pads.jpg'
      }
    ];

    // Add car models to sample parts
    for (const part of sampleParts) {
      const carModels = await CarModel.find({ carType: part.carType });
      if (carModels.length > 0) {
        part.carModel = carModels[Math.floor(Math.random() * carModels.length)]._id;
      }
    }

    await SparePart.insertMany(sampleParts);
    console.log('🔧 Sample spare parts created');

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@spareparts.com / admin123');
    console.log('User: user@spareparts.com / user123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seed();
