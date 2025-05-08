import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, queryClient } from '../lib/queryClient';
import { toast } from 'react-toastify';
import { mockTunnels } from '../data/mockData';

interface Tunnel {
  id: string;
  name: string;
  riskLevel: string;
  waterLevel: number;
  barrierStatus: string;
  lastUpdate: Date;
  guidanceDisplayEnabled: boolean;
  activeGuidanceSymbol: string;
  mapEmbedHtml?: string;
  sensors?: Record<string, any>;
}

interface TunnelContextType {
  tunnels: Tunnel[];
  loading: boolean;
  error: string | null;
  fetchTunnels: () => Promise<void>;
  getTunnel: (id: string) => Tunnel | undefined;
  updateTunnel: (id: string, data: Partial<Tunnel>) => Promise<void>;
  toggleBarrier: (id: string) => Promise<void>;
  deleteTunnel: (id: string) => Promise<void>;
  addTunnel: (tunnel: Omit<Tunnel, 'lastUpdate'>) => Promise<void>;
  updateGuidanceDisplay: (id: string, enabled: boolean, symbol: string, userId: number) => Promise<void>;
}

const TunnelContext = createContext<TunnelContextType | undefined>(undefined);

export const TunnelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTunnels();
  }, []);

  const fetchTunnels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/tunnels');
      const data = await response.json();
      // For each tunnel, get its sensors too
      const tunnelsWithSensors = await Promise.all(
        data.map(async (tunnel: Tunnel) => {
          try {
            const sensorsResponse = await apiRequest('GET', `/api/tunnels/${tunnel.id}/sensors`);
            const sensorsData = await sensorsResponse.json();
            
            // Convert sensors array to an object with type as key
            const sensorsObject: Record<string, any> = {};
            sensorsData.forEach((sensor: any) => {
              sensorsObject[sensor.type] = sensor.value;
            });
            
            return { ...tunnel, sensors: sensorsObject };
          } catch (error) {
            console.error(`Failed to fetch sensors for tunnel ${tunnel.id}`, error);
            return tunnel;
          }
        })
      );
      
      setTunnels(tunnelsWithSensors);
    } catch (error) {
      console.error('Failed to fetch tunnels', error);
      setError('Failed to fetch tunnels. Using mock data instead.');
      // Use mock data if API fails
      setTunnels(mockTunnels);
    } finally {
      setLoading(false);
    }
  };

  const getTunnel = (id: string) => {
    return tunnels.find(tunnel => tunnel.id === id);
  };

  const updateTunnel = async (id: string, data: Partial<Tunnel>) => {
    setLoading(true);
    
    try {
      const response = await apiRequest('PUT', `/api/tunnels/${id}`, data);
      const updatedTunnel = await response.json();
      
      setTunnels(prevTunnels => 
        prevTunnels.map(tunnel => 
          tunnel.id === id ? { ...tunnel, ...updatedTunnel } : tunnel
        )
      );
      
      toast.success('Tunnel updated successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/tunnels'] });
    } catch (error) {
      console.error('Failed to update tunnel', error);
      toast.error('Failed to update tunnel');
      
      // Update locally if API fails
      setTunnels(prevTunnels => 
        prevTunnels.map(tunnel => 
          tunnel.id === id ? { ...tunnel, ...data } : tunnel
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleBarrier = async (id: string) => {
    const tunnel = tunnels.find(t => t.id === id);
    if (!tunnel) return;
    
    const newStatus = tunnel.barrierStatus === 'Open' ? 'Closed' : 'Open';
    await updateTunnel(id, { barrierStatus: newStatus });
  };

  const deleteTunnel = async (id: string) => {
    setLoading(true);
    try {
      await apiRequest('DELETE', `/api/tunnels/${id}`);
      
      setTunnels(prevTunnels => 
        prevTunnels.filter(tunnel => tunnel.id !== id)
      );
      
      toast.success('Tunnel deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/tunnels'] });
    } catch (error) {
      console.error('Failed to delete tunnel', error);
      toast.error('Failed to delete tunnel');
      
      // Delete locally if API fails
      setTunnels(prevTunnels => 
        prevTunnels.filter(tunnel => tunnel.id !== id)
      );
    } finally {
      setLoading(false);
    }
  };

  const addTunnel = async (tunnel: Omit<Tunnel, 'lastUpdate'>) => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/tunnels', tunnel);
      const newTunnel = await response.json();
      
      setTunnels(prevTunnels => [...prevTunnels, newTunnel]);
      
      toast.success('Tunnel added successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/tunnels'] });
    } catch (error) {
      console.error('Failed to add tunnel', error);
      toast.error('Failed to add tunnel');
    } finally {
      setLoading(false);
    }
  };
  
  const updateGuidanceDisplay = async (id: string, enabled: boolean, symbol: string, userId: number) => {
    setLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/tunnels/${id}/guidance-display`, { 
        enabled, 
        symbol, 
        userId 
      });
      const updatedTunnel = await response.json();
      
      setTunnels(prevTunnels => 
        prevTunnels.map(tunnel => 
          tunnel.id === id ? 
          { 
            ...tunnel, 
            guidanceDisplayEnabled: updatedTunnel.guidanceDisplayEnabled, 
            activeGuidanceSymbol: updatedTunnel.activeGuidanceSymbol 
          } : tunnel
        )
      );
      
      const statusMessage = enabled 
        ? `Guidance display activated with "${symbol}" symbol` 
        : 'Guidance display deactivated';
        
      toast.success(statusMessage);
      
      // Invalidate tunnel queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tunnels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tunnels', id] });
    } catch (error) {
      console.error('Failed to update guidance display', error);
      toast.error('Failed to update guidance display');
      
      // Update locally if API fails
      setTunnels(prevTunnels => 
        prevTunnels.map(tunnel => 
          tunnel.id === id ? 
          { 
            ...tunnel, 
            guidanceDisplayEnabled: enabled, 
            activeGuidanceSymbol: symbol
          } : tunnel
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TunnelContext.Provider value={{
      tunnels,
      loading,
      error,
      fetchTunnels,
      getTunnel,
      updateTunnel,
      toggleBarrier,
      deleteTunnel,
      addTunnel,
      updateGuidanceDisplay
    }}>
      {children}
    </TunnelContext.Provider>
  );
};

export const useTunnels = () => {
  const context = useContext(TunnelContext);
  if (context === undefined) {
    throw new Error('useTunnels must be used within a TunnelProvider');
  }
  return context;
};
