// src/components/MyProperties.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Grid,
  Tag,
  Button,
  Empty,
  Image,
  Space,
  Toast,
  SpinLoading,
  Modal,
  List,
  Avatar,
} from 'antd-mobile';
import {
  EnvironmentOutline,
  EditSOutline,
  DeleteOutline,
  EyeOutline,
  AddOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { getMyProperties, deleteProperty } from '../../services/properties';
import { getProfile } from '../../services/auth';
import PostProperty from './PostProperty';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [postVisible, setPostVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProperties();
    fetchUserProfile();
  }, []);

  const fetchUserProperties = async () => {
    try {
      setLoading(true);
      const res = await getMyProperties();
      if (res.success) {
        setProperties(res.data || []);
      } else {
        Toast.show('Failed to load your properties');
      }
    } catch (error) {
      Toast.show('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.log('Error fetching user profile');
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      const res = await deleteProperty(selectedProperty._id);
      if (res.success) {
        Toast.show('Property deleted successfully');
        setProperties(properties.filter(p => p._id !== selectedProperty._id));
        setDeleteModalVisible(false);
        setSelectedProperty(null);
      } else {
        Toast.show('Failed to delete property');
      }
    } catch (error) {
      Toast.show('Error deleting property');
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const confirmDelete = (property) => {
    setSelectedProperty(property);
    setDeleteModalVisible(true);
  };

  const handlePropertyAdded = () => {
    fetchUserProperties();
    setPostVisible(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <SpinLoading color="primary" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
          My Properties
        </h1>
        <p style={{ margin: 0, color: '#666' }}>
          Manage your property listings ({properties.length} listed)
        </p>
      </div>

      {/* Add Property Button */}
      <Button 
        color="primary" 
        size="large" 
        block 
        style={{ marginBottom: '20px' }}
        onClick={() => setPostVisible(true)}
      >
        <AddOutline /> Add New Property
      </Button>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <Empty 
          description="You haven't listed any properties yet" 
          imageStyle={{ width: 128, height: 128 }}
        />
      ) : (
        <Grid columns={1} gap={12}>
          {properties.map((property) => (
            <Grid.Item key={property._id}>
              <Card>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Property Image */}
                  <Image
                    src={property.images?.[0] || '/default-property.jpg'}
                    alt={property.title}
                    style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                    fallback={
                      <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: '#f0f0f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                      }}>
                        🏠
                      </div>
                    }
                  />
                  
                  {/* Property Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        {property.title}
                      </h3>
                      <Tag color={property.listingType === 'Sale' ? 'red' : 'blue'} size="small">
                        {property.listingType}
                      </Tag>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <EnvironmentOutline style={{ fontSize: '12px', color: '#666' }} />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {property.locality}, {property.city}
                      </span>
                    </div>
                    
                    <div style={{ fontWeight: 'bold', color: '#ff4d4f', marginBottom: '8px' }}>
                      {formatPrice(property.price)}
                    </div>

                    {/* Property Features */}
                    <Space wrap style={{ marginBottom: '12px' }}>
                      {property.bedrooms && <Tag fill="outline" size="small">{property.bedrooms}</Tag>}
                      {property.carpetArea && <Tag fill="outline" size="small">{property.carpetArea} sq.ft</Tag>}
                      {property.furnishing && <Tag fill="outline" size="small">{property.furnishing}</Tag>}
                    </Space>

                    {/* Action Buttons */}
                    <Space block>
                      <Button 
                        size="mini" 
                        color="primary" 
                        fill="solid"
                        onClick={() => navigate(`/property/${property._id}`)}
                      >
                        <EyeOutline /> View
                      </Button>
                      <Button 
                        size="mini" 
                        color="warning" 
                        fill="outline"
                        onClick={() => {/* Edit functionality */}}
                      >
                        <EditSOutline /> Edit
                      </Button>
                      <Button 
                        size="mini" 
                        color="danger" 
                        fill="outline"
                        onClick={() => confirmDelete(property)}
                      >
                        <DeleteOutline /> Delete
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      )}

      {/* Post Property Modal */}
      <PostProperty 
        visible={postVisible} 
        onClose={() => setPostVisible(false)}
        onSuccess={handlePropertyAdded}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Property"
        content={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Are you sure you want to delete this property?</p>
            <p style={{ fontWeight: '600', marginBottom: '20px' }}>{selectedProperty?.title}</p>
            <Space block>
              <Button color="default" onClick={() => setDeleteModalVisible(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleDeleteProperty}>
                Delete
              </Button>
            </Space>
          </div>
        }
      />
    </div>
  );
};

export default MyProperties;