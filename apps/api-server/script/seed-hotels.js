/**
 * Seed Sample Hotels for Testing
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hotel = require('../src/models/Hotel.model');
const User = require('../src/models/User.model');

dotenv.config();

const sampleHotels = [
  {
    name: 'Grand Paradise Hotel',
    description: 'Luxury beachfront resort with stunning ocean views',
    category: 'luxury',
    address: {
      street: '123 Beach Road',
      city: 'Da Nang',
      state: 'Da Nang',
      country: 'Vietnam',
      zipCode: '550000'
    },
    contactInfo: {
      phone: '+84 236 3847 333',
      email: 'info@grandparadise.com',
      website: 'https://grandparadise.com'
    },
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access', 'Parking'],
    images: {
      main: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      gallery: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd',
        'https://images.unsplash.com/photo-1596436889106-be35e843f974'
      ]
    },
    status: 'pending',
    isVerified: false,
    isFeatured: false
  },
  {
    name: 'City Center Business Hotel',
    description: 'Modern hotel in the heart of the city',
    category: 'business',
    address: {
      street: '456 Nguyen Hue Street',
      city: 'Ho Chi Minh',
      state: 'Ho Chi Minh',
      country: 'Vietnam',
      zipCode: '700000'
    },
    contactInfo: {
      phone: '+84 28 3827 2829',
      email: 'reservations@citycenter.com',
      website: 'https://citycenter.com'
    },
    amenities: ['Free WiFi', 'Business Center', 'Restaurant', 'Gym', 'Parking'],
    images: {
      main: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
      gallery: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d'
      ]
    },
    status: 'pending',
    isVerified: false,
    isFeatured: false
  },
  {
    name: 'Mountain View Resort',
    description: 'Peaceful resort nestled in the mountains',
    category: 'resort',
    address: {
      street: '789 Mountain Road',
      city: 'Sapa',
      state: 'Lao Cai',
      country: 'Vietnam',
      zipCode: '330000'
    },
    contactInfo: {
      phone: '+84 214 3871 545',
      email: 'hello@mountainview.com',
      website: 'https://mountainview.com'
    },
    amenities: ['Free WiFi', 'Restaurant', 'Hiking Trails', 'Spa', 'Parking'],
    images: {
      main: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      gallery: [
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9',
        'https://images.unsplash.com/photo-1587213811864-3b0cc71f5b7f'
      ]
    },
    status: 'active',
    isVerified: true,
    isFeatured: true
  },
  {
    name: 'Budget Inn Downtown',
    description: 'Affordable accommodation with basic amenities',
    category: 'budget',
    address: {
      street: '321 Le Loi Street',
      city: 'Hanoi',
      state: 'Hanoi',
      country: 'Vietnam',
      zipCode: '100000'
    },
    contactInfo: {
      phone: '+84 24 3828 5555',
      email: 'info@budgetinn.com',
      website: 'https://budgetinn.com'
    },
    amenities: ['Free WiFi', 'Air Conditioning', 'Reception 24/7'],
    images: {
      main: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
      gallery: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427'
      ]
    },
    status: 'pending',
    isVerified: false,
    isFeatured: false
  },
  {
    name: 'Boutique Heritage Hotel',
    description: 'Charming boutique hotel in historic quarter',
    category: 'boutique',
    address: {
      street: '55 Old Quarter Street',
      city: 'Hoi An',
      state: 'Quang Nam',
      country: 'Vietnam',
      zipCode: '560000'
    },
    contactInfo: {
      phone: '+84 235 3861 222',
      email: 'stay@boutiqueheritage.com',
      website: 'https://boutiqueheritage.com'
    },
    amenities: ['Free WiFi', 'Restaurant', 'Bicycle Rental', 'Traditional Decor'],
    images: {
      main: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32',
      gallery: [
        'https://images.unsplash.com/photo-1609766975146-e0f4ab94b1cc'
      ]
    },
    status: 'rejected',
    isVerified: false,
    isFeatured: false,
    rejectionReason: 'Incomplete business registration documents. Please provide valid tax certificate and business license.'
  }
];

async function seedHotels() {
  try {
    console.log('🌱 Seeding Hotels...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user to set as owner
    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.log('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    console.log(`📝 Using admin user: ${admin.email}\n`);

    // Clear existing hotels (optional - comment out if you want to keep existing)
    // await Hotel.deleteMany({});
    // console.log('🗑️  Cleared existing hotels\n');

    // Add owner to each hotel
    const hotelsWithOwner = sampleHotels.map(hotel => ({
      ...hotel,
      owner: admin._id
    }));

    // Insert hotels
    const result = await Hotel.insertMany(hotelsWithOwner);
    console.log(`✅ Created ${result.length} hotels:\n`);
    
    result.forEach((hotel, index) => {
      const statusEmoji = {
        pending: '⏳',
        active: '✅',
        rejected: '❌'
      }[hotel.status] || '📋';
      
      console.log(`${index + 1}. ${statusEmoji} ${hotel.name} - ${hotel.status} ${hotel.isVerified ? '(Verified)' : ''}`);
    });

    console.log('\n📊 Summary:');
    console.log(`   Total: ${result.length}`);
    console.log(`   Pending: ${result.filter(h => h.status === 'pending').length}`);
    console.log(`   Active: ${result.filter(h => h.status === 'active').length}`);
    console.log(`   Rejected: ${result.filter(h => h.status === 'rejected').length}`);
    console.log(`   Verified: ${result.filter(h => h.isVerified).length}`);
    console.log(`   Featured: ${result.filter(h => h.isFeatured).length}\n`);

    console.log('🎉 Seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error seeding hotels:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedHotels();
