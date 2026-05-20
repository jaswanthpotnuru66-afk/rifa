import { useState, useEffect } from 'react';
import { 
    Truck, Clock, Ban, MapPin, Scale, Edit2, Check, X, AlertTriangle, Plus, Loader, Navigation, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { api } from '../../lib/api';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [17.3850, 78.4867]; // Hyderabad

// Helper component to update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const POLICIES = [
    { icon: Truck,  title: 'Courier Assignment',  body: 'Rifa assigns couriers automatically via Shiprocket based on your origin PIN and buyer\'s delivery PIN. You do not choose couriers.' },
    { icon: Clock,  title: 'Dispatch Window',     body: 'You must dispatch within 2 business days of order confirmation. Late dispatch = warning. 3 warnings = account review.' },
    { icon: Ban,    title: 'COD Policy',           body: 'COD is automatically disabled for all customisable listings. This cannot be overridden by any setting.' },
    { icon: MapPin, title: 'Self-Dropoff',         body: 'If pickup fails, re-request pickup (available after 4 hours) or self-dropoff at your nearest courier hub.' },
    { icon: Scale,  title: 'Weight Accuracy',      body: 'If actual billed weight exceeds declared weight by more than 10%, the difference is automatically deducted from your payout.' },
];

const Shipping = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [alertsLoading, setAlertsLoading] = useState(true);
    
    const [originPin, setOriginPin] = useState('302020');
    const [city, setCity] = useState('Jaipur');
    const [addressLine, setAddressLine] = useState('Sector 4, Mansarovar');
    const [originState, setOriginState] = useState('Rajasthan');

    const [alerts, setAlerts] = useState<any[]>([]);

    // Geolocation and Leaflet Map States
    const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const handleLocationSelect = async (lat: number, lng: number) => {
        const newPos: [number, number] = [lat, lng];
        setMapCenter(newPos);
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.address) {
                const addr = data.address;
                setAddressLine(addr.road || addr.suburb || addr.neighbourhood || addr.amenity || 'Pinpointed Location');
                setCity(addr.city || addr.town || addr.village || addr.county || '');
                setOriginPin(addr.postcode || '');
                if (addr.state) {
                    setOriginState(addr.state);
                }
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
        }
    };

    const handleDetectLocation = () => {
        setIsDetectingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                handleLocationSelect(lat, lng);
                setIsDetectingLocation(false);
            }, () => {
                setIsDetectingLocation(false);
                alert("Location access denied.");
            });
        } else {
            setIsDetectingLocation(false);
            alert("Geolocation not supported.");
        }
    };

    const handleSearchAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapCenter(newCenter);
                
                const parts = display_name.split(', ');
                setAddressLine(parts[0] || 'Pinpointed Location');
                setCity(parts[parts.length - 3] || '');
                setOriginPin(parts[parts.length - 1]?.match(/\d+/)?.[0] || '');
                
                const possibleState = parts[parts.length - 2];
                if (possibleState) {
                    setOriginState(possibleState);
                }
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            setProfileLoading(true);
            const data = await api.getArtisanStats();
            if (data && data.artisan) {
                setOriginPin(data.artisan.pincode || '302020');
                setCity(data.artisan.location || 'Jaipur');
                // parse extra fields or use defaults
                if (data.artisan.story && data.artisan.story.includes('Address:')) {
                    setAddressLine(data.artisan.story.split('Address:')[1].trim());
                }
                setOriginState(data.artisan.specialty || 'Rajasthan');
            }
            setProfileLoading(false);
        };

        const loadAlerts = async () => {
            setAlertsLoading(true);
            const data = await api.getArtisanShippingAlerts();
            setAlerts(data || []);
            setAlertsLoading(false);
        };

        loadProfile();
        loadAlerts();
    }, []);

    const handleSaveProfile = async () => {
        setProfileLoading(true);
        const res = await api.updateArtisanProfile({
            pincode: originPin,
            location: city,
            specialty: originState,
            story: `Address: ${addressLine}`
        });
        setProfileLoading(false);
        if (!res.error) {
            setIsEditing(false);
        }
    };

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Logistics</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Shipping & Logistics</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">
                        Manage origin details and track your shipment history. · <span className="font-semibold text-brand-pink uppercase tracking-wider text-xs">{city || 'Vizag'}</span>
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left: Profile + Shipment history */}
                    <div className="lg:col-span-2 space-y-10">
                        
                        {/* Section 1: Shipping Profile */}
                        <section className="bg-white border border-neutral-100 rounded-sm shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-50">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Origin Profile</h2>
                                {!isEditing && !profileLoading && (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:opacity-70 transition-opacity">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                )}
                            </div>
                            <div className="p-8">
                                {profileLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Loader className="animate-spin text-neutral-400" size={20} />
                                    </div>
                                ) : isEditing ? (
                                    <div className="flex flex-col md:flex-row gap-8 min-h-[450px]">
                                        {/* Left Side: Geolocation Pin & Fill Map */}
                                        <div className="flex-1 min-h-[300px] md:min-h-auto relative border border-neutral-100 bg-neutral-50 rounded-sm overflow-hidden flex flex-col">
                                            <div className="p-3 bg-white border-b border-neutral-100 flex items-center justify-between z-20">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-950 flex items-center gap-1.5">
                                                    <Navigation size={12} className="text-brand-pink" /> Pinpoint Origin Location
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={handleDetectLocation}
                                                    disabled={isDetectingLocation}
                                                    className="px-3 py-1.5 bg-neutral-950 text-white text-[8px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-1.5"
                                                >
                                                    {isDetectingLocation ? <Loader className="animate-spin text-white" size={10} /> : <MapPin size={10} />}
                                                    {isDetectingLocation ? 'Syncing...' : 'Detect Me'}
                                                </button>
                                            </div>
                                            
                                            <div className="flex-1 relative z-10 min-h-[250px]">
                                                <MapContainer 
                                                    center={mapCenter} 
                                                    zoom={13} 
                                                    style={{ height: '100%', width: '100%', minHeight: '250px' }}
                                                    zoomControl={false}
                                                >
                                                    <TileLayer
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                    />
                                                    <Marker position={mapCenter} />
                                                    <MapUpdater center={mapCenter} />
                                                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                                                </MapContainer>

                                                {/* Search Overlay */}
                                                <div className="absolute top-3 left-3 right-3 z-[1000]">
                                                    <form onSubmit={handleSearchAddress} className="relative">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                        <input 
                                                            type="text" 
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            placeholder="Search location (e.g. Vizag, Hyderabad)..."
                                                            className="w-full pl-9 pr-3 py-2.5 bg-white/95 backdrop-blur-sm rounded border border-neutral-200/50 shadow-lg outline-none text-[11px] font-bold"
                                                        />
                                                        {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-pink" size={12} />}
                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Form Inputs */}
                                        <div className="flex-1 space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Origin PIN</label>
                                                    <input type="text" value={originPin} onChange={e => setOriginPin(e.target.value)}
                                                        className="w-full bg-neutral-50 border border-neutral-100 px-3.5 py-3 text-xs font-bold outline-none focus:border-brand-pink transition-all" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">City</label>
                                                    <input type="text" value={city} onChange={e => setCity(e.target.value)}
                                                        className="w-full bg-neutral-50 border border-neutral-100 px-3.5 py-3 text-xs font-bold outline-none focus:border-brand-pink transition-all" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Address Line 1</label>
                                                <input type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)}
                                                    className="w-full bg-neutral-50 border border-neutral-100 px-3.5 py-3 text-xs font-bold outline-none focus:border-brand-pink transition-all" />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">State</label>
                                                <input type="text" value={originState} onChange={e => setOriginState(e.target.value)}
                                                    className="w-full bg-neutral-50 border border-neutral-100 px-3.5 py-3 text-xs font-bold outline-none focus:border-brand-pink transition-all" />
                                            </div>

                                            <div className="flex gap-3 pt-3">
                                                <button onClick={handleSaveProfile} className="flex-1 py-3.5 bg-brand-pink text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-brand-pink-dark transition-all shadow-md">
                                                    <Check size={14} /> Save Changes
                                                </button>
                                                <button onClick={() => setIsEditing(false)} className="px-6 py-3.5 border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:text-neutral-950 transition-all flex items-center gap-1.5">
                                                    <X size={14} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                        {[
                                            { label: 'PIN Code', val: originPin },
                                            { label: 'City',     val: city },
                                            { label: 'Address',  val: addressLine },
                                            { label: 'State',    val: originState },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">{item.label}</p>
                                                <p className="text-sm font-bold text-neutral-950">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Section 2: Delivery Profiles */}
                        <section className="bg-white border border-neutral-100 rounded-sm shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-50">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Delivery Profiles</h2>
                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-pink hover:opacity-70 transition-opacity">
                                    <Plus size={12} /> Add Rule
                                </button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="border border-neutral-100 rounded-sm p-5 hover:border-brand-pink/20 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-neutral-950">Standard Delivery</p>
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-1 rounded-sm">Default</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-4">Applies to all domestic zones (Local, Metro, ROI).</p>
                                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Base Rate</p>
                                            <p className="text-sm font-black text-neutral-900 font-bold">₹80</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Free Over</p>
                                            <p className="text-sm font-black text-brand-pink font-bold">₹2,000</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-neutral-100 rounded-sm p-5 hover:border-brand-pink/20 transition-all cursor-pointer opacity-70">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-neutral-950">Express Air (2-Day)</p>
                                        <button className="text-neutral-400 hover:text-neutral-900"><Edit2 size={12} /></button>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-4">Applies to Metro and Tier-1 cities only.</p>
                                    <div className="grid grid-cols-2 gap-4 border-t border-neutral-50 pt-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Base Rate</p>
                                            <p className="text-sm font-black text-neutral-900 font-bold">₹250</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Free Over</p>
                                            <p className="text-sm font-medium text-neutral-500">—</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Shipment History */}
                        <section>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-5">Shipment Alerts & Anomalies</h2>
                            <div className="bg-white border border-neutral-100 rounded-sm overflow-hidden shadow-sm">
                                {alertsLoading ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-neutral-400">
                                        <Loader className="animate-spin mb-4" size={24} />
                                        <p className="text-[10px] uppercase tracking-widest font-black">Loading shipment records...</p>
                                    </div>
                                ) : alerts.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                                <tr>
                                                    {['Alert ID', 'Order ID', 'Type', 'Severity', 'Declared', 'Billed', 'Adjustment', 'Status'].map(h => (
                                                        <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50">
                                                {alerts.map(s => (
                                                    <tr key={s.id} className="hover:bg-neutral-50/80 transition-colors">
                                                        <td className="px-5 py-4 text-xs font-black text-neutral-900">#{s.id.slice(0, 8)}</td>
                                                        <td className="px-5 py-4 text-xs font-medium text-neutral-500">#{s.order_id?.slice(0, 8)}</td>
                                                        <td className="px-5 py-4 text-xs font-bold text-neutral-900 capitalize">{s.type?.replace(/_/g, ' ')}</td>
                                                        <td className="px-5 py-4">
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                                s.severity === 'critical' || s.severity === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                            }`}>
                                                                {s.severity}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-xs text-neutral-500">{s.original_weight ? `${s.original_weight}g` : '—'}</td>
                                                        <td className="px-5 py-4 text-xs font-bold text-neutral-900">{s.detected_weight ? `${s.detected_weight}g` : '—'}</td>
                                                        <td className={`px-5 py-4 text-xs font-black ${Number(s.adjustment_amount) > 0 ? 'text-red-600' : 'text-neutral-300'}`}>
                                                            {Number(s.adjustment_amount) > 0 ? `−₹${Math.abs(Number(s.adjustment_amount)).toLocaleString()}` : '—'}
                                                        </td>
                                                        <td className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400 capitalize">{s.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-xs text-neutral-400 italic">
                                        No active shipping alerts or weight anomalies detected.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Policies */}
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-5">Platform Policies</h2>
                        {POLICIES.map((policy, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                                className="bg-white border border-neutral-100 rounded-sm p-5 shadow-sm group hover:border-brand-pink/20 hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="w-9 h-9 rounded-sm bg-brand-pink/5 flex items-center justify-center text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all shrink-0">
                                        <policy.icon size={16} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-950 mb-1.5">{policy.title}</p>
                                        <p className="text-[11px] text-neutral-500 leading-relaxed font-light">{policy.body}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Weight warning card */}
                        <div className="bg-amber-50 border border-amber-200 rounded-sm p-5 flex gap-3">
                            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                Weight mismatches &gt; 10% are auto-deducted. Always weigh packages accurately before declaring.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CraftMakerLayout>
    );
};

export default Shipping;
