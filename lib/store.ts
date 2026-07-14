import { Product, SellerProfile, Order, KYCSubmission, Notification, NewsletterCampaign, User } from './types';

// Seed data representing real Niamey/Niger premium landscape
export const SEED_SELLERS: SellerProfile[] = [
  {
    id: 'seller-alaza',
    name: 'Alaza Luxe',
    description: 'La référence du prêt-à-porter traditionnel et moderne haut de gamme à Niamey. Créations exclusives en Bazin Riche et tissus d\'apparat.',
    logo: 'https://picsum.photos/seed/alaza/120/120',
    banner: 'https://picsum.photos/seed/alazaban/1200/400',
    rating: 4.9,
    reviewCount: 28,
    city: 'Niamey',
    address: 'Avenue du Plateau, face Ambassade de France, Niamey',
    phone: '+227 96 44 22 11',
    isVerified: true,
    createdAt: '2025-01-10'
  },
  {
    id: 'seller-sahel',
    name: 'Sahel Art & Design',
    description: 'Coopérative d\'artisans d\'art d\'excellence du Niger. Sandales Touareg cousues main, bijoux en argent d\'Agadez et maroquinerie en cuir fin.',
    logo: 'https://picsum.photos/seed/sahel/120/120',
    banner: 'https://picsum.photos/seed/sahelban/1200/400',
    rating: 4.8,
    reviewCount: 19,
    city: 'Niamey',
    address: 'Quartier Nouveau Marché, Galerie d\'Art Zando, Niamey',
    phone: '+227 90 25 35 45',
    isVerified: true,
    createdAt: '2025-02-15'
  },
  {
    id: 'seller-dounia',
    name: 'Dounia HighTech',
    description: 'Spécialiste de la revente d\'appareils électroniques haut de gamme importés et garantis. Apple, Samsung et accessoires premium.',
    logo: 'https://picsum.photos/seed/dounia/120/120',
    banner: 'https://picsum.photos/seed/douniaban/1200/400',
    rating: 4.7,
    reviewCount: 42,
    city: 'Niamey',
    address: 'Rue des Banques, Immeuble Horizon, Niamey',
    phone: '+227 92 88 77 66',
    isVerified: true,
    createdAt: '2025-03-01'
  },
  {
    id: 'seller-nature',
    name: 'Sahel Bio & Soins',
    description: 'Cosmétiques naturels haut de gamme du Niger. Huiles rares de Dattier du Désert, beurre de karité premium purifié et huiles de Moringa.',
    logo: 'https://picsum.photos/seed/nature/120/120',
    banner: 'https://picsum.photos/seed/natureban/1200/400',
    rating: 4.9,
    reviewCount: 14,
    city: 'Niamey',
    address: 'Quartier Plateau, Villa 410, Niamey',
    phone: '+227 99 12 34 56',
    isVerified: false, // For testing verification flow
    createdAt: '2026-05-18'
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-boubou',
    name: 'Boubou d\'Apparat en Bazin Riche',
    description: 'Exceptionnel boubou traditionnel brodé à la main par nos maîtres artisans. Tissu Bazin Getzner de première qualité, teinté artisanalement à Niamey. Une pièce d\'exception pour les grandes occasions.',
    price: 185000,
    category: 'Mode & Luxe',
    images: [
      'https://picsum.photos/seed/boubou1/600/600',
      'https://picsum.photos/seed/boubou2/600/600'
    ],
    sellerId: 'seller-alaza',
    sellerName: 'Alaza Luxe',
    sellerVerified: true,
    stock: 3,
    rating: 4.9,
    createdAt: '2026-01-15',
    reviews: [
      { id: 'rev-1', userName: 'Amadou Diallo', rating: 5, comment: 'La qualité du Bazin et de la broderie est incomparable. Un vrai travail d\'orfèvre !', date: '2026-06-12' },
      { id: 'rev-2', userName: 'Mariama Idrissa', rating: 4, comment: 'Très beau tombé, parfait pour le mariage de mon frère.', date: '2026-07-02' }
    ]
  },
  {
    id: 'prod-sandales',
    name: 'Sandales Touareg Royales en Cuir',
    description: 'Sandales traditionnelles touareg en cuir noble tanné localement. Finitions de couleur ocre et broderies traditionnelles réalisées à la main. Semelle ultra robuste et confortable adaptée au climat chaud.',
    price: 35000,
    category: 'Artisanat d\'Art du Niger',
    images: [
      'https://picsum.photos/seed/sandals1/600/600',
      'https://picsum.photos/seed/sandals2/600/600'
    ],
    sellerId: 'seller-sahel',
    sellerName: 'Sahel Art & Design',
    sellerVerified: true,
    stock: 12,
    rating: 4.8,
    createdAt: '2026-02-20',
    reviews: [
      { id: 'rev-3', userName: 'Moustapha S.', rating: 5, comment: 'Très confortables et d\'une solidité remarquable. Je recommande vivement.', date: '2026-06-25' }
    ]
  },
  {
    id: 'prod-iphone',
    name: 'iPhone 15 Pro Max (256 Go) Titanium',
    description: 'Neuf sous blister, importé d\'Europe. Garantie constructeur 12 mois. Disponible immédiatement dans notre boutique à Niamey ou en livraison sécurisée.',
    price: 850000,
    category: 'Électronique & High-Tech',
    images: [
      'https://picsum.photos/seed/iphone1/600/600',
      'https://picsum.photos/seed/iphone2/600/600'
    ],
    sellerId: 'seller-dounia',
    sellerName: 'Dounia HighTech',
    sellerVerified: true,
    stock: 5,
    rating: 4.6,
    createdAt: '2026-04-10',
    reviews: [
      { id: 'rev-4', userName: 'Fatimata K.', rating: 5, comment: 'Transaction impeccable, produit authentique et vendeur professionnel !', date: '2026-05-15' }
    ]
  },
  {
    id: 'prod-dattier',
    name: 'Huile de Dattier du Désert Bio',
    description: 'Élixir de beauté naturel pressé à froid à Niamey. Idéal pour revitaliser les peaux sèches et fortifier les cheveux. 100% pur, sans additifs ni parfum artificiel. Flacon en verre ambré de 100ml.',
    price: 12000,
    category: 'Beauté, Cosmétiques & Soins',
    images: [
      'https://picsum.photos/seed/oil1/600/600',
      'https://picsum.photos/seed/oil2/600/600'
    ],
    sellerId: 'seller-nature',
    sellerName: 'Sahel Bio & Soins',
    sellerVerified: false,
    stock: 25,
    rating: 5.0,
    createdAt: '2026-05-20',
    reviews: [
      { id: 'rev-5', userName: 'Zeneba O.', rating: 5, comment: 'Ma peau adore ! L\'huile pénètre très vite sans laisser de film gras.', date: '2026-06-18' }
    ]
  },
  {
    id: 'prod-collier',
    name: 'Collier Croix d\'Agadez en Argent Fin',
    description: 'Bijou traditionnel d\'exception ciselé par les maîtres bijoutiers d\'Agadez. Argent 925 certifié et gravures traditionnelles complexes symbolisant la guidance. Livré dans un coffret écrin Zando.',
    price: 65000,
    category: 'Artisanat d\'Art du Niger',
    images: [
      'https://picsum.photos/seed/necklace1/600/600'
    ],
    sellerId: 'seller-sahel',
    sellerName: 'Sahel Art & Design',
    sellerVerified: true,
    stock: 4,
    rating: 4.9,
    createdAt: '2026-03-05',
    reviews: []
  },
  {
    id: 'prod-macbook',
    name: 'MacBook Pro 14" Apple M3 Pro',
    description: '18 Go de RAM, 512 Go de SSD. Version AZERTY Clavier français. Neuf en boîte scellée, garantie Apple. Le nec plus ultra pour les professionnels et créateurs à Niamey.',
    price: 1750000,
    category: 'Électronique & High-Tech',
    images: [
      'https://picsum.photos/seed/macbook1/600/600'
    ],
    sellerId: 'seller-dounia',
    sellerName: 'Dounia HighTech',
    sellerVerified: true,
    stock: 2,
    rating: 4.9,
    createdAt: '2026-04-12',
    reviews: []
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ZA-4829',
    buyerId: 'user-buyer-1',
    buyerName: 'Fatimata Diallo',
    buyerEmail: 'beidoufadimatou1998@gmail.com',
    buyerPhone: '+227 96 00 11 22',
    buyerAddress: 'Quartier Plateau, Rue des Ambassades, Niamey',
    items: [
      {
        productId: 'prod-boubou',
        productName: 'Boubou d\'Apparat en Bazin Riche',
        price: 185000,
        quantity: 1,
        image: 'https://picsum.photos/seed/boubou1/150/150',
        sellerId: 'seller-alaza'
      }
    ],
    totalAmount: 185000,
    status: 'delivered',
    createdAt: '2026-07-01T14:30:00Z'
  },
  {
    id: 'ZA-5120',
    buyerId: 'user-buyer-1',
    buyerName: 'Fatimata Diallo',
    buyerEmail: 'beidoufadimatou1998@gmail.com',
    buyerPhone: '+227 96 00 11 22',
    buyerAddress: 'Quartier Plateau, Rue des Ambassades, Niamey',
    items: [
      {
        productId: 'prod-sandales',
        productName: 'Sandales Touareg Royales en Cuir',
        price: 35000,
        quantity: 1,
        image: 'https://picsum.photos/seed/sandals1/150/150',
        sellerId: 'seller-sahel'
      },
      {
        productId: 'prod-dattier',
        productName: 'Huile de Dattier du Désert Bio',
        price: 12000,
        quantity: 2,
        image: 'https://picsum.photos/seed/oil1/150/150',
        sellerId: 'seller-nature'
      }
    ],
    totalAmount: 59000,
    status: 'processing',
    createdAt: '2026-07-12T09:15:00Z'
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-buyer-1',
    title: 'Bienvenue sur Zando',
    content: 'Merci d\'avoir rejoint la marketplace premium du Niger. Votre compte est actif !',
    isRead: false,
    createdAt: '2026-07-13T08:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-buyer-1',
    title: 'Commande expédiée',
    content: 'Votre commande #ZA-4829 a été livrée avec succès par notre équipe de coursiers.',
    isRead: true,
    createdAt: '2026-07-02T16:00:00Z'
  }
];

