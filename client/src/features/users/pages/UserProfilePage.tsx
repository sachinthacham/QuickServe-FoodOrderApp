import { useEffect, useState } from "react";
import { type User,type UserAddress, userService, type CreateUserAddressRequest } from "../services/userService";
import { useAuthStore } from "@/store/useAuthStore";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { User as UserIcon, MapPin, Plus, Loader2, Save, X, ShieldCheck, Mail, AlertCircle, Home } from "lucide-react";

function UserProfileContent() {
  const { token, user: authUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<CreateUserAddressRequest>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [profileData, addressesData] = await Promise.all([
          userService.getCurrentUser(token),
          userService.getAddresses(token).catch(() => []) // Catch if address endpoint fails or not implemented
        ]);
        setProfile(profileData);
        setAddresses(addressesData);
        setError(null);
      } catch (err: any) {
         setProfile({
            id: authUser?.id || "N/A",
            firstName: authUser?.firstName?.split(' ')[0] || "User",
            lastName: authUser?.firstName?.split(' ').slice(1).join(' ') || "",
            email: authUser?.email || "N/A",
            role: authUser?.role || "Customer",
            avatarUrl: ""
         });
         setError("Could not load all profile details. Some features might be unavailable.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, authUser]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setIsSubmitting(true);
      const added = await userService.addAddress(newAddress, token);
      setAddresses([...addresses, added]);
      setShowAddAddress(false);
      setNewAddress({ street: "", city: "", state: "", zipCode: "", country: "", isDefault: false });
    } catch (err: any) {
      setError(err.message || "Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (address: UserAddress) => {
      if(!token) return;
      try {
          // Typically there is an endpoint to set default, or update the whole address
          await userService.updateAddress(address.id, {
             ...address,
             isDefault: true
          }, token);
          
          // Optimistically update local state
          setAddresses(addresses.map(a => ({
             ...a,
             isDefault: a.id === address.id
          })));

      } catch (err: any) {
          setError(err.message || "Failed to set default address");
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 dark:bg-red-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 animate-fade-in-down">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center shadow-lg">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Profile
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal information and address book.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-4 text-red-600 animate-shake">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">Heads up</h3>
              <p className="text-sm font-medium mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: User Details */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
             <div className="glass-card bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"></div>
                <div className="relative z-10">
                   <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-400 mb-4 overflow-hidden">
                       <UserIcon className="w-12 h-12" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                     {profile?.firstName} {profile?.lastName}
                   </h2>
                   <div className="flex items-center gap-1.5 text-sm font-semibold text-red-500 mt-1 mb-6 uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" /> {profile?.role}
                   </div>

                   <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                        <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                           <Mail className="w-4 h-4 text-slate-400" /> {profile?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account ID</p>
                        <p className="text-slate-500 font-mono text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all">
                           {profile?.id}
                        </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Col: Addresses */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             <div className="glass-card bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                     <MapPin className="w-6 h-6 text-red-500" />
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">Address Book</h2>
                  </div>
                  {!showAddAddress && (
                    <button 
                      onClick={() => setShowAddAddress(true)}
                      className="text-sm font-bold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 dark:bg-red-500/10 dark:hover:bg-red-500 px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add New
                    </button>
                  )}
                </div>

                {showAddAddress && (
                   <form onSubmit={handleAddAddress} className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 animate-fade-in-down">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-slate-900 dark:text-white">Add Delivery Address</h3>
                         <button type="button" onClick={() => setShowAddAddress(false)} className="text-slate-400 hover:text-red-500 p-1 rounded-full"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Street Address</label>
                            <input required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="123 Main St" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">City</label>
                            <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="New York" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">State / Province</label>
                            <input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="NY" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ZIP / Postal Code</label>
                            <input required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="10001" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Country</label>
                            <input required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="United States" />
                         </div>
                         <div className="md:col-span-2 pt-2 flex items-center gap-2">
                             <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 text-red-500 rounded focus:ring-red-500 border-gray-300" />
                             <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as default delivery address</label>
                         </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                         <button type="submit" disabled={isSubmitting} className="bg-red-500 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isSubmitting ? "Saving..." : "Save Address"}
                         </button>
                      </div>
                   </form>
                )}

                {addresses.length === 0 && !showAddAddress ? (
                   <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">No addresses saved yet.</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Add your home or office address for faster checkout.</p>
                      <button onClick={() => setShowAddAddress(true)} className="text-red-500 font-bold hover:underline">Add First Address</button>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                         <div key={address.id} className={`p-5 rounded-2xl border-2 transition-all relative group ${address.isDefault ? 'border-red-500 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            {address.isDefault && (
                               <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] uppercase tracking-wider font-bold py-1 px-3 rounded-full shadow-md flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Default
                               </div>
                            )}
                            <div className="font-semibold text-slate-900 dark:text-white capitalize mb-1 flex items-center justify-between">
                               {address.street}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                               {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                               {address.country}
                            </p>

                            {!address.isDefault && (
                               <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                                  <button onClick={() => handleSetDefault(address)} className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                                     Set as Default
                                  </button>
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfileContent />
    </ProtectedRoute>
  );
}
