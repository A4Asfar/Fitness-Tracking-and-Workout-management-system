require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("Starting legacy data migration...");
    
    // Update missing bio
    const bioResult = await mongoose.connection.collection('users').updateMany(
      { bio: { $exists: false } },
      { $set: { bio: "" } }
    );
    console.log(`Updated missing bio: ${bioResult.modifiedCount} docs`);

    // Update missing avatar
    const avatarResult = await mongoose.connection.collection('users').updateMany(
      { avatar: { $exists: false } },
      { $set: { avatar: "" } }
    );
    console.log(`Updated missing avatar: ${avatarResult.modifiedCount} docs`);

    // Update missing workoutFocus
    const wfResult = await mongoose.connection.collection('users').updateMany(
      { workoutFocus: { $exists: false } },
      { $set: { workoutFocus: "" } }
    );
    console.log(`Updated missing workoutFocus: ${wfResult.modifiedCount} docs`);

    // Update missing weight
    const weightResult = await mongoose.connection.collection('users').updateMany(
      { weight: { $exists: false } },
      { $set: { weight: 0 } }
    );
    console.log(`Updated missing weight: ${weightResult.modifiedCount} docs`);

    // Update missing height
    const heightResult = await mongoose.connection.collection('users').updateMany(
      { height: { $exists: false } },
      { $set: { height: 0 } }
    );
    console.log(`Updated missing height: ${heightResult.modifiedCount} docs`);

    // Update missing fitnessGoal
    const fitnessGoalResult = await mongoose.connection.collection('users').updateMany(
      { fitnessGoal: { $exists: false } },
      { $set: { fitnessGoal: "None" } }
    );
    console.log(`Updated missing fitnessGoal: ${fitnessGoalResult.modifiedCount} docs`);

    // Update missing trainingLevel
    const trainingLevelResult = await mongoose.connection.collection('users').updateMany(
      { trainingLevel: { $exists: false } },
      { $set: { trainingLevel: "Beginner" } }
    );
    console.log(`Updated missing trainingLevel: ${trainingLevelResult.modifiedCount} docs`);

    // Update missing membershipType
    const membershipTypeResult = await mongoose.connection.collection('users').updateMany(
      { membershipType: { $exists: false } },
      { $set: { membershipType: "free" } }
    );
    console.log(`Updated missing membershipType: ${membershipTypeResult.modifiedCount} docs`);

    console.log("Migration complete!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

migrate();
