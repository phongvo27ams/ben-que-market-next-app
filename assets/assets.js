import { ClockFadingIcon, HeadsetIcon, SendIcon } from "lucide-react";

import upload_area from "./upload_area.svg";

import hero_model_img from "./hero_model_img.png";

import hero_product_img1 from "./hero_product_img1.png";
import hero_product_img2 from "./hero_product_img2.png";

import product_img1 from "./product_img1.png";
import product_img2 from "./product_img2.png";
import product_img3 from "./product_img3.png";
import product_img4 from "./product_img4.png";
import product_img5 from "./product_img5.png";
import product_img6 from "./product_img6.png";
import product_img7 from "./product_img7.png";
import product_img8 from "./product_img8.png";
import product_img9 from "./product_img9.png";
import product_img10 from "./product_img10.png";
import product_img11 from "./product_img11.png";
import product_img12 from "./product_img12.png";

import profile_pic1 from "./profile_pic1.png";
import profile_pic2 from "./profile_pic2.png";
import profile_pic3 from "./profile_pic3.png";

import store_logo_1 from "./store_logo_1.webp";
import store_logo_2 from "./store_logo_2.webp";

export const assets = {
  upload_area, hero_model_img,
  hero_product_img1, hero_product_img2,
  product_img1, product_img2, product_img3, product_img4, product_img5, product_img6,
  product_img7, product_img8, product_img9, product_img10, product_img11, product_img12,
}

export const categories = ["Đặc sản thực phẩm khô", "Trái cây đặc sản theo mùa", "Đồ ăn chế biến sẵn", "Đồ uống tự nhiên", "Đồ thủ công mỹ nghệ", "Quà lưu niệm"];

export const dummyRatingsData = [
  {
    id: "rat_1",
    rating: 4.2,
    review: "I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it's easy to use, and it delivers exactly what was promised. I've already recommended it to friends and will definitely purchase again in the future.",
    user: {
      name: 'Kristin Watson',
      image: profile_pic1
    },
    productId: "prod_1",
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
    product: {
      name: 'Bluetooth Speakers',
      category: 'Electronics',
      id: 'prod_1'
    }
  },
  {
    id: "rat_2",
    rating: 5.0,
    review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.",
    user: {
      name: 'Jenny Wilson',
      image: profile_pic2
    },
    productId: "prod_2",
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
    product: {
      name: 'Bluetooth Speakers',
      category: 'Electronics',
      id: 'prod_1'
    }
  },
  {
    id: "rat_3",
    rating: 4.1,
    review: "This product is amazing. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.",
    user: {
      name: 'Bessie Cooper',
      image: profile_pic3
    },
    productId: "prod_3",
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
    product: {
      name: 'Bluetooth Speakers',
      category: 'Electronics',
      id: 'prod_1'
    }
  },
  {
    id: "rat_4",
    rating: 5.0,
    review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.",
    user: {
      name: 'Kristin Watson',
      image: profile_pic1
    },
    productId: "prod_4",
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
    product: {
      name: 'Bluetooth Speakers',
      category: 'Electronics',
      id: 'prod_1'
    }
  },
  {
    id: "rat_5",
    rating: 4.3,
    review: "Overall, I'm very happy with this purchase. It works as described and feels durable. The only reason I didn't give it five stars is because of a small issue (such as setup taking a bit longer than expected, or packaging being slightly damaged). Still, highly recommend it for anyone looking for a reliable option.",
    user: {
      name: 'Jenny Wilson',
      image: profile_pic2
    },
    productId: "prod_5",
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
    product: {
      name: 'Bluetooth Speakers',
      category: 'Electronics',
      id: 'prod_1'
    }
  },
  {
    id: "rat_6",
    rating: 5.0,
    review: "This product is great. I love it!  You made it so simple. My new site is so much faster and easier to work with than my old site.",
    user: {
      name: 'Bessie Cooper',
      image: profile_pic3
    },
    productId: "prod_6",
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
    product: {
      name: 'Bluetooth Speakers',
      category: 'Electronics',
      id: 'prod_1'
    }
  },
]