export const SEED_KYC: KYCSubmission[] = [
  {
    id: 'kyc-1',
    sellerId: 'seller-nature',
    sellerName: 'Sahel Bio & Soins',
    email: 'contact@sahelbio.ne',
    documentType: 'Registre de Commerce (RCCM)',
    documentNumber: 'NE-NIM-2026-B-1294',
    submittedAt: '2026-07-11T11:00:00Z',
    status: 'pending'
  }
];

export const SEED_CAMPAIGNS: NewsletterCampaign[] = [
  {
    id: 'camp-1',
    subject: 'Lancement de la Collection Bazin Prestige d\'Alaza Luxe',
    content: 'Découvrez en exclusivité les nouvelles pièces de haute couture traditionnelle confectionnées à Niamey pour la fête de Tabaski.',
    recipientsCount: 450,
    sentAt: '2026-07-05T10:00:00Z'
  }
];

// LocalStorage helpers to load/save state
export const getStoredState = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(`zando_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading localStorage state for key', key, error);
    return defaultValue;
  }
};

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

export const setStoredState = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  // If Supabase is configured, we shouldn't cache massive lists in localStorage. Only keep local cart.
  if (isSupabaseConfigured && key !== 'cart') return;
  
  try {
    window.localStorage.setItem(`zando_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage state for key', key, error);
  }
};
