require('dotenv').config();
const mongoose = require('mongoose');
const CarModel = require('./models/CarModel');
const CarType = require('./models/CarType');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// View all car models organized by type
async function viewAllModels() {
  console.log('\n📋 Current Car Types and Models:');
  console.log('=====================================');
  
  const carTypes = await CarType.find().sort({ name: 1 });
  
  for (const type of carTypes) {
    const models = await CarModel.find({ carType: type._id }).sort({ name: 1 });
    console.log(`\n📂 ${type.name} (${models.length} models):`);
    models.forEach(model => console.log(`  - ${model.name}`));
  }
}

// Add new car models to a specific car type
async function addModels(carTypeName, modelNames) {
  try {
    const carType = await CarType.findOne({ name: carTypeName });
    if (!carType) {
      console.log(`❌ Car type "${carTypeName}" not found`);
      return;
    }

    const modelsToAdd = [];
    for (const modelName of modelNames) {
      // Check if model already exists for this car type
      const existingModel = await CarModel.findOne({ 
        name: modelName, 
        carType: carType._id 
      });
      
      if (!existingModel) {
        modelsToAdd.push({
          name: modelName,
          carType: carType._id
        });
      } else {
        console.log(`⚠️  Model "${modelName}" already exists for ${carTypeName}`);
      }
    }

    if (modelsToAdd.length > 0) {
      await CarModel.insertMany(modelsToAdd);
      console.log(`✅ Added ${modelsToAdd.length} new models to ${carTypeName}:`);
      modelsToAdd.forEach(model => console.log(`  + ${model.name}`));
    } else {
      console.log(`ℹ️  No new models to add to ${carTypeName}`);
    }
  } catch (error) {
    console.error('❌ Error adding models:', error.message);
  }
}

// Remove a car model
async function removeModel(carTypeName, modelName) {
  try {
    const carType = await CarType.findOne({ name: carTypeName });
    if (!carType) {
      console.log(`❌ Car type "${carTypeName}" not found`);
      return;
    }

    const result = await CarModel.deleteOne({ 
      name: modelName, 
      carType: carType._id 
    });

    if (result.deletedCount > 0) {
      console.log(`✅ Removed "${modelName}" from ${carTypeName}`);
    } else {
      console.log(`❌ Model "${modelName}" not found in ${carTypeName}`);
    }
  } catch (error) {
    console.error('❌ Error removing model:', error.message);
  }
}

// Update/rename a car model
async function updateModel(carTypeName, oldName, newName) {
  try {
    const carType = await CarType.findOne({ name: carTypeName });
    if (!carType) {
      console.log(`❌ Car type "${carTypeName}" not found`);
      return;
    }

    const result = await CarModel.updateOne(
      { name: oldName, carType: carType._id },
      { name: newName }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Updated "${oldName}" to "${newName}" in ${carTypeName}`);
    } else {
      console.log(`❌ Model "${oldName}" not found in ${carTypeName}`);
    }
  } catch (error) {
    console.error('❌ Error updating model:', error.message);
  }
}

// Fix missing Crossover models
async function fixCrossoverModels() {
  console.log('🔧 Fixing missing Crossover models...');
  
  const crossoverModels = [
    'Honda CR-V',
    'Nissan Rogue', 
    'Hyundai Tucson',
    'Mazda CX-5',
    'Toyota RAV4'
  ];
  
  await addModels('Crossover', crossoverModels);
}

// Add popular car models to existing categories
async function addPopularModels() {
  console.log('🚗 Adding popular car models...');
  
  // Additional Sedan models
  await addModels('Sedan', [
    'Mercedes-Benz C-Class',
    'Audi A4',
    'Lexus ES',
    'Volkswagen Passat',
    'Kia Optima'
  ]);

  // Additional SUV models
  await addModels('SUV', [
    'BMW X5',
    'Mercedes-Benz GLE',
    'Audi Q7',
    'Lexus RX',
    'Volvo XC90'
  ]);

  // Additional Hatchback models
  await addModels('Hatchback', [
    'Toyota Yaris',
    'Nissan Micra',
    'Mazda3',
    'Peugeot 208',
    'MINI Cooper'
  ]);
}

// Main function to handle command line arguments
async function main() {
  await connectDB();

  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'view':
      await viewAllModels();
      break;
      
    case 'add':
      if (args.length < 2) {
        console.log('Usage: node manage-models.js add <CarType> <Model1> [Model2] [Model3]...');
        break;
      }
      const carType = args[0];
      const models = args.slice(1);
      await addModels(carType, models);
      break;
      
    case 'remove':
      if (args.length !== 2) {
        console.log('Usage: node manage-models.js remove <CarType> <ModelName>');
        break;
      }
      await removeModel(args[0], args[1]);
      break;
      
    case 'update':
      if (args.length !== 3) {
        console.log('Usage: node manage-models.js update <CarType> <OldName> <NewName>');
        break;
      }
      await updateModel(args[0], args[1], args[2]);
      break;
      
    case 'fix-crossover':
      await fixCrossoverModels();
      break;
      
    case 'add-popular':
      await addPopularModels();
      break;
      
    default:
      console.log(`
🚗 Car Model Management Tool

Usage:
  node manage-models.js <command> [arguments]

Commands:
  view                                    - View all car types and models
  add <CarType> <Model1> [Model2]...     - Add new models to a car type
  remove <CarType> <ModelName>           - Remove a model from a car type
  update <CarType> <OldName> <NewName>   - Rename a model
  fix-crossover                          - Fix missing Crossover models
  add-popular                            - Add popular models to all categories

Examples:
  node manage-models.js view
  node manage-models.js add Sedan "Tesla Model 3" "Genesis G90"
  node manage-models.js remove SUV "Honda CR-V"
  node manage-models.js update Coupe "BMW M4" "BMW M4 Competition"
  node manage-models.js fix-crossover
  node manage-models.js add-popular
      `);
  }

  mongoose.disconnect();
  console.log('\n✅ Database connection closed');
}

// Run the script
main().catch(error => {
  console.error('❌ Script error:', error);
  mongoose.disconnect();
  process.exit(1);
});