/**
 * Subscription Manager Component
 * 
 * This component displays the user's current subscription status and allows them
 * to manage their subscription, including viewing available plans and subscribing
 * to new plans.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

// Types for our data models
interface PricingPlan {
  id: number;
  name: string;
  tier: string;
  price_monthly: number;
  price_yearly: number;
  description: string;
  features: string; // JSON string of features
  is_active: boolean;
}

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  is_auto_renew: boolean;
  created_at: string;
  updated_at: string;
  pricing_plan?: PricingPlan;
}

interface PaymentMethod {
  id: number;
  user_id: number;
  method_type: string;
  card_last_four?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;
  mobile_number?: string;
  payoneer_email?: string;
  is_default: boolean;
}

const SubscriptionManager: React.FC = () => {
  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [subscribing, setSubscribing] = useState<boolean>(false);
  
  // Get auth context for the current user
  const { token } = useAuth();
  
  // Fetch subscription data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user's subscriptions
        const subscriptionsResponse = await fetchWithAuth('/payments/subscriptions', token);
        const subscriptionsData = await subscriptionsResponse.json();
        
        // Get the active subscription if any
        const activeSubscription = subscriptionsData.find(
          (sub: Subscription) => sub.status === 'active'
        );
        
        if (activeSubscription) {
          // Fetch the plan details for this subscription
          const planResponse = await fetchWithAuth(`/payments/pricing-plans/${activeSubscription.plan_id}`, token);
          const planData = await planResponse.json();
          
          // Combine subscription with its plan
          setSubscription({
            ...activeSubscription,
            pricing_plan: planData
          });
        } else {
          setSubscription(null);
        }
        
        // Fetch all available pricing plans
        const plansResponse = await fetchWithAuth('/payments/pricing-plans', token);
        const plansData = await plansResponse.json();
        setPlans(plansData);
        
        // Fetch user's payment methods
        const methodsResponse = await fetchWithAuth('/payments/payment-methods', token);
        const methodsData = await methodsResponse.json();
        setPaymentMethods(methodsData);
        
      } catch (err) {
        console.error('Error fetching subscription data:', err);
        setError('Failed to load subscription data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token]);
  
  /**
   * Subscribe to a new plan
   * 
   * Creates a new subscription for the user with the selected plan and payment method.
   * 
   * @param planId - ID of the plan to subscribe to
   */
  const handleSubscribe = async (planId: number) => {
    // Check if user has a payment method
    if (paymentMethods.length === 0) {
      setError('You need to add a payment method before subscribing.');
      return;
    }
    
    const defaultMethod = paymentMethods.find(method => method.is_default) || paymentMethods[0];
    
    setSubscribing(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth('/payments/subscriptions', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          payment_method_id: defaultMethod.id,
          billing_cycle: 'monthly',
          is_auto_renew: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create subscription');
      }
      
      const newSubscription = await response.json();
      
      // Fetch the plan details for this subscription
      const planResponse = await fetchWithAuth(`/payments/pricing-plans/${newSubscription.plan_id}`, token);
      const planData = await planResponse.json();
      
      // Update state with new subscription
      setSubscription({
        ...newSubscription,
        pricing_plan: planData
      });
      
      // Show success message
      alert('Successfully subscribed to ' + planData.name + ' plan!');
      
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
    } finally {
      setSubscribing(false);
    }
  };
  
  /**
   * Cancel the current subscription
   * 
   * Cancels the user's active subscription.
   */
  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (!window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end date.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth(`/payments/subscriptions/${subscription.id}/cancel`, token, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to cancel subscription');
      }
      
      const updatedSubscription = await response.json();
      
      // Update subscription state
      setSubscription({
        ...updatedSubscription,
        pricing_plan: subscription.pricing_plan
      });
      
      alert('Subscription successfully canceled. You will have access until the end date.');
      
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Format a date string to a readable format
   * 
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  /**
   * Parse features JSON string into an array
   * 
   * @param featuresJson - JSON string of features
   * @returns Array of feature strings
   */
  const parseFeatures = (featuresJson: string): string[] => {
    try {
      return JSON.parse(featuresJson);
    } catch (err) {
      console.error('Error parsing features:', err);
      return [];
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "300px" 
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "red", fontSize: "18px", fontWeight: "bold" }}>
          {error}
        </p>
        <button 
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: "32px 0" }}>
      <h4 style={{ marginBottom: "16px" }}>
        Subscription Management
      </h4>
      
      {/* Current Subscription Section */}
      <div style={{ marginBottom: "32px" }}>
        <h5 style={{ marginBottom: "16px" }}>
          Current Subscription
        </h5>
        
        {subscription ? (
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "4px",
            overflow: "hidden"
          }}>
            <div style={{ 
              padding: "16px", 
              borderBottom: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h6 style={{ margin: 0 }}>{subscription.pricing_plan?.name || 'Unknown Plan'}</h6>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#666" }}>
                  Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </p>
              </div>
              <div>
                <span style={{ 
                  display: "inline-block",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: subscription.is_auto_renew ? "#4caf50" : "#bbb",
                  color: subscription.is_auto_renew ? "#4caf50" : "#666"
                }}>
                  {subscription.is_auto_renew ? 'Auto-renew On' : 'Auto-renew Off'}
                </span>
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: "16px"
              }}>
                <div>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Start Date:</strong> {formatDate(subscription.start_date)}
                  </p>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>End Date:</strong> {formatDate(subscription.end_date)}
                  </p>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Monthly Price:</strong> ${subscription.pricing_plan?.price_monthly.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 8px 0" }}>
                    <strong>Features:</strong>
                  </p>
                  {subscription.pricing_plan && (
                    <ul style={{ 
                      margin: "0", 
                      paddingLeft: "20px", 
                      listStyleType: "none" 
                    }}>
                      {parseFeatures(subscription.pricing_plan.features).map((feature, index) => (
                        <li key={index} style={{ 
                          margin: "4px 0",
                          display: "flex",
                          alignItems: "center"
                        }}>
                          <span style={{ 
                            color: "#4caf50", 
                            marginRight: "8px",
                            fontSize: "18px"
                          }}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div style={{ 
                marginTop: "16px", 
                display: "flex", 
                justifyContent: "flex-end" 
              }}>
                <button 
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "white",
                    color: "#f44336",
                    border: "1px solid #f44336",
                    borderRadius: "4px",
                    cursor: subscription.status === 'active' ? "pointer" : "not-allowed",
                    opacity: subscription.status === 'active' ? 1 : 0.5
                  }}
                  onClick={handleCancelSubscription}
                  disabled={subscription.status !== 'active'}
                >
                  {subscription.status === 'canceled' ? 'Subscription Canceled' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "4px",
            padding: "24px",
            textAlign: "center"
          }}>
            <p>
              You don't have an active subscription.
            </p>
          </div>
        )}
      </div>
      
      {/* Available Plans Section */}
      <div style={{ marginBottom: "32px" }}>
        <h5 style={{ marginBottom: "16px" }}>
          Available Plans
        </h5>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px"
        }}>
          {plans.map((plan) => (
            <div 
              key={plan.id}
              style={{ 
                border: subscription?.pricing_plan?.id === plan.id ? "2px solid #4caf50" : "1px solid #ddd",
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                height: "100%"
              }}
            >
              <div style={{ 
                padding: "16px",
                borderBottom: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                textAlign: "center"
              }}>
                <h6 style={{ margin: "0 0 8px 0" }}>{plan.name}</h6>
                <p style={{ margin: 0, color: "#666" }}>${plan.price_monthly.toFixed(2)}/month</p>
              </div>
              <div style={{ 
                padding: "16px",
                flexGrow: 1,
                display: "flex",
                flexDirection: "column"
              }}>
                <p style={{ color: "#666", margin: "0 0 16px 0" }}>
                  {plan.description}
                </p>
                
                <hr style={{ 
                  margin: "16px 0",
                  border: "none",
                  borderTop: "1px solid #eee"
                }} />
                
                <ul style={{ 
                  margin: "0 0 16px 0", 
                  paddingLeft: "20px", 
                  listStyleType: "none",
                  flexGrow: 1
                }}>
                  {parseFeatures(plan.features).map((feature, index) => (
                    <li key={index} style={{ 
                      margin: "4px 0",
                      display: "flex",
                      alignItems: "center"
                    }}>
                      <span style={{ 
                        color: "#4caf50", 
                        marginRight: "8px",
                        fontSize: "18px"
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div style={{ marginTop: "auto", padding: "16px 0 0 0" }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      opacity: (
                        subscribing || 
                        (subscription?.pricing_plan?.id === plan.id && subscription?.status === 'active') ||
                        plan.tier === 'free'
                      ) ? 0.7 : 1,
                    }}
                    disabled={
                      subscribing || 
                      (subscription?.pricing_plan?.id === plan.id && subscription?.status === 'active') ||
                      plan.tier === 'free'
                    }
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {subscribing ? (
                      <span>Processing...</span>
                    ) : subscription?.pricing_plan?.id === plan.id && subscription?.status === 'active' ? (
                      'Current Plan'
                    ) : plan.tier === 'free' ? (
                      'Free Plan (Default)'
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Payment Methods Section */}
      <div>
        <h5 style={{ marginBottom: "16px" }}>
          Payment Methods
        </h5>
        
        {paymentMethods.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px"
          }}>
            {paymentMethods.map((method) => (
              <div 
                key={method.id}
                style={{ 
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              >
                <div style={{ padding: "16px" }}>
                  <h6 style={{ margin: "0 0 8px 0" }}>
                    {method.method_type === 'visa' || method.method_type === 'mastercard' ? (
                      `${method.method_type.charAt(0).toUpperCase() + method.method_type.slice(1)} **** ${method.card_last_four}`
                    ) : method.method_type === 'mtn_mobile_money' || method.method_type === 'orange_money' ? (
                      `${method.method_type.replace('_', ' ').toUpperCase()} ${method.mobile_number}`
                    ) : (
                      `Payoneer (${method.payoneer_email})`
                    )}
                  </h6>
                  
                  {method.is_default && (
                    <span style={{ 
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      borderRadius: "16px"
                    }}>
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "4px",
            padding: "24px",
            textAlign: "center"
          }}>
            <p style={{ margin: "0 0 16px 0" }}>
              You don't have any payment methods.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button 
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
                onClick={() => alert('Payment method management not implemented in this demo')}
              >
                Add Payment Method
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
