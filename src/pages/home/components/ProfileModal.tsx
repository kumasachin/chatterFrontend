import { User2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useAuthStore } from "../../../store/auth.store";
import type { User, UpdateUserInfoData } from "../../../types/auth";

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
  });

  const { updateUserInfo, isUpdatingProfile } = useAuthStore();

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    });
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updateData: UpdateUserInfoData = {};

      // Only include fields that have values
      if (formData.fullName.trim())
        updateData.fullName = formData.fullName.trim();
      if (formData.email.trim()) updateData.email = formData.email.trim();
      if (formData.gender)
        updateData.gender = formData.gender as "male" | "female" | "other";
      if (formData.dateOfBirth) updateData.dateOfBirth = formData.dateOfBirth;

      await updateUserInfo(updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Profile"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <User2 className="w-8 h-8 text-[#FB406C]" />
          </div>
          <p className="text-gray-600">Update your profile information</p>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB406C] focus:border-[#FB406C] transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB406C] focus:border-[#FB406C] transition-colors"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB406C] focus:border-[#FB406C] transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FB406C] focus:border-[#FB406C] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
            disabled={isUpdatingProfile}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="flex-1"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
