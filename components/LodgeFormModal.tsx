import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Upload, Check, Home, MapPin, Camera, List, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge } from '../types';

interface LodgeFormModalProps {
  onClose: () => void;
  initialData?: Lodge | null;
}

const LodgeFormModal: React.FC<LodgeFormModalProps> = ({ onClose, initialData }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price_numeric: initialData?.price_numeric || 220000,
    area: initialData?.area || 'Permanent Site',
    address: initialData?.address || '',
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    amenities: initialData?.amenities || [] as string[],
    image_urls: initialData?.image_urls || [] as string[]
  });
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const active = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: active
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (formData.image_urls.length >= 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('lodges')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lodges')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, publicUrl]
      }));
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter(img => img !== url)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate 4% platform fee
      const basePrice = Number(formData.price_numeric) || 0;
      const fee = Math.floor(basePrice * 0.04);
      const totalPrice = basePrice + fee;

      const lodgeData = {
        title: formData.title,
        description: formData.description,
        price: `₦${totalPrice.toLocaleString()}/year`,
        price_numeric: totalPrice,
        base_price: basePrice,
        area: formData.area,
        amenities: formData.amenities,
        image_urls: formData.image_urls.length > 0 ? formData.image_urls : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop'],
        owner_id: user.id,
        is_verified: initialData ? initialData.is_verified : false,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        ...(initialData ? {} : { rating: 0, review_count: 0 })
      };

      const { error } = initialData
        ? await supabase
          .from('lodges')
          .update(lodgeData)
          .eq('id', initialData.id)
        : await supabase
          .from('lodges')
          .insert(lodgeData);

      if (error) throw error;
      onClose();
    } catch (error: any) {
      alert(error.message || 'Error creating lodge');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center" onClick={() => s < step && setStep(s)}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer ${step === s ? 'bg-[#c0ff72] text-black shadow-[0_0_15px_rgba(192,255,114,0.4)]' :
            step > s ? 'bg-gray-700 text-gray-400' : 'bg-[#212429] text-gray-600'
            }`}>
            {step > s ? <Check size={14} /> : s}
          </div>
          {s < 4 && (
            <div className={`w-8 h-0.5 mx-1 rounded-full ${step > s ? 'bg-[#c0ff72]' : 'bg-[#212429]'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Home size={20} className="text-[#c0ff72]" />
              <h3 className="text-xl font-bold">Basic Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Lodge Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Okafor Heritage Lodge"
                  className="w-full bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the lodge, its unique features..."
                  rows={3}
                  className="w-full bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Price (NGN)</label>
                  <input
                    type="number"
                    value={formData.price_numeric}
                    onChange={(e) => handleInputChange('price_numeric', Number(e.target.value))}
                    placeholder="220000"
                    className="w-full bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Rent Period</label>
                  <div className="bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 font-bold">
                    Per Year
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                    className="w-full bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                    className="w-full bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                  />
                </div>
              </div>
              {/* Fee Breakdown */}
              {formData.price_numeric > 0 && (
                <div className="col-span-2 bg-[#1a1c1e] border border-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Your Base Price</span>
                    <span className="text-white">₦{Number(formData.price_numeric).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Platform Fee (4%)</span>
                    <span className="text-[#c0ff72]">+ ₦{Math.floor(Number(formData.price_numeric) * 0.04).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">Total Listing Price</span>
                    <span className="text-white">₦{Math.floor(Number(formData.price_numeric) * 1.04).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={20} className="text-[#c0ff72]" />
              <h3 className="text-xl font-bold">Location Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Campus Proximity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Permanent Site', 'Presco', 'CAS'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleInputChange('area', c)}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${formData.area === c
                        ? 'bg-[#c0ff72] text-black border-[#c0ff72]'
                        : 'bg-[#212429] border-white/5 text-gray-400 hover:bg-white/5'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Detailed Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street number, landmark nearby..."
                  className="w-full bg-[#1a1c1e] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                />
              </div>
              <div className="h-40 bg-[#1a1c1e] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-600 border-dashed">
                <MapPin size={32} className="mb-2" />
                <span className="text-xs font-medium">Map Coordinates Set</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Camera size={20} className="text-[#c0ff72]" />
              <h3 className="text-xl font-bold">Media Upload</h3>
            </div>
            <p className="text-xs text-gray-500">Add high-quality photos to increase your visibility. Max 5 images.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className={`aspect-square bg-[#1a1c1e] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-[#c0ff72]/40 hover:bg-[#c0ff72]/5 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || formData.image_urls.length >= 5}
                  className="hidden"
                />
                {uploading ? (
                  <Loader2 className="animate-spin mb-2" size={24} />
                ) : (
                  <Upload size={24} className="mb-2" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </span>
              </label>

              {formData.image_urls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5 bg-[#1a1c1e]">
                  <img src={url} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#c0ff72] text-[8px] font-bold text-black rounded uppercase">
                      Main Cover
                    </div>
                  )}
                </div>
              ))}

              {/* Placeholders */}
              {Array.from({ length: Math.max(0, 5 - formData.image_urls.length - 1) }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#1a1c1e] border border-white/5 rounded-2xl flex items-center justify-center text-gray-600">
                  <Camera size={20} />
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <List size={20} className="text-[#c0ff72]" />
              <h3 className="text-xl font-bold">Review & Features</h3>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 px-1">Amenities</label>
              <div className="grid grid-cols-2 gap-3">
                {['Running Water', 'Steady Electricity', 'Fence/Security', 'Caretaker', 'AC Ready', 'En-suite Bath'].map(a => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.amenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                    />
                    <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${formData.amenities.includes(a)
                      ? 'bg-[#c0ff72] border-[#c0ff72] text-black'
                      : 'bg-[#212429] border-white/5 text-transparent group-hover:border-[#c0ff72]/50'
                      }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className={`text-xs transition-colors ${formData.amenities.includes(a) ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'
                      }`}>{a}</span>
                  </label>
                ))}
              </div>
              <div className="p-4 bg-[#c0ff72]/5 border border-[#c0ff72]/20 rounded-2xl">
                <p className="text-[10px] text-[#c0ff72] font-bold uppercase tracking-widest mb-1">Final Checklist</p>
                <p className="text-xs text-gray-400">By submitting, you agree to our listing verification process which takes 24-48 hours.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#16181b] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[#212429] rounded-full text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          {renderStepIndicator()}

          <div className="min-h-[350px]">
            {renderStepContent()}
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-[#212429] text-gray-400 hover:text-white hover:bg-[#2a2d33]'
                }`}
            >
              <ChevronLeft size={20} />
              Back
            </button>

            <button
              onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()}
              disabled={loading || (step === 1 && !formData.title)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#c0ff72] text-black rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] disabled:opacity-50 disabled:hover:shadow-none transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {step === totalSteps ? (initialData ? 'Update Listing' : 'Submit Listing') : 'Next Step'}
                  {step < totalSteps && <ChevronRight size={20} />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LodgeFormModal;
