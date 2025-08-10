import { users, dogs, locations, sessions, type User, type InsertUser, type Dog, type InsertDog, type Location, type InsertLocation, type Session, type InsertSession } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Dog methods
  getDog(id: number): Promise<Dog | undefined>;
  getDogByNfcTag(nfcTagId: string): Promise<Dog | undefined>;
  getDogsByOwner(ownerId: number): Promise<Dog[]>;
  createDog(dog: InsertDog): Promise<Dog>;
  updateDog(id: number, updates: Partial<InsertDog>): Promise<Dog | undefined>;
  deleteDog(id: number): Promise<boolean>;
  
  // Location methods
  getLocationsByDog(dogId: number): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Session methods
  getSession(token: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  deleteSession(token: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private dogs: Map<number, Dog> = new Map();
  private locations: Map<number, Location> = new Map();
  private sessions: Map<string, Session> = new Map();
  private currentUserId: number = 1;
  private currentDogId: number = 1;
  private currentLocationId: number = 1;
  private currentSessionId: number = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      username: "buddyowner",
      email: "real_CAK3D@yahoo.com",
      password: crypto.createHash('sha256').update('password123').digest('hex'),
      name: "John Doe",
      phone: "(518) 610-3096",
      address: "37 Fisher Ave, Lewiston, Maine, 04240",
      avatar: null,
      patreonId: null,
      patreonUsername: null,
      patreonTier: null,
      patreonVerified: false,
      isAdmin: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, sampleUser);
    
    // Create admin user
    const adminUser: User = {
      id: 2,
      username: "CAK3D",
      email: "real_cak3d@yahoo.com",
      password: crypto.createHash('sha256').update('Cak3d_518').digest('hex'), // Properly hashed password
      name: "CAK3D Admin",
      phone: null,
      address: null,
      avatar: null,
      patreonId: null,
      patreonUsername: null,
      patreonTier: null,
      patreonVerified: false,
      isAdmin: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(2, adminUser);
    this.currentUserId = 3;

    // Create sample dog
    const sampleDog: Dog = {
      id: 1,
      nfcTagId: "04:6C:E3:0F:BE:2A:81",
      name: "Buddy",
      description: "A friendly Golden Retriever who loves adventures and meeting new people!",
      age: "3 years",
      weight: "65 lbs",
      coat: "Golden",
      coatColor: "Golden",
      sex: "Male",
      eyeColor: "Brown",
      neutered: "Yes",
      breed: "Golden Retriever",
      personality: "Friendly, energetic, loyal",
      loves: "Playing fetch, swimming, treats",
      routine: "Morning walk, afternoon play, evening cuddles",
      training: "Basic commands, house trained",
      quirks: "Loves to carry sticks, afraid of vacuum cleaners",
      medicalInfo: {
        shots: "Up to date - last updated 3 months ago",
        medications: "None currently",
        vaccinations: "Rabies, DHPP, Bordetella - current",
        checkups: "Annual exam - due next month",
        allergies: "None known"
      },
      socials: {
        youtube: "@BuddyAdventures",
        instagram: "@buddy_golden_retriever",
        facebook: "Buddy the Golden",
        donationLink: "https://paypal.me/buddycare"
      },
      testimonials: [
        { text: "Buddy is the sweetest dog! So well-behaved.", author: "Sarah M." },
        { text: "Found him once and he was so friendly. Great system!", author: "Mike R." }
      ],
      gallery: [
        { type: "Photo", description: "Playing at the beach", url: "https://images.unsplash.com/photo-1551717743-49959800b1f6" },
        { type: "Photo", description: "Sleeping in the sun", url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee" }
      ],
      photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d",
      ownerId: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dogs.set(1, sampleDog);
    this.currentDogId = 2;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name ?? null,
      phone: insertUser.phone ?? null,
      address: insertUser.address ?? null,
      patreonId: insertUser.patreonId ?? null,
      patreonTier: insertUser.patreonTier ?? null,
      patreonVerified: insertUser.patreonVerified ?? null,
      isActive: insertUser.isActive ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Dog methods
  async getDog(id: number): Promise<Dog | undefined> {
    return this.dogs.get(id);
  }

  async getDogByNfcTag(nfcTagId: string): Promise<Dog | undefined> {
    return Array.from(this.dogs.values()).find(dog => dog.nfcTagId === nfcTagId);
  }

  async getDogsByOwner(ownerId: number): Promise<Dog[]> {
    return Array.from(this.dogs.values()).filter(dog => dog.ownerId === ownerId);
  }

  async createDog(insertDog: InsertDog): Promise<Dog> {
    const id = this.currentDogId++;
    const dog: Dog = {
      id,
      name: insertDog.name,
      nfcTagId: insertDog.nfcTagId ?? null,
      description: insertDog.description ?? null,
      isActive: insertDog.isActive ?? null,
      age: insertDog.age ?? null,
      weight: insertDog.weight ?? null,
      coat: insertDog.coat ?? null,
      coatColor: insertDog.coatColor ?? null,
      sex: insertDog.sex ?? null,
      eyeColor: insertDog.eyeColor ?? null,
      neutered: insertDog.neutered ?? null,
      breed: insertDog.breed ?? null,
      personality: insertDog.personality ?? null,
      loves: insertDog.loves ?? null,
      routine: insertDog.routine ?? null,
      training: insertDog.training ?? null,
      quirks: insertDog.quirks ?? null,
      medicalInfo: insertDog.medicalInfo ?? null,
      socials: insertDog.socials ?? null,
      testimonials: insertDog.testimonials ?? null,
      gallery: insertDog.gallery ?? null,
      photoUrl: insertDog.photoUrl ?? null,
      ownerId: insertDog.ownerId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dogs.set(id, dog);
    return dog;
  }

  async updateDog(id: number, updates: Partial<InsertDog>): Promise<Dog | undefined> {
    const dog = this.dogs.get(id);
    if (!dog) return undefined;
    
    const updatedDog: Dog = {
      ...dog,
      ...updates,
      updatedAt: new Date(),
    };
    this.dogs.set(id, updatedDog);
    return updatedDog;
  }

  async deleteDog(id: number): Promise<boolean> {
    return this.dogs.delete(id);
  }

  // Location methods
  async getLocationsByDog(dogId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(location => location.dogId === dogId);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      id,
      dogId: insertLocation.dogId ?? null,
      deviceName: insertLocation.deviceName ?? null,
      latitude: insertLocation.latitude ?? null,
      longitude: insertLocation.longitude ?? null,
      timestamp: insertLocation.timestamp ?? null,
      active: insertLocation.active ?? null,
      createdAt: new Date(),
    };
    this.locations.set(id, location);
    return location;
  }

  // Session methods
  async getSession(token: string): Promise<Session | undefined> {
    const session = this.sessions.get(token);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(token);
    }
    return undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = {
      id,
      userId: insertSession.userId ?? null,
      token: insertSession.token,
      expiresAt: insertSession.expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(session.token, session);
    return session;
  }

  async deleteSession(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.sessions.entries());
    for (const [token, session] of entries) {
      if (session.expiresAt <= now) {
        this.sessions.delete(token);
      }
    }
  }
}

export const storage = new MemStorage();
