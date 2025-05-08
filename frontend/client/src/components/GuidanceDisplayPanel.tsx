import React, { useState, useEffect } from 'react';
import { useTunnels } from '../context/TunnelContext';
import { FaSignal, FaExclamationTriangle, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { BsArrowLeftRight, BsExclamationCircleFill } from 'react-icons/bs';

interface GuidanceDisplayPanelProps {
  tunnelId: string;
  userId: number;
}

// Guidance symbol options for traffic officers to choose from
const guidanceSymbols = [
  { id: 'none', label: 'None', icon: <BsExclamationCircleFill className="text-secondary" /> },
  { id: 'detour_left', label: 'Detour Left', icon: <FaArrowLeft className="text-primary" /> },
  { id: 'detour_right', label: 'Detour Right', icon: <FaArrowRight className="text-primary" /> },
  { id: 'alternate_route', label: 'Alternate Route', icon: <BsArrowLeftRight className="text-info" /> },
  { id: 'caution', label: 'Caution', icon: <FaExclamationTriangle className="text-warning" /> },
  { id: 'closed', label: 'Closed', icon: <FaExclamationTriangle className="text-danger" /> },
];

const GuidanceDisplayPanel: React.FC<GuidanceDisplayPanelProps> = ({ tunnelId, userId }) => {
  const { getTunnel, updateGuidanceDisplay } = useTunnels();
  const tunnel = getTunnel(tunnelId);
  
  const [isEnabled, setIsEnabled] = useState(tunnel?.guidanceDisplayEnabled || false);
  const [selectedSymbol, setSelectedSymbol] = useState(tunnel?.activeGuidanceSymbol || 'none');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (tunnel) {
      setIsEnabled(tunnel.guidanceDisplayEnabled);
      setSelectedSymbol(tunnel.activeGuidanceSymbol);
    }
  }, [tunnel]);
  
  if (!tunnel) return null;
  
  const handleEnableToggle = async () => {
    setIsLoading(true);
    try {
      await updateGuidanceDisplay(tunnelId, !isEnabled, selectedSymbol, userId);
      setIsEnabled(!isEnabled);
    } catch (error) {
      console.error('Failed to toggle guidance display', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSymbolChange = async (symbolId: string) => {
    setIsLoading(true);
    try {
      await updateGuidanceDisplay(tunnelId, true, symbolId, userId);
      setSelectedSymbol(symbolId);
      setIsEnabled(true);
    } catch (error) {
      console.error('Failed to update guidance symbol', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedSymbolObj = guidanceSymbols.find(s => s.id === selectedSymbol) || guidanceSymbols[0];
  
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaSignal className="me-2 text-primary" />
            Traffic Guidance Display
          </h5>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="guidanceToggleSwitch"
              checked={isEnabled}
              onChange={handleEnableToggle}
              disabled={isLoading}
            />
            <label className="form-check-label" htmlFor="guidanceToggleSwitch">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {isEnabled ? (
          <>
            <p className="text-muted mb-3">
              Select a guidance symbol to display at tunnel entrances:
            </p>
            <div className="row row-cols-2 row-cols-md-3 g-3 mb-3">
              {guidanceSymbols.map(symbol => (
                <div key={symbol.id} className="col">
                  <div
                    className={`card h-100 ${selectedSymbol === symbol.id ? 'border-primary' : 'border'}`}
                    onClick={() => !isLoading && handleSymbolChange(symbol.id)}
                    style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <div className="display-5 mb-2">
                        {symbol.icon}
                      </div>
                      <div className="small fw-medium">
                        {symbol.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="alert alert-info d-flex align-items-center">
              <div className="me-3 fs-4">
                {selectedSymbolObj.icon}
              </div>
              <div>
                <strong>Active Display: {selectedSymbolObj.label}</strong>
                <div className="small">
                  This symbol will be displayed on electronic guidance signs at tunnel entrances.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-secondary">
            Guidance display is currently disabled. Toggle the switch above to enable and select a guidance symbol.
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidanceDisplayPanel;