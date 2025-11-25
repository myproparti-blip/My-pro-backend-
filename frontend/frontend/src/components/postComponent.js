import React, { useState, useEffect } from "react";
import {
  Modal,
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
import { createProperty } from "../services/properties";

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

  // Reset form when modal closes
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
    <Modal
      visible={visible}
      onClose={onClose}
      content={
        <div className="post-property-modal" style={{ 
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Header with close button */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0',
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderRadius: '16px 16px 0 0',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AppOutline style={{ fontSize: 20, color: '#1890ff' }} />
              <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: '600' }}>
                Post New Property
              </h3>
            </div>
            <Button 
              fill="none" 
              size="small" 
              onClick={onClose}
              style={{ 
                color: '#666',
                padding: '8px',
                borderRadius: '50%',
                minWidth: 'auto'
              }}
            >
              <CloseOutline style={{ fontSize: 18 }} />
            </Button>
          </div>

          {/* Form Content */}
          <div style={{ 
            maxHeight: '65vh', 
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 5px 10px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <Form
              form={form}
              onFinish={handleSubmit}
              footer={
                <div style={{ 
                  padding: '20px 0 0', 
                  background: '#fff',
                  position: 'sticky',
                  bottom: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <Button 
                    block 
                    type="submit" 
                    color="primary" 
                    size="large" 
                    loading={loading}
                    style={{
                      borderRadius: '12px',
                      height: '50px',
                      fontSize: '16px',
                      fontWeight: '600',
                      background: '#1890ff',
                      border: 'none',
                      width: '100%'
                    }}
                  >
                    {loading ? "Posting Property..." : "Post Property"}
                  </Button>
                </div>
              }
              style={{
                '--adm-form-background-color': 'transparent',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Basic Information */}
              <Card 
                title={
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    📝 Basic Information
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: '100%',
                  border: '1px solid #e8e8e8',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                bodyStyle={{
                  padding: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Space direction="vertical" block style={{ width: '100%', gap: '16px', boxSizing: 'border-box' }}>
                  <Form.Item 
                    name="title" 
                    label="Property Title" 
                    rules={[{ required: true, message: "Please enter property title" }]}
                    style={{ width: '100%', marginBottom: 0 }}
                  >
                    <Input 
                      placeholder="Beautiful 2 BHK Apartment" 
                      style={{ 
                        borderRadius: '8px', 
                        width: '100%',
                        height: '44px',
                        maxWidth: '100%'
                      }}
                    />
                  </Form.Item>

                  <Form.Item 
                    name="description" 
                    label="Description" 
                    rules={[{ required: true, message: "Please enter description" }]}
                    style={{ width: '100%', marginBottom: 0 }}
                  >
                    <Input 
                      placeholder="Describe your property feature" 
                      style={{ 
                        borderRadius: '8px', 
                        width: '100%',
                        height: '44px',
                        maxWidth: '100%'
                      }}
                    />
                  </Form.Item>

                  <Form.Item label="Property Type" required style={{ width: '100%', marginBottom: 0 }}>
                    <Selector 
                      options={PROPERTY_TYPES} 
                      value={selectedPropertyType} 
                      onChange={setSelectedPropertyType}
                      style={{ 
                        '--border-radius': '8px',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                      columns={2}
                    />
                  </Form.Item>

                  <Form.Item label="Listing Type" required style={{ width: '100%', marginBottom: 0 }}>
                    <Selector 
                      options={LISTING_TYPES} 
                      value={selectedListingType} 
                      onChange={setSelectedListingType}
                      style={{ 
                        '--border-radius': '8px',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                      columns={3}
                    />
                  </Form.Item>

                  <Form.Item label="Bedrooms" required style={{ width: '100%', marginBottom: 0 }}>
                    <Selector 
                      options={BEDROOM_TYPES} 
                      value={selectedBedrooms} 
                      onChange={setSelectedBedrooms}
                      style={{ 
                        '--border-radius': '8px',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                      columns={3}
                    />
                  </Form.Item>

          <Form.Item label="Furnishing" required style={{ width: '100%', marginBottom: 0 }}>
  <Selector 
    options={FURNISHING_TYPES.map(option => ({
      ...option,
      label: (
        <div style={{
          fontSize: '15px',
          lineHeight: '1.2',
          padding: '4px 2px',
          textAlign: 'center',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {option.label}
        </div>
      )
    }))} 
    value={selectedFurnishing} 
    onChange={setSelectedFurnishing}
    style={{ 
      '--border-radius': '8px',
      width: '100%',
      maxWidth: '100%',
    }}
    column={3}
  />
</Form.Item>

                  <Form.Item label="Construction Status" style={{ width: '100%', marginBottom: 0 }}>
                    <Selector 
                      options={CONSTRUCTION_STATUS} 
                      value={selectedConstructionStatus} 
                      onChange={setSelectedConstructionStatus}
                      style={{ 
                        '--border-radius': '8px',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                      columns={2}
                    />
                  </Form.Item>
                </Space>
              </Card>

              {/* Pricing & Area */}
              <Card 
                title={
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    💰 Pricing & Area
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: '100%',
                  border: '1px solid #e8e8e8',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                bodyStyle={{
                  padding: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Space direction="vertical" block style={{ width: '100%', gap: '16px', boxSizing: 'border-box' }}>
                  <Grid columns={2} gap={12} style={{ width: '100%', maxWidth: '100%' }}>
                    <Form.Item 
                      name="price" 
                      label="Price (₹)" 
                      rules={[{ required: true, message: "Please enter price" }]}
                      style={{ width: '100%', marginBottom: 0 }}
                    >
                      <Input 
                        type="number" 
                        placeholder="Enter price" 
                        style={{ 
                          borderRadius: '8px', 
                          width: '100%',
                          height: '44px',
                          maxWidth: '100%'
                        }}
                      />
                    </Form.Item>
                    <Form.Item 
                      name="carpetArea" 
                      label="Area (sq.ft)" 
                      rules={[{ required: true, message: "Please enter area" }]}
                      style={{ width: '100%', marginBottom: 0 }}
                    >
                      <Input 
                        type="number" 
                        placeholder="Enter area" 
                        style={{ 
                          borderRadius: '8px', 
                          width: '100%',
                          height: '44px',
                          maxWidth: '100%'
                        }}
                      />
                    </Form.Item>
                  </Grid>
                  <Form.Item style={{ width: '100%', marginBottom: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      width: '100%',
                      maxWidth: '100%',
                      background: '#fafafa',
                      borderRadius: '8px',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{ fontSize: '15px', color: '#333', fontWeight: '500' }}>
                        Negotiable Price
                      </span>
                      <Switch 
                        checked={negotiable} 
                        onChange={setNegotiable}
                        style={{ 
                          '--checked-color': '#1890ff',
                          '--width': '44px',
                          '--height': '24px'
                        }}
                      />
                    </div>
                  </Form.Item>
                </Space>
              </Card>

              {/* Location */}
              <Card 
                title={
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    📍 Location
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: '100%',
                  border: '1px solid #e8e8e8',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                bodyStyle={{
                  padding: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Space direction="vertical" block style={{ width: '100%', gap: '16px', boxSizing: 'border-box' }}>
                  <Form.Item 
                    name="addressLine1" 
                    label="Address" 
                    rules={[{ required: true, message: "Please enter address" }]}
                    style={{ width: '100%', marginBottom: 0 }}
                  >
                    <Input 
                      placeholder="Full street address" 
                      style={{ 
                        borderRadius: '8px', 
                        width: '100%',
                        height: '44px',
                        maxWidth: '100%'
                      }}
                    />
                  </Form.Item>
                  
                  <Grid columns={2} gap={12} style={{ width: '100%', maxWidth: '100%' }}>
                    <Form.Item 
                      name="locality" 
                      label="Locality" 
                      rules={[{ required: true, message: "Please enter locality" }]}
                      style={{ width: '100%', marginBottom: 0 }}
                    >
                      <Input 
                        placeholder="Locality/Area" 
                        style={{ 
                          borderRadius: '8px', 
                          width: '100%',
                          height: '44px',
                          maxWidth: '100%'
                        }}
                      />
                    </Form.Item>
                    <Form.Item 
                      name="city" 
                      label="City" 
                      rules={[{ required: true, message: "Please enter city" }]}
                      style={{ width: '100%', marginBottom: 0 }}
                    >
                      <Input 
                        placeholder="City" 
                        style={{ 
                          borderRadius: '8px', 
                          width: '100%',
                          height: '44px',
                          maxWidth: '100%'
                        }}
                      />
                    </Form.Item>
                  </Grid>
                  
                  <Grid columns={2} gap={12} style={{ width: '100%', maxWidth: '100%' }}>
                    <Form.Item 
                      name="state" 
                      label="State" 
                      rules={[{ required: true, message: "Please enter state" }]}
                      style={{ width: '100%', marginBottom: 0 }}
                    >
                      <Input 
                        placeholder="State" 
                        style={{ 
                          borderRadius: '8px', 
                          width: '100%',
                          height: '44px',
                          maxWidth: '100%'
                        }}
                      />
                    </Form.Item>
                    <Form.Item 
                      name="pincode" 
                      label="Pincode" 
                      rules={[{ required: true, message: "Please enter pincode" }]}
                      style={{ width: '100%', marginBottom: 0 }}
                    >
                      <Input 
                        placeholder="Pincode" 
                        style={{ 
                          borderRadius: '8px', 
                          width: '100%',
                          height: '44px',
                          maxWidth: '100%'
                        }}
                      />
                    </Form.Item>
                  </Grid>
                </Space>
              </Card>

              {/* Amenities */}
              <Card 
                title={
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    🏆 Amenities
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: '100%',
                  border: '1px solid #e8e8e8',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                bodyStyle={{
                  padding: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#666', 
                    marginBottom: '16px',
                  }}>
                    Select all applicable amenities
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
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
                          borderRadius: '16px',
                          fontSize: '13px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          flexShrink: 0,
                          margin: 0,
                          border: '1px solid #d9d9d9',
                          maxWidth: 'calc(50% - 4px)',
                          boxSizing: 'border-box',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {amenity}
                      </Tag>
                    ))}
                  </div>
                  {selectedAmenities.length > 0 && (
                    <div style={{ 
                      marginTop: '16px', 
                      fontSize: '14px', 
                      color: '#1890ff',
                      fontWeight: '500',
                      textAlign: 'center',
                      padding: '8px',
                      background: '#f0f8ff',
                      borderRadius: '8px',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      ✅ Selected: {selectedAmenities.length} amenities
                    </div>
                  )}
                </div>
              </Card>

              {/* Media Upload */}
              <Card 
                title={
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    🖼️ Media
                  </div>
                }
                style={{ 
                  borderRadius: '12px',
                  marginBottom: '16px',
                  width: '100%',
                  border: '1px solid #e8e8e8',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
                bodyStyle={{
                  padding: '16px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Space direction="vertical" block style={{ width: '100%', gap: '20px', boxSizing: 'border-box' }}>
                  <div style={{ width: '100%', maxWidth: '100%' }}>
                    <div style={{ 
                      marginBottom: '12px', 
                      fontSize: '15px', 
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
                        '--border-radius': '12px',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                    />
                  </div>

                  <Divider style={{ 
                    borderColor: '#f0f0f0',
                    margin: '0',
                    width: '100%'
                  }} />

                  <div style={{ width: '100%', maxWidth: '100%' }}>
                    <div style={{ 
                      marginBottom: '12px', 
                      fontSize: '15px', 
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
                        '--border-radius': '12px',
                        width: '100%',
                        maxWidth: '100%'
                      }}
                    >
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          background: '#265482ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '12px',
                          border: '2px dashed #d9d9d9',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f0f8ff';
                          e.target.style.borderColor = '#1890ff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.borderColor = '#d9d9d9';
                        }}
                      >
                        <PlayOutline style={{ fontSize: 28, color: "#999" }} />
                      </div>
                    </ImageUploader>
                  </div>
                </Space>
              </Card>
            </Form>
          </div>
        </div>
      }
      style={{
        '--width': '90vw',
        '--max-width': '500px',
        '--min-width': '370px',
        '--border-radius': '16px',
        '--min-height': '85vh'
      }}
      bodyStyle={{
        padding: '0',
        overflow: 'hidden',
        width: '100%'
      }}
    />
  );
}