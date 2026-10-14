// Asset paths helper for product and avatar images
import p1 from '../assets/images/product-1.png';
import p2 from '../assets/images/product-2.png';
import p3 from '../assets/images/product-3.png';
import p4 from '../assets/images/product-4.png';
import p5 from '../assets/images/product-5.png';
import p6 from '../assets/images/product-6.png';
import p7 from '../assets/images/product-7.png';
import p8 from '../assets/images/product-8.png';
import p9 from '../assets/images/product-9.png';
import p10 from '../assets/images/product-10.png';

import avatar1 from '../assets/images/avatar/avatar-1.jpg';
import avatar2 from '../assets/images/avatar/avatar-2.jpg';
import avatar4 from '../assets/images/avatar/avatar-4.jpg';

export const initialProducts = [
  {
    id: 1,
    name: 'Gaming Joy Stick',
    code: 'PRD001',
    category: 'Electronics',
    brand: 'Brand Name',
    price: 99.99,
    unit: 'pcs',
    quantity: 150,
    image: p1,
    salesPercentage: 32,
    unitsSold: 5420,
  },
  {
    id: 2,
    name: 'Wireless Earphones',
    code: 'PRD002',
    category: 'Electronics',
    brand: 'Tech Pro',
    price: 89.99,
    unit: 'pcs',
    quantity: 320,
    image: p2,
    salesPercentage: 18,
    unitsSold: 1250,
  },
  {
    id: 3,
    name: 'Smart Watch Pro',
    code: 'PRD003',
    category: 'Electronics',
    brand: 'Tech Pro',
    price: 98.00,
    unit: 'pcs',
    quantity: 200,
    image: p3,
    salesPercentage: 22,
    unitsSold: 862,
  },
  {
    id: 4,
    name: 'USB-C Fast Charger',
    code: 'PRD004',
    category: 'Electronics',
    brand: 'Tech Pro',
    price: 86.00,
    unit: 'pcs',
    quantity: 80,
    image: p4,
    salesPercentage: 28,
    unitsSold: 3200,
  },
  {
    id: 5,
    name: 'Portable Bluetooth Speaker',
    code: 'PRD005',
    category: 'Electronics',
    brand: 'Tech Pro',
    price: 32.00,
    unit: 'pcs',
    quantity: 110,
    image: p5,
    salesPercentage: 25,
    unitsSold: 2890,
  },
  {
    id: 6,
    name: 'Magic Keyboard',
    code: 'PRD006',
    category: 'Electronics',
    brand: 'Tech Pro',
    price: 49.00,
    unit: 'pcs',
    quantity: 14,
    image: p6,
    salesPercentage: 15,
    unitsSold: 1100,
  },
  {
    id: 7,
    name: 'MacBook Pro 16"',
    code: 'PRD007',
    category: 'Electronics',
    brand: 'Apple',
    price: 2499.00,
    unit: 'pcs',
    quantity: 25,
    image: p7,
    salesPercentage: 40,
    unitsSold: 450,
  },
  {
    id: 8,
    name: 'Wireless Headphones',
    code: 'PRD008',
    category: 'Electronics',
    brand: 'SoundMaster',
    price: 129.99,
    unit: 'pcs',
    quantity: 6,
    image: p8,
    salesPercentage: 14,
    unitsSold: 134,
  },
  {
    id: 9,
    name: 'AirPods Pro Max',
    code: 'PRD009',
    category: 'Electronics',
    brand: 'Apple',
    price: 549.00,
    unit: 'pcs',
    quantity: 18,
    image: p9,
    salesPercentage: 20,
    unitsSold: 320,
  },
  {
    id: 10,
    name: 'Phone Screen Protector',
    code: 'PRD010',
    category: 'Accessories',
    brand: 'ShieldGuard',
    price: 15.00,
    unit: 'pcs',
    quantity: 3,
    image: p10,
    salesPercentage: 10,
    unitsSold: 500,
  },
];

export const initialNotifications = [
  {
    id: 1,
    title: 'New order received',
    subtitle: 'Order #12345 has been placed',
    time: '5 minutes ago',
    avatar: avatar1,
  },
  {
    id: 2,
    title: 'New user registered',
    subtitle: 'User @john_doe has signed up',
    time: '30 minutes ago',
    avatar: avatar4,
  },
  {
    id: 3,
    title: 'Payment confirmed',
    subtitle: 'Payment of $299 has been received',
    time: '1 hour ago',
    avatar: avatar2,
  },
];

export const userProfile = {
  name: 'Shrina Tesla',
  username: '@imshrina',
  avatar: avatar1,
};

export const lowStockProductsMock = [
  { id: 8, name: 'Wireless Headphones', sku: '#554433', inStock: 6, image: p8 },
  { id: 4, name: 'USB-C Cable Pack', sku: '#887766', inStock: 9, image: p4 },
  { id: 10, name: 'Phone Screen Protector', sku: '#332211', inStock: 3, image: p10 },
  { id: 11, name: 'Portable Charger 20000mAh', sku: '#998877', inStock: 7, image: p4 },
  { id: 6, name: 'Mechanical Keyboard RGB', sku: '#665544', inStock: 2, image: p6 },
];

export const recentSalesMock = [
  { id: 7, name: 'MacBook Pro 16"', category: 'Computers', price: '$2,499', status: 'Completed', badgeClass: 'bg-success-subtle text-success', image: p7 },
  { id: 9, name: 'AirPods Pro Max', category: 'Audio', price: '$549', status: 'Processing', badgeClass: 'bg-primary-subtle text-primary', image: p9 },
  { id: 8, name: 'iPad Air 11"', category: 'Tablets', price: '$799', status: 'Completed', badgeClass: 'bg-success-subtle text-success', image: p8 },
  { id: 3, name: 'Apple Watch Ultra', category: 'Wearables', price: '$799', status: 'Pending', badgeClass: 'bg-warning-subtle text-warning', image: p3 },
  { id: 6, name: 'Magic Keyboard', category: 'Accessories', price: '$299', status: 'Cancelled', badgeClass: 'bg-danger-subtle text-danger', image: p6 },
];
