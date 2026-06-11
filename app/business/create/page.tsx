'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { saveBusinessProfile, saveVendorCategories } from '@/lib/storeData';

const MAX_BUSINESS_IMAGES = 5;

// Simulated Async Cloud Storage Service Engine
const uploadToCloudStorage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generates a lightweight, permanent web image reference string
      const randomId = Math.floor(100 + Math.random() * 900);
      resolve(`https://picsum.photos/id/${randomId}/600/600`);
    }, 1000); // Simulates 1-second network upload latency
  });
};

export default function CreateBusinessPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    bankName: '',
    accountNumber: '',
  });
  const [businessCategories, setBusinessCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState<string>('');

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 2. this helper function to handle adding tags
  const handleAddBusinessCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && categoryInput.trim() !== '') {
      e.preventDefault(); // Prevent accidental form submission
      if (!businessCategories.includes(categoryInput.trim())) {
        setBusinessCategories([...businessCategories, categoryInput.trim()]);
      }
      setCategoryInput('');
    }
  };

  const handleRemoveBusinessCategory = (categoryToRemove: string) => {
    setBusinessCategories(businessCategories.filter(cat => cat !== categoryToRemove));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_BUSINESS_IMAGES - images.length;
    if (remaining <= 0) {
      e.currentTarget.value = '';
      return;
    }

    setUploadingImage(true);
    setImageError(null);

    try {
      const selectedFiles = files.slice(0, remaining);
      // Dispatches files to cloud asset buckets concurrently
      const uploadedUrls = await Promise.all(selectedFiles.map(uploadToCloudStorage));
      
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch {
      setImageError('Unable to upload images to cloud storage. Please check connection and try again.');
    } finally {
      setUploadingImage(false);
      e.currentTarget.value = '';
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setImageError('Upload at least one business image or logo before launching your storefront.');
      fileInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const categoryObjects = businessCategories.map((category) => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        icon: '📦',
      }));

      saveBusinessProfile({
        name: formData.name.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        images,
        categories: categoryObjects,
      });

      if (categoryObjects.length > 0) {
        saveVendorCategories(categoryObjects);
      }

      setLoading(false);
      router.push('/admin/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start sm:items-center justify-center py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 md:p-10">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-black">Create Your Business Page</h1>
          <p className="text-gray-500 mt-2">Setup your business storefront and payment receiving details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Branding Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Business Images / Logos (Up to {MAX_BUSINESS_IMAGES}, at least 1 required)
            </label>
            {imageError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {imageError}
              </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={img}
                    alt={`Business image preview ${idx + 1}`}
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                  <button 
                    type="button" 
                    aria-label={`Remove business image preview ${idx + 1}`}
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center focus:outline-none"
                  >✕</button>
                </div>
              ))}
              {images.length < MAX_BUSINESS_IMAGES && (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 hover:border-green-600 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                >
                  <span className="text-2xl text-gray-400">{uploadingImage ? '⏳' : '+'}</span>
                  <span className="text-[10px] text-gray-400 mt-1">{uploadingImage ? 'Uploading...' : 'Add Logo'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Business Name</label>
            <input required type="text" value={formData.name} onChange={(e) => updateFormField('name', e.target.value)} placeholder="Enter your business name" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black placeholder:text-gray-500" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">Business Description</label>
            <textarea required rows={3} value={formData.description} onChange={(e) => updateFormField('description', e.target.value)} placeholder="Describe what your business sells or offers..." className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black placeholder:text-gray-500 resize-none" />
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
              <input required type="tel" value={formData.phone} onChange={(e) => updateFormField('phone', e.target.value)} placeholder="e.g., +234..." className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black placeholder:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Business Email Address</label>
              <input required type="email" value={formData.email} onChange={(e) => updateFormField('email', e.target.value)} placeholder="info@company.com" className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black placeholder:text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">What types of goods will you offer?</label>
            <div className="p-3 border border-gray-300 rounded-2xl focus-within:border-green-600 bg-white">
            {/* Display added category tags */}
              <div className="flex flex-wrap gap-2 mb-2">
              {businessCategories.map((cat, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                  {cat}
                  <button type="button" onClick={() => handleRemoveBusinessCategory(cat)} className="text-green-600 hover:text-green-900 font-bold">✕</button>
                </span>
              ))}
              </div>
            {/* The Input field */}
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={handleAddBusinessCategory}
              placeholder="Type a category (e.g., 'Sneakers') and press Enter"
              className="w-full outline-none text-black placeholder:text-gray-400 bg-transparent"
            />
          </div>
          <p className="text-xs text-gray-500">Press Enter to add multiple categories.</p>
          </div>

          {/* Banking Settlement Block */}
          <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <h3 className="font-semibold text-black">Bank Account Details (For Customer Transfers)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                required type="text" 
                value={formData.bankName} 
                onChange={(e) => updateFormField('bankName', e.target.value)} placeholder="Bank Name" 
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black" />
              <input 
                required type="text" 
                value={formData.accountNumber} 
                onChange={(e) => updateFormField('accountNumber', e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="Account Number"
                className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-green-600 transition-colors text-black" />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 rounded-2xl transition-colors text-base sm:text-lg disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Storefront...' : 'Launch Storefront'}
          </button>
        </form>

      </div>
    </div>
  );
}