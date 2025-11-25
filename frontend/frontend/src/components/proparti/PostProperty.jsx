import React, { useState, useEffect } from "react";
import {
  Popup,
  Form,
  Input,
  Button,
  Card,
  Space,
  Tag,
  Selector,
  Switch,
  ImageUploader,
  Toast,
  Grid,
  Divider,
} from "antd-mobile";
import { AppOutline, PlayOutline, CloseOutline } from "antd-mobile-icons";
import { createProperty } from "../../services/properties";

// -------------------- Data Options - UPDATED TO MATCH BACKEND ENUMS --------------------
const PROPERTY_TYPES = [
  { label: "Apartment", value: "Apartment" },
  { label: "Studio", value: "Studio" },
  { label: "Independent House", value: "Independent House" },
  { label: "Villa", value: "Villa" },
  { label: "Plot", value: "Plot" },
  { label: "Commercial Office", value: "Commercial Office" },
  { label: "Commercial Shop", value: "Commercial Shop" },
  { label: "Warehouse", value: "Warehouse" },
  { label: "Industrial Land", value: "Industrial Land" },
  { label: "Farmhouse", value: "Farmhouse" }
];

const LISTING_TYPES = [
  { label: "For Sale", value: "Sale" },
  { label: "For Rent", value: "Rent" },
];

const BEDROOM_TYPES = [
  { label: "Studio", value: "Studio" },
  { label: "1 BHK", value: "1 BHK" },
  { label: "2 BHK", value: "2 BHK" },
  { label: "3 BHK", value: "3 BHK" },
  { label: "4 BHK", value: "4 BHK" },
  { label: "5 BHK", value: "5 BHK" },
  { label: "6 BHK+", value: "6 BHK+" },
  { label: "Independent Floor", value: "Independent Floor" }
];

const FURNISHING_TYPES = [
  { label: "Unfurnished", value: "Unfurnished" },
  { label: "Semi-Furnished", value: "Semi-Furnished" },
  { label: "Furnished", value: "Furnished" },
];

const AMENITIES = [
  "Lift", "Power Backup", "Visitor Parking", "Security", "Gated Community",
  "Club House", "Gym", "Swimming Pool", "Children's Play Area", "Jogging Track",
  "Indoor Games", "Banquet Hall", "Car Parking", "Wi-Fi", "Fire Safety",
  "Garden/Park", "Community Hall", "24x7 Water Supply", "Intercom", "Shopping Center"
];

const CONSTRUCTION_STATUS = [
  { label: "Ready to Move", value: "Ready to Move" },
  { label: "Under Construction", value: "Under Construction" },
  { label: "New", value: "New" },
  { label: "Resale", value: "Resale" }
];

