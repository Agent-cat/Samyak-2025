import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const UserDetails = () => {
    const { email } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [hasEntered, setHasEntered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/verify-user?email=${email}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUser(response.data);
                setHasEntered(response.data.hasEntered);
                if (response.data.hasEntered) {
                    setShowPopup(true);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch user details");
            }
        };

        fetchUserDetails();
    }, [email]);

    const toggleHasEntered = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/update-has-entered`, { email: user.email });
            setHasEntered(response.data.hasEntered);
            setShowPopup(response.data.hasEntered);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update entry status");
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50  p-4 rounded-lg border border-red-200">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32  bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl  mx-auto bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4  border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-900">{user.fullName}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">College</p>
                            <p className="font-medium text-gray-900">{user.college}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">College ID</p>
                            <p className="font-medium text-gray-900">{user.collegeId}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">State</p>
                            <p className="font-medium text-gray-900">{user.state}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">{user.address}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <p className="font-medium text-gray-900">{user.paymentStatus}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="font-medium text-gray-900">{user.role}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Has Entered</p>
                            <p className="font-medium text-gray-900">{hasEntered ? "Yes" : "No"}</p>
                            <button
                                onClick={toggleHasEntered}
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                {hasEntered ? "Mark as Not Entered" : "Mark as Entered"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4">User Already Entered</h3>
                        <p className="mb-4">This user has already been marked as entered.</p>
                        <button
                            onClick={closePopup}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
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