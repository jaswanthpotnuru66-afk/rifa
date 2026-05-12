import type { OrderStatus } from './craftmaker';

export interface PlatformStats {
  totalGMV: number;
  gmvThisMonth: number;
  gmvLastMonth: number;
  totalOrders: number;
  ordersThisMonth: number;
  activeListings: number;
  activeMakers: number;
  pendingApprovals: number;
  openDisputes: number;
  avgPlatformRating: number;
  totalReviews: number;
  platformCommissionThisMonth: number;
  tcsCollectedThisMonth: number;
}

export interface PlatformSettings {
  commissionRate: number;
  listingFee: number;
  tcsRate: number;
  proofResponseDeadlineHours: number;
  shippingWeightBufferPercent: number;
  maxDispatchWindowDays: number;
  maxProofRevisionRounds: number;
  codEnabledForCustom: boolean;
  activeCouriers: string[];
  shiprocketConnected: boolean;
  razorpayConnected: boolean;
}

export interface MakerApplication {
  id: string;
  applicantName: string;
  shopName: string;
  shopSlug: string;
  email: string;
  mobile: string;
  originState: string;
  craftCategories: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  pan: string;
  bankAccountName: string;
  ifsc: string;
  bankLast4: string;
  aadhaarMasked: string;
  gstin?: string;
  kycVerified: boolean;
  adminNotes?: string;
  rejectionReason?: string;
  processingTime: number;
  shippingOriginPin: string;
  acceptsCustomOrders: boolean;
}

export interface MakerSummary {
  id: string;
  shopName: string;
  shopSlug: string;
  makerName: string;
  originState: string;
  craftCategories: string[];
  joinedDate: string;
  status: 'active' | 'paused' | 'suspended';
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  totalRevenue: number;
  platformCommissionEarned: number;
  avgRating: number;
  reviewCount: number;
  lastActive: string;
  kycVerified: boolean;
  gstin?: string;
  weightMismatchStrikes: 0 | 1 | 2 | 3;
  offPlatformWarnings: 0 | 1 | 2;
}

export interface AdminOrder {
  id: string;
  date: string;
  buyerName: string;
  buyerCity: string;
  buyerPin: string;
  makerShopName: string;
  makerId: string;
  productName: string;
  productId: string;
  amount: number;
  shippingCharge: number;
  commission: number;
  tcs: number;
  makerPayout: number;
  status: OrderStatus;
  isCustom: boolean;
  proofStatus?: 'none' | 'sent' | 'approved' | 'revision-requested';
  shippingZone: string;
  courier?: string;
  awb?: string;
  declaredWeight?: number;
  billedWeight?: number;
  weightAdjustment?: number;
  disputeId?: string;
  deliveredAt?: string;
}

