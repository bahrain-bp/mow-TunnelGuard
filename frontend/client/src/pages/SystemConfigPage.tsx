import React, { useState } from 'react';
import { FaSave, FaCog, FaBell, FaShieldAlt, FaServer, FaDatabase, FaEnvelope, FaGlobe, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

interface ConfigSection {
  id: string;
  title: string;
  icon: JSX.Element;
  fields: ConfigField[];
}

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle' | 'textarea' | 'time';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
  description?: string;
  min?: number;
  max?: number;
  unit?: string;
}

const SystemConfigPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  
  // Initial configuration sections with fields
  const [configSections, setConfigSections] = useState<ConfigSection[]>([
    {
      id: 'general',
      title: 'General Settings',
      icon: <FaCog />,
      fields: [
        {
          id: 'systemName',
          label: 'System Name',
          type: 'text',
          value: 'TunnelGuard',
          description: 'The name displayed throughout the application'
        },
        {
          id: 'maintenanceMode',
          label: 'Maintenance Mode',
          type: 'toggle',
          value: false,
          description: 'When enabled, only administrators can access the system'
        },
        {
          id: 'dateFormat',
          label: 'Date Format',
          type: 'select',
          value: 'MM/DD/YYYY',
          options: [
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
          ],
          description: 'Format for displaying dates throughout the application'
        },
        {
          id: 'timeFormat',
          label: 'Time Format',
          type: 'select',
          value: '12h',
          options: [
            { value: '12h', label: '12-hour (AM/PM)' },
            { value: '24h', label: '24-hour' }
          ],
          description: 'Format for displaying times throughout the application'
        },
        {
          id: 'defaultLanguage',
          label: 'Default Language',
          type: 'select',
          value: 'en',
          options: [
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'Arabic' }
          ],
          description: 'Default language for new users'
        }
      ]
    },
    {
      id: 'alerts',
      title: 'Alert Configuration',
      icon: <FaBell />,
      fields: [
        {
          id: 'alertRefreshInterval',
          label: 'Alert Refresh Interval',
          type: 'number',
          value: 30,
          min: 5,
          max: 300,
          unit: 'seconds',
          description: 'How often the system checks for new alerts'
        },
        {
          id: 'highWaterThreshold',
          label: 'High Water Alert Threshold',
          type: 'number',
          value: 70,
          min: 0,
          max: 100,
          unit: '%',
          description: 'Water level percentage that triggers a high alert'
        },
        {
          id: 'moderateWaterThreshold',
          label: 'Moderate Water Alert Threshold',
          type: 'number',
          value: 40,
          min: 0,
          max: 100,
          unit: '%',
          description: 'Water level percentage that triggers a moderate alert'
        },
        {
          id: 'alertEmails',
          label: 'Alert Email Recipients',
          type: 'textarea',
          value: 'alerts@tunnelguard.gov, ministry@example.gov',
          description: 'Comma-separated list of email addresses to receive alerts'
        },
        {
          id: 'smsAlerts',
          label: 'SMS Alerts',
          type: 'toggle',
          value: true,
          description: 'Enable SMS notifications for critical alerts'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: <FaShieldAlt />,
      fields: [
        {
          id: 'sessionTimeout',
          label: 'Session Timeout',
          type: 'number',
          value: 30,
          min: 5,
          max: 120,
          unit: 'minutes',
          description: 'Time of inactivity before users are logged out'
        },
        {
          id: 'passwordExpiry',
          label: 'Password Expiry',
          type: 'number',
          value: 90,
          min: 30,
          max: 365,
          unit: 'days',
          description: 'Number of days before passwords must be changed'
        },
        {
          id: 'minimumPasswordLength',
          label: 'Minimum Password Length',
          type: 'number',
          value: 8,
          min: 6,
          max: 32,
          description: 'Minimum number of characters for passwords'
        },
        {
          id: 'twoFactorAuth',
          label: 'Two-Factor Authentication',
          type: 'toggle',
          value: true,
          description: 'Require two-factor authentication for all admin users'
        },
        {
          id: 'loginAttempts',
          label: 'Max Login Attempts',
          type: 'number',
          value: 5,
          min: 3,
          max: 10,
          description: 'Maximum number of failed login attempts before account lockout'
        }
      ]
    },
    {
      id: 'server',
      title: 'Server Configuration',
      icon: <FaServer />,
      fields: [
        {
          id: 'serverPort',
          label: 'Server Port',
          type: 'number',
          value: 5000,
          min: 1024,
          max: 65535,
          description: 'Port number for the application server'
        },
        {
          id: 'apiRateLimit',
          label: 'API Rate Limit',
          type: 'number',
          value: 100,
          min: 10,
          max: 1000,
          unit: 'requests/minute',
          description: 'Maximum number of API requests allowed per minute per client'
        },
        {
          id: 'maxUploadSize',
          label: 'Maximum Upload Size',
          type: 'number',
          value: 10,
          min: 1,
          max: 100,
          unit: 'MB',
          description: 'Maximum size for file uploads'
        },
        {
          id: 'logRetention',
          label: 'Log Retention Period',
          type: 'number',
          value: 30,
          min: 7,
          max: 365,
          unit: 'days',
          description: 'Number of days to keep system logs'
        },
        {
          id: 'debugMode',
          label: 'Debug Mode',
          type: 'toggle',
          value: false,
          description: 'Enable verbose logging for troubleshooting'
        }
      ]
    },
    {
      id: 'database',
      title: 'Database Settings',
      icon: <FaDatabase />,
      fields: [
        {
          id: 'dbHost',
          label: 'Database Host',
          type: 'text',
          value: 'localhost',
          description: 'Hostname or IP address of the database server'
        },
        {
          id: 'dbPort',
          label: 'Database Port',
          type: 'number',
          value: 5432,
          min: 1024,
          max: 65535,
          description: 'Port number for the database connection'
        },
        {
          id: 'dbName',
          label: 'Database Name',
          type: 'text',
          value: 'tunnelguard_prod',
          description: 'Name of the database to connect to'
        },
        {
          id: 'dbPoolSize',
          label: 'Connection Pool Size',
          type: 'number',
          value: 10,
          min: 5,
          max: 100,
          description: 'Maximum number of database connections to maintain'
        },
        {
          id: 'dbBackupTime',
          label: 'Daily Backup Time',
          type: 'time',
          value: '02:00',
          description: 'Time of day to perform automatic database backups'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: <FaEnvelope />,
      fields: [
        {
          id: 'smtpHost',
          label: 'SMTP Server',
          type: 'text',
          value: 'smtp.tunnelguard.gov',
          description: 'SMTP server hostname for sending emails'
        },
        {
          id: 'smtpPort',
          label: 'SMTP Port',
          type: 'number',
          value: 587,
          min: 1,
          max: 65535,
          description: 'Port number for the SMTP server'
        },
        {
          id: 'senderEmail',
          label: 'Sender Email',
          type: 'text',
          value: 'noreply@tunnelguard.gov',
          description: 'Email address from which notifications are sent'
        },
        {
          id: 'smsGateway',
          label: 'SMS Gateway',
          type: 'text',
          value: 'api.smsgateway.com',
          description: 'SMS gateway provider URL for sending text messages'
        },
        {
          id: 'notificationLogo',
          label: 'Include Logo in Emails',
          type: 'toggle',
          value: true,
          description: 'Include the system logo in email notifications'
        }
      ]
    },
    {
      id: 'integration',
      title: 'External Integrations',
      icon: <FaGlobe />,
      fields: [
        {
          id: 'googleMapsApiKey',
          label: 'Google Maps API Key',
          type: 'text',
          value: 'AIza...[hidden]',
          description: 'API key for Google Maps integration'
        },
        {
          id: 'weatherApiKey',
          label: 'Weather API Key',
          type: 'text',
          value: '1234...[hidden]',
          description: 'API key for weather data integration'
        },
        {
          id: 'trafficApiEndpoint',
          label: 'Traffic API Endpoint',
          type: 'text',
          value: 'https://api.traffic.gov.bh/v1',
          description: 'Endpoint URL for traffic data integration'
        },
        {
          id: 'webhookUrl',
          label: 'Alert Webhook URL',
          type: 'text',
          value: 'https://alerts.ministry.gov.bh/webhook',
          description: 'Webhook URL for sending alerts to external systems'
        },
        {
          id: 'enableExternalApis',
          label: 'Enable External APIs',
          type: 'toggle',
          value: true,
          description: 'Allow the system to connect to external API services'
        }
      ]
    }
  ]);
  
  // Update a configuration field value
  const updateFieldValue = (sectionId: string, fieldId: string, value: string | number | boolean) => {
    setShowUnsavedChanges(true);
    setConfigSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map(field => {
              if (field.id === fieldId) {
                return {
                  ...field,
                  value
                };
              }
              return field;
            })
          };
        }
        return section;
      })
    );
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call to save the configuration
    console.log('Saving configuration:', configSections);
    setShowSaveConfirmation(true);
    setShowUnsavedChanges(false);
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowSaveConfirmation(false);
    }, 3000);
  };
  
  // Render input field based on type
  const renderField = (section: ConfigSection, field: ConfigField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-control"
            id={field.id}
            value={field.value as string}
            onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
          />
        );
        
      case 'number':
        return (
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              id={field.id}
              value={field.value as number}
              min={field.min}
              max={field.max}
              onChange={(e) => updateFieldValue(section.id, field.id, Number(e.target.value))}
            />
            {field.unit && <span className="input-group-text">{field.unit}</span>}
          </div>
        );
        
      case 'select':
        return (
          <select
            className="form-select"
            id={field.id}
            value={field.value as string}
            onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'toggle':
        return (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={field.id}
              checked={field.value as boolean}
              onChange={(e) => updateFieldValue(section.id, field.id, e.target.checked)}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <textarea
            className="form-control"
            id={field.id}
            value={field.value as string}
            rows={3}
            onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
          ></textarea>
        );
        
      case 'time':
        return (
          <input
            type="time"
            className="form-control"
            id={field.id}
            value={field.value as string}
            onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Check if the current user has permission to edit settings
  const canEditSettings = hasPermission('admin');
  
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">System Configuration</h1>
        
        {showUnsavedChanges && (
          <div className="alert alert-warning py-2 px-3 mb-0 d-flex align-items-center">
            <FaExclamationTriangle className="me-2 text-warning" />
            You have unsaved changes
          </div>
        )}
        
        {showSaveConfirmation && (
          <div className="alert alert-success py-2 px-3 mb-0 d-flex align-items-center">
            <FaSave className="me-2 text-success" />
            Configuration saved successfully
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary d-flex align-items-center"
          onClick={handleSubmit}
          disabled={!canEditSettings}
        >
          <FaSave className="me-2" /> Save Changes
        </button>
      </div>
      
      <div className="row">
        {/* Navigation Sidebar */}
        <div className="col-md-3 mb-4">
          <div className="list-group shadow-sm">
            {configSections.map(section => (
              <button
                key={section.id}
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className={`me-3 ${activeSection === section.id ? 'text-white' : 'text-primary'}`}>{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Settings Form */}
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {configSections.map(section => (
                  <div 
                    key={section.id} 
                    style={{ display: activeSection === section.id ? 'block' : 'none' }}
                  >
                    <h3 className="mb-4 d-flex align-items-center">
                      <span className="me-3 text-primary">{section.icon}</span>
                      {section.title}
                    </h3>
                    
                    {section.fields.map(field => (
                      <div className="mb-4" key={field.id}>
                        <div className="row align-items-center">
                          <div className="col-md-4">
                            <label htmlFor={field.id} className="form-label fw-bold mb-1">
                              {field.label}
                            </label>
                            {field.description && (
                              <div className="form-text text-muted small">
                                {field.description}
                              </div>
                            )}
                          </div>
                          <div className="col-md-8">
                            {renderField(section, field)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {!canEditSettings && (
                  <div className="alert alert-warning">
                    <FaExclamationTriangle className="me-2 text-warning" />
                    You do not have permission to modify system configuration. Contact an administrator for assistance.
                  </div>
                )}
                
                <div className="d-flex justify-content-end mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary d-flex align-items-center"
                    disabled={!canEditSettings}
                  >
                    <FaSave className="me-2" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigPage;