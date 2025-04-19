'use client';
import { useState, useEffect } from 'react';
import Navbar from "../components/navbar/page";
import { useAuth } from "../../app/context/AuthContext";
import { request } from 'graphql-request';
import { gql } from "graphql-request";
import { getCSRFToken } from '../../hooks'; // Import the getCSRFToken function from hooks.js
import { useRouter } from 'next/navigation';
import "../styles/orders.css"

interface ProfileResponse {
  profile: {
      user: string;
      address: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      image?: string; // optional if image might be null
      email: string;
  };
}
export interface OrderResponse {
  orders: {
      id: number;
      user: string;
      createdAt: string;
      orderItems: {
          id: number;
          quantity: number;
          product: {
              id: number;
              name: string;
              price: number;
              image1: string;
          };
      }[];
  }[];
}

export interface DeleteProfileResponse {
  deleteProfile: {
      success: boolean;
      message: string;
  };
}


const ORDERS_QUERY = gql`
  query Orders($userId: Int!) {
    orders(userId: $userId) {
      id
      user
      createdAt
      orderItems {
        id
        product {
          id
          name
          price
          image1
        }
        quantity
      }
    }
  }
`;

const PROFILE_QUERY = gql`
  query GetProfile($userId: Int!) {
    profile(userId: $userId) {
      user
      address
      firstName
      lastName
      phoneNumber
      image
      email
    }
  }
`;

const EDIT_PROFILE_MUTATION = gql`
  mutation EditProfile(
    $userId: Int!, 
    $username: String!, 
    $address: String!, 
    $firstName: String!, 
    $lastName: String!, 
    $phoneNumber: String!, 
    $image: String
  ) {
    editProfile(
      userId: $userId, 
      username: $username, 
      address: $address, 
      firstName: $firstName, 
      lastName: $lastName, 
      phoneNumber: $phoneNumber, 
      image: $image
    ) {
      user
    }
  }
`;

