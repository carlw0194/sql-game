/**
 * Payment Dashboard Page
 * 
 * This page serves as the main hub for all payment-related activities in the SQL Game.
 * It provides tabs for managing subscriptions and payment methods, allowing users to
 * easily switch between different payment management features.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SubscriptionManager from '../components/payment/SubscriptionManager';
import PaymentMethodManager from '../components/payment/PaymentMethodManager';
import { useAuth } from '../context/AuthContext';

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab Panel Component
 * 
 * A component that displays the content for a specific tab.
 * It only renders its children when the tab is active.
 */
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to create accessibility props for tabs
 */
const a11yProps = (index: number) => {
  return {
    id: `payment-tab-${index}`,
    'aria-controls': `payment-tabpanel-${index}`,
  };
};

/**
 * Payment Dashboard Page Component
 * 
 * The main component that renders the payment dashboard with tabs for
 * subscriptions and payment methods.
 */
const PaymentDashboard: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Get auth context
  const { user } = useAuth();
  
  /**
   * Handle tab change
   * 
   * Updates the active tab when a user clicks on a different tab.
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // If user is not logged in, show a message
  if (!user) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <h4 style={{ marginBottom: '16px' }}>
            Please log in to access the Payment Dashboard
          </h4>
          <p>
            <Link to="/login">
              Click here to log in
            </Link>
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumbs navigation */}
      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Home
        </Link>
        {' > '}
        <span>Payment Dashboard</span>
      </div>
      
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>
          Payment Dashboard
        </h1>
        <p style={{ color: '#666' }}>
          Manage your subscriptions and payment methods
        </p>
      </div>
      
      {/* Main content with tabs */}
      <div style={{ 
        marginBottom: '32px', 
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        borderRadius: '4px'
      }}>
        <div style={{ 
          borderBottom: '1px solid #ddd',
          display: 'flex'
        }}>
          <button 
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 0 ? '2px solid #1976d2' : 'none',
              color: activeTab === 0 ? '#1976d2' : 'inherit',
              fontWeight: activeTab === 0 ? 'bold' : 'normal'
            }}
            onClick={(e) => handleTabChange(e, 0)}
            {...a11yProps(0)}
          >
            Subscriptions
          </button>
          <button 
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 1 ? '2px solid #1976d2' : 'none',
              color: activeTab === 1 ? '#1976d2' : 'inherit',
              fontWeight: activeTab === 1 ? 'bold' : 'normal'
            }}
            onClick={(e) => handleTabChange(e, 1)}
            {...a11yProps(1)}
          >
            Payment Methods
          </button>
        </div>
        
        {/* Tab content */}
        <TabPanel value={activeTab} index={0}>
          <SubscriptionManager />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <PaymentMethodManager />
        </TabPanel>
      </div>
      
      {/* Additional information section */}
      <div style={{ 
        padding: '24px', 
        marginBottom: '32px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        borderRadius: '4px'
      }}>
        <h5 style={{ marginBottom: '16px' }}>
          About Our Subscription Plans
        </h5>
        <p style={{ marginBottom: '16px' }}>
          SQL Game offers different subscription tiers to enhance your learning experience. 
          Our premium plans provide access to advanced challenges, detailed analytics, 
          and additional learning resources.
        </p>
        <p>
          For any payment-related inquiries, please contact our support team at 
          <a href="mailto:support@sqlgame.com" style={{ marginLeft: '8px' }}>
            support@sqlgame.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentDashboard;
