'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { AxiosError } from 'axios';

// Define interface for server error response
interface ServerValidationError {
    path: string;
    msg: string;
}

interface ErrorResponse {
    success: boolean;
    message?: string;
    errors?: ServerValidationError[];
}

// Validation schema for profile information form
const profileSchema = yup.object({
    name: yup.string().required('Name is required'),
});

// Updated validation schema for password change form with strict rules
const passwordSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/^(?=.*\d)/, 'Password must include at least one number')
        .matches(/^(?=.*[a-z])/, 'Password must include at least one lowercase letter')
        .matches(/^(?=.*[A-Z])/, 'Password must include at least one uppercase letter')
        .matches(/^(?=.*[!@#$%^&*])/, 'Password must include at least one special character (!@#$%^&*)'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

// TypeScript types for our form data
type ProfileFormData = yup.InferType<typeof profileSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

interface EditProfileProps {
    initialTab?: 'profile' | 'password';
    hideProfileTab?: boolean;
}

export default function EditProfile({ initialTab = 'profile', hideProfileTab = false }: EditProfileProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>(initialTab);
    const [isUpdating, setIsUpdating] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [passwordStrength, setPasswordStrength] = useState<number>(0);
    const [mounted, setMounted] = useState(false);
    const { updateProfile: updateProfileStore, updatePassword: updatePasswordStore } = useAuthStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile,
    } = useForm<ProfileFormData>({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        watch,
    } = useForm<PasswordFormData>({
        resolver: yupResolver(passwordSchema),
    });

    // Watch password for strength meter
    const newPassword = watch('newPassword', '');

    // Calculate password strength
    useEffect(() => {
        if (!newPassword) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;

        // Length check
        if (newPassword.length >= 8) strength += 20;

        // Contains number
        if (/\d/.test(newPassword)) strength += 20;

        // Contains lowercase
        if (/[a-z]/.test(newPassword)) strength += 20;

        // Contains uppercase
        if (/[A-Z]/.test(newPassword)) strength += 20;

        // Contains special char
        if (/[!@#$%^&*]/.test(newPassword)) strength += 20;

        setPasswordStrength(strength);
    }, [newPassword]);

    // Handle profile update form submission
    const handleUpdateProfile = async (data: ProfileFormData) => {
        if (!user) return;

        try {
            setIsUpdating(true);
            setServerError(null);
            setSuccessMessage(null);
            await updateProfileStore(data.name);
            resetProfile({ name: data.name });
            setSuccessMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);

            // Type-safe error handling
            const axiosError = error as AxiosError<ErrorResponse>;

            if (axiosError.response?.data?.errors) {
                const errorMessages = axiosError.response.data.errors.map((err) =>
                    `${err.path}: ${err.msg}`
                ).join(', ');
                setServerError(errorMessages);
            } else {
                setServerError(axiosError.response?.data?.message || 'Profile update failed. Please try again.');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle password update form submission
    const handleUpdatePassword = async (data: PasswordFormData) => {
        if (!user) return;

        try {
            setIsUpdating(true);
            setServerError(null);
            setSuccessMessage(null);
            await updatePasswordStore(data.currentPassword, data.newPassword);
            resetPassword();
            setSuccessMessage('Password updated successfully! Please use your new password next time you log in.');
        } catch (error) {
            console.error('Password update error:', error);

            // Type-safe error handling
            const axiosError = error as AxiosError<ErrorResponse>;

            if (axiosError.response?.data?.errors) {
                const errorMessages = axiosError.response.data.errors.map((err) =>
                    `${err.path}: ${err.msg}`
                ).join(', ');
                setServerError(errorMessages);
            } else {
                setServerError(axiosError.response?.data?.message || 'Password update failed. Please try again.');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="rounded-xl">
            {!hideProfileTab && (
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'profile'
                            ? 'border-b-2 border-pink-500 text-pink-600 dark:text-pink-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('profile')}
                        type="button"
                    >
                        Profile Information
                    </button>
                    <button
                        className={`py-2 px-4 text-sm font-medium ${activeTab === 'password'
                            ? 'border-b-2 border-pink-500 text-pink-600 dark:text-pink-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        onClick={() => setActiveTab('password')}
                        type="button"
                    >
                        Change Password
                    </button>
                </div>
            )}

            {/* Success message */}
            {successMessage && (
                <div className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Server error message */}
            {serverError && (
                <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{serverError}</span>
                </div>
            )}

            {/* Profile Form */}
            {activeTab === 'profile' && !hideProfileTab && (
                <form onSubmit={handleProfileSubmit(handleUpdateProfile)} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`w-full px-4 py-3 text-gray-700 border ${profileErrors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white`}
                                placeholder="Enter your full name"
                                {...registerProfile('name')}
                            />
                            {profileErrors.name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{profileErrors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <div className="w-full px-4 py-3 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                                {user?.email}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Email address cannot be changed
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            )}

            {/* Password Form */}
            {(activeTab === 'password' || hideProfileTab) && (
                <form onSubmit={handlePasswordSubmit(handleUpdatePassword)} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                className={`w-full px-4 py-3 text-gray-700 border ${passwordErrors.currentPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white`}
                                placeholder="Enter your current password"
                                {...registerPassword('currentPassword')}
                            />
                            {passwordErrors.currentPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                className={`w-full px-4 py-3 text-gray-700 border ${passwordErrors.newPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white`}
                                placeholder="Enter your new password"
                                {...registerPassword('newPassword')}
                            />
                            {passwordErrors.newPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword.message}</p>
                            )}

                            {/* Password strength meter */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className={`h-full ${passwordStrength < 40 ? 'bg-red-500' :
                                                    passwordStrength < 80 ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                }`}
                                            style={{ width: `${passwordStrength}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                        {passwordStrength < 40 ? 'Weak password' :
                                            passwordStrength < 80 ? 'Moderate password' :
                                                'Strong password'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                            <p className="font-medium mb-1">Password requirements:</p>
                            <ul className="space-y-1 pl-5 list-disc">
                                <li className={newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                                    At least 8 characters
                                </li>
                                <li className={/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                    At least one number
                                </li>
                                <li className={/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                    At least one lowercase letter
                                </li>
                                <li className={/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                    At least one uppercase letter
                                </li>
                                <li className={/[!@#$%^&*]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                                    At least one special character (!@#$%^&*)
                                </li>
                            </ul>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className={`w-full px-4 py-3 text-gray-700 border ${passwordErrors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-800 dark:text-white`}
                                placeholder="Confirm your new password"
                                {...registerPassword('confirmPassword')}
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}