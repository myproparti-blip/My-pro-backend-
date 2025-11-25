// src/components/AddConsultantModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Toast,
  TextArea,
  ImageUploader,
  Avatar,
  Badge,
  Space,
  Selector,
} from "antd-mobile";
import { addConsultant } from "../services/consultants";

// ✅ PUT UTILITY FUNCTIONS HERE - OUTSIDE THE COMPONENT
const reverseGeocode = async (lat, lon) => {
  try {
    // Using CORS proxy solution
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
    
    if (!response.ok) throw new Error('Geocoding failed');
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.warn('Geocoding failed, using coordinates:', error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
};

// Fixed placeholder image function
const getPlaceholderImage = (width = 150, height = 150) => {
  return `https://placehold.co/${width}x${height}/f0f0f0/666666/png?text=Consultant`;
};

const EXPERIENCE_LEVELS = [
  { label: "0-2 years", value: 1 },
  { label: "2-5 years", value: 3 },
  { label: "5-10 years", value: 7 },
  { label: "10+ years", value: 10 },
];

const MONEY_TYPE_OPTIONS = [
  { label: "Per 30 Minute", value: "minute" },
  { label: "Per 1 Hour", value: "hour" },
  { label: "Per Project", value: "project" },
];

const COMMON_LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", 
  "Chinese", "Japanese", "Arabic", "Portuguese", "Russian",
  "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati"
];

const EXPERTISE_AREAS = [
  "Market analysis",
  "Market research",
  "Negotiation",
  "Client consultation",
  "Customer service",
  "Property management",
  "Real estate negotiating",
  "Real Estate transactions",
  "Customer Relationship Management",
  "Analysis",
  "Market trends analysis",
  "Communication",
  "Consulting experience",
  "Online listings management",
  "Property proposals",
  "Problem solving",
  "Real estate appraisal",
  "Property marketing",
  "Investment recommendations",
  "Strategic planning"
];

export default function AddConsultantModal({ visible, setVisible, refreshData, onSuccess, onCancel, userLocation, userPhone }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [feeAmount, setFeeAmount] = useState(500);
  const [selectedMoneyType, setSelectedMoneyType] = useState(["project"]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // ✅ UPDATED useEffect - INSIDE THE COMPONENT
  useEffect(() => {
    if (visible) {
      // If userLocation is provided as coordinates, reverse geocode it
      if (userLocation && typeof userLocation === 'object') {
        reverseGeocode(userLocation.lat, userLocation.lon)
          .then(locationName => {
            form.setFieldValue('location', locationName);
          })
          .catch(error => {
            console.error('Location error:', error);
            form.setFieldValue('location', '');
          });
      } else if (userLocation) {
        form.setFieldValue('location', userLocation);
      }
      
      if (userPhone) {
        form.setFieldValue('phone', userPhone);
      }
    } else {
      handleReset();
    }
  }, [visible, userLocation, userPhone, form]);

  const validateForm = () => {
    const errors = [];
    
    // Get form values
    const formValues = form.getFieldsValue();
    
    // Check form fields
    if (!formValues.name?.trim()) errors.push("Full Name");
    if (!formValues.phone?.trim()) errors.push("Phone Number");
    if (!formValues.location?.trim()) errors.push("Location");
    if (!formValues.designation?.trim()) errors.push("Designation");
    
    // Check state fields
    if (!imageFile) errors.push("Profile Photo");
    if (!idProofFile) errors.push("ID Proof");
    if (!selectedExperience) errors.push("Experience Level");
    if (selectedExpertise.length === 0) errors.push("Area of Expertise");
    if (selectedMoneyType.length === 0) errors.push("Fee Type");

    return errors;
  };

  const handleSubmit = async () => {
    // Validate all fields first
    const errors = validateForm();
    
    if (errors.length > 0) {
      Toast.show({
        icon: "fail",
        content: `Please fill: ${errors.join(", ")}`,
        duration: 4000,
      });
      return;
    }

    // Now get the validated form values
    const values = form.getFieldsValue();
    
    setLoading(true);
    try {
      const formData = new FormData();

      // Add all required fields from schema
      formData.append("name", values.name.trim());
      formData.append("phone", values.phone.trim());
      formData.append("designation", values.designation.trim());
      formData.append("experience", selectedExperience);
      formData.append("money", feeAmount);
      formData.append("moneyType", selectedMoneyType[0]); // Use selected money type
      formData.append("expertise", selectedExpertise.join(", "));
      formData.append("location", values.location.trim());
      
      // Add optional fields
      if (values.certifications?.trim()) {
        formData.append("certifications", values.certifications.trim());
      }
      if (values.address?.trim()) {
        formData.append("address", values.address.trim());
      }
      
      // Add languages as array (not stringified)
      selectedLanguages.forEach(language => {
        formData.append("languages", language);
      });

      // Add files
      formData.append("image", imageFile);
      formData.append("idProof", idProofFile);

      console.log("Submitting consultant data...", {
        name: values.name,
        phone: values.phone,
        designation: values.designation,
        experience: selectedExperience,
        money: feeAmount,
        moneyType: selectedMoneyType[0],
        expertise: selectedExpertise.join(", "),
        location: values.location,
        languages: selectedLanguages
      });

      const res = await addConsultant(formData);
      
      if (res.success) {
        Toast.show({
          icon: "success",
          content: "Consultant added successfully!",
          duration: 2000,
        });
        handleReset();
        setVisible(false);
        refreshData?.();
        onSuccess?.();
      } else {
        throw new Error(res.error || "Failed to add consultant");
      }
    } catch (err) {
      console.error("Add consultant error:", err);
      Toast.show({
        icon: "fail",
        content: err.message || "Something went wrong!",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setImageFile(null);
    setIdProofFile(null);
    setPreviewImage(null);
    setIdProofPreview(null);
    setFeeAmount(500);
    setSelectedMoneyType(["project"]);
    setSelectedExperience(null);
    setSelectedExpertise([]);
    setSelectedLanguages([]);
  };

  // Fixed image upload handlers with validation
  const handleImageUpload = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Toast.show({
        icon: "fail",
        content: "Please upload a valid image file",
      });
      return null;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Toast.show({
        icon: "fail",
        content: "Image size should be less than 5MB",
      });
      return null;
    }
    
    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    return { url: imageUrl };
  };

  const handleIdProofUpload = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Toast.show({
        icon: "fail",
        content: "Please upload a valid image file for ID proof",
      });
      return null;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Toast.show({
        icon: "fail",
        content: "ID proof size should be less than 5MB",
      });
      return null;
    }
    
    setIdProofFile(file);
    const imageUrl = URL.createObjectURL(file);
    setIdProofPreview(imageUrl);
    return { url: imageUrl };
  };

  const handleCancel = () => {
    handleReset();
    if (onCancel) {
      onCancel();
    } else {
      setVisible(false);
    }
  };

  const incrementFee = () => setFeeAmount(prev => prev + 100);
  const decrementFee = () => setFeeAmount(prev => Math.max(100, prev - 100));

  const toggleExperience = (value) => {
    setSelectedExperience(value);
  };

  const toggleExpertise = (expertise) => {
    setSelectedExpertise(prev =>
      prev.includes(expertise)
        ? prev.filter(e => e !== expertise)
        : [...prev, expertise]
    );
  };

  const toggleLanguage = (language) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  // Chip Component
  const Chip = ({ label, selected, onToggle }) => (
    <div
      onClick={onToggle}
      style={{
        padding: "10px 16px",
        borderRadius: "20px",
        border: `2px solid ${selected ? "#1677ff" : "#e0e0e0"}`,
        backgroundColor: selected ? "#1677ff" : "white",
        color: selected ? "white" : "#333",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );

  // Counter Component
  const Counter = ({ value, onIncrement, onDecrement, label, unit }) => (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '16px', 
      borderRadius: '12px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333', textAlign: 'center' }}>
        {label}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '16px'
      }}>
        <Button 
          size="small" 
          onClick={onDecrement}
          style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          -
        </Button>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          minWidth: '80px'
        }}>
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>
            {value}
          </span>
          <span style={{ fontSize: 12, color: '#666', marginTop: '4px' }}>
            {unit}
          </span>
        </div>
        
        <Button 
          size="small" 
          onClick={onIncrement}
          style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          +
        </Button>
      </div>
    </div>
  );

  // Section Component
  const Section = ({ title, icon, children }) => (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '16px', 
      borderRadius: '12px',
      border: '1px solid #f0f0f0',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>{title}</span>
      </div>
      {children}
    </div>
  );

  // Get money type display text
  const getMoneyTypeDisplay = () => {
    const type = selectedMoneyType[0];
    switch (type) {
      case 'minute': return 'Per Minute';
      case 'hour': return 'Per Hour';
      case 'project': return 'Per Project';
      default: return 'Per Project';
    }
  };

  return (
    <Modal
      visible={visible}
      title={
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
            Add New Consultant
          </div>
          <div style={{ fontSize: 13, color: '#666' }}>
            Complete all required fields
          </div>
        </div>
      }
      content={
        <div style={{ maxHeight: "65vh", overflowY: "auto", padding: '0 4px' }}>
          <Form
            form={form}
            layout="vertical"
            footer={null}
          >
            {/* Profile Photo */}
            <Section title="Profile Photo" icon="👤">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '12px' }}>
                {previewImage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Badge content="Preview">
                      <Avatar 
                        src={previewImage} 
                        style={{ 
                          '--size': '100px',
                          borderRadius: '50%',
                          border: '3px solid #1677ff'
                        }}
                      />
                    </Badge>
                    <Button 
                      size="mini" 
                      color="danger" 
                      onClick={() => {
                        setImageFile(null);
                        setPreviewImage(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImageUploader
                    maxCount={1}
                    upload={handleImageUpload}
                  >
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        border: '2px dashed #d9d9d9',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#666',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>📷</span>
                      <span style={{ fontSize: 11, textAlign: 'center' }}>Upload Photo</span>
                    </div>
                  </ImageUploader>
                )}
              </div>
            </Section>

            {/* Personal Information */}
            <Section title="Personal Information" icon="👤">
              <Space direction="vertical" block style={{ '--gap': '12px' }}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: "Please enter full name" }]}
                >
                  <Input placeholder="Enter full name" clearable />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    { pattern: /^[0-9]{10}$/, message: "10 digits required" }
                  ]}
                >
                  <Input type="tel" maxLength={10} placeholder="10-digit number" clearable />
                </Form.Item>

                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: "Please enter location" }]}
                >
                  <Input placeholder="City, State" clearable />
                </Form.Item>

                <Form.Item
                  name="designation"
                  label="Designation"
                  rules={[{ required: true, message: "Please enter designation" }]}
                >
                  <Input placeholder="e.g., Senior Consultant" clearable />
                </Form.Item>
              </Space>
            </Section>

            {/* Consultation Details */}
            <Section title="Consultation Details" icon="💰">
              <Space direction="vertical" block style={{ '--gap': '16px' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    Consultation Fee {!feeAmount && "❌"}
                  </div>
                  <Counter
                    value={feeAmount}
                    onIncrement={incrementFee}
                    onDecrement={decrementFee}
                    label="Fee Amount"
                    unit="₹"
                  />
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    Fee Type {selectedMoneyType.length === 0 && "❌"}
                  </div>
                  <Selector
                    options={MONEY_TYPE_OPTIONS}
                    value={selectedMoneyType}
                    onChange={setSelectedMoneyType}
                    multiple={false}
                    style={{
                      '--border-radius': '8px',
                      '--border': '1px solid #e0e0e0',
                      '--checked-border': '1px solid #1677ff',
                    }}
                  />
                </div>

                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f0f8ff', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: 13, color: '#1677ff', fontWeight: '500' }}>
                    💰 {feeAmount}₹ {getMoneyTypeDisplay()}
                  </span>
                </div>
              </Space>
            </Section>

            {/* Professional Details */}
            <Section title="Professional Details" icon="💼">
              <Space direction="vertical" block style={{ '--gap': '16px' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    Experience Level {!selectedExperience && "❌"}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <Chip
                        key={level.value}
                        label={level.label}
                        selected={selectedExperience === level.value}
                        onToggle={() => toggleExperience(level.value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    Area of Expertise ({selectedExpertise.length} selected) {selectedExpertise.length === 0 && "❌"}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EXPERTISE_AREAS.map((expertise) => (
                      <Chip
                        key={expertise}
                        label={expertise}
                        selected={selectedExpertise.includes(expertise)}
                        onToggle={() => toggleExpertise(expertise)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>
                    Languages Spoken ({selectedLanguages.length} selected)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {COMMON_LANGUAGES.map((language) => (
                      <Chip
                        key={language}
                        label={language}
                        selected={selectedLanguages.includes(language)}
                        onToggle={() => toggleLanguage(language)}
                      />
                    ))}
                  </div>
                </div>

                <Form.Item name="certifications" label="Certifications">
                  <TextArea 
                    placeholder="List certifications, degrees, or qualifications..."
                    rows={2}
                    maxLength={300}
                    showCount
                  />
                </Form.Item>
              </Space>
            </Section>

            {/* Documents Section */}
            <Section title="Documents & Verification" icon="📄">
              <Space direction="vertical" block style={{ '--gap': '16px' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#333' }}>
                    ID Proof Document {!idProofFile && "❌"}
                  </div>
                  {idProofPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Badge content="Preview">
                        <Avatar 
                          src={idProofPreview} 
                          style={{ 
                            '--size': '100px',
                            borderRadius: '8px',
                            border: '2px solid #52c41a'
                          }}
                        />
                      </Badge>
                      <Button 
                        size="mini" 
                        color="danger" 
                        onClick={() => {
                          setIdProofFile(null);
                          setIdProofPreview(null);
                        }}
                      >
                        Remove ID
                      </Button>
                    </div>
                  ) : (
                    <ImageUploader
                      maxCount={1}
                      upload={handleIdProofUpload}
                    >
                      <div
                        style={{
                          width: '100%',
                          padding: '20px',
                          border: '2px dashed #d9d9d9',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          color: '#666',
                          gap: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 24 }}>🆔</span>
                        <span>Tap to upload ID Proof</span>
                        <span style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>
                          Aadhaar, PAN, or Government ID
                        </span>
                      </div>
                    </ImageUploader>
                  )}
                </div>

                <Form.Item name="address" label="Full Address">
                  <TextArea 
                    rows={2} 
                    maxLength={150} 
                    showCount 
                    placeholder="Enter complete residential address..."
                  />
                </Form.Item>
              </Space>
            </Section>
          </Form>
        </div>
      }
      closeOnAction
      onClose={handleCancel}
      actions={[
        {
          key: 'cancel',
          text: 'Cancel',
          onClick: handleCancel,
          disabled: loading,
        },
        {
          key: 'submit',
          text: loading ? 'Adding...' : 'Add Consultant',
          primary: true,
          onClick: handleSubmit,
          loading: loading,
        }
      ]}
      style={{ 
        '--border-radius': '16px',
        '--max-width': '100%',
      }}
    />
  );
}