// -------------------- Component --------------------
export default function PostProperty({ visible, onClose }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [selectedPropertyType, setSelectedPropertyType] = useState([]);
  const [selectedListingType, setSelectedListingType] = useState([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);
  const [selectedFurnishing, setSelectedFurnishing] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedConstructionStatus, setSelectedConstructionStatus] = useState([]);
  const [negotiable, setNegotiable] = useState(false);

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  // Reset form when popup closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedPropertyType([]);
      setSelectedListingType([]);
      setSelectedBedrooms([]);
      setSelectedFurnishing([]);
      setSelectedAmenities([]);
      setSelectedConstructionStatus([]);
      setNegotiable(false);
      setImages([]);
      setVideos([]);
    }
  }, [visible, form]);

  // -------------------- Submit Handler - FIXED VALUES --------------------
  const handleSubmit = async (values) => {
    try {
      // Validation
      if (!selectedPropertyType.length) {
        Toast.show("Please select property type");
        return;
      }
      if (!selectedListingType.length) {
        Toast.show("Please select listing type");
        return;
      }
      if (!selectedBedrooms.length) {
        Toast.show("Please select bedroom type");
        return;
      }
      if (!selectedFurnishing.length) {
        Toast.show("Please select furnishing type");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      
      // Basic info - using exact enum values from backend
      formData.append("title", values.title || "");
      formData.append("description", values.description || "");
      formData.append("price", values.price || "0");
      formData.append("carpetArea", values.carpetArea || "0");
      formData.append("addressLine1", values.addressLine1 || "");
      formData.append("locality", values.locality || "");
      formData.append("city", values.city || "");
      formData.append("state", values.state || "");
      formData.append("pincode", values.pincode || "");
      formData.append("negotiable", negotiable.toString());
      
      // Use exact enum values from backend schema
      formData.append("propertyType", selectedPropertyType[0] || "");
      formData.append("listingType", selectedListingType[0] || "");
      formData.append("bedrooms", selectedBedrooms[0] || "");
      formData.append("furnishing", selectedFurnishing[0] || "");
      
      // Construction status - default to "Resale" if not selected
      formData.append("constructionStatus", selectedConstructionStatus[0] || "Resale");
      
      // Send amenities as array of strings
      selectedAmenities.forEach(amenity => {
        formData.append("amenities", amenity);
      });
      
      formData.append("postedBy", "owner");
      formData.append("status", "Available");
      formData.append("country", "India");

      // Append media files
      images.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });
      
      videos.forEach((vid) => {
        if (vid.file) formData.append("videos", vid.file);
      });

      console.log("Submitting form data with values:", {
        propertyType: selectedPropertyType[0],
        listingType: selectedListingType[0],
        bedrooms: selectedBedrooms[0],
        furnishing: selectedFurnishing[0],
        constructionStatus: selectedConstructionStatus[0] || "Resale",
        amenities: selectedAmenities
      });

      const result = await createProperty(formData);
      console.log("API Response:", result);

      if (result.success) {
        Toast.show("Property posted successfully!");
        onClose?.();
        // Dispatch event to refresh properties
        window.dispatchEvent(new Event("propertyAdded"));
      } else {
        Toast.show(result.error || "Failed to post property. Please check all fields.");
        console.error("API Error:", result.error);
      }
    } catch (err) {
      console.error("Submission error:", err);
      Toast.show("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Render --------------------
  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{
        height: "90vh",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
      }}
    >
      <div className="post-property-popup">
        {/* Header with close button */}
        <div className="popup-header">
          <div className="header-content">
            <AppOutline style={{ fontSize: 20, color: '#1890ff' }} />
            <h3 style={{ margin: 0, color: '#333', fontSize: 18 }}>Post New Property</h3>
          </div>
          <Button 
            fill="none" 
            size="small" 
            onClick={onClose} 
            className="close-btn"
            style={{ 
              color: '#666',
              padding: '8px',
              borderRadius: '50%'
            }}
          >
            <CloseOutline style={{ fontSize: 18 }} />
          </Button>
        </div>

        <div className="popup-content">
          <Form
            form={form}
            onFinish={handleSubmit}
            footer={
              <div style={{ padding: '16px 0' }}>
                <Button 
                  block 
                  type="submit" 
                  color="primary" 
                  size="large" 
                  loading={loading}
                  style={{
                    borderRadius: '8px',
                    height: '44px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? "Posting Property..." : "Post Property"}
                </Button>
              </div>
            }
            style={{
              '--adm-form-background-color': 'transparent'
            }}
          >
            {/* Basic Information */}
            <Card 
              title="Basic Information" 
              style={{ 
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              <Space direction="vertical" block style={{ width: '100%' }}>
                <Form.Item 
                  name="title" 
                  label="Property Title" 
                  rules={[{ required: true, message: "Please enter property title" }]}
                  style={{ '--adm-font-size-main': '14px' }}
                >
                  <Input 
                    placeholder="Beautiful 2 BHK Apartment" 
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item 
                  name="description" 
                  label="Description" 
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <Input 
                    placeholder="Describe your property features, location advantages..." 
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item label="Property Type" required>
                  <Selector 
                    options={PROPERTY_TYPES} 
                    value={selectedPropertyType} 
                    onChange={setSelectedPropertyType}
                    style={{ '--border-radius': '8px' }}
                  />
                </Form.Item>

                <Form.Item label="Listing Type" required>
                  <Selector 
                    options={LISTING_TYPES} 
                    value={selectedListingType} 
                    onChange={setSelectedListingType}
                    style={{ '--border-radius': '8px' }}
                  />
                </Form.Item>

                <Form.Item label="Bedrooms" required>
                  <Selector 
                    options={BEDROOM_TYPES} 
                    value={selectedBedrooms} 
                    onChange={setSelectedBedrooms}
                    style={{ '--border-radius': '8px' }}
                  />
                </Form.Item>

                <Form.Item label="Furnishing" required>
                  <Selector 
                    options={FURNISHING_TYPES} 
                    value={selectedFurnishing} 
                    onChange={setSelectedFurnishing}
                    style={{ '--border-radius': '8px' }}
                  />
                </Form.Item>

                <Form.Item label="Construction Status">
                  <Selector 
                    options={CONSTRUCTION_STATUS} 
                    value={selectedConstructionStatus} 
                    onChange={setSelectedConstructionStatus}
                    style={{ '--border-radius': '8px' }}
                  />
                </Form.Item>
              </Space>
            </Card>

            {/* Pricing & Area */}
            <Card 
              title="Pricing & Area" 
              style={{ 
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              <Space direction="vertical" block style={{ width: '100%' }}>
                <Grid columns={2} gap={8}>
                  <Form.Item 
                    name="price" 
                    label="Price (₹)" 
                    rules={[{ required: true, message: "Please enter price" }]}
                  >
                    <Input 
                      type="number" 
                      placeholder="Enter price" 
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  <Form.Item 
                    name="carpetArea" 
                    label="Area (sq.ft)" 
                    rules={[{ required: true, message: "Please enter area" }]}
                  >
                    <Input 
                      type="number" 
                      placeholder="Enter area" 
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Grid>
                <Form.Item label="Price Negotiable">
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 0'
                  }}>
                    <span style={{ fontSize: '14px', color: '#333' }}>
                      Negotiable Price
                    </span>
                    <Switch 
                      checked={negotiable} 
                      onChange={setNegotiable}
                      style={{ '--checked-color': '#1890ff' }}
                    />
                  </div>
                </Form.Item>
              </Space>
            </Card>

            {/* Location */}
            <Card 
              title="Location" 
              style={{ 
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              <Space direction="vertical" block style={{ width: '100%' }}>
                <Form.Item 
                  name="addressLine1" 
                  label="Address" 
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input 
                    placeholder="Full street address" 
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
                <Grid columns={2} gap={8}>
                  <Form.Item 
                    name="locality" 
                    label="Locality" 
                    rules={[{ required: true, message: "Please enter locality" }]}
                  >
                    <Input 
                      placeholder="Locality/Area" 
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  <Form.Item 
                    name="city" 
                    label="City" 
                    rules={[{ required: true, message: "Please enter city" }]}
                  >
                    <Input 
                      placeholder="City" 
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Grid>
                <Grid columns={2} gap={8}>
                  <Form.Item 
                    name="state" 
                    label="State" 
                    rules={[{ required: true, message: "Please enter state" }]}
                  >
                    <Input 
                      placeholder="State" 
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                  <Form.Item 
                    name="pincode" 
                    label="Pincode" 
                    rules={[{ required: true, message: "Please enter pincode" }]}
                  >
                    <Input 
                      placeholder="Pincode" 
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Grid>
              </Space>
            </Card>

            {/* Amenities */}
            <Card 
              title="Amenities" 
              style={{ 
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              <div style={{ padding: '8px 0' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  Select all applicable amenities
                </div>
                <Space wrap style={{ width: '100%' }}>
                  {AMENITIES.map((amenity) => (
                    <Tag
                      key={amenity}
                      color={selectedAmenities.includes(amenity) ? "primary" : "default"}
                      onClick={() => {
                        setSelectedAmenities((prev) =>
                          prev.includes(amenity) 
                            ? prev.filter((a) => a !== amenity) 
                            : [...prev, amenity]
                        );
                      }}
                      style={{
                        margin: '4px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {amenity}
                    </Tag>
                  ))}
                </Space>
                {selectedAmenities.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '14px', 
                    color: '#1890ff' 
                  }}>
                    Selected: {selectedAmenities.length} amenities
                  </div>
                )}
              </div>
            </Card>

            {/* Media Upload */}
            <Card 
              title="Media" 
              style={{ 
                borderRadius: '12px',
                marginBottom: '16px'
              }}
            >
              <Space direction="vertical" block style={{ width: '100%' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    📸 Images ({images.length}/10)
                  </div>
                  <ImageUploader
                    value={images}
                    onChange={setImages}
                    multiple
                    maxCount={10}
                    upload={async (file) => ({ 
                      url: URL.createObjectURL(file), 
                      file 
                    })}
                    style={{
                      '--cell-size': '80px',
                      '--border-radius': '8px'
                    }}
                  />
                </div>

                <Divider style={{ 
                  borderColor: '#f0f0f0',
                  margin: '16px 0'
                }} />

                <div>
                  <div style={{ 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    🎥 Videos ({videos.length}/5)
                  </div>
                  <ImageUploader
                    value={videos}
                    onChange={setVideos}
                    multiple
                    maxCount={5}
                    upload={async (file) => ({ 
                      url: URL.createObjectURL(file), 
                      file 
                    })}
                    style={{
                      '--cell-size': '80px',
                      '--border-radius': '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        border: '1px dashed #d9d9d9',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f0f0f0';
                        e.target.style.borderColor = '#1890ff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f5f5f5';
                        e.target.style.borderColor = '#d9d9d9';
                      }}
                    >
                      <PlayOutline style={{ fontSize: 24, color: "#999" }} />
                    </div>
                  </ImageUploader>
                </div>
              </Space>
            </Card>
          </Form>
        </div>
      </div>
    </Popup>
  );
}