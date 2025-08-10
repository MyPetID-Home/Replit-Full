// push-to-mongo.js
import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';

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

    // Process locations (sync all entries)
    const locationsData = JSON.parse(await fs.readFile('data/locations.json', 'utf8'));
    if (Array.isArray(locationsData) && locationsData.length > 0) {
      const locationsCollection = db.collection("locations");
      
      // Upsert each location entry
      for (const location of locationsData) {
        const mongoEntry = {
          ...location,
          timestamp: new Date(location.timestamp),
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          __v: location.__v || 0,
        };

        await locationsCollection.replaceOne(
          { _id: mongoEntry._id },
          mongoEntry,
          { upsert: true }
        );
      }
      console.log("Locations data synced to MongoDB:", locationsData.length, "entries");
    } else {
      console.log("No location data to process.");
    }

    // Process devices
    const devicesData = JSON.parse(await fs.readFile('data/devices.json', 'utf8'));
    if (Array.isArray(devicesData) && devicesData.length > 0) {
      const devicesCollection = db.collection("devices");
      for (const device of devicesData) {
        await devicesCollection.replaceOne(
          { _id: device._id },
          device,
          { upsert: true }
        );
      }
      console.log("Devices data synced to MongoDB:", devicesData.length, "entries");
    }

    // Process users
    const usersData = JSON.parse(await fs.readFile('data/users.json', 'utf8'));
    if (Array.isArray(usersData) && usersData.length > 0) {
      const usersCollection = db.collection("users");
      for (const user of usersData) {
        await usersCollection.replaceOne(
          { _id: user._id },
          user,
          { upsert: true }
        );
      }
      console.log("Users data synced to MongoDB:", usersData.length, "entries");
    }

    // Process dogs
    const dogsData = JSON.parse(await fs.readFile('data/dogs.json', 'utf8'));
    if (Array.isArray(dogsData) && dogsData.length > 0) {
      const dogsCollection = db.collection("dogs");
      for (const dog of dogsData) {
        await dogsCollection.replaceOne(
          { _id: dog._id },
          dog,
          { upsert: true }
        );
      }
      console.log("Dogs data synced to MongoDB:", dogsData.length, "entries");
    }

    // Process patreon verification queue
    const patreonData = JSON.parse(await fs.readFile('data/patreon_verification_queue.json', 'utf8'));
    if (Array.isArray(patreonData) && patreonData.length > 0) {
      const patreonCollection = db.collection("patreon_verification_queue");
      for (const entry of patreonData) {
        await patreonCollection.replaceOne(
          { _id: entry._id },
          entry,
          { upsert: true }
        );
      }
      console.log("Patreon verification queue synced to MongoDB:", patreonData.length, "entries");
    }

    // Process user stats
    const userStatsData = JSON.parse(await fs.readFile('data/user_stats.json', 'utf8'));
    if (Array.isArray(userStatsData) && userStatsData.length > 0) {
      const userStatsCollection = db.collection("user_stats");
      for (const stat of userStatsData) {
        await userStatsCollection.replaceOne(
          { _id: stat._id },
          stat,
          { upsert: true }
        );
      }
      console.log("User stats synced to MongoDB:", userStatsData.length, "entries");
    }

    // Process pet stats
    const petStatsData = JSON.parse(await fs.readFile('data/pet_stats.json', 'utf8'));
    if (Array.isArray(petStatsData) && petStatsData.length > 0) {
      const petStatsCollection = db.collection("pet_stats");
      for (const stat of petStatsData) {
        await petStatsCollection.replaceOne(
          { _id: stat._id },
          stat,
          { upsert: true }
        );
      }
      console.log("Pet stats synced to MongoDB:", petStatsData.length, "entries");
    }
  } catch (err) {
    console.error("Error pushing data to MongoDB:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("Uncaught error:", err.message);
  process.exit(1);
});