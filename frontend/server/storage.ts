import { 
  users, User, InsertUser, 
  tunnels, Tunnel, InsertTunnel, 
  sensors, Sensor, InsertSensor, 
  closureRequests, ClosureRequest, InsertClosureRequest,
  operationsLogs, OperationsLog, InsertOperationsLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Tunnel methods
  getTunnel(id: string): Promise<Tunnel | undefined>;
  createTunnel(tunnel: InsertTunnel): Promise<Tunnel>;
  updateTunnel(id: string, tunnel: Partial<Tunnel>): Promise<Tunnel | undefined>;
  deleteTunnel(id: string): Promise<boolean>;
  getAllTunnels(): Promise<Tunnel[]>;
  
  // Sensor methods
  getSensor(id: number): Promise<Sensor | undefined>;
  createSensor(sensor: InsertSensor): Promise<Sensor>;
  updateSensor(id: number, sensor: Partial<Sensor>): Promise<Sensor | undefined>;
  deleteSensor(id: number): Promise<boolean>;
  getSensorsByTunnelId(tunnelId: string): Promise<Sensor[]>;
  
  // Closure Request methods
  getClosureRequest(id: number): Promise<ClosureRequest | undefined>;
  createClosureRequest(request: InsertClosureRequest): Promise<ClosureRequest>;
  updateClosureRequest(id: number, request: Partial<ClosureRequest>): Promise<ClosureRequest | undefined>;
  deleteClosureRequest(id: number): Promise<boolean>;
  getAllClosureRequests(): Promise<ClosureRequest[]>;
  getPendingClosureRequests(): Promise<ClosureRequest[]>;
  getClosureRequestsByTunnelId(tunnelId: string): Promise<ClosureRequest[]>;
  getClosureRequestsByRequesterId(userId: number): Promise<ClosureRequest[]>;
  
  // Operations Log methods
  logOperation(log: InsertOperationsLog): Promise<OperationsLog>;
  getOperationsLogs(filters?: {
    userId?: number,
    category?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
    offset?: number
  }): Promise<OperationsLog[]>;
  getOperationsByEntityId(entityId: string): Promise<OperationsLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tunnels: Map<string, Tunnel>;
  private sensors: Map<number, Sensor>;
  private closureRequests: Map<number, ClosureRequest>;
  private operationsLogs: Map<number, OperationsLog>;
  private userId: number;
  private sensorId: number;
  private closureRequestId: number;
  private operationsLogId: number;

  constructor() {
    this.users = new Map();
    this.tunnels = new Map();
    this.sensors = new Map();
    this.closureRequests = new Map();
    this.operationsLogs = new Map<number, OperationsLog>();
    this.userId = 1;
    this.sensorId = 1;
    this.closureRequestId = 1;
    this.operationsLogId = 1;
    
    // Initialize with some mock data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "public", // Use the provided role or default to "public"
      status: "active"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Tunnel methods
  async getTunnel(id: string): Promise<Tunnel | undefined> {
    return this.tunnels.get(id);
  }

  async createTunnel(tunnel: InsertTunnel): Promise<Tunnel> {
    const newTunnel: Tunnel = {
      ...tunnel,
      lastUpdate: new Date(),
      guidanceDisplayEnabled: tunnel.guidanceDisplayEnabled || false,
      activeGuidanceSymbol: tunnel.activeGuidanceSymbol || 'none'
    };
    this.tunnels.set(tunnel.id, newTunnel);
    return newTunnel;
  }

  async updateTunnel(id: string, tunnelData: Partial<Tunnel>): Promise<Tunnel | undefined> {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) return undefined;
    
    const updatedTunnel = { ...tunnel, ...tunnelData, lastUpdate: new Date() };
    this.tunnels.set(id, updatedTunnel);
    return updatedTunnel;
  }

  async deleteTunnel(id: string): Promise<boolean> {
    return this.tunnels.delete(id);
  }

  async getAllTunnels(): Promise<Tunnel[]> {
    return Array.from(this.tunnels.values());
  }

  // Sensor methods
  async getSensor(id: number): Promise<Sensor | undefined> {
    return this.sensors.get(id);
  }

  async createSensor(sensor: InsertSensor): Promise<Sensor> {
    const id = this.sensorId++;
    // Ensure lastCalibrated is a Date even if not provided
    const newSensor: Sensor = { 
      ...sensor, 
      id,
      lastCalibrated: sensor.lastCalibrated || new Date() 
    };
    this.sensors.set(id, newSensor);
    return newSensor;
  }

  async updateSensor(id: number, sensorData: Partial<Sensor>): Promise<Sensor | undefined> {
    const sensor = this.sensors.get(id);
    if (!sensor) return undefined;
    
    const updatedSensor = { ...sensor, ...sensorData };
    this.sensors.set(id, updatedSensor);
    return updatedSensor;
  }

  async deleteSensor(id: number): Promise<boolean> {
    return this.sensors.delete(id);
  }

  async getSensorsByTunnelId(tunnelId: string): Promise<Sensor[]> {
    return Array.from(this.sensors.values()).filter(
      (sensor) => sensor.tunnelId === tunnelId
    );
  }

  // Closure Request methods
  async getClosureRequest(id: number): Promise<ClosureRequest | undefined> {
    return this.closureRequests.get(id);
  }

  async createClosureRequest(request: InsertClosureRequest): Promise<ClosureRequest> {
    const id = this.closureRequestId++;
    const now = new Date();
    const newRequest: ClosureRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      reviewedById: null,
      reviewNotes: null
    };
    this.closureRequests.set(id, newRequest);
    return newRequest;
  }

  async updateClosureRequest(id: number, requestData: Partial<ClosureRequest>): Promise<ClosureRequest | undefined> {
    const request = this.closureRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      ...requestData, 
      updatedAt: new Date() 
    };
    this.closureRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteClosureRequest(id: number): Promise<boolean> {
    return this.closureRequests.delete(id);
  }

  async getAllClosureRequests(): Promise<ClosureRequest[]> {
    return Array.from(this.closureRequests.values());
  }

  async getPendingClosureRequests(): Promise<ClosureRequest[]> {
    return Array.from(this.closureRequests.values()).filter(
      (request) => request.status === 'pending'
    );
  }

  async getClosureRequestsByTunnelId(tunnelId: string): Promise<ClosureRequest[]> {
    return Array.from(this.closureRequests.values()).filter(
      (request) => request.tunnelId === tunnelId
    );
  }

  async getClosureRequestsByRequesterId(userId: number): Promise<ClosureRequest[]> {
    return Array.from(this.closureRequests.values()).filter(
      (request) => request.requestedById === userId
    );
  }

  // Operations Log methods
  async logOperation(log: InsertOperationsLog): Promise<OperationsLog> {
    const id = this.operationsLogId++;
    
    // Prepare default values for missing fields
    const defaultValues = {
      details: {},
      entityId: null,
      environmentData: {},
      hardwareImpact: {},
      ipAddress: null,
      userAgent: null
    };
    
    // Create new log with all required fields
    const newLog: OperationsLog = {
      ...defaultValues,
      ...log,
      id,
      timestamp: new Date()
    };
    
    this.operationsLogs.set(id, newLog);
    return newLog;
  }

  async getOperationsLogs(filters?: {
    userId?: number,
    category?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
    offset?: number
  }): Promise<OperationsLog[]> {
    let logs = Array.from(this.operationsLogs.values());

    // Apply filters
    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.category) {
        logs = logs.filter(log => log.category === filters.category);
      }
      if (filters.startDate !== undefined) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate !== undefined) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }

      // Sort by timestamp (newest first)
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply pagination
      if (filters.offset !== undefined) {
        logs = logs.slice(filters.offset);
      }
      if (filters.limit !== undefined) {
        logs = logs.slice(0, filters.limit);
      }
    }

    return logs;
  }

  async getOperationsByEntityId(entityId: string): Promise<OperationsLog[]> {
    return Array.from(this.operationsLogs.values())
      .filter(log => log.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Initialize mock data
  private initializeData() {
    // Create admin user with fixed credentials
    const adminUser: User = {
      id: this.userId++,
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@tunnelguard.com',
      phone: '+973 3312 4567',
      password: 'Admin123',
      role: 'admin',
      status: 'active'
    };
    this.users.set(adminUser.id, adminUser);

    // Create ministry of works user
    const ministryUser: User = {
      id: this.userId++,
      username: 'ministry',
      fullName: 'Sara Ali',
      email: 'sara@tunnelguard.com',
      phone: '+973 3398 7654',
      password: 'ministry123',
      role: 'ministry',
      status: 'active'
    };
    this.users.set(ministryUser.id, ministryUser);

    // Create traffic department user
    const trafficUser: User = {
      id: this.userId++,
      username: 'traffic',
      fullName: 'Ahmed Hassan',
      email: 'ahmed@tunnelguard.com',
      phone: '+973 3345 8901',
      password: 'traffic123',
      role: 'traffic',
      status: 'active'
    };
    this.users.set(trafficUser.id, trafficUser);
    
    // Create public user
    const publicUser: User = {
      id: this.userId++,
      username: 'public',
      fullName: 'John Public',
      email: 'public@example.com',
      phone: '+973 1234 5678',
      password: 'public123',
      role: 'public',
      status: 'active'
    };
    this.users.set(publicUser.id, publicUser);
    
    // Create tunnels with mock data
    const tunnelIds = ['TUN001', 'TUN002', 'TUN003', 'TUN004', 'TUN005', 'TUN006', 'TUN007'];
    const tunnelNames = [
      'Al Fateh Tunnel', 
      'Diplomatic Area Tunnel', 
      'Tubli Bay Tunnel', 
      'King Faisal Highway Tunnel', 
      'Muharraq Island Tunnel', 
      'Sitra Island Tunnel', 
      'Buri Village Tunnel'
    ];
    const riskLevels = ['High', 'Moderate', 'Moderate', 'High', 'Moderate', 'Low', 'Low'];
    const waterLevels = [78, 45, 52, 85, 48, 15, 12];
    const barrierStatuses = ['Closed', 'Open', 'Open', 'Closed', 'Open', 'Open', 'Open'];
    
    for (let i = 0; i < tunnelIds.length; i++) {
      const tunnel: Tunnel = {
        id: tunnelIds[i],
        name: tunnelNames[i],
        riskLevel: riskLevels[i],
        waterLevel: waterLevels[i],
        barrierStatus: barrierStatuses[i],
        lastUpdate: new Date(),
        guidanceDisplayEnabled: false,
        activeGuidanceSymbol: 'none'
      };
      this.tunnels.set(tunnel.id, tunnel);
      
      // Add sensors for each tunnel
      const sensorTypes = ['temperature', 'humidity', 'entrance', 'center', 'exit', 'waterLevel', 'airQuality'];
      const sensorValues = [28, 72, 65, 85, 55, waterLevels[i], 65];
      const sensorStatuses = ['Warning', 'Warning', 'Warning', 'Critical', 'Warning', riskLevels[i] === 'High' ? 'Critical' : (riskLevels[i] === 'Moderate' ? 'Warning' : 'Normal'), 'Normal'];
      
      for (let j = 0; j < sensorTypes.length; j++) {
        const sensor: Sensor = {
          id: this.sensorId++,
          tunnelId: tunnelIds[i],
          type: sensorTypes[j],
          value: sensorValues[j],
          status: sensorStatuses[j],
          lastCalibrated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Always a date in the past
          nextMaintenance: new Date(Date.now() + (Math.floor(Math.random() * 60) + 30) * 24 * 60 * 60 * 1000) // Always a date in the future
        };
        this.sensors.set(sensor.id, sensor);
      }
    }
    
    // Initialize operations logs with hardware impact data
    this.initializeOperationsLogs(adminUser.id, ministryUser.id, trafficUser.id, tunnelIds);
  }
  
  private initializeOperationsLogs(adminId: number, ministryId: number, trafficId: number, tunnelIds: string[]) {
    // Define hardware components
    const components = [
      'Barrier Motor',
      'Water Pump',
      'Ventilation System',
      'Lighting Controller',
      'CCTV Camera',
      'Sensor Array',
      'Power Backup System',
      'Emergency Phone System',
      'Water Level Detector',
      'Traffic Light Controller'
    ];
    
    // Operations for tunnel maintenance
    const maintenanceActions = [
      'Updated tunnel barrier settings',
      'Calibrated water level sensors',
      'Replaced emergency lighting',
      'Adjusted ventilation system',
      'Performed routine inspection',
      'Upgraded control software',
      'Restarted monitoring systems',
      'Modified sensor thresholds',
      'Reset emergency systems'
    ];
    
    // Create sample logs for various maintenance activities with different hardware impacts
    for (let i = 0; i < 20; i++) {
      const randomTunnelIndex = Math.floor(Math.random() * tunnelIds.length);
      const tunnelId = tunnelIds[randomTunnelIndex];
      
      // Choose a random user with administrative capabilities
      const userId = [adminId, ministryId, trafficId][Math.floor(Math.random() * 3)];
      
      // Pick a random component and action
      const componentIndex = Math.floor(Math.random() * components.length);
      const component = components[componentIndex];
      const action = maintenanceActions[Math.floor(Math.random() * maintenanceActions.length)];
      
      // Determine impact level based on wear percentage
      const wearPercentage = Math.floor(Math.random() * 100);
      let impactLevel: 'low' | 'medium' | 'high' | 'critical';
      
      if (wearPercentage > 85) {
        impactLevel = 'critical';
      } else if (wearPercentage > 70) {
        impactLevel = 'high';
      } else if (wearPercentage > 45) {
        impactLevel = 'medium';
      } else {
        impactLevel = 'low';
      }
      
      // Generate random date within last 30 days
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
      
      // Set maintenance dates
      const lastMaintenance = new Date(timestamp.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
      
      // Higher wear percentage = sooner maintenance is needed
      const maintenanceDelayDays = impactLevel === 'critical' ? 7 : 
                                  impactLevel === 'high' ? 30 :
                                  impactLevel === 'medium' ? 60 : 90;
      
      const nextMaintenance = new Date(timestamp.getTime() + maintenanceDelayDays * 24 * 60 * 60 * 1000);
      
      // Create hardware impact data
      const hardwareImpact = {
        deviceId: `${tunnelId}-${component.replace(/\s+/g, '')}`,
        componentName: component,
        impactLevel: impactLevel,
        wearPercentage: wearPercentage,
        estimatedLifespan: `${Math.floor((100 - wearPercentage) / 10) * 3} months`,
        maintenanceRecommendation: impactLevel === 'critical' || impactLevel === 'high' ? 
            `Immediate replacement recommended` : 
            `Schedule routine maintenance within ${maintenanceDelayDays} days`,
        lastMaintenance: lastMaintenance.toISOString(),
        nextScheduledMaintenance: nextMaintenance.toISOString(),
        operationCount: Math.floor(Math.random() * 1000) + 500
      };
      
      // Create the operations log
      const log: OperationsLog = {
        id: this.operationsLogId++,
        userId: userId,
        action: action,
        category: 'tunnel',
        details: { tunnelName: this.tunnels.get(tunnelId)?.name, actionType: 'maintenance' },
        entityId: tunnelId,
        timestamp: timestamp,
        environmentData: {
          temperature: Math.floor(Math.random() * 15) + 20,
          humidity: Math.floor(Math.random() * 30) + 60,
          weatherCondition: ['Clear', 'Rainy', 'Windy', 'Foggy'][Math.floor(Math.random() * 4)]
        },
        hardwareImpact: hardwareImpact,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'TunnelGuard Maintenance App'
      };
      
      this.operationsLogs.set(log.id, log);
    }
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Tunnel methods
  async getTunnel(id: string): Promise<Tunnel | undefined> {
    const [tunnel] = await db.select().from(tunnels).where(eq(tunnels.id, id));
    return tunnel || undefined;
  }

  async createTunnel(tunnel: InsertTunnel): Promise<Tunnel> {
    const [newTunnel] = await db
      .insert(tunnels)
      .values({ 
        ...tunnel, 
        lastUpdate: new Date(),
        guidanceDisplayEnabled: tunnel.guidanceDisplayEnabled || false,
        activeGuidanceSymbol: tunnel.activeGuidanceSymbol || 'none'
      })
      .returning();
    return newTunnel;
  }

  async updateTunnel(id: string, tunnelData: Partial<Tunnel>): Promise<Tunnel | undefined> {
    const [updatedTunnel] = await db
      .update(tunnels)
      .set({ ...tunnelData, lastUpdate: new Date() })
      .where(eq(tunnels.id, id))
      .returning();
    return updatedTunnel || undefined;
  }

  async deleteTunnel(id: string): Promise<boolean> {
    const result = await db.delete(tunnels).where(eq(tunnels.id, id));
    return !!result;
  }

  async getAllTunnels(): Promise<Tunnel[]> {
    return await db.select().from(tunnels);
  }

  // Sensor methods
  async getSensor(id: number): Promise<Sensor | undefined> {
    const [sensor] = await db.select().from(sensors).where(eq(sensors.id, id));
    return sensor || undefined;
  }

  async createSensor(sensor: InsertSensor): Promise<Sensor> {
    const [newSensor] = await db.insert(sensors).values(sensor).returning();
    return newSensor;
  }

  async updateSensor(id: number, sensorData: Partial<Sensor>): Promise<Sensor | undefined> {
    const [updatedSensor] = await db
      .update(sensors)
      .set(sensorData)
      .where(eq(sensors.id, id))
      .returning();
    return updatedSensor || undefined;
  }

  async deleteSensor(id: number): Promise<boolean> {
    const result = await db.delete(sensors).where(eq(sensors.id, id));
    return !!result;
  }

  async getSensorsByTunnelId(tunnelId: string): Promise<Sensor[]> {
    return await db.select().from(sensors).where(eq(sensors.tunnelId, tunnelId));
  }

  // Closure Request methods
  async getClosureRequest(id: number): Promise<ClosureRequest | undefined> {
    const [request] = await db.select().from(closureRequests).where(eq(closureRequests.id, id));
    return request || undefined;
  }

  async createClosureRequest(request: InsertClosureRequest): Promise<ClosureRequest> {
    const now = new Date();
    const [newRequest] = await db
      .insert(closureRequests)
      .values({
        ...request,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newRequest;
  }

  async updateClosureRequest(id: number, requestData: Partial<ClosureRequest>): Promise<ClosureRequest | undefined> {
    const [updatedRequest] = await db
      .update(closureRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(closureRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  async deleteClosureRequest(id: number): Promise<boolean> {
    const result = await db.delete(closureRequests).where(eq(closureRequests.id, id));
    return !!result;
  }

  async getAllClosureRequests(): Promise<ClosureRequest[]> {
    return await db.select().from(closureRequests);
  }

  async getPendingClosureRequests(): Promise<ClosureRequest[]> {
    return await db
      .select()
      .from(closureRequests)
      .where(eq(closureRequests.status, 'pending'));
  }

  async getClosureRequestsByTunnelId(tunnelId: string): Promise<ClosureRequest[]> {
    return await db
      .select()
      .from(closureRequests)
      .where(eq(closureRequests.tunnelId, tunnelId));
  }

  async getClosureRequestsByRequesterId(userId: number): Promise<ClosureRequest[]> {
    return await db
      .select()
      .from(closureRequests)
      .where(eq(closureRequests.requestedById, userId));
  }

  // Operations Log methods
  async logOperation(log: InsertOperationsLog): Promise<OperationsLog> {
    // Ensure hardware impact is initialized if not provided
    const logWithDefaults = {
      ...log,
      hardwareImpact: log.hardwareImpact || {},
      timestamp: new Date()
    };
    
    const [newLog] = await db
      .insert(operationsLogs)
      .values(logWithDefaults)
      .returning();
    return newLog;
  }

  async getOperationsLogs(filters?: {
    userId?: number,
    category?: string,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
    offset?: number
  }): Promise<OperationsLog[]> {
    let query = db.select().from(operationsLogs);

    if (filters) {
      if (filters.userId) {
        query = query.where(eq(operationsLogs.userId, filters.userId));
      }
      if (filters.category) {
        query = query.where(eq(operationsLogs.category, filters.category));
      }
      if (filters.startDate) {
        query = query.where(gte(operationsLogs.timestamp, filters.startDate));
      }
      if (filters.endDate) {
        query = query.where(lte(operationsLogs.timestamp, filters.endDate));
      }

      // Order by timestamp desc
      query = query.orderBy(desc(operationsLogs.timestamp));

      // Apply pagination
      if (filters.offset !== undefined) {
        query = query.offset(filters.offset);
      }
      if (filters.limit !== undefined) {
        query = query.limit(filters.limit);
      }
    }

    return await query;
  }

  async getOperationsByEntityId(entityId: string): Promise<OperationsLog[]> {
    return await db
      .select()
      .from(operationsLogs)
      .where(eq(operationsLogs.entityId, entityId))
      .orderBy(desc(operationsLogs.timestamp));
  }
}

// Use MemStorage for now, can switch to DatabaseStorage with minimal code changes
export const storage = new MemStorage();
