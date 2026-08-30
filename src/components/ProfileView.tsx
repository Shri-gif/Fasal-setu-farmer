import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Sprout, 
  Building2, 
  CheckCircle2, 
  Edit3, 
  Save, 
  FileText,
  BadgeCheck
} from 'lucide-react';
import { FarmerProfile, Language } from '../types';

interface ProfileViewProps {
  farmer: FarmerProfile;
  onUpdateProfile: (updated: FarmerProfile) => void;
  language: Language;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  farmer,
  onUpdateProfile,
  language,
}) => {
  const isHi = language === 'hi';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FarmerProfile>(farmer);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
            {farmer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 font-serif">{farmer.name}</h1>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                {isHi ? 'प्रमाणित किसान' : 'Verified Farmer'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Kisan ID: {farmer.kisan_id} • {farmer.village}, {farmer.district}
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-stone-600" />
            <span>{isHi ? 'प्रोफ़ाइल बदलें' : 'Edit Profile'}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-medium">{isHi ? 'किसान प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Farmer profile updated successfully!'}</span>
        </div>
      )}

      {/* Main Profile Form / Details */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          
          {/* Section 1: Personal & Farm Info */}
          <div>
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'व्यक्तिगत व कृषि भूमि विवरण' : 'Personal & Land Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'किसान का पूरा नाम' : 'Full Name'}</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 disabled:opacity-80 disabled:bg-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'मोबाइल नंबर' : 'Phone Number'}</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 disabled:opacity-80 disabled:bg-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'गाँव / कस्बा' : 'Village'}</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 disabled:opacity-80 disabled:bg-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'जिला और राज्य' : 'District & State'}</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={`${formData.district}, ${formData.state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setFormData({ ...formData, district: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 disabled:opacity-80 disabled:bg-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'कुल कृषि भूमि (एकड़ में)' : 'Total Land (Acres)'}</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.total_land_acres}
                  onChange={(e) => setFormData({ ...formData, total_land_acres: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 disabled:opacity-80 disabled:bg-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-bold">{isHi ? 'पिन कोड' : 'Pincode'}</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 disabled:opacity-80 disabled:bg-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* KYC Status & Badges */}
          <div className="pt-4 border-t border-stone-200">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{isHi ? 'KYC और सुरक्षा सत्यापन' : 'KYC & Verification Badges'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-stone-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-xs">{isHi ? 'आधार KYC सत्यापित' : 'Aadhaar Verified'}</div>
                  <div className="text-[10px] text-stone-500">UIDAI Registered</div>
                </div>
              </div>

              <div className="bg-stone-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-xs">{isHi ? 'भूमि खसरा लिंक' : 'Land Record Linked'}</div>
                  <div className="text-[10px] text-stone-500">UP Bhulekh Sync</div>
                </div>
              </div>

              <div className="bg-stone-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-stone-900 text-xs">{isHi ? 'बैंक खाता सत्यापित' : 'Bank Account Verified'}</div>
                  <div className="text-[10px] text-stone-500">NPCI Penny Drop OK</div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold cursor-pointer"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isHi ? 'बदलाव सेव करें' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

    </div>
  );
};
