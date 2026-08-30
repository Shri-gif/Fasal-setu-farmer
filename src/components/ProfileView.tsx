import React, { useState } from 'react';
import { FarmerProfile, UserProfile } from '../types';
import { User, ShieldCheck, MapPin, Save, LogOut, Check, AlertCircle, Sparkles, Building2 } from 'lucide-react';

interface ProfileViewProps {
  userProfile: UserProfile;
  farmerProfile: FarmerProfile;
  onSaveUserProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  onSaveFarmerProfile: (profile: Partial<FarmerProfile>) => Promise<boolean>;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  farmerProfile,
  onSaveUserProfile,
  onSaveFarmerProfile,
  onLogout,
}) => {
  // Personal Info Form State
  const [fullName, setFullName] = useState(userProfile.full_name || '');
  const [mobile, setMobile] = useState(userProfile.mobile || '');
  const [village, setVillage] = useState(userProfile.village || '');
  const [district, setDistrict] = useState(userProfile.district || '');
  const [state, setState] = useState(userProfile.state || 'Uttar Pradesh');

  // Farm Info Form State
  const [farmName, setFarmName] = useState(farmerProfile.farm_name || '');
  const [farmLocation, setFarmLocation] = useState(farmerProfile.farm_location || '');
  const [farmSize, setFarmSize] = useState(farmerProfile.farm_size || '5 Acres');
  const [farmingType, setFarmingType] = useState(farmerProfile.farming_type || 'organic');
  const [farmDistrict, setFarmDistrict] = useState(farmerProfile.district || district || '');
  const [farmState, setFarmState] = useState(farmerProfile.state || state || 'Uttar Pradesh');

  // Feedback states
  const [personalMsg, setPersonalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [farmMsg, setFarmMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingFarm, setIsSavingFarm] = useState(false);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    setPersonalMsg(null);

    try {
      const ok = await onSaveUserProfile({
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        village: village.trim(),
        district: district.trim(),
        state: state.trim(),
      });
      if (ok) {
        setPersonalMsg({ type: 'success', text: 'Personal details saved successfully! ✓' });
      }
    } catch (err: any) {
      setPersonalMsg({ type: 'error', text: err?.message || 'Failed to save personal profile.' });
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFarm(true);
    setFarmMsg(null);

    try {
      const ok = await onSaveFarmerProfile({
        farm_name: farmName.trim(),
        farm_location: farmLocation.trim(),
        farm_size: farmSize.trim(),
        farming_type: farmingType,
        district: farmDistrict.trim(),
        state: farmState.trim(),
      });
      if (ok) {
        setFarmMsg({ type: 'success', text: 'Farm business details saved successfully! ✓' });
      }
    } catch (err: any) {
      setFarmMsg({ type: 'error', text: err?.message || 'Failed to save farm details.' });
    } finally {
      setIsSavingFarm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Profile Header Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center shadow-xs">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-50 flex items-center justify-center text-4xl shadow-xs mb-3">
          👨‍🌾
        </div>
        <h1 className="text-xl font-black text-slate-900">
          {fullName || 'Farmers Profile'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{userProfile.email || 'farmer@khet2ghar.in'}</p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Producer • सत्यापित किसान</span>
        </div>
      </div>

      {/* Personal Details Form */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Personal Information (व्यक्तिगत जानकारी)
          </h2>
          <p className="text-xs text-slate-500">Manage your contact and residential address</p>
        </div>

        {personalMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              personalMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {personalMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{personalMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePersonal} className="space-y-3.5" id="profileForm">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Full Name (पूरा नाम) *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vimal Shukla"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Mobile Number (मोबाइल नंबर) *
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Village / Town (गाँव / कस्बा)
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Palia Kalan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                District (ज़िला)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Lakhimpur Kheri"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                State (राज्य)
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPersonal}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            {isSavingPersonal ? 'Saving Profile...' : 'Save Personal Details'}
          </button>
        </form>
      </section>

      {/* Farm Details Form */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Farm Information (खेत का विवरण) 🌾
          </h2>
          <p className="text-xs text-slate-500">Showcase your farm size and agricultural methods</p>
        </div>

        {farmMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              farmMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {farmMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{farmMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveFarm} className="space-y-3.5" id="farmForm">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Farm / Producer Brand Name (फार्म का नाम) *
            </label>
            <input
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Shukla Organic Krishi Farm"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Farm Size (खेत का आकार / रकबा)
              </label>
              <input
                type="text"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                placeholder="e.g. 7.5 Acres / Bigha"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Farming Type (खेती का प्रकार)
              </label>
              <select
                value={farmingType}
                onChange={(e) => setFarmingType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="organic">Organic Farming (जैविक खेती)</option>
                <option value="natural">Natural Farming (प्राकृतिक खेती)</option>
                <option value="conventional">Conventional Farming (पारंपरिक खेती)</option>
                <option value="mixed">Mixed Crop Farming (मिश्रित खेती)</option>
                <option value="hydroponic">Hydroponic / Greenhouse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Farm Location (खेत का पता / ग्राम)
            </label>
            <input
              type="text"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              placeholder="e.g. Near River Basin, Palia Kalan"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingFarm}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            {isSavingFarm ? 'Saving Farm Info...' : 'Save Farm Details'}
          </button>
        </form>
      </section>

      {/* Account Settings & Logout */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Account Operations
        </h2>
        <button
          onClick={onLogout}
          id="logoutBtn"
          className="w-full p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-between transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg">
              🚪
            </div>
            <div className="text-left">
              <strong className="text-sm font-bold block">Sign Out (लॉग आउट)</strong>
              <span className="text-xs text-rose-600/80">Exit current farmer session</span>
            </div>
          </div>
          <span className="text-base font-bold group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </section>
    </div>
  );
};
