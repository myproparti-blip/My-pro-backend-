import React, { useState, useEffect } from 'react';
import { 
  Modal,
  Button, 
  Input, 
  TextArea, 
  Toast
} from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { addAgent } from '../services/agents';

const AgentModal = ({ visible, setVisible, agent, refreshData, onSuccess, onCancel }) => {
  const [isPropertyDealer, setIsPropertyDealer] = useState(true);
  const [fullName, setFullName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [yearsOperating, setYearsOperating] = useState('');
  const [teamCount, setTeamCount] = useState('');
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [operatingCity, setOperatingCity] = useState('');
  const [aboutAgent, setAboutAgent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States for areas functionality
  const [availableAreas, setAvailableAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [areaSearchText, setAreaSearchText] = useState('');
  const [filteredAreas, setFilteredAreas] = useState([]);

  const dealTypes = ['Rent/Lease', 'Pre-launch', 'Original Booking', 'Resale', 'Others'];

  // Complete India Cities and Areas Dummy Data
  const cityAreasData = {
    // Maharashtra
    'Mumbai': ['Bandra', 'Andheri', 'Dadar', 'Juhu', 'Powai', 'Worli', 'Malad', 'Borivali', 'Churchgate', 'Colaba', 'Marine Lines', 'Bhayandar', 'Virar', 'Navi Mumbai', 'Thane', 'Kalyan'],
    'Pune': ['Koregaon Park', 'Hinjewadi', 'Kothrud', 'Baner', 'Aundh', 'Wakad', 'Viman Nagar', 'Magarpatta', 'Hadapsar', 'Shivajinagar', 'Deccan', 'FC Road'],
    'Nagpur': ['Sitabuldi', 'Dharampeth', 'Ramdaspeth', 'Manish Nagar', 'Wardha Road', 'Byramji Town', 'Besa', 'Koradi'],
    'Nashik': ['College Road', 'Gangapur Road', 'Pathardi', 'Satpur', 'Ambad', 'CIDCO', 'Canada Corner'],
    'Thane': ['Kopri', 'Wagle Estate', 'Kolshet', 'Manpada', 'Hiranandani', 'Lokmanyanagar'],
    'Aurangabad': ['Jalna Road', 'Cidco', 'Satara Parisar', 'Garkheda', 'Nirala Bazar'],
    
    // Delhi NCR
    'Delhi': ['Connaught Place', 'Karol Bagh', 'Saket', 'Rajouri Garden', 'Dwarka', 'Rohini', 'Lajpat Nagar', 'Greater Kailash', 'Hauz Khas', 'Vasant Kunj', 'Paschim Vihar', 'Pitampura', 'Janakpuri', 'Model Town'],
    'Gurgaon': ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Sector 14', 'Sector 15', 'Sector 17', 'Sohna Road', 'MG Road', 'Cyber City', 'Galleria Market'],
    'Noida': ['Sector 18', 'Sector 62', 'Sector 15', 'Sector 16', 'Sector 137', 'Sector 168', 'Expressway', 'Greater Noida'],
    'Faridabad': ['Sector 16', 'Sector 21', 'Sector 37', 'Neharpar', 'Greenfield', 'Ballabgarh'],
    'Ghaziabad': ['Raj Nagar', 'Vaishali', 'Kaushambi', 'Indirapuram', 'Vasundhara', 'Crossing Republik'],
    
    // Karnataka
    'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'MG Road', 'Jayanagar', 'HSR Layout', 'Marathahalli', 'Electronic City', 'Bellandur', 'Sarjapur Road', 'Bannerghatta Road', 'Malleswaram', 'Basavanagudi', 'Rajajinagar'],
    'Mysore': ['Vijaynagar', 'Gokulam', 'Saraswathipuram', 'T K Layout', 'Kuvempunagar', 'Yadavagiri', 'Bogadi'],
    'Hubli': ['Gokul Road', 'Old Hubli', 'Vidyanagar', 'Keshwapur', 'Unkal', 'Tarihal'],
    'Mangalore': ['Kadri', 'Hampankatta', 'Lalbagh', 'Bejai', 'Pandeshwar', 'Bolar'],
    
    // Tamil Nadu
    'Chennai': ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR', 'Guindy', 'Porur', 'Chrompet', 'Tambaram', 'Mylapore', 'Besant Nagar', 'Thoraipakkam', 'Perungudi', 'Medavakkam'],
    'Coimbatore': ['RS Puram', 'Gandhipuram', 'Saibaba Colony', 'Peelamedu', 'Avinashi Road', 'Race Course', 'Sitra', 'Ukkadam'],
    'Madurai': ['Anna Nagar', 'K K Nagar', 'Bypass Road', 'Tallakulam', 'Simmakkal', 'Goripalayam', 'Villapuram'],
    'Salem': ['Hasthampatti', 'Ammapet', 'Gugai', 'Kitchipalayam', 'Kondalampatti', 'Suramangalam'],
  };

  // Effect to update available areas when city changes
  useEffect(() => {
    if (operatingCity && cityAreasData[operatingCity]) {
      const areas = cityAreasData[operatingCity];
      setAvailableAreas(areas);
      setFilteredAreas(areas);
    } else {
      setAvailableAreas([]);
      setFilteredAreas([]);
    }
    setSelectedAreas([]);
    setAreaSearchText('');
  }, [operatingCity]);

  // Effect to filter areas based on search text
  useEffect(() => {
    if (areaSearchText.trim() === '') {
      setFilteredAreas(availableAreas);
    } else {
      const filtered = availableAreas.filter(area =>
        area.toLowerCase().includes(areaSearchText.toLowerCase())
      );
      setFilteredAreas(filtered);
    }
  }, [areaSearchText, availableAreas]);

  const toggleDeal = (deal) => {
    setSelectedDeals(prev => 
      prev.includes(deal) 
        ? prev.filter(d => d !== deal)
        : [...prev, deal]
    );
  };

  const toggleArea = (area) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const addCustomArea = () => {
    if (areaSearchText.trim() && !selectedAreas.includes(areaSearchText.trim())) {
      setSelectedAreas(prev => [...prev, areaSearchText.trim()]);
      setAreaSearchText('');
    }
  };

  const removeArea = (areaToRemove) => {
    setSelectedAreas(prev => prev.filter(area => area !== areaToRemove));
  };

  // Handle cancel button click
  const handleCancel = () => {
    console.log("❌ Cancel button clicked in AgentModal");
    if (onCancel) {
      onCancel();
    } else {
      setVisible(false);
    }
    resetForm();
  };

  // Handle modal close (mask click, back button, etc.)
  const handleModalClose = () => {
    console.log("🔧 Modal close triggered in AgentModal");
    setVisible(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Toast.show({ content: 'Please enter your full name', position: 'top' });
      return;
    }
    if (selectedDeals.length === 0) {
      Toast.show({ content: 'Please select at least one deal type', position: 'top' });
      return;
    }
    if (!operatingCity.trim()) {
      Toast.show({ content: 'Please select an operating city', position: 'top' });
      return;
    }

    setLoading(true);
    
    try {
      const agentData = {
        isPropertyDealer: isPropertyDealer ? "yes" : "no",
        agentName: fullName.trim(),
        firmName: firmName?.trim() || "",
        operatingCity: operatingCity.trim(),
        operatingAreaChips: selectedAreas,
        operatingSince: yearsOperating,
        teamMembers: teamCount,
        dealsIn: selectedDeals,
        dealsInOther: "",
        aboutAgent: aboutAgent?.trim() || "",
      };

      console.log('Sending agent data:', agentData);

      const response = await addAgent(agentData);
      
      if (response) {
        Toast.show({ 
          content: response.message || 'Registration Submitted Successfully!', 
          position: 'top' 
        });
        
        console.log('API Response:', response);
        
        resetForm();
        setVisible(false);
        onSuccess?.(response.data);
        refreshData?.();
      } else {
        throw new Error('No response from server');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      Toast.show({ 
        content: error.message || 'Submission failed. Please try again.', 
        position: 'top' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFullName('');
    setFirmName('');
    setYearsOperating('');
    setTeamCount('');
    setSelectedDeals([]);
    setOperatingCity('');
    setAboutAgent('');
    setIsPropertyDealer(true);
    setSelectedAreas([]);
    setAreaSearchText('');
    setAvailableAreas([]);
    setFilteredAreas([]);
  };

  return (
    <Modal
      visible={visible}
      content={(
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxHeight: '90vh', // Increased from 80vh to 90vh
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Scrollable Content */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            marginBottom: '24px' // Add space for buttons
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '24px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '32px', marginRight: '12px' }}>💼</span>
                <h2 style={{ 
                  margin: 0, 
                  color: '#00897b', 
                  fontSize: '24px',
                  fontWeight: 600
                }}>
                  Agent Registration
                </h2>
              </div>
              <Button
                fill="none"
                onClick={handleModalClose}
                style={{ padding: '4px', minWidth: 'auto' }}
              >
                <CloseOutline fontSize={20} />
              </Button>
            </div>

            {/* Property Dealer Question */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                marginBottom: '12px',
                color: '#333',
                fontWeight: 600
              }}>
                Are you a property dealer?
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsPropertyDealer(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isPropertyDealer ? '#00897b' : '#e8d4f8',
                    color: isPropertyDealer ? 'white' : '#00897b',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setIsPropertyDealer(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: !isPropertyDealer ? '#00897b' : '#e8d4f8',
                    color: !isPropertyDealer ? 'white' : '#00897b',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  No
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

            {/* Agent & Firm Details */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                marginBottom: '16px',
                color: '#333',
                fontWeight: 600
              }}>
                Agent & Firm Details
              </h3>
              
              <Input
                placeholder="Your Full Name *"
                value={fullName}
                onChange={setFullName}
                style={{ 
                  marginBottom: '12px',
                  borderRadius: '8px'
                }}
              />
              
              <Input
                placeholder="Firm Name (Optional)"
                value={firmName}
                onChange={setFirmName}
                style={{ 
                  marginBottom: '12px'
                }}
              />
              
              <Input
                placeholder="Years Operating Since (e.g., 2005)"
                value={yearsOperating}
                onChange={setYearsOperating}
                style={{ 
                  marginBottom: '12px'
                }}
              />
              
              <Input
                placeholder="Team Members Count"
                value={teamCount}
                onChange={setTeamCount}
                type="number"
              />
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

            {/* Deals In */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                marginBottom: '12px',
                color: '#333',
                fontWeight: 600
              }}>
                Deals In *
              </h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px' 
              }}>
                {dealTypes.map(deal => (
                  <button
                    key={deal}
                    onClick={() => toggleDeal(deal)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedDeals.includes(deal) ? '#00897b' : '#e8d4f8',
                      color: selectedDeals.includes(deal) ? 'white' : '#00897b',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      flex: '1 0 calc(50% - 8px)',
                      minWidth: '120px'
                    }}
                  >
                    {deal}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

            {/* Operating City & Areas */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                marginBottom: '12px',
                color: '#333',
                fontWeight: 600
              }}>
                Operating City *
              </h3>
              
              <select
                value={operatingCity}
                onChange={(e) => setOperatingCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  marginBottom: '16px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a City</option>
                {Object.keys(cityAreasData).sort().map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Selected Areas Display */}
              {selectedAreas.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    marginBottom: '8px',
                    color: '#666',
                    fontWeight: 500
                  }}>
                    Selected Areas:
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px' 
                  }}>
                    {selectedAreas.map(area => (
                      <div
                        key={area}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          backgroundColor: '#00897b',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                      >
                        {area}
                        <button
                          onClick={() => removeArea(area)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            marginLeft: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Area Selection - Simplified */}
              {operatingCity && availableAreas.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    marginBottom: '8px',
                    color: '#666',
                    fontWeight: 500
                  }}>
                    Select Operating Areas:
                  </h4>
                  
                  {/* Area Search and Add */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <Input
                      placeholder="Search areas..."
                      value={areaSearchText}
                      onChange={setAreaSearchText}
                      style={{ flex: 1 }}
                    />
                    {areaSearchText && !availableAreas.includes(areaSearchText) && (
                      <Button
                        size="small"
                        onClick={addCustomArea}
                        style={{
                          backgroundColor: '#ff9800',
                          color: 'white',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Add Custom
                      </Button>
                    )}
                  </div>

                  {/* Available Areas as Simple Chips */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px'
                  }}>
                    {filteredAreas.map(area => (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '16px',
                          border: 'none',
                          backgroundColor: selectedAreas.includes(area) ? '#00897b' : '#f0f0f0',
                          color: selectedAreas.includes(area) ? 'white' : '#333',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {area}
                      </button>
                    ))}
                  </div>

                  {filteredAreas.length === 0 && areaSearchText && (
                    <div style={{ 
                      padding: '12px', 
                      color: '#666', 
                      fontSize: '13px',
                      textAlign: 'center',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}>
                      No areas found matching "{areaSearchText}". Type and click "Add Custom" to create a custom area.
                    </div>
                  )}
                </div>
              )}

              {operatingCity && availableAreas.length === 0 && (
                <div style={{
                  backgroundColor: '#fff8e1',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '8px'
                }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>ℹ️</span>
                  <span style={{ color: '#f57c00', fontSize: '13px' }}>
                    No predefined areas found for {operatingCity}. You can add custom areas using the search above.
                  </span>
                </div>
              )}

              {!operatingCity && (
                <div style={{
                  backgroundColor: '#fff8e1',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>👆</span>
                  <span style={{ color: '#f57c00', fontSize: '13px' }}>
                    Please select an Operating City to see and add areas.
                  </span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0' }} />

            {/* About Agent */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                marginBottom: '12px',
                color: '#333',
                fontWeight: 600
              }}>
                About Agent
              </h3>
              
              <TextArea
                placeholder="Write a brief description about your services and firm."
                value={aboutAgent}
                onChange={setAboutAgent}
                rows={3}
                style={{ 
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>

          {/* Cancel and Submit Buttons - Fixed at bottom */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            flexShrink: 0 // Prevent buttons from shrinking
          }}>
            <Button
              block
              onClick={handleCancel}
              disabled={loading}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                flex: 1,
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #d9d9d9'
              }}
            >
              Cancel
            </Button>
            <Button
              block
              color="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
              style={{
                backgroundColor: '#00897b',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                height: '48px',
                flex: 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </div>
      )}
      onClose={handleModalClose}
      bodyStyle={{
        padding: '16px'
      }}
      closeOnMaskClick
    />
  );
};

export default AgentModal;