export interface AdminDispute {
  id: string;
  orderId: string;
  buyerName: string;
  buyerCity: string;
  makerShopName: string;
  makerId: string;
  productName: string;
  amount: number;
  category: 'content-mismatch' | 'dimension-mismatch' | 'structural-defect' | 'wrong-item' | 'other';
  buyerDescription: string;
  buyerPhotoUrl?: string;
  approvedProofUrl?: string;
  dateRaised: string;
  status: 'open' | 'under-review' | 'resolved';
  outcome?: 'maker-favour' | 'refund-issued';
  amountRefunded?: number;
  amountDeducted?: number;
  adminNotes?: string;
  adminRuling?: string;
  makerResponse?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AdminPayout {
  id: string;
  makerId: string;
  makerShopName: string;
  date: string;
  orderCount: number;
  grossAmount: number;
  commission: number;
  tcs: number;
  shippingAdj: number;
  netPaid: number;
  status: 'released' | 'pending' | 'held';
  heldReason?: string;
  heldAt?: string;
  releasedAt?: string;
}

export interface ShippingAlert {
  id: string;
  orderId: string;
  makerShopName: string;
  makerId: string;
  type: 'sla-breach' | 'weight-mismatch' | 'rto' | 'scan-delay';
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
  declaredWeight?: number;
  billedWeight?: number;
  overage?: number;
  makerStrikeCount?: number;
}

export interface FlaggedListing {
  id: string;
  listingId: string;
  productName: string;
  makerShopName: string;
  makerId: string;
  flagReason: 'copyright' | 'not-handmade' | 'misleading' | 'prohibited' | 'no-material-notice';
  flaggedAt: string;
  flaggedBy: 'system' | 'buyer';
  status: 'open' | 'reviewed' | 'delisted';
  adminAction?: string;
  adminNotes?: string;
}

export interface AdminTCSMonth {
  month: string;
  totalGrossSales: number;
  totalTCSCollected: number;
  makerCount: number;
  averagePerMaker: number;
  exportedAt?: string;
  exportedBy?: string;
}

export interface WeightMismatch {
  id: string;
  orderId: string;
  makerShopName: string;
  makerId: string;
  declaredWeight: number;
  billedWeight: number;
  overageGrams: number;
  overageShippingCost: number;
  deducted: boolean;
  deductedAt?: string;
  makerStrikeCount: number;
  date: string;
}

// --- MOCK DATA ---

export const mockPlatformStats: PlatformStats = {
  totalGMV: 8420580,
  gmvThisMonth: 124580,
  gmvLastMonth: 108340,
  totalOrders: 2847,
  ordersThisMonth: 184,
  activeListings: 1240,
  activeMakers: 38,
  pendingApprovals: 3,
  openDisputes: 2,
  avgPlatformRating: 4.8,
  totalReviews: 2143,
  platformCommissionThisMonth: 6229,
  tcsCollectedThisMonth: 1246
};

export const mockPlatformSettings: PlatformSettings = {
  commissionRate: 5,
  listingFee: 10,
  tcsRate: 1,
  proofResponseDeadlineHours: 72,
  shippingWeightBufferPercent: 10,
  maxDispatchWindowDays: 2,
  maxProofRevisionRounds: 3,
  codEnabledForCustom: false,
  activeCouriers: ['Delhivery', 'BlueDart', 'India Post', 'Xpressbees', 'DTDC'],
  shiprocketConnected: true,
  razorpayConnected: true
};

export const mockMakerApplications: MakerApplication[] = [
  {
    id: 'app-1',
    applicantName: 'Arjun Verma',
    shopName: 'Verma Woodworks',
    shopSlug: 'verma-woodworks',
    email: 'arjun@example.com',
    mobile: '9876543210',
    originState: 'Uttar Pradesh',
    craftCategories: ['Wood Carving', 'Home Decor'],
    submittedAt: '2025-06-01T10:00:00Z',
    status: 'pending',
    pan: 'ABCDE1234F',
    bankAccountName: 'Arjun Verma',
    ifsc: 'SBIN0001234',
    bankLast4: '5678',
    aadhaarMasked: 'XXXX XXXX 1234',
    gstin: '09ABCDE1234F1Z5',
    kycVerified: false,
    processingTime: 5,
    shippingOriginPin: '226001',
    acceptsCustomOrders: true
  },
  {
    id: 'app-2',
    applicantName: 'Sita Devi',
    shopName: 'Sita Madhubani Art',
    shopSlug: 'sita-madhubani',
    email: 'sita@example.com',
    mobile: '9876543211',
    originState: 'Bihar',
    craftCategories: ['Painting', 'Madhubani'],
    submittedAt: '2025-06-02T11:30:00Z',
    status: 'pending',
    pan: 'FGHIJ5678K',
    bankAccountName: 'Sita Devi',
    ifsc: 'HDFC0005678',
    bankLast4: '9012',
    aadhaarMasked: 'XXXX XXXX 5678',
    kycVerified: true,
    processingTime: 10,
    shippingOriginPin: '800001',
    acceptsCustomOrders: true
  },
  {
    id: 'app-3',
    applicantName: 'Rahul Singh',
    shopName: 'The Copper Smith',
    shopSlug: 'copper-smith',
    email: 'rahul@example.com',
    mobile: '9876543212',
    originState: 'Maharashtra',
    craftCategories: ['Metal Work', 'Kitchenware'],
    submittedAt: '2025-06-03T09:15:00Z',
    status: 'pending',
    pan: 'LMNOP9012Q',
    bankAccountName: 'Rahul Singh',
    ifsc: 'ICIC0009012',
    bankLast4: '3456',
    aadhaarMasked: 'XXXX XXXX 9012',
    kycVerified: false,
    processingTime: 7,
    shippingOriginPin: '400001',
    acceptsCustomOrders: false
  },
  {
    id: 'app-4',
    applicantName: 'Priya Sharma',
    shopName: 'Priya Weaves',
    shopSlug: 'priya-weaves',
    email: 'priya@example.com',
    mobile: '9876543213',
    originState: 'West Bengal',
    craftCategories: ['Textiles', 'Sarees'],
    submittedAt: '2025-05-20T14:00:00Z',
    status: 'approved',
    pan: 'RSTUV3456W',
    bankAccountName: 'Priya Sharma',
    ifsc: 'AXIS0003456',
    bankLast4: '7890',
    aadhaarMasked: 'XXXX XXXX 3456',
    kycVerified: true,
    processingTime: 15,
    shippingOriginPin: '700001',
    acceptsCustomOrders: true
  },
  {
    id: 'app-5',
    applicantName: 'Vikram AD',
    shopName: 'Modern Clay',
    shopSlug: 'modern-clay',
    email: 'vikram@example.com',
    mobile: '9876543214',
    originState: 'Karnataka',
    craftCategories: ['Pottery', 'Ceramics'],
    submittedAt: '2025-05-25T16:45:00Z',
    status: 'rejected',
    pan: 'XYZAB7890C',
    bankAccountName: 'Vikram AD',
    ifsc: 'KKBK0007890',
    bankLast4: '1234',
    aadhaarMasked: 'XXXX XXXX 7890',
    kycVerified: false,
    processingTime: 3,
    shippingOriginPin: '560001',
    acceptsCustomOrders: true,
    rejectionReason: 'Invalid ID proof submitted'
  }
];

export const mockAllMakers: MakerSummary[] = [
  {
    id: 'm-1',
    shopName: "Meera's Clay Studio",
    shopSlug: 'meerasclayStudio',
    makerName: 'Meera Sharma',
    originState: 'Rajasthan',
    craftCategories: ['Pottery', 'Blue Pottery'],
    joinedDate: '2025-01-12',
    status: 'active',
    totalListings: 15,
    activeListings: 12,
    totalOrders: 145,
    totalRevenue: 350000,
    platformCommissionEarned: 17500,
    avgRating: 4.8,
    reviewCount: 143,
    lastActive: '2025-06-12T15:00:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 0
  },
  {
    id: 'm-2',
    shopName: 'Royal Silk Weaves',
    shopSlug: 'royal-silk',
    makerName: 'Anand Kumar',
    originState: 'Varanasi',
    craftCategories: ['Textiles', 'Silk'],
    joinedDate: '2025-02-15',
    status: 'active',
    totalListings: 25,
    activeListings: 20,
    totalOrders: 88,
    totalRevenue: 840000,
    platformCommissionEarned: 42000,
    avgRating: 4.9,
    reviewCount: 76,
    lastActive: '2025-06-12T12:00:00Z',
    kycVerified: true,
    weightMismatchStrikes: 1,
    offPlatformWarnings: 0
  },
  {
    id: 'm-3',
    shopName: 'Dhokra Artifacts',
    shopSlug: 'dhokra-art',
    makerName: 'Sunita Das',
    originState: 'Odisha',
    craftCategories: ['Metal Work', 'Dhokra'],
    joinedDate: '2025-03-01',
    status: 'active',
    totalListings: 12,
    activeListings: 10,
    totalOrders: 42,
    totalRevenue: 125000,
    platformCommissionEarned: 6250,
    avgRating: 4.7,
    reviewCount: 35,
    lastActive: '2025-06-11T18:00:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 0
  },
  {
    id: 'm-4',
    shopName: 'Kashmiri Embroideries',
    shopSlug: 'kashmiri-emb',
    makerName: 'Bashir Ahmed',
    originState: 'Jammu & Kashmir',
    craftCategories: ['Embroidery', 'Shawls'],
    joinedDate: '2025-03-20',
    status: 'paused',
    totalListings: 30,
    activeListings: 0,
    totalOrders: 112,
    totalRevenue: 1250000,
    platformCommissionEarned: 62500,
    avgRating: 5.0,
    reviewCount: 98,
    lastActive: '2025-06-05T10:00:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 1
  },
  {
    id: 'm-5',
    shopName: 'Terracotta Treasures',
    shopSlug: 'terracotta-tr',
    makerName: 'Prakash Jena',
    originState: 'West Bengal',
    craftCategories: ['Pottery', 'Terracotta'],
    joinedDate: '2025-04-05',
    status: 'active',
    totalListings: 18,
    activeListings: 15,
    totalOrders: 65,
    totalRevenue: 98000,
    platformCommissionEarned: 4900,
    avgRating: 4.5,
    reviewCount: 42,
    lastActive: '2025-06-12T09:00:00Z',
    kycVerified: true,
    weightMismatchStrikes: 2,
    offPlatformWarnings: 0
  },
  {
    id: 'm-6',
    shopName: 'Phulkari Hub',
    shopSlug: 'phulkari-hub',
    makerName: 'Harpreet Kaur',
    originState: 'Punjab',
    craftCategories: ['Embroidery', 'Phulkari'],
    joinedDate: '2025-04-15',
    status: 'active',
    totalListings: 14,
    activeListings: 12,
    totalOrders: 38,
    totalRevenue: 75000,
    platformCommissionEarned: 3750,
    avgRating: 4.8,
    reviewCount: 22,
    lastActive: '2025-06-12T14:30:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 0
  },
  {
    id: 'm-7',
    shopName: 'Pattachitra Gallery',
    shopSlug: 'pattachitra-gal',
    makerName: 'Bijay Mohanty',
    originState: 'Odisha',
    craftCategories: ['Painting', 'Pattachitra'],
    joinedDate: '2025-05-01',
    status: 'suspended',
    totalListings: 20,
    activeListings: 0,
    totalOrders: 15,
    totalRevenue: 45000,
    platformCommissionEarned: 2250,
    avgRating: 4.2,
    reviewCount: 12,
    lastActive: '2025-05-20T11:00:00Z',
    kycVerified: false,
    weightMismatchStrikes: 3,
    offPlatformWarnings: 2
  },
  {
    id: 'm-8',
    shopName: 'Channapatna Toys',
    shopSlug: 'channapatna-toys',
    makerName: 'Manjunath B',
    originState: 'Karnataka',
    craftCategories: ['Toys', 'Wood Work'],
    joinedDate: '2025-05-10',
    status: 'active',
    totalListings: 40,
    activeListings: 38,
    totalOrders: 120,
    totalRevenue: 62000,
    platformCommissionEarned: 3100,
    avgRating: 4.9,
    reviewCount: 85,
    lastActive: '2025-06-12T16:00:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 0
  },
  {
    id: 'm-9',
    shopName: 'Bidri Art Studio',
    shopSlug: 'bidri-art',
    makerName: 'Mohammad Ali',
    originState: 'Telangana',
    craftCategories: ['Metal Work', 'Bidri'],
    joinedDate: '2025-05-20',
    status: 'active',
    totalListings: 10,
    activeListings: 8,
    totalOrders: 22,
    totalRevenue: 110000,
    platformCommissionEarned: 5500,
    avgRating: 4.8,
    reviewCount: 18,
    lastActive: '2025-06-12T10:15:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 0
  },
  {
    id: 'm-10',
    shopName: 'Cane & Bamboo Crafts',
    shopSlug: 'cane-bamboo',
    makerName: 'Hiren Borah',
    originState: 'Assam',
    craftCategories: ['Cane Work', 'Home Decor'],
    joinedDate: '2025-06-01',
    status: 'active',
    totalListings: 15,
    activeListings: 15,
    totalOrders: 8,
    totalRevenue: 12000,
    platformCommissionEarned: 600,
    avgRating: 5.0,
    reviewCount: 5,
    lastActive: '2025-06-12T13:45:00Z',
    kycVerified: true,
    weightMismatchStrikes: 0,
    offPlatformWarnings: 0
  }
];

export const mockAllOrders: AdminOrder[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ORD-${10000 + i}`,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  buyerName: `Buyer ${i + 1}`,
  buyerCity: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata'][i % 5],
  buyerPin: `40000${i % 9}`,
  makerShopName: mockAllMakers[i % 10].shopName,
  makerId: mockAllMakers[i % 10].id,
  productName: `Product ${i + 1}`,
  productId: `p-${100 + i}`,
  amount: 2500 + i * 100,
  shippingCharge: 150,
  commission: (2500 + i * 100) * 0.05,
  tcs: (2500 + i * 100) * 0.01,
  makerPayout: (2500 + i * 100) * 0.94 - 150,
  status: ['new', 'awaiting-proof', 'proof-sent', 'in-production', 'shipped', 'delivered', 'cancelled', 'disputed'][i % 8] as OrderStatus,
  isCustom: i % 3 === 0,
  proofStatus: i % 3 === 0 ? ['none', 'sent', 'approved', 'revision-requested'][i % 4] as any : undefined,
  shippingZone: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'][i % 5],
  courier: i > 5 ? 'Delhivery' : undefined,
  awb: i > 5 ? `AWB${88000 + i}` : undefined,
  declaredWeight: 500,
  billedWeight: i === 10 || i === 15 ? 800 : 500,
  weightAdjustment: i === 10 || i === 15 ? -45 : 0,
  disputeId: i === 7 || i === 15 ? `DISP-00${i}` : undefined,
  deliveredAt: i % 8 === 5 ? new Date(Date.now() - i * 43200000).toISOString() : undefined
}));

// Manually setting the specific cases requested
mockAllOrders[7].status = 'disputed';
mockAllOrders[15].status = 'disputed';
mockAllOrders[10].billedWeight = 800;
mockAllOrders[10].weightAdjustment = -45;
mockAllOrders[15].billedWeight = 1000;
mockAllOrders[15].weightAdjustment = -85;
mockAllOrders[19].status = 'cancelled'; // Let's use this for RTO simulation in status labels if needed

export const mockDisputes: AdminDispute[] = [
  {
    id: 'DISP-007',
    orderId: 'ORD-10007',
    buyerName: 'Buyer 8',
    buyerCity: 'Chennai',
    makerShopName: "Meera's Clay Studio",
    makerId: 'm-1',
    productName: 'Product 8',
    amount: 3200,
    category: 'structural-defect',
    buyerDescription: 'The base of the vase is uneven and it wobbles.',
    dateRaised: '2025-06-10T10:00:00Z',
    status: 'open'
  },
  {
    id: 'DISP-0015',
    orderId: 'ORD-10015',
    buyerName: 'Buyer 16',
    buyerCity: 'Mumbai',
    makerShopName: 'Phulkari Hub',
    makerId: 'm-6',
    productName: 'Product 16',
    amount: 4000,
    category: 'wrong-item',
    buyerDescription: 'I received a red scarf instead of the blue one I ordered.',
    dateRaised: '2025-06-11T14:30:00Z',
    status: 'open'
  },
  {
    id: 'DISP-003',
    orderId: 'ORD-10003',
    buyerName: 'Buyer 4',
    buyerCity: 'Delhi',
    makerShopName: 'Royal Silk Weaves',
    makerId: 'm-2',
    productName: 'Product 4',
    amount: 2800,
    category: 'content-mismatch',
    buyerDescription: 'The embroidery is not as detailed as shown in the approved proof.',
    dateRaised: '2025-06-05T09:00:00Z',
    status: 'under-review',
    makerResponse: 'We have used the same thread and pattern. The lighting in the photo might make it look different.'
  },
  {
    id: 'DISP-005',
    orderId: 'ORD-10005',
    buyerName: 'Buyer 6',
    buyerCity: 'Kolkata',
    makerShopName: 'Dhokra Artifacts',
    makerId: 'm-3',
    productName: 'Product 6',
    amount: 3000,
    category: 'dimension-mismatch',
    buyerDescription: 'The artifact is 2 inches shorter than specified.',
    dateRaised: '2025-06-08T11:20:00Z',
    status: 'under-review'
  },
  {
    id: 'DISP-001',
    orderId: 'ORD-10001',
    buyerName: 'Buyer 2',
    buyerCity: 'Delhi',
    makerShopName: 'Kashmiri Embroideries',
    makerId: 'm-4',
    productName: 'Product 2',
    amount: 2600,
    category: 'other',
    buyerDescription: 'Delayed delivery, needed it for an event.',
    dateRaised: '2025-05-25T16:00:00Z',
    status: 'resolved',
    outcome: 'maker-favour',
    adminRuling: 'Order was shipped on time, delay was due to courier. No refund applicable.',
    resolvedAt: '2025-05-30T10:00:00Z',
    resolvedBy: 'Super Admin'
  }
];

export const mockAllPayouts: AdminPayout[] = Array.from({ length: 15 }, (_, i) => ({
  id: `PAY-${500 + i}`,
  makerId: mockAllMakers[i % 10].id,
  makerShopName: mockAllMakers[i % 10].shopName,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  orderCount: 5 + i,
  grossAmount: 15000 + i * 1000,
  commission: (15000 + i * 1000) * 0.05,
  tcs: (15000 + i * 1000) * 0.01,
  shippingAdj: i % 4 === 0 ? -250 : 0,
  netPaid: (15000 + i * 1000) * 0.94 - (i % 4 === 0 ? 250 : 0),
  status: i < 10 ? 'released' : i < 13 ? 'pending' : 'held',
  heldReason: i >= 13 ? 'KYC verification pending' : undefined,
  releasedAt: i < 10 ? new Date(Date.now() - i * 86400000 + 43200000).toISOString() : undefined
}));

export const mockShippingAlerts: ShippingAlert[] = [
  {
    id: 'SA-1',
    orderId: 'ORD-10010',
    makerShopName: 'Royal Silk Weaves',
    makerId: 'm-2',
    type: 'sla-breach',
    description: 'Order not dispatched within 48 hours of proof approval.',
    severity: 'high',
    createdAt: '2025-06-10T10:00:00Z'
  },
  {
    id: 'SA-2',
    orderId: 'ORD-10011',
    makerShopName: 'Dhokra Artifacts',
    makerId: 'm-3',
    type: 'sla-breach',
    description: 'Dispatch window exceeded.',
    severity: 'medium',
    createdAt: '2025-06-11T09:00:00Z'
  },
  {
    id: 'SA-3',
    orderId: 'ORD-10012',
    makerShopName: "Meera's Clay Studio",
    makerId: 'm-1',
    type: 'sla-breach',
    description: 'Final shipment delay.',
    severity: 'low',
    createdAt: '2025-06-12T08:00:00Z'
  },
  {
    id: 'SA-4',
    orderId: 'ORD-10010',
    makerShopName: 'Royal Silk Weaves',
    makerId: 'm-2',
    type: 'weight-mismatch',
    description: 'Declared: 500g, Billed: 800g',
    severity: 'medium',
    createdAt: '2025-06-10T14:00:00Z',
    declaredWeight: 500,
    billedWeight: 800,
    overage: 300
  },
  {
    id: 'SA-5',
    orderId: 'ORD-10015',
    makerShopName: 'Phulkari Hub',
    makerId: 'm-6',
    type: 'weight-mismatch',
    description: 'Major weight discrepancy detected.',
    severity: 'high',
    createdAt: '2025-06-11T16:00:00Z',
    declaredWeight: 500,
    billedWeight: 1000,
    overage: 500
  },
  {
    id: 'SA-6',
    orderId: 'ORD-10019',
    makerShopName: 'Cane & Bamboo Crafts',
    makerId: 'm-10',
    type: 'rto',
    description: 'Customer refused delivery. Shipment returning to origin.',
    severity: 'medium',
    createdAt: '2025-06-12T11:00:00Z'
  },
  {
    id: 'SA-7',
    orderId: 'ORD-10018',
    makerShopName: 'Bidri Art Studio',
    makerId: 'm-9',
    type: 'rto',
    description: 'Address unreachable.',
    severity: 'low',
    createdAt: '2025-06-12T12:00:00Z'
  },
  {
    id: 'SA-8',
    orderId: 'ORD-10008',
    makerShopName: 'Kashmiri Embroideries',
    makerId: 'm-4',
    type: 'scan-delay',
    description: 'No movement scan for 24 hours after pickup.',
    severity: 'low',
    createdAt: '2025-06-12T13:00:00Z'
  }
];

export const mockFlaggedListings: FlaggedListing[] = [
  {
    id: 'FL-1',
    listingId: 'l-101',
    productName: 'Copyrighted Art Print',
    makerShopName: 'Modern Clay',
    makerId: 'm-5',
    flagReason: 'copyright',
    flaggedAt: '2025-06-05T10:00:00Z',
    flaggedBy: 'system',
    status: 'open'
  },
  {
    id: 'FL-2',
    listingId: 'l-102',
    productName: 'Mass Produced Mug',
    makerShopName: 'Meera\'s Clay Studio',
    makerId: 'm-1',
    flagReason: 'not-handmade',
    flaggedAt: '2025-06-07T11:30:00Z',
    flaggedBy: 'buyer',
    status: 'open'
  },
  {
    id: 'FL-3',
    listingId: 'l-103',
    productName: 'Misleading Dimensions Rug',
    makerShopName: 'Phulkari Hub',
    makerId: 'm-6',
    flagReason: 'misleading',
    flaggedAt: '2025-06-08T09:15:00Z',
    flaggedBy: 'buyer',
    status: 'reviewed',
    adminAction: 'Warning sent to maker'
  },
  {
    id: 'FL-4',
    listingId: 'l-104',
    productName: 'Banned Material Item',
    makerShopName: 'Royal Silk Weaves',
    makerId: 'm-2',
    flagReason: 'prohibited',
    flaggedAt: '2025-06-09T14:00:00Z',
    flaggedBy: 'system',
    status: 'delisted',
    adminAction: 'Listing removed'
  },
  {
    id: 'FL-5',
    listingId: 'l-105',
    productName: 'No Material Notice Saree',
    makerShopName: 'Kashmiri Embroideries',
    makerId: 'm-4',
    flagReason: 'no-material-notice',
    flaggedAt: '2025-06-10T16:45:00Z',
    flaggedBy: 'system',
    status: 'open'
  }
];

export const mockTCSMonthly: AdminTCSMonth[] = [
  { month: 'Jan 2025', totalGrossSales: 1083400, totalTCSCollected: 10834, makerCount: 30, averagePerMaker: 361 },
  { month: 'Feb 2025', totalGrossSales: 1150000, totalTCSCollected: 11500, makerCount: 32, averagePerMaker: 359 },
  { month: 'Mar 2025', totalGrossSales: 1280000, totalTCSCollected: 12800, makerCount: 34, averagePerMaker: 376 },
  { month: 'Apr 2025', totalGrossSales: 1420000, totalTCSCollected: 14200, makerCount: 35, averagePerMaker: 405 },
  { month: 'May 2025', totalGrossSales: 1560000, totalTCSCollected: 15600, makerCount: 38, averagePerMaker: 410 },
  { month: 'Jun 2025', totalGrossSales: 1245800, totalTCSCollected: 12458, makerCount: 38, averagePerMaker: 327 }
];

export const mockWeightMismatches: WeightMismatch[] = [
  {
    id: 'WM-1',
    orderId: 'ORD-10010',
    makerShopName: 'Royal Silk Weaves',
    makerId: 'm-2',
    declaredWeight: 500,
    billedWeight: 800,
    overageGrams: 300,
    overageShippingCost: 45,
    deducted: true,
    deductedAt: '2025-06-11T10:00:00Z',
    makerStrikeCount: 1,
    date: '2025-06-10T14:00:00Z'
  },
  {
    id: 'WM-2',
    orderId: 'ORD-10015',
    makerShopName: 'Phulkari Hub',
    makerId: 'm-6',
    declaredWeight: 500,
    billedWeight: 1000,
    overageGrams: 500,
    overageShippingCost: 85,
    deducted: true,
    deductedAt: '2025-06-12T09:00:00Z',
    makerStrikeCount: 2,
    date: '2025-06-11T16:00:00Z'
  },
  {
    id: 'WM-3',
    orderId: 'ORD-10020',
    makerShopName: 'Meera\'s Clay Studio',
    makerId: 'm-1',
    declaredWeight: 1000,
    billedWeight: 1200,
    overageGrams: 200,
    overageShippingCost: 30,
    deducted: false,
    makerStrikeCount: 0,
    date: '2025-06-12T11:00:00Z'
  },
  {
    id: 'WM-4',
    orderId: 'ORD-10025',
    makerShopName: 'Dhokra Artifacts',
    makerId: 'm-3',
    declaredWeight: 2000,
    billedWeight: 2300,
    overageGrams: 300,
    overageShippingCost: 55,
    deducted: false,
    makerStrikeCount: 0,
    date: '2025-06-12T12:00:00Z'
  },
  {
    id: 'WM-5',
    orderId: 'ORD-10030',
    makerShopName: 'Kashmiri Embroideries',
    makerId: 'm-4',
    declaredWeight: 300,
    billedWeight: 500,
    overageGrams: 200,
    overageShippingCost: 25,
    deducted: false,
    makerStrikeCount: 0,
    date: '2025-06-12T13:00:00Z'
  },
  {
    id: 'WM-6',
    orderId: 'ORD-10035',
    makerShopName: 'Modern Clay',
    makerId: 'm-5',
    declaredWeight: 800,
    billedWeight: 1100,
    overageGrams: 300,
    overageShippingCost: 45,
    deducted: false,
    makerStrikeCount: 0,
    date: '2025-06-12T14:00:00Z'
  },
  {
    id: 'WM-7',
    orderId: 'ORD-10040',
    makerShopName: 'Phulkari Hub',
    makerId: 'm-6',
    declaredWeight: 400,
    billedWeight: 600,
    overageGrams: 200,
    overageShippingCost: 30,
    deducted: false,
    makerStrikeCount: 1,
    date: '2025-06-12T15:00:00Z'
  },
  {
    id: 'WM-8',
    orderId: 'ORD-10045',
    makerShopName: 'Royal Silk Weaves',
    makerId: 'm-2',
    declaredWeight: 1500,
    billedWeight: 1800,
    overageGrams: 300,
    overageShippingCost: 50,
    deducted: false,
    makerStrikeCount: 1,
    date: '2025-06-12T16:00:00Z'
  }
];