const DELETE_PROFILE_MUTATION = gql`
  mutation DeleteProfile($userId: Int!) {
    deleteProfile(userId: $userId) {
      success
      message
    }
  }
`;

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [ordersData, setOrdersData] = useState<OrderResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    username: '',
    address: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Delete account states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const GRAPHQL_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql/";

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user || !user.id) {
        setProfileLoading(false);
        return;
      }
      
      const userId = parseInt(user.id);
      if (isNaN(userId)) {
        setProfileError("Invalid user ID");
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError(null);

      try {
        const endpoint = GRAPHQL_URL;
        const headers = { 'X-CSRFToken': getCSRFToken() };

        const result: ProfileResponse = await request(
          endpoint,
          PROFILE_QUERY,
          { userId },
          headers
        );

        if (result.profile) {
          setProfile({
            firstName: result.profile.firstName || '',
            lastName: result.profile.lastName || '',
            email: result.profile.email || '',
            phone: result.profile.phoneNumber || '',
            username: result.profile.user || '',
            address: result.profile.address || '',
          });

          if (result.profile.image) {
            const imageUrl = result.profile.image.startsWith('/')
            ? `http://127.0.0.1:8000/${result.profile.image.substring(1)}` 
            : `http://127.0.0.1:8000/${result.profile.image}`;

            setProfileImage(imageUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfileError("Error fetching profile");
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  // Fetch orders data
  useEffect(() => {
    async function fetchOrders() {
      if (!user || !user.id) {
        setOrdersLoading(false);
        return;
      }
      
      const userId = parseInt(user.id);
      
      if (isNaN(userId)) {
        setOrdersError("Invalid user ID");
        setOrdersLoading(false);
        return;
      }

      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const endpoint = GRAPHQL_URL;
        const headers = { 'X-CSRFToken': getCSRFToken() };
        
        const result = await request<OrderResponse>(
          endpoint, 
          ORDERS_QUERY, 
          { userId }, 
          headers
        );
        
        setOrdersData(result);
      } catch {
        console.error("Error fetching orders:");
        setOrdersError("Error fetching orders:");
      } finally {
        setOrdersLoading(false);
      }
    }

    // Only fetch orders when on orders tab
    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [user, activeSection]);

  const formatOrderDate = (dateString: string | number | Date): string => {
    if (!dateString) return 'Date not available';
  
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      // fallback: stringify the original input
      return String(dateString);
    } catch (error) {
      console.error("Error parsing date:", error);
      return String(dateString);
    }
  };
  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
  
    if (name === "phone") {
      // For phone field, only allow numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      setProfile((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      // For all other fields
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Create a descriptive filename using username or user ID
        const fileExt = file.name.split('.').pop();
        if (!user) {
          console.error("User not available");
          return;
        }
        const filename = `profile_${profile.username || user.id}.${fileExt}`;
        
        const reader = new FileReader();
        reader.onloadend = () => {
          // Store the base64 data which will be sent to the backend
          const result = reader.result;
          if (typeof result === 'string') {
            setProfileImage(result);
          } else {
            console.error("Failed to convert file to base64 string.");
          }
          
          // Optionally store the filename for reference
          setProfile(prev => ({
            ...prev,
            imageName: filename
          }));
        };
        reader.readAsDataURL(file);
      }
    };

  const handleSaveProfile = async () => {
    if (!user || !user.id) {
      setUpdateError("User not authenticated");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const userId = parseInt(user.id);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID");
      }

      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };

      // Prepare variables for the mutation
      const variables = {
        userId,
        username: profile.username,
        address: profile.address,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phone,
        image: profileImage // This should be a URL or base64 string
      };

      console.log("Sending image data:", profileImage ? "Image data present" : "No image data");

      const result = await request(
        endpoint,
        EDIT_PROFILE_MUTATION,
        variables,
        headers
      );

      console.log("Profile updated successfully:", result);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user || !user.id) {
      setDeleteError("User not authenticated");
      return;
    }

    if (confirmDeleteText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const userId = parseInt(user.id);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID");
      }

      const endpoint = GRAPHQL_URL;
      const headers = { 'X-CSRFToken': getCSRFToken() };

      const result = await request<DeleteProfileResponse>(
        endpoint,
        DELETE_PROFILE_MUTATION,
        { userId },
        headers
      );

      console.log("Profile deleted:", result);

      if (result.deleteProfile.success) {
        // Logout the user after successful deletion
        logout();
        alert("Your account has been deleted successfully.");
        window.location.href = "/";
      } else {
        throw new Error("Failed to delete account");
      }
    } catch {
      console.error("Error deleting profile:");
      setDeleteError("Error deleting profile:");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
  return (
      <>
        <Navbar />
        <div className="flex flex-col items-center p-4 bg-[#ebdfff] min-h-screen">
          <div className="p-8 text-center text-[#5D5A8D] bg-[#F4EEFF] rounded-lg text-base">
            <p>Please log in to view your Profile.</p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full max-w-[200px] bg-[#424874] text-white py-3 px-4 rounded-lg border-none 
              cursor-pointer mt-3 text-sm font-semibold tracking-wider transition-all duration-300 
              shadow-md hover:bg-[#383d65] mx-auto"
            >
              GO TO LOGIN
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-[#ece2fd] min-h-screen">
      <Navbar />
      <div className="p-6 pt-24">
        {/* Main Container */}
        <div className="max-w-6xl mx-auto bg-[#DCD6F7] rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-[#424874] border-b border-[#A6B1E1]/20">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          </div>

          {/* Content Area */}
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 bg-[#DCD6F7]">
              <nav className="py-6">
                {activeSection !== 'orders' && activeSection !== 'delete' && (
                  <div className="px-8 mb-4">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleSaveProfile();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      disabled={updateLoading || profileLoading}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                        isEditing 
                          ? "bg-[#A6B1E1] text-white" 
                          : "bg-[#A6B1E1]/20 text-[#424874] hover:bg-[#A6B1E1]/30"
                      } ${(updateLoading || profileLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {updateLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                  </div>
                )}
                <ul>
                  <li>
                    <button
                      onClick={() => setActiveSection('profile')}
                      className={`w-full text-left px-8 py-3 flex items-center space-x-3 transition-colors ${
                        activeSection === 'profile'
                          ? 'bg-[#A6B1E1]/20 text-[#424874] border-l-4 border-[#424874]'
                          : 'text-[#424874] hover:bg-[#A6B1E1]/10'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('orders')}
                      className={`w-full text-left px-8 py-3 flex items-center space-x-3 transition-colors ${
                        activeSection === 'orders'
                          ? 'bg-[#A6B1E1]/20 text-[#424874] border-l-4 border-[#424874]'
                          : 'text-[#424874] hover:bg-[#A6B1E1]/10'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Orders</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveSection('delete')}
                      className={`w-full text-left px-8 py-3 flex items-center space-x-3 transition-colors ${
                        activeSection === 'delete'
                          ? 'bg-red-900/20 text-red-400 border-l-4 border-red-500'
                          : 'text-red-400 hover:bg-red-900/10'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Delete Account</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main Content */}
             <div className="w-full md:w-3/4 bg-[#d4cdf1] p-8">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  {profileLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#424874]"></div>
                    </div>
                  ) : profileError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                      <strong className="font-bold">Error! </strong>
                      <span className="block sm:inline">{"Failed to load profile"}</span>
                    </div>
                  ) : (
                    <>
                      {updateError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                          <strong className="font-bold">Error! </strong>
                          <span className="block sm:inline">{"Failed to update profile"}</span>
                        </div>
                      )}
                      
                      {updateSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                          <strong className="font-bold">Success! </strong>
                          <span className="block sm:inline">Your profile has been updated.</span>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A6B1E1] to-[#424874] flex items-center justify-center overflow-hidden">
                            {profileImage ? (
                              <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  console.error("Error loading profile image:", profileImage);
                                  img.onerror = null; 
                                  img.style.display = 'none';

                                  // Show initials instead
                                  const container = img.parentNode as HTMLElement; 
                                  const initials = document.createElement('span');
                                  initials.className = "text-3xl font-bold text-white";
                                  initials.textContent = profile.firstName && profile.lastName ? 
                                    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` : "";
                                  container.appendChild(initials);
                                }}
                              />
                            ) : (
                              <span className="text-3xl font-bold text-white">
                                {profile.firstName && profile.lastName ? 
                                  `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` : 
                                  ""}
                              </span>
                            )}
                          </div>
                          {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <label htmlFor="profile-upload" className="cursor-pointer text-xs text-white text-center p-2">
                                Change Photo
                                <input
                                  id="profile-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[#424874]">{profile.firstName} {profile.lastName}</h2>
                          <p className="text-[#424874]">@{profile.username}</p>
                        </div>
                      </div>

                      {/* Personal Information Card */}
                      <div className="bg-[#DCD6F7] rounded-xl overflow-hidden shadow-lg">
                        <div className="px-6 py-4 bg-[#424874] border-b border-white">
                          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-[#424874] mb-1">First Name</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="firstName"
                                  value={profile.firstName}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 rounded-lg bg-[#424874] border border-[#A6B1E1]/30 text-white  focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] focus:border-transparent"
                                />
                              ) : (
                                <p className="text-[#424874]">{profile.firstName}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#424874] mb-1">Last Name</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="lastName"
                                  value={profile.lastName}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 rounded-lg bg-[#424874] border border-[#A6B1E1]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] focus:border-transparent"
                                />
                              ) : (
                                <p className="text-[#424874]">{profile.lastName}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#424874] mb-1">Email Address</label>
                              {isEditing ? (
                                <input
                                  type="email"
                                  name="email"
                                  value={profile.email}
                                  className="w-full px-4 py-2.5 rounded-lg bg-[#424874] border border-[#A6B1E1]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] focus:border-transparent"
                                  disabled={true} // Email is typically not editable
                                />
                              ) : (
                                <p className="text-[#424874]">{profile.email}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#424874] mb-1">Phone</label>
                              {isEditing ? (
                                <input
                                  type="tel"
                                  name="phone"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={profile.phone}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 rounded-lg bg-[#424874] border border-[#A6B1E1]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] focus:border-transparent"
                                />
                              ) : (
                                <p className="text-[#424874]">{profile.phone}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#424874] mb-1">Username</label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  name="username"
                                  value={profile.username}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 rounded-lg bg-[#424874] border border-[#A6B1E1]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] focus:border-transparent"
                                />
                              ) : (
                                <p className="text-[#424874]">{profile.username}</p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-[#424874] mb-1">Address</label>
                              {isEditing ? (
                                <textarea
                                  name="address"
                                  value={profile.address}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 rounded-lg bg-[#424874] border border-[#A6B1E1]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#A6B1E1] focus:border-transparent"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-[#424874]">{profile.address}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Orders Section */}
              {activeSection === 'orders' && (
                <div className="bg-[#DCD6F7] rounded-xl overflow-hidden shadow-lg max-w-4xl w-full mx-auto orders-container">
                  <div className="px-6 py-4 bg-[#424874] border-b border-[#A6B1E1]/20">
                    <h3 className="text-xl font-semibold text-white">Orders</h3>
                  </div>
                  <div className="p-4 flex items-center justify-center min-h-[400px]">
                    {ordersLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[#424874]"></div>
                      </div>
                    ) : ordersError ? (
                      <p className="text-red-500 text-center">Error fetching orders.</p>
                    ) : ordersData && ordersData.orders && ordersData.orders.length > 0 ? (
                      <div className="space-y-4 w-full">
                        {ordersData.orders.map((order) => (
                          <div key={order.id} className="order-card">
                            <div className="order-header">
                              <h4 className="order-id">Order #{order.id}</h4>
                              <span className="order-date">
                                {formatOrderDate(order.createdAt)}
                              </span>
                            </div>
                            <div className="order-items">
                              {order.orderItems.map((item) => (
                                <div key={item.id} className="order-item">
                                  <img 
                                    src={item.product.image1 || "/images/placeholder.jpg"} 
                                    alt={item.product.name} 
                                    className="product-image" 
                                  />
                                  <div className="product-details">
                                    <p className="product-name">{item.product.name}</p>
                                    <div className="product-meta">
                                      <div>Quantity: <span className="font-medium">{item.quantity}</span></div>
                                      <div>Price: <span className="font-medium">₹{item.product.price}</span></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="order-total">
                              <span>Total:</span>
                              <span>₹{order.orderItems.reduce((sum, item) => 
                                sum + (item.product.price * item.quantity), 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-orders">
                        <svg xmlns="http://www.w3.org/2000/svg" className="empty-orders-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="empty-message">No orders found</p>
                        <p className="empty-submessage">Your order history will appear here once you make a purchase</p>
                        <button className="mt-4 px-6 py-2 bg-[#424874] text-white rounded-lg hover:bg-[#383d65] transition-colors" 
                          onClick={() => router.push('/products')}>
                          Browse Products
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delete Account Section */}
              {activeSection === 'delete' && (
                <div className="bg-[#DCD6F7] rounded-xl overflow-hidden shadow-lg">
                  <div className="px-6 py-4 bg-[#424874] border-b border-red-900/20">
                    <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                  </div>
                  <div className="p-8">
                    <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="text-red-400 font-medium">Warning: This action cannot be undone</h4>
                          <p className="text-[#424874] mt-1">
                            All of your data will be permanently removed from our servers. This includes your profile information, order history, and saved addresses.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {deleteError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{"Failed to delete account"}</span>
                      </div>
                    )}
                    
                    {showDeleteConfirmation ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h4 className="text-red-600 font-medium mb-3">Confirm Account Deletion</h4>
                        <p className="text-[#424874] mb-4">
                          To confirm deletion, please type &quot;DELETE&quot; in the field below:
                        </p>
                        <input
                          type="text"
                          value={confirmDeleteText}
                          onChange={(e) => setConfirmDeleteText(e.target.value)}
                          placeholder="Type DELETE to confirm"
                           className="w-full px-4 py-2.5 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-4"
                        />
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setShowDeleteConfirmation(false);
                              setConfirmDeleteText('');
                            }}
                            className="px-4 py-2 text-[#424874] bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmation(true)}
                          className="px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete My Account
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;