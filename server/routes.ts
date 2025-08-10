import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, patreonVerifySchema, insertDogSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Create session
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt
      });

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          name: user.name,
          patreonVerified: user.patreonVerified,
          patreonTier: user.patreonTier,
          isAdmin: user.isAdmin
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, username, name, phone, address } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        username,
        name,
        phone,
        address,
        patreonId: null,
        patreonTier: null,
        patreonVerified: false,
        isActive: true
      });

      // Create session
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt
      });

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          name: user.name,
          patreonVerified: user.patreonVerified,
          patreonTier: user.patreonTier,
          isAdmin: user.isAdmin
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await storage.deleteSession(token);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!session.userId) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      name: user.name,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      patreonVerified: user.patreonVerified,
      patreonTier: user.patreonTier,
      isAdmin: user.isAdmin
    });
  });

  app.put("/api/users/:id", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = parseInt(req.params.id);
    
    // Ensure user can only update their own profile
    if (session.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this profile" });
    }

    try {
      const updates = req.body;
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: updatedUser.id, 
        username: updatedUser.username, 
        email: updatedUser.email, 
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        patreonVerified: updatedUser.patreonVerified,
        patreonTier: updatedUser.patreonTier
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Patreon verification
  app.post("/api/auth/verify-patreon", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const { patreonId, accessToken } = patreonVerifySchema.parse(req.body);
      
      // In a real implementation, this would verify with Patreon API
      // For now, we'll simulate verification
      const patreonTier = "supporter"; // This would come from Patreon API
      
      if (!session.userId) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      const updatedUser = await storage.updateUser(session.userId, {
        patreonId,
        patreonTier,
        patreonVerified: true
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        patreonVerified: true,
        patreonTier: updatedUser.patreonTier
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Dog management routes
  app.get("/api/dogs", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!session.userId) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    const dogs = await storage.getDogsByOwner(session.userId);
    res.json(dogs);
  });

  app.get("/api/dogs/:id", async (req, res) => {
    const dogId = parseInt(req.params.id);
    const dog = await storage.getDog(dogId);
    
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    res.json(dog);
  });

  app.get("/api/dogs/nfc/:tagId", async (req, res) => {
    const tagId = req.params.tagId;
    const dog = await storage.getDogByNfcTag(tagId);
    
    if (!dog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    res.json(dog);
  });

  app.post("/api/dogs", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const dogData = insertDogSchema.parse(req.body);
      const dog = await storage.createDog({
        ...dogData,
        ownerId: session.userId
      });

      res.json(dog);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/dogs/:id", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const dogId = parseInt(req.params.id);
      const existingDog = await storage.getDog(dogId);
      
      if (!existingDog) {
        return res.status(404).json({ message: "Dog not found" });
      }

      if (existingDog.ownerId !== session.userId) {
        return res.status(403).json({ message: "Not authorized to edit this dog" });
      }

      const updates = insertDogSchema.partial().parse(req.body);
      const updatedDog = await storage.updateDog(dogId, updates);

      res.json(updatedDog);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/dogs/:id", async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const dogId = parseInt(req.params.id);
    const existingDog = await storage.getDog(dogId);
    
    if (!existingDog) {
      return res.status(404).json({ message: "Dog not found" });
    }

    if (existingDog.ownerId !== session.userId) {
      return res.status(403).json({ message: "Not authorized to delete this dog" });
    }

    await storage.deleteDog(dogId);
    res.json({ message: "Dog deleted successfully" });
  });

  // Location routes
  app.get("/api/dogs/:id/locations", async (req, res) => {
    const dogId = parseInt(req.params.id);
    const locations = await storage.getLocationsByDog(dogId);
    res.json(locations);
  });

  app.post("/api/dogs/:id/locations", async (req, res) => {
    try {
      const dogId = parseInt(req.params.id);
      const { deviceName, latitude, longitude } = req.body;
      
      const location = await storage.createLocation({
        dogId,
        deviceName,
        latitude,
        longitude,
        timestamp: new Date(),
        active: true
      });

      res.json(location);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Public profile routes
  app.get("/api/profile/:username", async (req, res) => {
    const username = req.params.username;
    const user = await storage.getUserByUsername(username);
    
    if (!user || !user.isActive) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const dogs = await storage.getDogsByOwner(user.id);
    
    res.json({
      username: user.username,
      name: user.name,
      dogs: dogs.map(dog => ({
        id: dog.id,
        name: dog.name,
        description: dog.description,
        photoUrl: dog.photoUrl,
        nfcTagId: dog.nfcTagId
      }))
    });
  });

  // Patreon verification endpoint
  app.post("/api/patreon/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const { patreonUsername } = req.body;
      if (!patreonUsername) {
        return res.status(400).json({ message: "Patreon username is required" });
      }

      // In a real implementation, you would call the Patreon API here
      // For now, we'll simulate verification based on username patterns
      let tier = null;
      let verified = false;

      // Simulate different tiers based on username
      if (patreonUsername.toLowerCase().includes('supporter') || patreonUsername.toLowerCase().includes('5')) {
        tier = "Supporter";
        verified = true;
      } else if (patreonUsername.toLowerCase().includes('guardian') || patreonUsername.toLowerCase().includes('10')) {
        tier = "Guardian";
        verified = true;
      } else if (patreonUsername.toLowerCase().includes('protector') || patreonUsername.toLowerCase().includes('20')) {
        tier = "Protector";
        verified = true;
      } else {
        // Default verification for any username (for demo purposes)
        tier = "Supporter";
        verified = true;
      }

      if (verified) {
        // Update user's Patreon status
        await storage.updateUser(session.userId, {
          patreonUsername,
          patreonTier: tier,
          patreonVerified: true
        });
      }

      res.json({ 
        verified, 
        tier,
        username: patreonUsername,
        message: verified ? `Verified as ${tier} tier patron` : "Verification failed"
      });
    } catch (error) {
      res.status(400).json({ message: "Patreon verification failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const user = await storage.getUser(session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all users with enhanced stats
      const users = await storage.getAllUsers();
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const dogs = await storage.getDogsByOwner(user.id);
          const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          
          // Calculate mock stats (in production, these would come from real data)
          const totalScans = Math.floor(Math.random() * 50) + dogs.length * 5;
          const userLevel = Math.floor(totalScans / 10) + 1;
          const userPoints = totalScans * 10 + userLevel * 50;
          const avgPetLevel = dogs.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
          const totalPetPoints = dogs.length * avgPetLevel * 25;
          
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            patreonVerified: user.patreonVerified,
            patreonTier: user.patreonTier,
            patreonUsername: user.patreonUsername,
            isActive: user.isActive,
            createdAt: user.createdAt,
            dogCount: dogs.length,
            lastActiveAt: user.createdAt, // Mock - would be real last activity
            totalScans,
            accountAge,
            userLevel,
            userPoints,
            avgPetLevel,
            totalPetPoints
          };
        })
      );

      res.json(usersWithStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const user = await storage.getUser(session.userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      const totalUsers = users.length;
      const patreonVerified = users.filter(u => u.patreonVerified).length;
      
      // Get total dogs across all users
      const allDogs = await Promise.all(
        users.map(u => storage.getDogsByOwner(u.id))
      );
      const totalDogs = allDogs.flat().length;

      // Users active this month (created in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeThisMonth = users.filter(u => 
        new Date(u.createdAt) >= thirtyDaysAgo
      ).length;

      // Enhanced stats
      const totalScans = users.reduce((sum, user) => {
        const dogs = allDogs.find(d => d.length > 0) || [];
        return sum + (Math.floor(Math.random() * 50) + dogs.length * 5);
      }, 0);

      const avgUserLevel = users.reduce((sum, user) => {
        const userScans = Math.floor(Math.random() * 50) + 25;
        return sum + (Math.floor(userScans / 10) + 1);
      }, 0) / users.length;

      res.json({
        totalUsers,
        patreonVerified,
        totalDogs,
        activeThisMonth,
        totalScans,
        avgUserLevel
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Profile update endpoint
  app.put("/api/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { name, phone, address } = req.body;
      
      const updatedUser = await storage.updateUser(user.id, {
        name,
        phone,
        address
      });

      if (!updatedUser) {
        return res.status(400).json({ message: "Failed to update profile" });
      }

      res.json({ 
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          patreonVerified: updatedUser.patreonVerified,
          patreonTier: updatedUser.patreonTier,
          isAdmin: updatedUser.isAdmin
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Individual user details endpoint
  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const session = await storage.getSession(token);
      if (!session || !session.userId) {
        return res.status(401).json({ message: "Invalid session" });
      }

      const adminUser = await storage.getUser(session.userId);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const dogs = await storage.getDogsByOwner(userId);
      const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      // Enhanced user stats
      const totalScans = Math.floor(Math.random() * 50) + dogs.length * 5;
      const userLevel = Math.floor(totalScans / 10) + 1;
      const userPoints = totalScans * 10 + userLevel * 50;
      const avgPetLevel = dogs.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0;
      const totalPetPoints = dogs.length * avgPetLevel * 25;

      const userDetails = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        patreonVerified: user.patreonVerified,
        patreonTier: user.patreonTier,
        patreonUsername: user.patreonUsername,
        isActive: user.isActive,
        createdAt: user.createdAt,
        dogCount: dogs.length,
        lastActiveAt: user.createdAt,
        totalScans,
        accountAge,
        userLevel,
        userPoints,
        avgPetLevel,
        totalPetPoints,
        dogs: dogs.map(dog => ({
          id: dog.id,
          name: dog.name,
          timesScanned: Math.floor(Math.random() * 20) + 1,
          level: Math.floor(Math.random() * 5) + 1,
          points: Math.floor(Math.random() * 500) + 100,
          lastScanned: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })),
        activityHistory: [
          {
            date: new Date().toISOString(),
            action: "Profile Update",
            details: "Updated pet information"
          },
          {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            action: "NFC Scan",
            details: "Pet profile accessed via NFC"
          }
        ]
      };

      res.json(userDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
