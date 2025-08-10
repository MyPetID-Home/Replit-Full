// pull-from-mongo.js - Sync data FROM MongoDB TO local JSON files
import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

async function ensureDataDirectory() {
  try {
    await fs.mkdir('data', { recursive: true });
  } catch (err) {
    // Directory already exists
  }
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI environment variable is not set.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("mypetid");
    
    await ensureDataDirectory();

    // Pull users data
    const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();
    await fs.writeFile('data/users.json', JSON.stringify(users, null, 2));
    console.log("Users data pulled from MongoDB:", users.length, "entries");

    // Pull dogs data
    const dogsCollection = db.collection("dogs");
    const dogs = await dogsCollection.find({}).toArray();
    await fs.writeFile('data/dogs.json', JSON.stringify(dogs, null, 2));
    console.log("Dogs data pulled from MongoDB:", dogs.length, "entries");

    // Pull locations data
    const locationsCollection = db.collection("locations");
    const locations = await locationsCollection.find({}).toArray();
    await fs.writeFile('data/locations.json', JSON.stringify(locations, null, 2));
    console.log("Locations data pulled from MongoDB:", locations.length, "entries");

    // Pull devices data
    const devicesCollection = db.collection("devices");
    const devices = await devicesCollection.find({}).toArray();
    await fs.writeFile('data/devices.json', JSON.stringify(devices, null, 2));
    console.log("Devices data pulled from MongoDB:", devices.length, "entries");

    // Pull patreon verification queue
    const patreonCollection = db.collection("patreon_verification_queue");
    const patreonQueue = await patreonCollection.find({}).toArray();
    await fs.writeFile('data/patreon_verification_queue.json', JSON.stringify(patreonQueue, null, 2));
    console.log("Patreon verification queue pulled from MongoDB:", patreonQueue.length, "entries");

    // Pull user stats
    const userStatsCollection = db.collection("user_stats");
    const userStats = await userStatsCollection.find({}).toArray();
    await fs.writeFile('data/user_stats.json', JSON.stringify(userStats, null, 2));
    console.log("User stats pulled from MongoDB:", userStats.length, "entries");

    // Pull pet stats
    const petStatsCollection = db.collection("pet_stats");
    const petStats = await petStatsCollection.find({}).toArray();
    await fs.writeFile('data/pet_stats.json', JSON.stringify(petStats, null, 2));
    console.log("Pet stats pulled from MongoDB:", petStats.length, "entries");

  } catch (err) {
    console.error("Error pulling data from MongoDB:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("Uncaught error:", err.message);
  process.exit(1);
});