export const dummyStoreData = [
  {
    id: "store_1",
    userId: "user_1",
    name: "Lumina & Sonic Labs",
    description: "At Lumina & Sonic Labs, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
    username: "happyshop",
    address: "252 Sunny Street, Pleasantville, CA 90210",
    status: "approved",
    isActive: true,
    logo: store_logo_1,
    email: "happyshop@example.com",
    contact: "+0 1234567890",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
      id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      name: "Great Stack",
      email: "user.greatstack@gmail.com",
      image: profile_pic1,
    }
  },
  {
    id: "store_2",
    userId: "user_2",
    name: "UrbanPulse Gear",
    description: "Your go-to hub for the latest tech trends. From rugged speakers to colorful smart accessories, we fuel your energetic lifestyle with gadgets that keep up with your beat. Tech that moves with you, wherever you go.",
    username: "happyshop",
    address: "88 Retro Boulevard, Ground Floor Brooklyn, NY 11211",
    status: "approved",
    isActive: true,
    logo: store_logo_1,
    email: "happyshop@example.com",
    contact: "+0 1234567890",
    createdAt: "2025-09-04T09:04:16.189Z",
    updatedAt: "2025-09-04T09:04:44.273Z",
    user: {
      id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
      name: "Great Stack",
      email: "user.greatstack@gmail.com",
      image: profile_pic1,
    }
  },
]

