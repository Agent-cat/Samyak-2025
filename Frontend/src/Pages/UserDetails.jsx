import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

const UserDetails = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [hasEntered, setHasEntered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setIsLoading(true);
                const [userResponse, eventsResponse, attendanceResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/users/verify-user?email=${email}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/events/registered`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/me`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    })
                ]);
                
                setUser(userResponse.data);
                setHasEntered(userResponse.data.hasEntered);
                setRegisteredEvents(eventsResponse.data);
                setAttendanceRecords(attendanceResponse.data);
                
                if (userResponse.data.hasEntered) {
                    setShowPopup(true);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch user details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [email]);

    const toggleHasEntered = async () => {
        try {
            setIsUpdating(true);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/update-has-entered`, { email: user.email });
            setHasEntered(response.data.hasEntered);
            setShowPopup(response.data.hasEntered);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update entry status");
        } finally {
            setIsUpdating(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-400 bg-green-900';
            case 'pending': return 'text-yellow-400 bg-yellow-900';
            case 'rejected': return 'text-red-400 bg-red-900';
            default: return 'text-gray-400 bg-gray-700';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'text-purple-400 bg-purple-900';
            case 'manager': return 'text-blue-400 bg-blue-900';
            case 'hod': return 'text-indigo-400 bg-indigo-900';
            default: return 'text-gray-400 bg-gray-700';
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-lg border border-red-700 max-w-md w-full">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-400 ml-3">Error</h3>
                    </div>
                    <p className="text-red-300">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors w-full sm:w-auto"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">User not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white  py-4 px-2 sm:py-8 sm:px-4 lg:px-8">
            <div className="max-w-7xl pt-24 mx-auto">
                {/* Header */}
                <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 mb-4 sm:mb-6">
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-700">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                                    {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{user.fullName}</h1>
                                    <p className="text-gray-400 text-sm sm:text-base truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.paymentStatus)}`}>
                                    {user.paymentStatus}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 mb-4 sm:mb-6">
                    <div className="border-b border-gray-700">
                        <nav className="flex overflow-x-auto space-x-1 sm:space-x-8 px-2 sm:px-6">
                            {[
                                { id: 'profile', label: 'Profile', icon: '👤' },
                                { id: 'events', label: 'Events', icon: '📅' },
                                { id: 'attendance', label: 'Attendance', icon: '✅' },
                                { id: 'actions', label: 'Actions', icon: '⚙️' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-white text-white'
                                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                                    }`}
                                >
                                    <span className="mr-1 sm:mr-2">{tab.icon}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-300 mb-2">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400">Full Name</p>
                                            <p className="font-medium text-white text-sm sm:text-base">{user.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="font-medium text-white text-sm sm:text-base break-all">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">College ID</p>
                                            <p className="font-medium text-white text-sm sm:text-base">{user.collegeId}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-300 mb-2">Academic Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400">College</p>
                                            <p className="font-medium text-white text-sm sm:text-base">{user.college}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">State</p>
                                            <p className="font-medium text-white text-sm sm:text-base">{user.state}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Address</p>
                                            <p className="font-medium text-white text-sm sm:text-base">{user.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 sm:col-span-2 lg:col-span-1">
                                    <h3 className="text-sm font-medium text-gray-300 mb-2">Account Status</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-400">Payment Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.paymentStatus)}`}>
                                                {user.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Account Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.isApproved ? 'text-green-400 bg-green-900' : 'text-red-400 bg-red-900'}`}>
                                                {user.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Entry Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${hasEntered ? 'text-green-400 bg-green-900' : 'text-gray-400 bg-gray-700'}`}>
                                                {hasEntered ? 'Entered' : 'Not Entered'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Events Tab */}
                        {activeTab === 'events' && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Registered Events</h3>
                                {registeredEvents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {registeredEvents.map((event, index) => (
                                            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                                <h4 className="font-medium text-white text-sm sm:text-base">{event.title}</h4>
                                                <p className="text-sm text-gray-300">{event.categoryName}</p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {event.date} • {event.venue}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <span className="text-2xl">📅</span>
                                        </div>
                                        <p className="text-gray-400">No events registered</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attendance Tab */}
                        {activeTab === 'attendance' && (
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Attendance Records</h3>
                                {attendanceRecords.length > 0 ? (
                                    <div className="space-y-4">
                                        {attendanceRecords.map((record, index) => (
                                            <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-white text-sm sm:text-base">{record.eventName}</h4>
                                                        <p className="text-sm text-gray-300">
                                                            {format(new Date(record.date), 'MMM dd, yyyy')} • {record.session}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        record.present ? 'text-green-400 bg-green-900' : 'text-red-400 bg-red-900'
                                                    }`}>
                                                        {record.present ? 'Present' : 'Absent'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <span className="text-2xl">✅</span>
                                        </div>
                                        <p className="text-gray-400">No attendance records</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions Tab */}
                        {activeTab === 'actions' && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">Entry Management</h3>
                                    <p className="text-sm text-gray-300 mb-4">
                                        Control whether this user has entered the event venue.
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <span className="text-sm text-gray-400">
                                            Current status: <strong className="text-white">{hasEntered ? 'Entered' : 'Not Entered'}</strong>
                                        </span>
                                        <button
                                            onClick={toggleHasEntered}
                                            disabled={isUpdating}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                                                hasEntered
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating ? 'Updating...' : (hasEntered ? 'Mark as Not Entered' : 'Mark as Entered')}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => window.open(`mailto:${user.email}`, '_blank')}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            📧 Send Email
                                        </button>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(user.email)}
                                            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                                        >
                                            📋 Copy Email
                                        </button>
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                                        >
                                            ← Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold ml-3 text-white">User Entry Status</h3>
                        </div>
                        <p className="mb-4 text-gray-300">
                            This user has been marked as entered. They can now access the event venue.
                        </p>
                        <button
                            onClick={closePopup}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails; 