// BookConsultant.jsx (updated)
import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Tag,
  Button,
  Toast,
  Avatar,
  Badge,
  Space,
  DotLoading,
  Empty,
  Popup,
  List,
  Modal,
  Ellipsis,
  Selector,
  Slider,
} from "antd-mobile";
import {
  UserOutline,
  MessageOutline,
  EnvironmentOutline,
  StarOutline,
  MoreOutline,
  FilterOutline,
  CloseOutline,
  HeartOutline,
  TeamOutline,
  BellOutline,
  SetOutline,
  InformationCircleOutline,
} from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { getConsultants } from "../services/consultants";
import { getProfile } from "../services/auth";
import HeaderWithSearch from "../components/common/HeaderWithSearch";

export default function BookConsultant() {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState("Detecting...");
  const [currentUser, setCurrentUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  // Filter states - REMOVED minRating filter
  const [filters, setFilters] = useState({
    experience: [],
  });

  // FIXED: Image URL resolver
  const getSafeImageUrl = (image) => {
    if (!image || image === 'null' || image === 'undefined') {
      return "https://via.placeholder.com/120x80/f0f0f0/666666?text=No+Image";
    }

    let imgStr = String(image).trim();

    // Define possible base URLs to check for duplicates
    const baseUrls = [
      'http://192.168.29.78:5000',
      'http://localhost:5000',
      process.env.REACT_APP_UPLOADS_URL_LAN,
      process.env.REACT_APP_UPLOADS_URL_LOCAL
    ].filter(Boolean);

    // Check if image already contains any base URL
    for (const baseUrl of baseUrls) {
      if (baseUrl && imgStr.includes(baseUrl)) {
        return imgStr;
      }
    }

    // If it's already a full URL from another source, return as is
    if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
      return imgStr;
    }

    // Clean the path - remove any leading slashes
    imgStr = imgStr.replace(/^\/+/, '');

    // Use environment variable with fallback
    const baseUrl = process.env.REACT_APP_UPLOADS_URL_LAN || 'http://192.168.29.78:5000';

    // Handle different path formats
    if (imgStr.startsWith('uploads/')) {
      return `${baseUrl}/${imgStr}`;
    } else {
      return `${baseUrl}/uploads/${imgStr}`;
    }
  };

  const getPlaceholderImage = (width, height) => {
    return `https://via.placeholder.com/${width}x${height}/f0f0f0/666666?text=No+Image`;
  };

  // Experience options
  const experienceOptions = [
    { label: '0-2 years', value: '0-2' },
    { label: '2-5 years', value: '2-5' },
    { label: '5-10 years', value: '5-10' },
    { label: '10+ years', value: '10+' },
  ];

  // Advertisements data
  const advertisements = [
    {
      id: 1,
      title: "Premium Consultants",
      description: "Connect with top-rated real estate experts",
      badge: "Premium",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      title: "Instant Consultation",
      description: "Get immediate advice from certified professionals",
      badge: "Fast",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      title: "Local Experts",
      description: "Find consultants specializing in your area",
      badge: "Local",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    }
  ];

  // UPDATED: Format languages to show max 3 languages
  const formatLanguages = (languages) => {
    if (!languages) return ['ENG'];

    let languageArray = [];

    if (Array.isArray(languages)) {
      languageArray = languages
        .filter(lang => lang && lang.trim().length > 0)
        .map(lang => String(lang).trim());
    } else if (typeof languages === 'string') {
      // Clean the string and split by commas
      const cleanString = languages.replace(/[\[\]"]/g, '').trim();
      languageArray = cleanString.split(',').map(lang => lang.trim()).filter(lang => lang);
    }

    if (languageArray.length === 0) return ['ENG'];

    // UPDATED: Take first 3 languages and show first 3 letters in uppercase
    const formatted = languageArray.slice(0, 3).map(lang => {
      const cleanLang = lang.replace(/[^a-zA-Z]/g, '');
      return cleanLang.substring(0, 3).toUpperCase();
    }).filter(lang => lang.length > 0);

    return formatted;
  };

  // Get first N consultants
  const getFirstNine = (consultantsList) => {
    return consultantsList.slice(0, 9);
  };

  // Get user's location
  const detectLocation = () => {
    setUserLocation("Surat");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const city = data.city || data.locality || "Surat";
            setUserLocation(city);
          } catch (error) {
            setUserLocation("Surat");
          }
        },
        () => setUserLocation("Surat")
      );
    }
  };

  // Fetch consultants with proper data mapping
  const fetchConsultants = async () => {
    try {
      setLoading(true);
      const result = await getConsultants();
      console.log("API Response:", result);

      if (result.success) {
        const consultantsData = result.data?.data || result.data || [];
        console.log("Raw consultants data:", consultantsData);

        // Enhanced consultants data with proper field mapping
        const enhancedConsultants = consultantsData.map(consultant => {
          const formattedLanguages = formatLanguages(consultant.languages);
          const safeImage = getSafeImageUrl(consultant.image);

          // Determine consultation time based on moneyType
          let consultationTime = 'session';
          if (consultant.moneyType === 'minute') consultationTime = 'min';
          if (consultant.moneyType === 'hour') consultationTime = 'hour';
          if (consultant.moneyType === 'project') consultationTime = 'project';

          const enhanced = {
            ...consultant,
            _id: consultant._id || consultant.id,
            name: consultant.name || 'Consultant',
            designation: consultant.designation || 'Real Estate Consultant',
            type: consultant.designation || 'Real Estate Consultant',
            expertise: consultant.expertise || 'General Consulting',
            languages: formattedLanguages,
            consultationFee: consultant.money || consultant.consultationFee || '500',
            consultationTime: consultationTime,
            experience: consultant.experience || 0,
            location: consultant.location || 'City not specified',
            image: safeImage
          };

          console.log("Enhanced consultant data:", enhanced);
          return enhanced;
        });

        setConsultants(enhancedConsultants);
        applyFiltersAndLocation(enhancedConsultants);
      } else {
        Toast.show(result.error || "Failed to fetch consultants");
      }
    } catch (error) {
      console.error("Error fetching consultants:", error);
      Toast.show("Error loading consultants");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const res = await getProfile();
        if (res.success) {
          setCurrentUser(res.data.user);
        }
      }
    } catch (error) {
      console.log("Error fetching user profile");
    }
  };

  // Apply filters and location sorting
  const applyFiltersAndLocation = (consultantsList = consultants) => {
    let filtered = [...consultantsList];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(consultant =>
        (consultant.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (consultant.expertise?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (consultant.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (consultant.designation?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    // REMOVED: Rating filter

    // Apply experience filter
    if (filters.experience.length > 0) {
      filtered = filtered.filter(consultant => {
        const exp = parseInt(consultant.experience) || 0;
        return filters.experience.some(range => {
          if (range === '0-2') return exp >= 0 && exp <= 2;
          if (range === '2-5') return exp > 2 && exp <= 5;
          if (range === '5-10') return exp > 5 && exp <= 10;
          if (range === '10+') return exp > 10;
          return false;
        });
      });
    }

    // Sort by location - current city first, then nearby
    if (userLocation && userLocation !== "Detecting...") {
      filtered.sort((a, b) => {
        const aIsCurrentCity = (a.location?.toLowerCase() || '').includes(userLocation.toLowerCase());
        const bIsCurrentCity = (b.location?.toLowerCase() || '').includes(userLocation.toLowerCase());

        if (aIsCurrentCity && !bIsCurrentCity) return -1;
        if (!aIsCurrentCity && bIsCurrentCity) return 1;

        // If both are from current city or both are not, sort by experience (highest first)
        return (b.experience || 0) - (a.experience || 0);
      });
    }

    setFilteredConsultants(filtered);
  };

  // Format experience
  const formatExperience = (exp) => {
    const experience = parseInt(exp) || 0;
    if (!experience) return "0 years";
    return `${experience} ${experience === 1 ? 'year' : 'years'}`;
  };

  // Get consultants in chunks of 9
  const getConsultantChunks = () => {
    const chunks = [];
    const firstNine = getFirstNine(filteredConsultants);
    if (firstNine.length > 0) {
      chunks.push(firstNine);
    }
    return chunks;
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      experience: [],
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    applyFiltersAndLocation();
    setFilterVisible(false);
    Toast.show('Filters applied');
  };

  // Consultant Card Component with proper data display
  const ConsultantCard = ({ consultant }) => {
    const [imgSrc, setImgSrc] = useState(consultant.image);
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
      if (!imgError) {
        console.warn('Image failed to load:', imgSrc);
        setImgError(true);
        setImgSrc(getPlaceholderImage(120, 80));
      }
    };

    const handleImageLoad = () => {
      console.log('Image loaded successfully:', consultant.name);
    };

    return (
      <Grid.Item key={consultant._id}>
        <Card
          style={{
            background: "rgba(255, 255, 255, 0.19)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            overflow: "hidden",
            padding: 0,
            height: '100%'
          }}
          onClick={() => setSelectedConsultant(consultant)}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            {/* Consultant Image */}
            <div style={{
              width: '100%',
              height: '80px',
              overflow: 'hidden',
              background: '#f5f5f5'
            }}>
              <img
                src={imgSrc}
                alt={consultant.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            </div>

            {/* Consultant Info */}
            <div style={{
              padding: '8px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Name */}
              <div style={{
                fontWeight: '600',
                fontSize: '11px',
                color: 'white',
                marginBottom: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {consultant.name}
              </div>

              {/* Designation/Type */}
             <div
  style={{
    fontSize: "8px",
    color: "#1677ff", // slightly stronger blue
    fontWeight: 800, // 🔥 bold and thick
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    letterSpacing: "0.3px",
    textTransform: "capitalize", // optional, makes it neat
  }}
>
  {consultant.designation || consultant.type}
</div>


              {/* Location */}
              <div style={{
                fontSize: '8px',
                color: 'rgba(255, 255, 255, 1)',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <EnvironmentOutline style={{ fontSize: '8px' }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {consultant.location}
                </span>
              </div>

              {/* Languages - UPDATED: Shows max 3 languages */}
              <div style={{
                display: 'flex',
                gap: '2px',
                marginBottom: '4px',
                flexWrap: 'wrap'
              }}>
                {consultant.languages && consultant.languages.slice(0, 3).map((lang, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '7px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '1px 3px',
                      borderRadius: '4px'
                    }}
                  >
                    {lang}
                  </span>
                ))}
                {/* Show +X if there are more than 3 languages */}
                {consultant.languages && consultant.languages.length > 3 && (
                  <span
                    style={{
                      fontSize: '7px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 1)',
                      padding: '1px 3px',
                      borderRadius: '4px'
                    }}
                  >
                    +{consultant.languages.length - 3}
                  </span>
                )}
              </div>

              {/* Experience - REMOVED rating */}
              {/* Experience */}
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "white" }}>Exp:</span>{" "}
                <span style={{ color: "#ff6b00" }}>
                  {consultant.experience || 1} year
                </span>
              </div>

              {/* Fee */}
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "white" }}>Fee:</span>{" "}
                <span style={{ color: "#ff6b00" }}>
                  ₹{consultant.consultationFee || 500} / {consultant.consultationTime || "session"}
                </span>
              </div>


              {/* View Button */}
              <Button
                size="mini"
                color="primary"
                fill="solid"
                style={{
                  fontSize: '12px',
                  height: '24px',
                  marginTop: 'auto'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConsultant(consultant);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </Card>
      </Grid.Item>
    );
  };

  // Advertisement Card Component
  const AdvertisementCard = ({ ad }) => (
    <Card
      style={{
        background: ad.gradient,
        color: 'white',
        marginBottom: '16px',
        border: 'none',
        borderRadius: '12px'
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Badge
          content={ad.badge}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '10px'
          }}
        />
        <h3 style={{
          margin: '8px 0 4px 0',
          color: 'white',
          fontSize: '14px'
        }}>
          {ad.title}
        </h3>
        <p style={{
          margin: '0 0 12px 0',
          opacity: 0.9,
          fontSize: '12px'
        }}>
          {ad.description}
        </p>
        <Button
          color="primary"
          size="small"
          fill="solid"
          style={{ fontSize: '12px' }}
          onClick={() => Toast.show(`Exploring ${ad.title}`)}
        >
          Explore
        </Button>
      </div>
    </Card>
  );

  // Menu Popup Component
  const MenuPopup = () => (
    <Popup
      visible={menuVisible}
      onMaskClick={() => setMenuVisible(false)}
      position="right"
      bodyStyle={{ width: '80vw', height: '100vh' }}
    >
      <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#1677ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              <UserOutline />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{currentUser?.name || 'Welcome!'}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Find expert consultants</p>
            </div>
          </div>
          <Button fill="none" size="small" onClick={() => setMenuVisible(false)}>
            <CloseOutline />
          </Button>
        </div>

        <List style={{ flex: 1 }}>
          {[
            { icon: <UserOutline />, label: 'My Profile', action: () => navigate('/profile') },
            { icon: <BellOutline />, label: 'Notifications', action: () => Toast.show('Notifications feature coming soon') },
            { icon: <HeartOutline />, label: 'Favorites', action: () => navigate('/favorites') },
            { icon: <TeamOutline />, label: 'My Consultants', action: () => Toast.show('My Consultants feature coming soon') },
            { icon: <SetOutline />, label: 'Settings', action: () => Toast.show('Settings feature coming soon') },
            { icon: <InformationCircleOutline />, label: 'About Us', action: () => Toast.show('About Us feature coming soon') }
          ].map((item, index) => (
            <List.Item
              key={index}
              prefix={item.icon}
              onClick={() => {
                setMenuVisible(false);
                item.action();
              }}
              style={{ fontSize: '14px' }}
            >
              {item.label}
            </List.Item>
          ))}
        </List>

        <div>
          {currentUser ? (
            <Button
              color="primary"
              fill="solid"
              size="large"
              block
              onClick={() => {
                localStorage.removeItem('authToken');
                setCurrentUser(null);
                setMenuVisible(false);
                Toast.show('Logged out successfully');
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="primary"
              fill="solid"
              size="large"
              block
              onClick={() => {
                setMenuVisible(false);
                navigate('/login');
              }}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </Popup>
  );

  // UPDATED: Filter Modal Component - Removed rating filter
  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      onClose={() => setFilterVisible(false)}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Filter Consultants</span>
          <Button fill="none" size="small" onClick={() => setFilterVisible(false)}>
            <CloseOutline />
          </Button>
        </div>
      }
      content={
        <div style={{ padding: '16px' }}>
          {/* REMOVED: Rating filter section */}

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '8px' }}>Experience Level</h4>
            <Selector
              options={experienceOptions}
              value={filters.experience}
              onChange={value => setFilters(prev => ({ ...prev, experience: value }))}
              multiple
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button color="default" onClick={resetFilters} style={{ flex: 1 }}>
              Reset
            </Button>
            <Button color="primary" onClick={handleApplyFilters} style={{ flex: 1 }}>
              Apply
            </Button>
          </div>
        </div>
      }
    />
  );

  // UPDATED: Consultant Detail Modal - Removed rating
  const ConsultantModal = () => (
    <Modal
      visible={!!selectedConsultant}
      onClose={() => setSelectedConsultant(null)}
      closeOnAction
      closeOnMaskClick
      actions={[
        {
          key: 'close',
          text: 'Close',
          primary: true,
        }
      ]}
      content={
        selectedConsultant && (
          <div style={{ padding: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar
                src={getSafeImageUrl(selectedConsultant.image)}
                style={{ '--size': '80px', margin: '0 auto 12px' }}
                fallback={<UserOutline />}
              />
              <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{selectedConsultant.name}</h2>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                {selectedConsultant.designation || selectedConsultant.type}
              </p>
              {/* REMOVED: Rating component */}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Expertise</h4>
              <Space wrap>
                {selectedConsultant.expertise?.split(',').map((exp, index) => (
                  <Tag key={index} color="blue" fill="outline" style={{ fontSize: '12px' }}>
                    {exp.trim()}
                  </Tag>
                ))}
              </Space>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Details</h4>
              <List style={{ '--font-size': '13px' }}>
                <List.Item prefix={<EnvironmentOutline />}>
                  {selectedConsultant.location}
                </List.Item>
                <List.Item prefix={<StarOutline />}>
                  Experience: {formatExperience(selectedConsultant.experience)}
                </List.Item>
                <List.Item>
                  Fee: ₹{selectedConsultant.consultationFee} / {selectedConsultant.consultationTime}
                </List.Item>
                <List.Item>
                  Languages: {Array.isArray(selectedConsultant.languages) ? selectedConsultant.languages.join(', ') : selectedConsultant.languages}
                </List.Item>
              </List>
            </div>

            <Space block>
              <Button color="primary" fill="solid" block size="large">
                <MessageOutline /> Contact
              </Button>
            </Space>
          </div>
        )
      }
    />
  );

  useEffect(() => {
    detectLocation();
    fetchConsultants();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    applyFiltersAndLocation();
  }, [searchQuery, userLocation, filters, consultants]);

  const consultantChunks = getConsultantChunks();

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Dark Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 0
      }}></div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeaderWithSearch
          searchValue={searchQuery}
          setSearchValue={setSearchQuery}
          city={userLocation}
          setCity={setUserLocation}
        />

        {/* Filter info and count */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {filteredConsultants.length} consultants found
            </span>
            <Button
              color="primary"
              fill="outline"
              size="mini"
              onClick={() => setFilterVisible(true)}
            >
              <FilterOutline style={{ fontSize: '12px' }} />
              Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: 'white'
          }}>
            <DotLoading color="primary" />
            <div style={{ marginTop: '12px', color: 'white' }}>Loading consultants...</div>
          </div>
        ) : (
          <div style={{ padding: '12px', paddingBottom: '80px' }}>
            {filteredConsultants.length === 0 ? (
              <Empty description="No consultants found" />
            ) : (
              consultantChunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex}>
                  {/* Section Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    padding: '0 4px'
                  }}>
                    <h3 style={{
                      margin: 0,
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      Top Consultants ({filteredConsultants.length})
                    </h3>
                  </div>

                  {/* 3x3 Grid */}
                  <Grid columns={3} gap={8} style={{ marginBottom: '16px' }}>
                    {chunk.map((consultant) => (
                      <ConsultantCard key={consultant._id} consultant={consultant} />
                    ))}
                  </Grid>

                  {/* Advertisement after each chunk */}
                  {advertisements[chunkIndex] && (
                    <AdvertisementCard ad={advertisements[chunkIndex]} />
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals and Popups */}
      <MenuPopup />
      <FilterModal />
      <ConsultantModal />
    </div>
  );
}