export const productDummyData = [
  {
    id: "prod_1",
    name: "SonicStream Pro ANC Earbuds",
    description: "Experience silence and sound in perfect harmony. The SonicStream Pro features industry-leading Active Noise Cancellation to block out the world, while Transparency mode lets you hear what matters. Designed with a custom high-excursion driver for powerful bass and clear highs, these earbuds offer a secure, ergonomic fit and over 24 hours of battery life with the wireless charging case.",
    mrp: 20.00,
    price: 17.00,
    images: [product_img9, product_img9, product_img9, product_img9],
    category: "Earbuds",
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    rating: dummyRatingsData,
    createdAt: 'Sat Jul 29 2025 14:51:25',
    updatedAt: 'Sat Jul 29 2025 14:51:25',
  },
  {
    id: "prod_2",
    name: "ChronoFit X-Series Smartwatch",
    description: "The ChronoFit X-Series is where precision meets wellness. Featuring an always-on display and advanced health monitoring, including heart rate tracking and sleep analysis, this watch is your sophisticated companion for a better lifestyle. Its durable aerospace-grade aluminum casing and fluid OS make it the essential piece of technology on your wrist.",
    mrp: 400.00,
    price: 359.00,
    images: [product_img10],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Smartwatch",
    rating: dummyRatingsData,
    createdAt: 'Sat Jul 28 2025 14:51:25',
    updatedAt: 'Sat Jul 28 2025 14:51:25',
  },
  {
    id: "prod_3",
    name: "Luminos Balance Lamp",
    description: "Elevate your space with the Luminos Balance Lamp, a statement piece of minimalist design. Its elegant cylindrical stem and brushed metal base provide stable support for the softly diffused light, creating a warm, inviting ambiance. Perfect for executive desks or bedside tables, the Luminos offers seamless touch control dimming for refined lighting management.",
    mrp: 170.00,
    price: 149.00,
    images: [product_img1],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Lamp",
    rating: dummyRatingsData,
    createdAt: 'Sat Jul 27 2025 14:51:25',
    updatedAt: 'Sat Jul 27 2025 14:51:25',
  },
  {
    id: "prod_4",
    name: "Aether Voice Sphere Speaker",
    description: "The Aether Voice Sphere is the centerpiece of modern audio. Encased in premium acoustic fabric, this smart speaker delivers immersive 360-degree sound and sophisticated voice assistant capabilities. Its seamless design, highlighted by a subtle ambient light base, blends effortlessly into any high-end interior while providing crystal-clear sound reproduction for music and communication.",
    mrp: 320.00,
    price: 299.00,
    images: [product_img2],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Speaker",
    rating: dummyRatingsData,
    createdAt: 'Sat Jul 26 2025 14:51:25',
    updatedAt: 'Sat Jul 26 2025 14:51:25',
  },
  {
    id: "prod_5",
    name: "Sentinel Pro 360 Smart Camera (Dual Pack)",
    description: "Achieve total peace of mind with the Sentinel Pro 360. This smart indoor camera system offers crystal-clear 2K video resolution, 360-degree pan/tilt coverage, and advanced AI-powered motion detection that differentiates between people and pets. Easily connect to your smart home ecosystem and access secure cloud storage for complete, reliable monitoring.",
    mrp: 170.00,
    price: 159.00,
    images: [product_img6],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Camera",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 25 2025 14:51:25',
    updatedAt: 'Sat Jul 25 2025 14:51:25',
  },
  {
    id: "prod_6",
    name: "VibeBoost Party Speaker",
    description: "Get the party started anywhere with the VibeBoost Speaker. This compact powerhouse features dynamic LED light effects that sync to the rhythm of your music and a deep bass response to fuel your next get-together. With a strong carry loop and easy-to-use buttons, it’s the ultimate portable speaker for beach trips, picnics, or backyard fun.",
    mrp: 89.00,
    price: 79.00,
    images: [product_img6],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Speaker",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 25 2025 14:51:25',
    updatedAt: 'Sat Jul 25 2025 14:51:25',
  },
  {
    id: "prod_7",
    name: "PulseGo Sport Smartwatch",
    description: "Track every move and stay connected with the PulseGo Sport Watch. Built for action, it features a rugged, water-resistant design and multiple sport modes to accurately measure your workouts. Get real-time notifications, control your music, and enjoy long battery life so you never miss a beat, whether you’re on the trail or in the pool.",
    mrp: 250.00,
    price: 239.00,
    images: [product_img3],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Smartwatch",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 24 2025 14:51:25',
    updatedAt: 'Sat Jul 24 2025 14:51:25',
  },
  {
    id: "prod_8",
    name: "Acoustic Zenith Noise-Cancelling Headphones",
    description: "Dive into unparalleled sound isolation and audio clarity. The Acoustic Zenith headphones utilize adaptive noise-cancelling technology to create a sanctuary of sound, allowing you to focus on the nuanced details of your music. Crafted with plush memory foam earcups and a lightweight frame, they provide exceptional comfort for long listening sessions and boast up to 30 hours of playtime.",
    mrp: 449.00,
    price: 419.00,
    images: [product_img4],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Headphones",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 23 2025 14:51:25',
    updatedAt: 'Sat Jul 23 2025 14:51:25',
  },
  {
    id: "prod_9",
    name: "Precision Slate Digital Pen",
    description: "Unleash your creativity with the Precision Slate Digital Pen. Engineered with pixel-perfect accuracy and pressure sensitivity, this stylus provides a natural, fluid writing and drawing experience. The magnetic attachment and elegant matte finish ensure it feels like a seamless extension of your tablet, making it an essential tool for digital artists and note-takers.",
    mrp: 129.00,
    price: 99.00,
    images: [product_img7],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Pen",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 22 2025 14:51:25',
    updatedAt: 'Sat Jul 22 2025 14:51:25',
  },
  {
    id: "prod_10",
    name: "CinemaPro Atmos 4.1 System",
    description: "Transform your living room into a cinematic experience with the CinemaPro Atmos 4.1 System. This soundbar, paired with a powerful wireless subwoofer and two satellite speakers, delivers expansive Dolby Atmos audio that fills the room. Its sleek, low-profile design and seamless connectivity options make it the ideal, high-fidelity upgrade for any modern entertainment setup.",
    mrp: 599.00,
    price: 529.00,
    images: [product_img8],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Cinema",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 21 2025 14:51:25',
    updatedAt: 'Sat Jul 21 2025 14:51:25',
  },
  {
    id: "prod_11",
    name: "PocketGlide Multi-Device Mouse",
    description: "Seamlessly switch between your laptop, tablet, and desktop with the PocketGlide Multi-Device Mouse. Its compact, ambidextrous design makes it perfect for travel, while the reliable wireless connection ensures minimal lag. It features silent clicks and a long-lasting battery, making it an ideal companion for students and anyone working on the go.",
    mrp: 59.00,
    price: 39.00,
    images: [product_img11],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Mouse",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 20 2025 14:51:25',
    updatedAt: 'Sat Jul 20 2025 14:51:25',
  },
  {
    id: "prod_12",
    name: "AuraClean Pro X10 Laser Navigator",
    description: "Experience autonomous cleaning perfection with the AuraClean Pro X10. Featuring cutting-edge LiDAR navigation, this 2-in-1 robot precisely maps your home for optimal path planning and zone cleaning. Its powerful suction and intelligent mopping system handle deep messes on all floor types, while the sleek, dark-metal finish adds a touch of elegance to your smart home ecosystem.",
    mrp: 549.00,
    price: 529.00,
    images: [product_img12],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Cleaner",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: 'Sat Jul 19 2025 14:51:25',
    updatedAt: 'Sat Jul 19 2025 14:51:25',
  }
];

