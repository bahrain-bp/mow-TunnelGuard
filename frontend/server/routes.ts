import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTunnelSchema, insertSensorSchema, insertClosureRequestSchema, insertOperationsLogSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with same email exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      const adminId = req.body.adminId; // ID of admin making the update
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Create a copy of userData without the adminId to avoid saving it to the user data
      const { adminId: _, ...userDataToSave } = userData;
      
      const updatedUser = await storage.updateUser(id, userDataToSave);
      
      // Log user update operation
      if (adminId) {
        const admin = await storage.getUser(adminId);
        if (admin && ['admin', 'ministry', 'traffic'].includes(admin.role)) {
          // Check what fields were updated - with type-safe field checking
          const changedFields = Object.keys(userDataToSave).filter(key => {
            // Don't include password in logs for security
            if (key === 'password') return false;
            
            // Use typesafe property access using 'in' operator
            if (key in user && key in userDataToSave) {
              // @ts-ignore - we've verified the keys exist
              return user[key] !== userDataToSave[key];
            }
            return false;
          });
          
          if (changedFields.length > 0) {
            await storage.logOperation({
              userId: adminId,
              action: 'update_user',
              category: 'user',
              details: {
                targetUser: id,
                targetUsername: user.username,
                targetUserRole: user.role,
                updatedFields: changedFields,
                // For role changes, add more specific information
                roleChange: userDataToSave.role && user.role !== userDataToSave.role ? {
                  from: user.role,
                  to: userDataToSave.role
                } : null,
                // For status changes, add more specific information
                statusChange: userDataToSave.status && user.status !== userDataToSave.status ? {
                  from: user.status,
                  to: userDataToSave.status
                } : null
              },
              entityId: id.toString(),
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] || null
            });
          }
        }
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Tunnel routes
  app.get("/api/tunnels", async (req: Request, res: Response) => {
    try {
      const tunnels = await storage.getAllTunnels();
      res.json(tunnels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tunnels" });
    }
  });

  app.get("/api/tunnels/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const tunnel = await storage.getTunnel(id);
      if (!tunnel) {
        return res.status(404).json({ error: "Tunnel not found" });
      }
      res.json(tunnel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tunnel" });
    }
  });

  app.post("/api/tunnels", async (req: Request, res: Response) => {
    try {
      const tunnelData = insertTunnelSchema.parse(req.body);
      const tunnel = await storage.createTunnel(tunnelData);
      res.status(201).json(tunnel);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create tunnel" });
    }
  });

  app.put("/api/tunnels/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { userId, ...tunnelDataToSave } = req.body; // Extract userId and remaining tunnel data
      
      // Debug logging
      console.log("Updating tunnel:", id);
      console.log("Data to save:", JSON.stringify(tunnelDataToSave, null, 2));
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      const tunnel = await storage.getTunnel(id);
      if (!tunnel) {
        return res.status(404).json({ error: "Tunnel not found" });
      }
      
      // If barrier status is changing, log this as a separate operation
      if (tunnelDataToSave.barrierStatus && tunnelDataToSave.barrierStatus !== tunnel.barrierStatus) {
        // Log barrier status change
        if (userId) {
          const user = await storage.getUser(userId);
          if (user && ['admin', 'ministry', 'traffic'].includes(user.role)) {
            await storage.logOperation({
              userId,
              action: 'update_barrier',
              category: 'tunnel',
              details: {
                previousStatus: tunnel.barrierStatus,
                newStatus: tunnelDataToSave.barrierStatus,
                tunnelName: tunnel.name
              },
              entityId: id,
              environmentData: {
                waterLevel: tunnel.waterLevel,
                riskLevel: tunnel.riskLevel
              },
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] || null
            });
          }
        }
      }
      
      const updatedTunnel = await storage.updateTunnel(id, tunnelDataToSave);
      
      // Log general tunnel update
      if (userId) {
        const user = await storage.getUser(userId);
        if (user && ['admin', 'ministry', 'traffic'].includes(user.role)) {
          await storage.logOperation({
            userId,
            action: 'update_tunnel',
            category: 'tunnel',
            details: {
              updatedFields: Object.keys(tunnelDataToSave),
              tunnelName: tunnel.name
            },
            entityId: id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || null
          });
        }
      }
      
      res.json(updatedTunnel);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tunnel" });
    }
  });

  app.delete("/api/tunnels/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteTunnel(id);
      if (!success) {
        return res.status(404).json({ error: "Tunnel not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tunnel" });
    }
  });

  // Sensor routes
  app.get("/api/tunnels/:tunnelId/sensors", async (req: Request, res: Response) => {
    try {
      const tunnelId = req.params.tunnelId;
      const sensors = await storage.getSensorsByTunnelId(tunnelId);
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensors" });
    }
  });

  app.post("/api/sensors", async (req: Request, res: Response) => {
    try {
      const sensorData = insertSensorSchema.parse(req.body);
      const sensor = await storage.createSensor(sensorData);
      res.status(201).json(sensor);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sensor" });
    }
  });

  app.put("/api/sensors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const sensorData = req.body;
      
      const sensor = await storage.getSensor(id);
      if (!sensor) {
        return res.status(404).json({ error: "Sensor not found" });
      }
      
      const updatedSensor = await storage.updateSensor(id, sensorData);
      res.json(updatedSensor);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sensor" });
    }
  });

  // Authentication - simplified for this app
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        // Debug log
        console.log(`Failed login attempt for email ${email}. User exists: ${!!user}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Debug log
      console.log(`Successful login for user ${user.username}, role: ${user.role}`);
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      // Log the registration data (excluding password for security)
      const { password, ...logData } = req.body;
      console.log("User registration attempt:", logData);
      
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with same email exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        console.log(`Registration failed: Email ${userData.email} already in use`);
        return res.status(400).json({ error: "Email already in use" });
      }
      
      const user = await storage.createUser(userData);
      console.log(`User registered successfully: ${user.username}, role: ${user.role}`);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Registration validation error:", error.errors);
        return res.status(400).json({ error: error.errors });
      }
      console.error("Registration failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Closure Request routes
  app.get("/api/closure-requests", async (req: Request, res: Response) => {
    try {
      const requests = await storage.getAllClosureRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch closure requests" });
    }
  });

  app.get("/api/closure-requests/pending", async (req: Request, res: Response) => {
    try {
      const requests = await storage.getPendingClosureRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending closure requests" });
    }
  });

  app.get("/api/closure-requests/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getClosureRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Closure request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch closure request" });
    }
  });

  app.get("/api/tunnels/:tunnelId/closure-requests", async (req: Request, res: Response) => {
    try {
      const tunnelId = req.params.tunnelId;
      const requests = await storage.getClosureRequestsByTunnelId(tunnelId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tunnel closure requests" });
    }
  });

  app.get("/api/users/:userId/closure-requests", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const requests = await storage.getClosureRequestsByRequesterId(userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user's closure requests" });
    }
  });

  app.post("/api/closure-requests", async (req: Request, res: Response) => {
    try {
      const requestData = insertClosureRequestSchema.parse(req.body);
      
      // Check if tunnel exists
      const tunnel = await storage.getTunnel(requestData.tunnelId);
      if (!tunnel) {
        return res.status(404).json({ error: "Tunnel not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(requestData.requestedById);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const request = await storage.createClosureRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create closure request" });
    }
  });

  app.put("/api/closure-requests/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const requestData = req.body;
      
      const request = await storage.getClosureRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Closure request not found" });
      }
      
      // If the status is being changed to approved or rejected, make sure reviewedById is provided
      if (
        (requestData.status === 'approved' || requestData.status === 'rejected') && 
        !requestData.reviewedById
      ) {
        return res.status(400).json({ error: "Reviewer ID required for approval or rejection" });
      }
      
      const updatedRequest = await storage.updateClosureRequest(id, requestData);
      
      // Log closure request review action
      if (requestData.status === 'approved' || requestData.status === 'rejected') {
        const reviewer = await storage.getUser(requestData.reviewedById);
        const tunnel = await storage.getTunnel(request.tunnelId);
        
        if (reviewer && tunnel && ['admin', 'ministry', 'traffic'].includes(reviewer.role)) {
          await storage.logOperation({
            userId: requestData.reviewedById,
            action: requestData.status === 'approved' ? 'approve_closure' : 'reject_closure',
            category: 'closure_request',
            details: {
              requestId: id,
              tunnelId: request.tunnelId,
              tunnelName: tunnel.name,
              requestedBy: request.requestedById,
              reviewNotes: requestData.reviewNotes || 'No notes provided'
            },
            entityId: request.tunnelId,
            environmentData: {
              waterLevel: tunnel.waterLevel,
              riskLevel: tunnel.riskLevel
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || null
          });
        }
      }
      
      // If the request is approved, update the tunnel barrier status
      if (requestData.status === 'approved') {
        const tunnel = await storage.getTunnel(request.tunnelId);
        if (tunnel) {
          // Create a copy of the tunnelData without userId to avoid TypeScript errors
          const tunnelUpdateData = { barrierStatus: 'Closed' };
          
          // Update the tunnel without passing userId to the storage call
          await storage.updateTunnel(tunnel.id, tunnelUpdateData);
        }
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to update closure request" });
    }
  });

  app.delete("/api/closure-requests/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClosureRequest(id);
      if (!success) {
        return res.status(404).json({ error: "Closure request not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete closure request" });
    }
  });

  // Operations Log routes
  app.post("/api/operations-logs", async (req: Request, res: Response) => {
    try {
      const logData = insertOperationsLogSchema.parse(req.body);
      
      // Optional: Check if user exists before recording the operation
      const user = await storage.getUser(logData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Only allow logs from admin, ministry, and traffic roles
      if (!['admin', 'ministry', 'traffic'].includes(user.role)) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const log = await storage.logOperation(logData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to log operation" });
    }
  });

  app.get("/api/operations-logs", async (req: Request, res: Response) => {
    try {
      // Parse query parameters
      const filters: any = {};
      
      if (req.query.userId) {
        filters.userId = parseInt(req.query.userId as string);
      }
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }
      
      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }
      
      const logs = await storage.getOperationsLogs(filters);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch operations logs" });
    }
  });

  app.get("/api/operations-logs/entity/:entityId", async (req: Request, res: Response) => {
    try {
      const entityId = req.params.entityId;
      const logs = await storage.getOperationsByEntityId(entityId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entity operations logs" });
    }
  });
  
  // Guidance Display routes
  app.put("/api/tunnels/:id/guidance-display", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { enabled, symbol, userId } = req.body;
      
      // Validate that the tunnel exists
      const tunnel = await storage.getTunnel(id);
      if (!tunnel) {
        return res.status(404).json({ error: "Tunnel not found" });
      }
      
      // Update the tunnel's guidance display settings
      const updatedTunnel = await storage.updateTunnel(id, {
        guidanceDisplayEnabled: !!enabled,
        activeGuidanceSymbol: symbol || 'none'
      });
      
      // Log the operation if a user ID was provided
      if (userId) {
        const user = await storage.getUser(userId);
        if (user && ['admin', 'traffic'].includes(user.role)) {
          await storage.logOperation({
            userId,
            action: enabled ? 'activate_guidance_display' : 'deactivate_guidance_display',
            category: 'tunnel',
            details: {
              tunnelName: tunnel.name,
              symbol: symbol || 'none'
            },
            entityId: id,
            hardwareImpact: {
              deviceId: `${id}-GuidanceDisplay`,
              componentName: 'Traffic Guidance Display',
              impactLevel: 'low',
              wearPercentage: 10,
              operationCount: 1
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || null
          });
        }
      }
      
      res.json(updatedTunnel);
    } catch (error) {
      res.status(500).json({ error: "Failed to update guidance display settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
