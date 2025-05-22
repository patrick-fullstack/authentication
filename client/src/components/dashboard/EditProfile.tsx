'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuthStore } from '@/store/authStore';

// Validation schema for profile information form
const profileSchema = yup.object({
    name: yup.string().required('Name is required'),
});

// Validation schema for password change form
const passwordSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

// TypeScript types for our form data
type ProfileFormData = yup.InferType<typeof profileSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

export default function EditProfile() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const [isUpdating, setIsUpdating] = useState(false);

    const { updateProfile: updateProfileStore, updatePassword: updatePasswordStore } = useAuthStore();

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
    } = useForm<PasswordFormData>({
        resolver: yupResolver(passwordSchema),
    });

    // Handle profile update form submission
    const handleUpdateProfile = async (data: ProfileFormData) => {
        if (!user) return;

        try {
            setIsUpdating(true);

            await updateProfileStore(data.name);

            resetProfile({ name: data.name });
        } catch (error) {
            console.error('Profile update error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle password update form submission
    const handleUpdatePassword = async (data: PasswordFormData) => {
        if (!user) return;

        try {
            setIsUpdating(true);

            await updatePasswordStore(data.currentPassword, data.newPassword);

            resetPassword();
        } catch (error) {
            console.error('Password update error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'profile'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab('profile')}
                    type="button"
                >
                    Profile Information
                </button>
                <button
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'password'
                        ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    onClick={() => setActiveTab('password')}
                    type="button"
                >
                    Change Password
                </button>
            </div>

            {/* Profile Form */}
            {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit(handleUpdateProfile)} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            id="name"
                            label="Full Name"
                            type="text"
                            placeholder="Enter your full name"
                            error={profileErrors.name?.message}
                            {...registerProfile('name')}
                        />

                        <div className="flex items-center space-x-4">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </label>
                                <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">
                                    {user?.email}
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Email address cannot be changed
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Password Form */}
            {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit(handleUpdatePassword)} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            id="currentPassword"
                            label="Current Password"
                            type="password"
                            placeholder="Enter your current password"
                            error={passwordErrors.currentPassword?.message}
                            {...registerPassword('currentPassword')}
                        />

                        <Input
                            id="newPassword"
                            label="New Password"
                            type="password"
                            placeholder="Enter your new password"
                            error={passwordErrors.newPassword?.message}
                            {...registerPassword('newPassword')}
                        />

                        <Input
                            id="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your new password"
                            error={passwordErrors.confirmPassword?.message}
                            {...registerPassword('confirmPassword')}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Change Password'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}