export const ourSpecsData = [
  {
    title: "Miễn phí giao hàng",
    description: "Tận hưởng dịch vụ giao hàng nhanh chóng, miễn phí và giao hàng tận nhà đáng tin cậy.",
    icon: SendIcon,
    accent: '#05DF72'
  },
  {
    title: "Đóng gói chuẩn, giữ trọn hương vị",
    description: "Sản phẩm được đóng gói cẩn thận theo tiêu chuẩn riêng, đảm bảo giữ nguyên độ tươi ngon và hương vị đặc trưng trong suốt quá trình vận chuyển.",
    icon: ClockFadingIcon,
    accent: '#FF8904'
  },
  {
    title: "Hỗ trợ khách hàng",
    description: "Chúng tôi luôn sẵn sàng hỗ trợ bạn. Nhận trợ giúp chuyên nghiệp từ bộ phận chăm sóc khách hàng của chúng tôi.",
    icon: HeadsetIcon,
    accent: '#A684FF'
  }
]

export const addressDummyData = {
  id: "addr_1",
  userId: "user_1",
  name: "John Doe",
  email: "johndoe@example.com",
  street: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "USA",
  phone: "1234567890",
  createdAt: 'Sat Jul 19 2025 14:51:25',
}

export const couponDummyData = [
  { code: "NEW20", description: "20% Off for New Users", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
  { code: "NEW10", description: "10% Off for New Users", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
  { code: "OFF20", description: "20% Off for All Users", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
  { code: "OFF10", description: "10% Off for All Users", discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.279Z" },
  { code: "PLUS10", description: "20% Off for Members", discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: "2027-03-06T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" }
]

export const dummyUserData = {
  id: "user_31dQbH27HVtovbs13X2cmqefddM",
  name: "GreatStack",
  email: "greatstack@example.com",
  image: profile_pic1,
  cart: {}
}

export const orderDummyData = [
  {
    id: "cmemm75h5001jtat89016h1p3",
    total: 214.2,
    status: "DELIVERED",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    storeId: "cmemkqnzm000htat8u7n8cpte",
    addressId: "cmemm6g95001ftat8omv9b883",
    isPaid: false,
    paymentMethod: "COD",
    createdAt: "2025-08-22T09:15:03.929Z",
    updatedAt: "2025-08-22T09:15:50.723Z",
    isCouponUsed: true,
    coupon: dummyRatingsData[2],
    orderItems: [
      { orderId: "cmemm75h5001jtat89016h1p3", productId: "cmemlydnx0017tat8h3rg92hz", quantity: 1, price: 89, product: productDummyData[0], },
      { orderId: "cmemm75h5001jtat89016h1p3", productId: "cmemlxgnk0015tat84qm8si5v", quantity: 1, price: 149, product: productDummyData[1], }
    ],
    address: addressDummyData,
    user: dummyUserData
  },
  {
    id: "cmemm6jv7001htat8vmm3gxaf",
    total: 421.6,
    status: "DELIVERED",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    storeId: "cmemkqnzm000htat8u7n8cpte",
    addressId: "cmemm6g95001ftat8omv9b883",
    isPaid: false,
    paymentMethod: "COD",
    createdAt: "2025-08-22T09:14:35.923Z",
    updatedAt: "2025-08-22T09:15:52.535Z",
    isCouponUsed: true,
    coupon: couponDummyData[0],
    orderItems: [
      { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemm1f3y001dtat8liccisar", quantity: 1, price: 229, product: productDummyData[2], },
      { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemm0nh2001btat8glfvhry1", quantity: 1, price: 99, product: productDummyData[3], },
      { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "cmemlz8640019tat8kz7emqca", quantity: 1, price: 199, product: productDummyData[4], }
    ],
    address: addressDummyData,
    user: dummyUserData
  }
]

export const storesDummyData = [
  {
    id: "cmemkb98v0001tat8r1hiyxhn",
    userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
    name: "GreatStack",
    description: "GreatStack is the education marketplace where you can buy goodies related to coding and tech",
    username: "greatstack",
    address: "123 Maplewood Drive Springfield, IL 62704 USA",
    status: "approved",
    isActive: true,
    logo: profile_pic1,
    email: "greatstack@example.com",
    contact: "+0 1234567890",
    createdAt: "2025-08-22T08:22:16.189Z",
    updatedAt: "2025-08-22T08:22:44.273Z",
    user: dummyUserData,
  },
  {
    id: "cmemkqnzm000htat8u7n8cpte",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    name: "Lumina & Sonic Labs",
    description: "At Lumina & Sonic Labs, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
    username: "happyshop",
    address: "3rd Floor, Lumina & Sonic Labs , New Building, 123 street , c sector , NY, US",
    status: "approved",
    isActive: true,
    logo: store_logo_1,
    email: "happyshop@example.com",
    contact: "+0 123456789",
    createdAt: "2025-08-22T08:34:15.155Z",
    updatedAt: "2025-08-22T08:34:47.162Z",
    user: dummyUserData,
  }
]

export const dummyAdminDashboardData = {
  "orders": 6,
  "stores": 2,
  "products": 12,
  "revenue": "959.10",
  "allOrders": [
    { "createdAt": "2025-08-20T08:46:58.239Z", "total": 145.6 },
    { "createdAt": "2025-08-22T08:46:21.818Z", "total": 97.2 },
    { "createdAt": "2025-08-22T08:45:59.587Z", "total": 54.4 },
    { "createdAt": "2025-08-23T09:15:03.929Z", "total": 214.2 },
    { "createdAt": "2025-08-23T09:14:35.923Z", "total": 421.6 },
    { "createdAt": "2025-08-23T11:44:29.713Z", "total": 26.1 },
    { "createdAt": "2025-08-24T09:15:03.929Z", "total": 214.2 },
    { "createdAt": "2025-08-24T09:14:35.923Z", "total": 421.6 },
    { "createdAt": "2025-08-24T11:44:29.713Z", "total": 26.1 },
    { "createdAt": "2025-08-24T11:56:29.713Z", "total": 36.1 },
    { "createdAt": "2025-08-25T11:44:29.713Z", "total": 26.1 },
    { "createdAt": "2025-08-25T09:15:03.929Z", "total": 214.2 },
    { "createdAt": "2025-08-25T09:14:35.923Z", "total": 421.6 },
    { "createdAt": "2025-08-25T11:44:29.713Z", "total": 26.1 },
    { "createdAt": "2025-08-25T11:56:29.713Z", "total": 36.1 },
    { "createdAt": "2025-08-25T11:30:29.713Z", "total": 110.1 }
  ]
}

export const dummyStoreDashboardData = {
  "ratings": dummyRatingsData,
  "totalOrders": 2,
  "totalEarnings": 636,
  "totalProducts": 5
}