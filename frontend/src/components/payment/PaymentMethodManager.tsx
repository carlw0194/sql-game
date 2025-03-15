/**
 * Payment Method Manager Component
 * 
 * This component allows users to view, add, and manage their payment methods.
 * It supports credit/debit cards, mobile money, and Payoneer payment options.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

// Types for our data models
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
  created_at: string;
}

// Type for the form data when adding a new payment method
interface PaymentMethodFormData {
  method_type: string;
  card_number?: string;
  card_expiry_month?: string;
  card_expiry_year?: string;
  mobile_number?: string;
  payoneer_email?: string;
  is_default: boolean;
}

const PaymentMethodManager: React.FC = () => {
  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    method_type: 'visa',
    is_default: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get auth context for the current user
  const { token } = useAuth();
  
  /**
   * Fetch the user's payment methods from the API
   * 
   * This function is called when the component mounts and after
   * adding or removing payment methods.
   */
  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth('/payments/payment-methods', token);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to load payment methods. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch payment methods on component mount
  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);
  
  /**
   * Handle form input changes
   * 
   * Updates the form data state when input values change.
   * 
   * @param e - The change event from the form input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear any previous error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Validate the payment method form
   * 
   * Checks that all required fields are filled correctly based on the selected method type.
   * 
   * @returns True if the form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate based on method type
    if (formData.method_type === 'visa' || formData.method_type === 'mastercard') {
      // Card validation
      if (!formData.card_number) {
        errors.card_number = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.card_number)) {
        errors.card_number = 'Card number must be 16 digits';
      }
      
      if (!formData.card_expiry_month) {
        errors.card_expiry_month = 'Expiry month is required';
      } else if (!/^(0[1-9]|1[0-2])$/.test(formData.card_expiry_month)) {
        errors.card_expiry_month = 'Month must be between 01-12';
      }
      
      if (!formData.card_expiry_year) {
        errors.card_expiry_year = 'Expiry year is required';
      } else if (!/^\d{4}$/.test(formData.card_expiry_year)) {
        errors.card_expiry_year = 'Year must be 4 digits';
      } else {
        // Check if the expiry date is in the future
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const year = formData.card_expiry_year ? parseInt(formData.card_expiry_year) : 0;
        const month = formData.card_expiry_month ? parseInt(formData.card_expiry_month) : 0;
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errors.card_expiry_year = 'Card has expired';
        }
      }
    } else if (formData.method_type === 'mtn_mobile_money' || formData.method_type === 'orange_money') {
      // Mobile money validation
      if (!formData.mobile_number) {
        errors.mobile_number = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobile_number)) {
        errors.mobile_number = 'Mobile number must be 10 digits';
      }
    } else if (formData.method_type === 'payoneer') {
      // Payoneer validation
      if (!formData.payoneer_email) {
        errors.payoneer_email = 'Payoneer email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.payoneer_email)) {
        errors.payoneer_email = 'Invalid email format';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Submit the payment method form
   * 
   * Validates the form and sends the data to the API to create a new payment method.
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      let endpoint = '';
      let requestData = {};
      
      // Prepare request based on method type
      if (formData.method_type === 'visa' || formData.method_type === 'mastercard') {
        endpoint = '/payments/payment-methods/card';
        requestData = {
          method_type: formData.method_type,
          card_number: formData.card_number,
          card_expiry_month: formData.card_expiry_month,
          card_expiry_year: formData.card_expiry_year,
          is_default: formData.is_default
        };
      } else if (formData.method_type === 'mtn_mobile_money' || formData.method_type === 'orange_money') {
        endpoint = '/payments/payment-methods/mobile-money';
        requestData = {
          method_type: formData.method_type,
          mobile_number: formData.mobile_number,
          is_default: formData.is_default
        };
      } else if (formData.method_type === 'payoneer') {
        endpoint = '/payments/payment-methods/payoneer';
        requestData = {
          method_type: formData.method_type,
          payoneer_email: formData.payoneer_email,
          is_default: formData.is_default
        };
      }
      
      const response = await fetchWithAuth(endpoint, token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add payment method');
      }
      
      // Close dialog and refresh payment methods
      setOpenDialog(false);
      fetchPaymentMethods();
      
      // Reset form
      setFormData({
        method_type: 'visa',
        is_default: false
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Payment method added successfully',
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Error adding payment method:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to add payment method',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * Delete a payment method
   * 
   * Sends a request to the API to delete the specified payment method.
   * 
   * @param id - ID of the payment method to delete
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/payments/payment-methods/${id}`, token, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete payment method');
      }
      
      // Refresh payment methods
      fetchPaymentMethods();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Payment method deleted successfully',
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to delete payment method',
        severity: 'error'
      });
    }
  };
  
  /**
   * Set a payment method as the default
   * 
   * Sends a request to the API to set the specified payment method as the default.
   * 
   * @param id - ID of the payment method to set as default
   */
  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetchWithAuth(`/payments/payment-methods/${id}/default`, token, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to set default payment method');
      }
      
      // Refresh payment methods
      fetchPaymentMethods();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Default payment method updated',
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to set default payment method',
        severity: 'error'
      });
    }
  };
  
  /**
   * Format a payment method for display
   * 
   * Creates a human-readable representation of the payment method.
   * 
   * @param method - The payment method to format
   * @returns Formatted payment method string
   */
  const formatPaymentMethod = (method: PaymentMethod): string => {
    if (method.method_type === 'visa' || method.method_type === 'mastercard') {
      return `${method.method_type.charAt(0).toUpperCase() + method.method_type.slice(1)} **** ${method.card_last_four}`;
    } else if (method.method_type === 'mtn_mobile_money' || method.method_type === 'orange_money') {
      return `${method.method_type.replace('_', ' ').toUpperCase()} (${method.mobile_number})`;
    } else {
      return `Payoneer (${method.payoneer_email})`;
    }
  };
  
  // Show loading state
  if (loading && paymentMethods.length === 0) {
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
  
  return (
    <div style={{ padding: "32px 0" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "24px" 
      }}>
        <h4 style={{ margin: 0 }}>
          Payment Methods
        </h4>
        
        <button 
          style={{
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={() => setOpenDialog(true)}
        >
          Add Payment Method
        </button>
      </div>
      
      {error && (
        <div style={{ 
          padding: "12px 16px", 
          backgroundColor: "#ffebee", 
          color: "#c62828", 
          borderRadius: "4px", 
          marginBottom: "24px" 
        }}>
          {error}
        </div>
      )}
      
      {/* Payment Methods List */}
      {paymentMethods.length > 0 ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px"
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
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center" 
                }}>
                  <h6 style={{ margin: 0 }}>
                    {formatPaymentMethod(method)}
                  </h6>
                  
                  <div>
                    {/* Set as default button */}
                    <button 
                      style={{
                        marginRight: "8px",
                        backgroundColor: "transparent",
                        border: "none",
                        color: method.is_default ? "#1976d2" : "#757575",
                        cursor: method.is_default ? "default" : "pointer",
                        padding: "4px"
                      }}
                      onClick={() => !method.is_default && handleSetDefault(method.id)}
                      disabled={method.is_default}
                      title={method.is_default ? "Default payment method" : "Set as default"}
                    >
                      {method.is_default ? "★" : "☆"}
                    </button>
                    
                    {/* Delete button */}
                    <button 
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#f44336",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                      onClick={() => handleDelete(method.id)}
                      title="Delete payment method"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <p style={{ 
                  margin: "8px 0 0 0", 
                  fontSize: "14px", 
                  color: "#757575" 
                }}>
                  Added on {new Date(method.created_at).toLocaleDateString()}
                </p>
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
          <p style={{ margin: "0 0 8px 0" }}>
            You don't have any payment methods.
          </p>
          <p style={{ 
            margin: "0 0 16px 0", 
            fontSize: "14px", 
            color: "#757575" 
          }}>
            Add a payment method to subscribe to premium plans.
          </p>
        </div>
      )}
      
      {/* Add Payment Method Dialog */}
      {openDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "4px",
            width: "100%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <div style={{ 
              padding: "16px 24px", 
              borderBottom: "1px solid #ddd" 
            }}>
              <h5 style={{ margin: 0 }}>Add Payment Method</h5>
            </div>
            
            <div style={{ padding: "24px" }}>
              {/* Payment Method Type Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "bold" 
                }}>
                  Payment Method Type
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="radio" 
                      name="method_type" 
                      value="visa" 
                      checked={formData.method_type === 'visa'} 
                      onChange={handleInputChange} 
                    />
                    <span style={{ marginLeft: "8px" }}>Visa</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="radio" 
                      name="method_type" 
                      value="mastercard" 
                      checked={formData.method_type === 'mastercard'} 
                      onChange={handleInputChange} 
                    />
                    <span style={{ marginLeft: "8px" }}>Mastercard</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="radio" 
                      name="method_type" 
                      value="mtn_mobile_money" 
                      checked={formData.method_type === 'mtn_mobile_money'} 
                      onChange={handleInputChange} 
                    />
                    <span style={{ marginLeft: "8px" }}>MTN Mobile Money</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="radio" 
                      name="method_type" 
                      value="orange_money" 
                      checked={formData.method_type === 'orange_money'} 
                      onChange={handleInputChange} 
                    />
                    <span style={{ marginLeft: "8px" }}>Orange Money</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input 
                      type="radio" 
                      name="method_type" 
                      value="payoneer" 
                      checked={formData.method_type === 'payoneer'} 
                      onChange={handleInputChange} 
                    />
                    <span style={{ marginLeft: "8px" }}>Payoneer</span>
                  </label>
                </div>
              </div>
              
              <hr style={{ 
                margin: "0 0 24px 0",
                border: "none",
                borderTop: "1px solid #eee"
              }} />
              
              {/* Card Payment Fields */}
              {(formData.method_type === 'visa' || formData.method_type === 'mastercard') && (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px" 
                    }}>
                      Card Number
                    </label>
                    <input 
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: formErrors.card_number ? "1px solid #f44336" : "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "16px"
                      }}
                      type="text"
                      name="card_number"
                      value={formData.card_number || ''}
                      onChange={handleInputChange}
                      maxLength={16}
                      placeholder="1234567890123456"
                    />
                    {formErrors.card_number && (
                      <p style={{ 
                        color: "#f44336", 
                        margin: "4px 0 0 0", 
                        fontSize: "14px" 
                      }}>
                        {formErrors.card_number}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "16px",
                    marginBottom: "16px"
                  }}>
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px" 
                      }}>
                        Expiry Month
                      </label>
                      <input 
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: formErrors.card_expiry_month ? "1px solid #f44336" : "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px"
                        }}
                        type="text"
                        name="card_expiry_month"
                        value={formData.card_expiry_month || ''}
                        onChange={handleInputChange}
                        maxLength={2}
                        placeholder="MM"
                      />
                      {formErrors.card_expiry_month && (
                        <p style={{ 
                          color: "#f44336", 
                          margin: "4px 0 0 0", 
                          fontSize: "14px" 
                        }}>
                          {formErrors.card_expiry_month}
                        </p>
                      )}
                    </div>
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px" 
                      }}>
                        Expiry Year
                      </label>
                      <input 
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: formErrors.card_expiry_year ? "1px solid #f44336" : "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "16px"
                        }}
                        type="text"
                        name="card_expiry_year"
                        value={formData.card_expiry_year || ''}
                        onChange={handleInputChange}
                        maxLength={4}
                        placeholder="YYYY"
                      />
                      {formErrors.card_expiry_year && (
                        <p style={{ 
                          color: "#f44336", 
                          margin: "4px 0 0 0", 
                          fontSize: "14px" 
                        }}>
                          {formErrors.card_expiry_year}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {/* Mobile Money Fields */}
              {(formData.method_type === 'mtn_mobile_money' || formData.method_type === 'orange_money') && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px" 
                  }}>
                    Mobile Number
                  </label>
                  <input 
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: formErrors.mobile_number ? "1px solid #f44336" : "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "16px"
                    }}
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number || ''}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="0712345678"
                  />
                  {formErrors.mobile_number && (
                    <p style={{ 
                      color: "#f44336", 
                      margin: "4px 0 0 0", 
                      fontSize: "14px" 
                    }}>
                      {formErrors.mobile_number}
                    </p>
                  )}
                </div>
              )}
              
              {/* Payoneer Fields */}
              {formData.method_type === 'payoneer' && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px" 
                  }}>
                    Payoneer Email
                  </label>
                  <input 
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: formErrors.payoneer_email ? "1px solid #f44336" : "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "16px"
                    }}
                    type="email"
                    name="payoneer_email"
                    value={formData.payoneer_email || ''}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                  {formErrors.payoneer_email && (
                    <p style={{ 
                      color: "#f44336", 
                      margin: "4px 0 0 0", 
                      fontSize: "14px" 
                    }}>
                      {formErrors.payoneer_email}
                    </p>
                  )}
                </div>
              )}
              
              {/* Default Payment Method Option */}
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                marginTop: "16px" 
              }}>
                <input 
                  type="checkbox" 
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                />
                <span style={{ marginLeft: "8px" }}>
                  Set as default payment method
                </span>
              </label>
            </div>
            
            <div style={{ 
              padding: "16px 24px", 
              borderTop: "1px solid #ddd",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px"
            }}>
              <button 
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </button>
              <button 
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1
                }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Add Payment Method'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: snackbar.severity === 'success' ? "#4caf50" : "#f44336",
          color: "white",
          padding: "12px 24px",
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minWidth: "300px",
          maxWidth: "500px"
        }}>
          <span>{snackbar.message}</span>
          <button 
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              marginLeft: "16px",
              fontSize: "18px"
            }}
            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;
