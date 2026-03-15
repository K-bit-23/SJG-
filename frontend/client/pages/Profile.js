import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { User, MapPin, Save, CheckCircle } from 'lucide-react';
import api from '../../src/utils/api';
import AccountLayout from '../../src/components/AccountLayout';

const Profile = () => {
    const { user } = useAuth();
    
    // Profile Data
    const [profileData, setProfileData] = useState({
        fullName: '',
        phone: '',
        email: '',
        photoURL: '',
        dateOfBirth: '',
        gender: ''
    });

    // Address Form + Saved Addresses
    const [addressForm, setAddressForm] = useState({
        id: null,
        nickname: 'Home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
    });
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [mapUrl, setMapUrl] = useState('');

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                if (!userEmail) return;
                
                const res = await api.get(`/profile/${encodeURIComponent(userEmail)}/`);
                const data = res.data;

                setProfileData({
                    fullName: data.fullName || user.fullName || user.name || '',
                    phone: data.phone || '',
                    email: data.email || userEmail || '',
                    photoURL: data.photoURL || user.imageUrl || user.photoURL || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || ''
                });

                const addresses = Array.isArray(data.savedAddresses) ? data.savedAddresses : [];
                setSavedAddresses(addresses);

                const selected = addresses.length > 0 ? addresses[0] : (data.address || {});
                setAddressForm(selected);
                setSelectedAddressId(selected?.id || null);
            } catch (error) {
                console.error("Error fetching profile:", error);
                const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
                setProfileData(prev => ({
                    ...prev,
                    fullName: user.fullName || user.name || '',
                    email: userEmail || '',
                    photoURL: user.imageUrl || user.photoURL || ''
                }));
            }
        };

        fetchProfile();
    }, [user]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const userEmail = user.emailAddresses ? user.emailAddresses[0].emailAddress : user.email;
            await api.post(`/profile/${encodeURIComponent(userEmail)}/`, {
                ...profileData,
                address: addressForm,
                savedAddresses
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddOrUpdateAddress = () => {
        setSavedAddresses(prev => {
            const existingIndex = prev.findIndex(addr => addr.id === addressForm.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = addressForm;
                return updated;
            }
            return [...prev, { ...addressForm, id: Date.now().toString() }];
        });
        setAddressForm({
            id: null,
            nickname: 'Home',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        });
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            return data.display_name || '';
        } catch (err) {
            console.warn('Reverse geocode failed:', err);
            return '';
        }
    };

    const forwardGeocode = async (query) => {
        if (!query) return null;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv1&limit=1`);
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return null;
            return { lat: data[0].lat, lon: data[0].lon };
        } catch (err) {
            console.warn('Forward geocode failed:', err);
            return null;
        }
    };

    const setMapMarker = (lat, lon, label = 'A') => {
        if (!lat || !lon) return;
        setMapUrl(`https://maps.google.com/maps?center=${lat},${lon}&q=${lat},${lon}&z=16&output=embed&markers=size:mid%7Ccolor:red%7Clabel:${label}%7C${lat},${lon}`);
    };

    const updateMapForCurrentAddress = async () => {
        const query = `${addressForm.addressLine1} ${addressForm.city} ${addressForm.state}`.trim();
        const coords = await forwardGeocode(query);
        if (coords) {
            setMapMarker(coords.lat, coords.lon, 'A');
            return;
        }

        const _q = encodeURIComponent(query);
        setMapUrl(`https://maps.google.com/maps?center=${_q}&q=${_q}&z=15&output=embed&markers=size:mid%7Ccolor:red%7C${_q}`);
    };

    useEffect(() => {
        const query = `${addressForm.addressLine1} ${addressForm.city} ${addressForm.state}`.trim();
        if (!query) return;

        const timer = setTimeout(() => {
            updateMapForCurrentAddress();
        }, 700);

        return () => clearTimeout(timer);
    }, [addressForm.addressLine1, addressForm.city, addressForm.state]);

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

                const full = await reverseGeocode(latitude, longitude);

                setAddressForm(prev => ({
                    ...prev,
                    addressLine1: full || coords,
                    city: '',
                    state: '',
                    pincode: ''
                }));

                setMapUrl(`https://maps.google.com/maps?center=${latitude},${longitude}&q=${latitude},${longitude}&z=16&output=embed&markers=size:mid%7Ccolor:red%7C${latitude},${longitude}`);
            },
            (err) => {
                alert('Unable to retrieve location. Please allow location access or try again.');
                console.error('Geolocation error:', err);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    };


    const handleEditAddress = async (address) => {
        setAddressForm(address);
        setSelectedAddressId(address.id);

        const query = `${address.addressLine1} ${address.city} ${address.state}`.trim();
        const coords = await forwardGeocode(query);
        if (coords) {
            setMapMarker(coords.lat, coords.lon, 'A');
            return;
        }

        const _q = encodeURIComponent(query);
        setMapUrl(`https://maps.google.com/maps?center=${_q}&q=${_q}&z=15&output=embed&markers=size:mid%7Ccolor:red%7C${_q}`);
    };

    const handleUseAddress = async (address) => {
        setAddressForm(address);
        setSelectedAddressId(address.id);

        const query = `${address.addressLine1} ${address.city} ${address.state}`.trim();
        const coords = await forwardGeocode(query);
        if (coords) {
            setMapMarker(coords.lat, coords.lon, 'A');
            return;
        }

        const _q = encodeURIComponent(query);
        setMapUrl(`https://maps.google.com/maps?center=${_q}&q=${_q}&z=15&output=embed&markers=size:mid%7Ccolor:red%7C${_q}`);
    };

    const handleDeleteAddress = (id) => {
        setSavedAddresses(prev => prev.filter(addr => addr.id !== id));
    };


    if (!user) return null;

    return (
        <AccountLayout>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {(() => {
                                const hour = new Date().getHours();
                                let greeting = 'Good Morning';
                                if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
                                else if (hour >= 17 && hour < 21) greeting = 'Good Evening';
                                else if (hour >= 21 || hour < 5) greeting = 'Good Night';
                                return `${greeting}, ${user.name?.split(' ')[0] || 'User'}`;
                            })()} 👋
                        </h1>
                        <p className="text-gray-500 text-sm">Manage your personal details and account settings</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <User size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                                <p className="text-xs text-gray-500">Update your personal details</p>
                            </div>
                        </div>
                        {saveSuccess && (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle size={16} /> Saved!
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left column: Personal info + save button */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-800 mb-2">Personal Information</h2>
                                <p className="text-sm text-gray-500 mb-6">Update your personal details</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={profileData.dateOfBirth}
                                            onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <div className="flex gap-4">
                                            {['Male', 'Female', 'Other'].map(g => (
                                                <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        checked={profileData.gender === g}
                                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                                        className="w-4 h-4 text-secondary cursor-pointer"
                                                    />
                                                    <span className="text-sm text-gray-600">{g}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="w-full px-8 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>

                        {/* Right column: Address + map */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Current Delivery Address</h3>
                                        <p className="text-sm text-gray-500">This is the address used at checkout.</p>
                                    </div>
                                    {selectedAddressId && (
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                                            Selected
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2">
                                        <p className="text-sm font-semibold text-gray-700">{addressForm.nickname || 'Home'}</p>
                                        <p className="text-sm text-gray-600">
                                            {addressForm.addressLine1}{addressForm.addressLine2 ? `, ${addressForm.addressLine2}` : ''}
                                            <br />
                                            {addressForm.city}{addressForm.city ? ', ' : ''}{addressForm.state} {addressForm.pincode}
                                            <br />
                                            {addressForm.country}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={() => handleUseAddress(addressForm)}
                                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition"
                                        >
                                            Use This Address
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAddressForm({
                                                id: null,
                                                nickname: 'Home',
                                                addressLine1: '',
                                                addressLine2: '',
                                                city: '',
                                                state: '',
                                                pincode: '',
                                                country: 'India'
                                            })}
                                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            Edit / Add New Address
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <MapPin size={18} className="text-green-600" /> Delivery Address
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">Save multiple delivery addresses for quick checkout.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAddressForm({
                                            id: null,
                                            nickname: 'Home',
                                            addressLine1: '',
                                            addressLine2: '',
                                            city: '',
                                            state: '',
                                            pincode: '',
                                            country: 'India'
                                        })}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-secondary text-secondary hover:bg-secondary/10 transition"
                                    >
                                        + Add new address
                                    </button>

                                    {savedAddresses.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {savedAddresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    className="relative p-4 rounded-xl border border-gray-200 bg-gray-50"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {addr.nickname}
                                                                {addr.id === addressForm.id && (
                                                                    <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                                        Editing
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {addr.addressLine1}
                                                                {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                                                <br />
                                                                {addr.city}, {addr.state} {addr.pincode}
                                                                <br />
                                                                {addr.country}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUseAddress(addr)}
                                                                className="inline-flex items-center justify-center rounded-full p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                                                title="Use this address"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    className="w-4 h-4"
                                                                >
                                                                    <path d="M20 6L9 17l-5-5" />
                                                                </svg>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditAddress(addr)}
                                                                className="inline-flex items-center justify-center rounded-full p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                                                title="Edit address"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    className="w-4 h-4"
                                                                >
                                                                    <path d="M12 20h9" />
                                                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                className="inline-flex items-center justify-center rounded-full p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                                                title="Remove address"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    className="w-4 h-4"
                                                                >
                                                                    <polyline points="3 6 5 6 21 6" />
                                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                                    <path d="M10 11v6" />
                                                                    <path d="M14 11v6" />
                                                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Address Nickname
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={useCurrentLocation}
                                                        className="text-xs font-medium text-primary hover:text-indigo-700"
                                                    >
                                                        Use current location
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={updateMapForCurrentAddress}
                                                        className="text-xs font-medium text-secondary hover:text-indigo-700"
                                                    >
                                                        Update map
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={addressForm.nickname}
                                                onChange={(e) => setAddressForm({ ...addressForm, nickname: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                                placeholder="Home, Work, Parents, etc."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                value={addressForm.addressLine1}
                                                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                                placeholder="House/Flat No., Building Name"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                value={addressForm.addressLine2}
                                                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                                placeholder="Street, Landmark"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                                placeholder="State"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                                placeholder="Pincode"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={addressForm.country}
                                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 ring-secondary/20 outline-none"
                                            >
                                                <option>India</option>
                                                <option>USA</option>
                                                <option>UK</option>
                                                <option>Canada</option>
                                            </select>
                                        </div>
                                    </div>

                                    {mapUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                            <iframe
                                                title="Selected location"
                                                src={mapUrl}
                                                className="w-full h-full"
                                                loading="lazy"
                                            />
                                            <div className="p-2 text-xs text-gray-500">
                                                <a href={mapUrl.replace('&output=embed','')} target="_blank" rel="noreferrer" className="underline">
                                                    View on map
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleAddOrUpdateAddress}
                                        className="mt-4 px-6 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {addressForm.id ? 'Update Address' : 'Add Address'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
};

export default Profile;
