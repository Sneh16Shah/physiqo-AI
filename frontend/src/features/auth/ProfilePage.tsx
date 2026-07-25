import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../stores/authStore';
import { profileApi } from '../../api/profile.api';
import { toast } from '../../stores/toastStore';

const ProfilePage: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      unitSystem: user?.preferences?.unitSystem || 'metric',
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await profileApi.getProfile();
        reset({
          name: data.name,
          unitSystem: data.preferences?.unitSystem || 'metric'
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { data: updatedProfile } = await profileApi.updateProfile({
        name: data.name,
        preferences: { unitSystem: data.unitSystem }
      });
      // update user in store
      if (user) {
        setAuth(useAuthStore.getState().token!, { ...user, ...updatedProfile });
      }
      toast.success('Your profile settings have been updated.', 'Profile Saved');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update profile. Please try again.', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
      
      <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 bg-surface-950 border border-surface-800 rounded-lg text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Unit Preference</label>
            <select
              {...register('unitSystem')}
              className="w-full px-4 py-2 bg-surface-950 border border-surface-800 rounded-lg text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, in)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
