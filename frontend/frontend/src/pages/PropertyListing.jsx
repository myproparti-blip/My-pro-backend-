import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tag, 
  Empty,
  Image,
  Space,
  Badge,
  Toast,
  DotLoading,
  Ellipsis,
  Popup,
  List,
  Button,
  Grid,
  Modal,
  Selector,
  Slider,
} from 'antd-mobile';
import { 
  EnvironmentOutline, 
  HeartOutline,
  MoreOutline,
  SetOutline,
  UserOutline,
  InformationCircleOutline,
  MessageOutline,
  FilterOutline,
  CloseOutline,
  AddOutline,
  BellOutline,
  TeamOutline,
} from 'antd-mobile-icons';
import { getProperties, getMyProperties } from '../services/properties';
import { getProfile } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import './PropertyListings.css';
import PostProperty from '../components/proparti/PostProperty';
import HeaderWithSearch from '../components/common/HeaderWithSearch';
const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Get user's location for search bar placeholder
  const [userLocation, setUserLocation] = useState('Detecting...');
  const [userCity, setUserCity] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    propertyType: [],
    priceRange: [0, 50000000],
    bedrooms: [],
    furnished: [],
    bathrooms: [],
    constructionStatus: [],
    parking: false,
    balcony: false,
    swimmingPool: false,
    gym: false,
    security: false,
    listingType: ['Sale', 'Rent'],
    areaRange: [0, 5000]
  });

  // Filter options
  const filterOptions = {
    propertyType: [
      { label: 'Apartment', value: 'Apartment' },
      { label: 'Villa', value: 'Villa' },
      { label: 'House', value: 'House' },
      { label: 'Plot', value: 'Plot' },
      { label: 'Commercial', value: 'Commercial' },
    ],
    bedrooms: [
      { label: '1 BHK', value: '1 BHK' },
      { label: '2 BHK', value: '2 BHK' },
      { label: '3 BHK', value: '3 BHK' },
      { label: '4 BHK', value: '4 BHK' },
      { label: '4+ BHK', value: '5 BHK' }
    ],
    bathrooms: [
      { label: '1 Bath', value: '1' },
      { label: '2 Bath', value: '2' },
      { label: '3 Bath', value: '3' },
      { label: '4+ Bath', value: '4' }
    ],
    furnished: [
      { label: 'Fully Furnished', value: 'Furnished' },
      { label: 'Semi Furnished', value: 'Semi-Furnished' },
      { label: 'Unfurnished', value: 'Unfurnished' }
    ],
    constructionStatus: [
      { label: 'Ready to Move', value: 'Ready to Move' },
      { label: 'Under Construction', value: 'Under Construction' },
      { label: 'New Launch', value: 'New' }
    ],
    listingType: [
      { label: 'For Sale', value: 'Sale' },
      { label: 'For Rent', value: 'Rent' }
    ]
  };

  // Advertisements data
  const advertisements = [
    {
      id: 1,
      title: "Premium Properties",
      description: "Exclusive luxury villas and apartments with premium amenities",
      badge: "Luxury",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      action: () => navigate('/properties')
    },
    {
      id: 2,
      title: "Budget Friendly",
      description: "Affordable homes with great locations and modern facilities",
      badge: "Affordable",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      action: () => navigate('/properties')
    },
    {
      id: 3,
      title: "Commercial Spaces",
      description: "Prime commercial properties for business and investment",
      badge: "Commercial",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      action: () => navigate('/properties')
    }
  ];

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const city = data.city || data.locality || 'Your City';
            setUserLocation(city);
            setUserCity(city);
          } catch (error) {
            console.error('Error getting location:', error);
            setUserLocation('Surat');
            setUserCity('Surat');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation('Surat');
          setUserCity('Surat');
        }
      );
    } else {
      setUserLocation('Surat');
      setUserCity('Surat');
    }
  };

  // Enhanced Filter Modal Component
  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      onClose={() => setFilterVisible(false)}
      title={
        <div className="filter-modal-header">
          <span>Advanced Filters</span>
          <Button fill="none" size="small" onClick={() => setFilterVisible(false)} className="close-filter-btn">
            <CloseOutline />
          </Button>
        </div>
      }
      content={
        <div className="filter-modal-content">
          <div className="filter-section">
            <h4>Listing Type</h4>
            <Selector options={filterOptions.listingType} value={filters.listingType} onChange={(val) => setFilters(prev => ({ ...prev, listingType: val }))} multiple />
          </div>

          <div className="filter-section">
            <h4>Property Type</h4>
            <Selector options={filterOptions.propertyType} value={filters.propertyType} onChange={(val) => setFilters(prev => ({ ...prev, propertyType: val }))} multiple />
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range-display">₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}</div>
            <Slider range min={0} max={50000000} value={filters.priceRange} onChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))} />
          </div>

          <div className="filter-section">
            <h4>Area Range (sq.ft)</h4>
            <div className="area-range-display">{filters.areaRange[0]} - {filters.areaRange[1]} sq.ft</div>
            <Slider range min={0} max={5000} value={filters.areaRange} onChange={(value) => setFilters(prev => ({ ...prev, areaRange: value }))} />
          </div>

          <div className="filter-section">
            <h4>Bedrooms</h4>
            <Selector options={filterOptions.bedrooms} value={filters.bedrooms} onChange={(val) => setFilters(prev => ({ ...prev, bedrooms: val }))} multiple />
          </div>

          <div className="filter-section">
            <h4>Furnishing</h4>
            <Selector options={filterOptions.furnished} value={filters.furnished} onChange={(val) => setFilters(prev => ({ ...prev, furnished: val }))} multiple />
          </div>

          <div className="filter-section">
            <h4>Construction Status</h4>
            <Selector options={filterOptions.constructionStatus} value={filters.constructionStatus} onChange={(val) => setFilters(prev => ({ ...prev, constructionStatus: val }))} multiple />
          </div>

          <div className="filter-actions">
            <Button color="default" onClick={resetFilters}>Reset All</Button>
            <Button color="primary" onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      }
    />
  );

  // Menu Popup Component
  const MenuPopup = () => (
    <Popup visible={menuVisible} onMaskClick={() => setMenuVisible(false)} position="right" bodyStyle={{ width: '80vw', height: '50vh', borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
      <div className="menu-popup">
        <div className="menu-header">
          <div className="menu-user-info">
            <div className="user-avatar">
              <UserOutline />
            </div>
            <div className="user-details">
              <h3>{currentUser?.name || 'Welcome!'}</h3>
              <p>Explore properties in {userLocation}</p>
            </div>
          </div>
          <Button fill="none" size="small" onClick={() => setMenuVisible(false)} className="close-menu-btn">
            <CloseOutline />
          </Button>
        </div>

        <List className="menu-list">
          {[
            { icon: <UserOutline />, label: 'My Profile', action: () => navigate('/profile') },
            { icon: <BellOutline />, label: 'Notifications', action: () => Toast.show('Notifications clicked') },
            { icon: <HeartOutline />, label: 'Favorites', action: () => navigate('/favorites') },
            { icon: <UserOutline />, label: 'My Properties', action: () => navigate('/my-properties') },
            { icon: <TeamOutline />, label: 'Find Agents', action: () => navigate('/consultants') },
            { icon: <SetOutline />, label: 'Settings', action: () => Toast.show('Settings clicked') },
            { icon: <InformationCircleOutline />, label: 'About Us', action: () => Toast.show('About Us clicked') }
          ].map((item, index) => (
            <List.Item 
              key={index} 
              prefix={item.icon} 
              onClick={() => { 
                setMenuVisible(false); 
                item.action(); 
              }}
            >
              {item.label}
            </List.Item>
          ))}
        </List>

        <div className="menu-footer">
          {currentUser ? (
            <Button color="primary" fill="solid" size="large" className="logout-btn" onClick={handleLogout}>
              Delete Account 
            </Button>
          ) : (
            <Button color="primary" fill="solid" size="large" className="login-btn" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </Popup>
  );

  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyType: [],
      priceRange: [0, 50000000],
      bedrooms: [],
      furnished: [],
      bathrooms: [],
      constructionStatus: [],
      parking: false,
      balcony: false,
      swimmingPool: false,
      gym: false,
      security: false,
      listingType: ['Sale', 'Rent'],
      areaRange: [0, 5000]
    });
  };

  // Filter properties by location
  const filterByLocation = (properties) => {
    if (!userCity || userCity === 'Detecting...') return properties;
    
    // First, get properties from current city
    const currentCityProperties = properties.filter(property => 
      property.city?.toLowerCase() === userCity.toLowerCase()
    );
    
    // If we have less than 10 properties in current city, add nearby properties
    if (currentCityProperties.length < 10) {
      const nearbyProperties = properties.filter(property => 
        property.city?.toLowerCase() !== userCity.toLowerCase()
      );
      
      // Combine current city properties with nearby properties
      return [...currentCityProperties, ...nearbyProperties.slice(0, 10 - currentCityProperties.length)];
    }
    
    return currentCityProperties;
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = properties;

    // First filter by location
    filtered = filterByLocation(filtered);

    // Then apply other filters
    if (filters.listingType.length > 0) {
      filtered = filtered.filter(property => 
        filters.listingType.includes(property.listingType)
      );
    }

    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(property => 
        filters.propertyType.includes(property.propertyType)
      );
    }

    filtered = filtered.filter(property => 
      property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1]
    );

    filtered = filtered.filter(property => 
      property.carpetArea >= filters.areaRange[0] && property.carpetArea <= filters.areaRange[1]
    );

    if (filters.bedrooms.length > 0) {
      filtered = filtered.filter(property => 
        filters.bedrooms.includes(property.bedrooms)
      );
    }

    if (filters.furnished.length > 0) {
      filtered = filtered.filter(property => 
        filters.furnished.includes(property.furnishing)
      );
    }

    if (filters.constructionStatus.length > 0) {
      filtered = filtered.filter(property => 
        filters.constructionStatus.includes(property.constructionStatus)
      );
    }

    setFilteredProperties(filtered);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setFilterVisible(false);
    Toast.show('Filters applied successfully!');
  };

  // Format price to Indian format
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  // Format area
  const formatArea = (area) => area ? `${area} sq.ft` : '';

  // Get first available image
  const getPropertyImage = (property) => {
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      if (firstImage.startsWith('http') || firstImage.startsWith('https')) {
        return firstImage;
      } else {
        return `http://localhost:5000/${firstImage}`;
      }
    }
    return '/default-property.jpg';
  };

  // Fetch properties from backend
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProperties();
      
      if (result.success) {
        const allProperties = result.data.data || [];
        setProperties(allProperties);
        
        // Apply location-based filtering initially
        const locationFiltered = filterByLocation(allProperties);
        setFilteredProperties(locationFiltered);
      } else {
        setError(result.error || 'Failed to fetch properties');
        Toast.show({ content: result.error || 'Failed to fetch properties', position: 'bottom' });
      }
    } catch (err) {
      setError('Network error occurred');
      Toast.show({ content: 'Network error occurred', position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const res = await getProfile();
        if (res.success) {
          setCurrentUser(res.data.user);
        }
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  };

  // Filter properties based on search query
  const handleSearch = (value) => {
    setSearchQuery(value);
    
    if (!value.trim()) {
      applyFilters();
      return;
    }

    const filtered = properties.filter(property => 
      property.title?.toLowerCase().includes(value.toLowerCase()) ||
      property.description?.toLowerCase().includes(value.toLowerCase()) ||
      property.city?.toLowerCase().includes(value.toLowerCase()) ||
      property.locality?.toLowerCase().includes(value.toLowerCase()) ||
      property.propertyType?.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredProperties(filtered);
  };

  // Get badge color based on listing type
  const getListingTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'sale': return '#ff4d4f';
      case 'rent': return '#1890ff';
      default: return '#52c41a';
    }
  };

  // Handle view details - navigate to property details page
  // Handle view details - navigate to property details page
// In PropertyListings.jsx - Update the navigation path
// In PropertyListing.jsx - ensure consistent routing
const handleViewDetails = (property) => {
  console.log('Navigating to property:', property._id);
  if (property._id) {
    navigate(`/PropertyDetails/${property._id}`);
  } else {
    Toast.show('Property ID not found');
  }
};


  // Handle post property
  const handlePostProperty = () => {
    if (!currentUser) {
      Toast.show('Please login to post property');
      navigate('/login');
      return;
    }
    setPostVisible(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setMenuVisible(false);
    Toast.show('Logged out successfully');
  };

  // Handle property added successfully
  const handlePropertyAdded = () => {
    fetchProperties();
    setPostVisible(false);
    Toast.show('Property posted successfully!');
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) return count + filter.length;
    if (typeof filter === 'boolean' && filter) return count + 1;
    return count;
  }, 0);

  useEffect(() => {
    getUserLocation();
    fetchProperties();
    fetchCurrentUser();
  }, []);

  // Re-apply filters when user location changes
  useEffect(() => {
    if (userCity && properties.length > 0) {
      applyFilters();
    }
  }, [userCity]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <DotLoading color="primary" />
          <div className="loading-text">Loading properties...</div>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="error-container">
        <Empty description="Failed to load properties" imageStyle={{ width: 128, height: 128 }} />
        <Button color="primary" onClick={fetchProperties} className="retry-button">
          Try Again
        </Button>
      </div>
    );
  }

  // Split properties into chunks for 3x3 grid
  const propertyChunks = [];
  for (let i = 0; i < filteredProperties.length; i += 9) {
    propertyChunks.push(filteredProperties.slice(i, i + 9));
  }

  return (
    <div className="property-listings-container mobile-view">
      {/* Background with Property Image */}
      <div className="property-background-image">
        <div className="background-overlay-dark"></div>
      </div>

      {/* Replace old header with HeaderWithSearch component */}
      <HeaderWithSearch
        searchValue={searchQuery}
        setSearchValue={setSearchQuery}
        city={userLocation}
        setCity={setUserLocation}
      />

      {/* Filter Button */}
      <div className="filter-section-header">
        <Button color="primary" fill="outline" className="filter-button" onClick={() => setFilterVisible(true)}>
          <FilterOutline />
          Filter
          {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
        </Button>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {filteredProperties.length} properties found in {userLocation}
        {searchQuery && ` for "${searchQuery}"`}
      </div>

      {/* Properties Grid - 3x3 layout */}
      <div className="properties-grid-container">
        {filteredProperties.length === 0 ? (
          <Empty description={searchQuery ? "No properties match your search" : "No properties available"} imageStyle={{ width: 128, height: 128 }} />
        ) : (
          propertyChunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="property-chunk">
              <div className="properties-grid">
                {chunk.map((property) => (
                  <div key={property._id} className="property-grid-item">
                    <Card className="property-card grid-card transparent-card">
                      <div className="property-card-content">
                        <div className="property-image-container">
                          <Image 
                            src={getPropertyImage(property)} 
                            alt={property.title} 
                            className="property-image" 
                            fallback={
                              <div className="image-fallback">
                                <div className="fallback-icon">🏠</div>
                              </div>
                            } 
                          />
                          <div className="listing-badge">
                            <Badge color={getListingTypeColor(property.listingType)} content={property.listingType} />
                          </div>
                        </div>

                        <div className="property-details">
                          <div className="property-price-main">
                            {formatPrice(property.price)}
                          </div>
                          <div className="property-title">
                            <Ellipsis content={property.title} row={1} />
                          </div>
                          <div className="property-location">
                            <EnvironmentOutline className="location-icon" />
                            <Ellipsis content={[property.locality, property.city].filter(Boolean).join(', ')} row={1} />
                          </div>
                          <div className="property-features">
                            <Space wrap>
                              {property.bedrooms && <Tag className="feature-tag" fill="outline">{property.bedrooms}</Tag>}
                              {property.carpetArea && <Tag className="feature-tag" fill="outline">{formatArea(property.carpetArea)}</Tag>}
                            </Space>
                          </div>
                          <div className="property-footer">
                            <Button 
  color="primary" 
  size="mini" 
  className="view-button" 
  onClick={(e) => {
    e.stopPropagation(); // Prevent event bubbling
    handleViewDetails(property);
  }}
>
  View Details
</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Advertisement after each 3x3 chunk */}
              {advertisements[chunkIndex % advertisements.length] && (
                <div className="advertisement-section">
                  <Card 
                    className="ad-card" 
                    style={{ background: advertisements[chunkIndex % advertisements.length].gradient }}
                    onClick={advertisements[chunkIndex % advertisements.length].action}
                  >
                    <div className="ad-content">
                      <div className="ad-badge">{advertisements[chunkIndex % advertisements.length].badge}</div>
                      <h3>{advertisements[chunkIndex % advertisements.length].title}</h3>
                      <p>{advertisements[chunkIndex % advertisements.length].description}</p>
                      <Button color="primary" size="small" fill="solid">Explore Now</Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Post Property Floating Button */}
      {currentUser && (
        <div className="floating-action-button" onClick={handlePostProperty}>
          <AddOutline className="fab-icon" />
        </div>
      )}

      {/* Modals and Popups */}
      <FilterModal />
      <MenuPopup />
      <PostProperty 
        visible={postVisible} 
        onClose={() => setPostVisible(false)}
        onSuccess={handlePropertyAdded}
      />
    </div>
  );
};

export default PropertyListings;