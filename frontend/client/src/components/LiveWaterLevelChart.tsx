import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'recharts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { useTunnels } from '@/context/TunnelContext';

// Colors for different risk levels
const riskColors = {
  Low: '#4cd964',
  Moderate: '#ffcc00',
  High: '#ff3b30'
};

// Threshold values
const WATER_LEVEL_THRESHOLD = {
  Low: 30,
  Moderate: 60,
  High: 90
};

interface WaterLevelData {
  name: string;
  value: number;
  risk: string;
}

const LiveWaterLevelChart: React.FC = () => {
  const { theme } = useTheme();
  const { tunnels } = useTunnels();
  const [chartData, setChartData] = useState<WaterLevelData[]>([]);
  const isDarkMode = theme === 'dark';

  // Function to convert tunnel data to chart data
  const processChartData = () => {
    const processedData = tunnels.map(tunnel => {
      const waterLevel = tunnel.waterLevel;
      let risk = 'Low';
      
      if (waterLevel > WATER_LEVEL_THRESHOLD.Moderate) {
        risk = waterLevel > WATER_LEVEL_THRESHOLD.High ? 'High' : 'Moderate';
      }
      
      return {
        name: tunnel.name.replace('Tunnel', '').trim(),
        value: waterLevel,
        risk
      };
    });
    
    // Sort by water level descending
    return processedData.sort((a, b) => b.value - a.value);
  };

  // Update chart data when tunnels change
  useEffect(() => {
    if (tunnels.length > 0) {
      setChartData(processChartData());
    }
  }, [tunnels]);

  // Custom tooltip to show more detailed information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { value, risk } = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: isDarkMode ? '#24243e' : '#fff',
          padding: '10px',
          border: `1px solid ${isDarkMode ? '#3a3a5a' : '#ccc'}`,
          borderRadius: '5px',
          color: isDarkMode ? '#e9ecef' : '#333'
        }}>
          <p className="fw-bold mb-1">{label}</p>
          <p className="mb-1">
            <span>Water Level: </span>
            <span className="fw-medium" style={{ color: riskColors[risk as keyof typeof riskColors] }}>
              {value}%
            </span>
          </p>
          <p className="mb-0">
            <span>Risk Level: </span>
            <span className="fw-medium" style={{ color: riskColors[risk as keyof typeof riskColors] }}>
              {risk}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container" style={{ width: '100%', height: '88%' }}>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 25,
            }}
          >
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={riskColors.Low} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={riskColors.Low} stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={riskColors.Moderate} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={riskColors.Moderate} stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={riskColors.High} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={riskColors.High} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: isDarkMode ? '#e9ecef' : '#333' }}
              stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              tickMargin={10}
            />
            <YAxis
              tick={{ fill: isDarkMode ? '#e9ecef' : '#333' }}
              stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              domain={[0, 100]}
              tickCount={6}
              label={{
                value: 'Water Level (%)',
                angle: -90,
                position: 'insideLeft',
                fill: isDarkMode ? '#e9ecef' : '#333',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{
                color: isDarkMode ? '#e9ecef' : '#333',
                paddingTop: '10px'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Water Level"
              stroke="#4e73df"
              fillOpacity={1}
              fill="url(#colorLow)"
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ color: isDarkMode ? '#e9ecef' : '#333' }}>Loading tunnel data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWaterLevelChart;