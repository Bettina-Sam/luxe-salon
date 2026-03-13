// src/data/pricing.js
export const pricingMeta = {
  currency: '₹',
  gstNote: '+ GST as applicable',
};

export const categories = [
  {
    title: 'Hair',
    items: [
      {
        id: 'haircut-style',
        name: 'Haircut + Styling',
        duration: '30–45 min',
        prices: { Women: 699, Men: 399 },
        notes: ['Shampoo & quick blow-dry included for Women'],
      },
      {
        id: 'global-color',
        name: 'Global Hair Color (ammonia-free)',
        duration: '120–150 min',
        prices: { Women: 2899, Men: 1999 },
        notes: ['Toner add-on recommended for tone correction'],
      },
      {
        id: 'keratin-smooth',
        name: 'Keratin / Smoothening (short-medium)',
        duration: '2–3 hrs',
        prices: { Women: 3999, Men: 2999 },
        notes: ['Free post-care guide'],
      },
    ],
  },
  {
    title: 'Skin & Facial',
    items: [
      {
        id: 'hydra-glow',
        name: 'Hydra Glow Facial',
        duration: '60–75 min',
        prices: { Women: 1999, Men: 1799 },
        notes: ['Zero-downtime; event-safe'],
      },
      {
        id: 'acne-defense',
        name: 'Acne Defense Facial',
        duration: '60 min',
        prices: { Women: 1499, Men: 1399 },
      },
      {
        id: 'bright-c',
        name: 'Bright-C Facial',
        duration: '60 min',
        prices: { Women: 1599, Men: 1499 },
      },
    ],
  },
  {
    title: 'Bridal',
    items: [
      {
        id: 'bridal-makeup',
        name: 'Bridal Makeup (HD)',
        duration: '90–120 min',
        prices: { Women: 6499, Men: 0 }, // Men N/A → will be hidden automatically
        notes: ['Includes hairstyle & basic drape'],
      },
      {
        id: 'saree-drape',
        name: 'Saree Draping',
        duration: '20–30 min',
        prices: { Women: 699, Men: 0 },
      },
    ],
  },
  {
    title: 'Spa',
    items: [
      {
        id: 'aroma-head',
        name: 'Aroma Head Massage',
        duration: '20 min',
        prices: { Women: 499, Men: 499 },
        notes: ['Lavender / Citrus / Eucalyptus'],
      },
    ],
  },
];

export const addons = [
  { id: 'hair-spa', name: 'Hair Spa Boost', price: 799, duration: '25 min' },
  { id: 'color-toner', name: 'Color Toner', price: 499, duration: '15 min' },
  { id: 'brow-shape', name: 'Brow Shaping', price: 199, duration: '10 min' },
];
