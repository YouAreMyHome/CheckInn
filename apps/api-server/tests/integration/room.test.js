/**
 * Room API Integration Tests
 * 
 * Tests full HTTP workflow for room management endpoints
 * Covers: CRUD operations, availability search, authorization, validation
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../src/models/User.model');
const Hotel = require('../../src/models/Hotel.model');
const Room = require('../../src/models/Room.model');
const Booking = require('../../src/models/Booking.model');
const { generateToken, createTestUser, createTestHotel, createTestRoom, createTestBooking } = require('../helpers');

describe('Room API Integration Tests', () => {
  let adminToken, partnerToken, customerToken;
  let adminUser, partnerUser, customerUser;
  let testHotel, otherHotel;
  let testRoom;

  beforeAll(async () => {
    // Create test users
    adminUser = await createTestUser('Admin');
    partnerUser = await createTestUser('HotelPartner');
    customerUser = await createTestUser('Customer');

    // Generate tokens
    adminToken = generateToken(adminUser._id);
    partnerToken = generateToken(partnerUser._id);
    customerToken = generateToken(customerUser._id);

    // Create test hotels
    testHotel = await createTestHotel(partnerUser._id);
    otherHotel = await createTestHotel(adminUser._id);
  });

  afterAll(async () => {
    // Clean up all test data
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await Hotel.deleteMany({});
    await User.deleteMany({});
  });

  beforeEach(async () => {
    // Clean rooms and bookings before each test to ensure isolation
    await Room.deleteMany({});
    await Booking.deleteMany({});
  });

  // =====================================================================
  // POST /api/rooms - Create Room
  // =====================================================================
  describe('POST /api/rooms', () => {
    const validRoomData = {
      name: 'Deluxe Suite',
      roomNumber: '101',
      type: 'deluxe',
      description: 'Spacious deluxe room with city view',
      hotel: null, // Will be set in tests
      size: {
        value: 45,
        unit: 'sqm'
      },
      capacity: {
        adults: 2,
        children: 1,
        totalGuests: 3
      },
      bedConfiguration: [
        { type: 'king', count: 1 },
        { type: 'single', count: 1 }
      ],
      pricing: {
        basePrice: 150,
        currency: 'USD'
      },
      amenities: [
        { name: 'WiFi', icon: 'wifi', description: 'High-speed internet' },
        { name: 'TV', icon: 'tv', description: 'Smart TV' }
      ]
    };

    describe('✅ Success Cases', () => {
      test('Should create room as hotel owner', async () => {
        const roomData = { ...validRoomData, hotel: testHotel._id };
        
        const res = await request(app)
          .post('/api/rooms')
          .set('Authorization', `Bearer ${partnerToken}`)
          .send(roomData)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.room).toMatchObject({
          roomNumber: roomData.roomNumber,
          type: roomData.type,
          status: 'available'
        });

        // Verify hotel stats updated
        const hotel = await Hotel.findById(testHotel._id);
        expect(hotel.stats.totalRooms).toBe(testHotel.stats.totalRooms + 1);
      });

      test('Should create room as admin', async () => {
        const roomData = { ...validRoomData, hotel: testHotel._id };
        
        const res = await request(app)
          .post('/api/rooms')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(roomData)
          .expect(201);

        expect(res.body.success).toBe(true);
      });
    });

    describe('❌ Error Cases - Authorization', () => {
      test('Should reject unauthenticated request (401)', async () => {
        const roomData = { ...validRoomData, hotel: testHotel._id };
        
        const res = await request(app)
          .post('/api/rooms')
          .send(roomData)
          .expect(401);

        expect(res.body.success).toBe(false);
      });

      test('Should reject customer role (403)', async () => {
        const roomData = { ...validRoomData, hotel: testHotel._id };
        
        const res = await request(app)
          .post('/api/rooms')
          .set('Authorization', `Bearer ${customerToken}`)
          .send(roomData)
          .expect(403);

        expect(res.body.success).toBe(false);
      });

      test('Should reject non-owner partner (403)', async () => {
        const roomData = { ...validRoomData, hotel: otherHotel._id };
        
        const res = await request(app)
          .post('/api/rooms')
          .set('Authorization', `Bearer ${partnerToken}`)
          .send(roomData)
          .expect(403);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/permission/i);
      });
    });

    describe('❌ Error Cases - Validation', () => {
      test('Should reject if hotel not found (404)', async () => {
        const roomData = { 
          ...validRoomData, 
          hotel: new mongoose.Types.ObjectId() 
        };
        
        const res = await request(app)
          .post('/api/rooms')
          .set('Authorization', `Bearer ${partnerToken}`)
          .send(roomData)
          .expect(404);

        expect(res.body.message).toMatch(/hotel not found/i);
      });

      test('Should reject invalid room data (400)', async () => {
        const invalidData = {
          hotel: testHotel._id,
          // Missing required fields
        };
        
        const res = await request(app)
          .post('/api/rooms')
          .set('Authorization', `Bearer ${partnerToken}`)
          .send(invalidData)
          .expect(400);

        expect(res.body.success).toBe(false);
      });
    });
  });

  // =====================================================================
  // GET /api/rooms/availability - Search Available Rooms
  // =====================================================================
  describe('GET /api/rooms/availability', () => {
    let room1, room2, room3;
    const checkIn = new Date('2025-12-20');
    const checkOut = new Date('2025-12-25');

    beforeEach(async () => {
      // Create test rooms
      room1 = await createTestRoom(testHotel._id, {
        name: 'Room 101',
        roomNumber: '101',
        capacity: { adults: 2, children: 0, totalGuests: 2 },
        pricing: { basePrice: 100, currency: 'USD' },
        status: 'available'
      });

      room2 = await createTestRoom(testHotel._id, {
        name: 'Room 102',
        roomNumber: '102',
        type: 'deluxe',
        capacity: { adults: 3, children: 1, totalGuests: 4 },
        pricing: { basePrice: 150, currency: 'USD' },
        status: 'available'
      });

      room3 = await createTestRoom(testHotel._id, {
        name: 'Room 103',
        roomNumber: '103',
        capacity: { adults: 2, children: 0, totalGuests: 2 },
        pricing: { basePrice: 100, currency: 'USD' },
        status: 'available'
      });

      // Create overlapping booking for room2
      await createTestBooking({
        customer: customerUser._id,
        hotel: testHotel._id,
        room: room2._id,
        checkIn: new Date('2025-12-22'),
        checkOut: new Date('2025-12-27')
      }, { totalAmount: 750 });
    });

    describe('✅ Success Cases', () => {
      test('Should return available rooms excluding booked ones', async () => {
        const res = await request(app)
          .get('/api/rooms/availability')
          .query({
            hotelId: testHotel._id.toString(),
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString()
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.rooms).toHaveLength(2); // room1 and room3
        expect(res.body.data.rooms.map(r => r._id)).not.toContain(room2._id.toString());
      });

      test('Should filter by guest capacity', async () => {
        const res = await request(app)
          .get('/api/rooms/availability')
          .query({
            hotelId: testHotel._id.toString(),
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            guests: 3 // Only room2 has capacity for 3+, but it's booked
          })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.rooms).toHaveLength(0);
      });

      test('Should include dynamic pricing in response', async () => {
        const res = await request(app)
          .get('/api/rooms/availability')
          .query({
            hotelId: testHotel._id.toString(),
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString()
          })
          .expect(200);

        expect(res.body.data.rooms[0]).toHaveProperty('currentBookingPrice');
      });
    });

    describe('❌ Error Cases - Validation', () => {
      test('Should reject missing hotelId (400)', async () => {
        const res = await request(app)
          .get('/api/rooms/availability')
          .query({
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString()
          })
          .expect(400);

        expect(res.body.message).toMatch(/hotelId/i);
      });

      test('Should reject missing dates (400)', async () => {
        const res = await request(app)
          .get('/api/rooms/availability')
          .query({
            hotelId: testHotel._id
          })
          .expect(400);

        expect(res.body.message).toMatch(/checkIn|checkOut/i);
      });
    });
  });

  // =====================================================================
  // GET /api/rooms/:id - Get Room Details
  // =====================================================================
  describe('GET /api/rooms/:id', () => {
    beforeEach(async () => {
      testRoom = await createTestRoom(testHotel._id, {
        name: 'Test Room',
        roomNumber: '101'
      });
    });

    test('Should get room details (200)', async () => {
      const res = await request(app)
        .get(`/api/rooms/${testRoom._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.room).toMatchObject({
        name: testRoom.name,
        type: testRoom.type
      });
      expect(res.body.data.room.hotel).toHaveProperty('name'); // Populated
    });

    test('Should return 404 for non-existent room', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/rooms/${fakeId}`)
        .expect(404);

      expect(res.body.message).toMatch(/not found/i);
    });
  });

  // =====================================================================
  // GET /api/rooms/hotel/:hotelId - Get Rooms by Hotel
  // =====================================================================
  describe('GET /api/rooms/hotel/:hotelId', () => {
    beforeEach(async () => {
      await Promise.all([
        createTestRoom(testHotel._id, { name: 'Room A', roomNumber: '101', pricing: { basePrice: 100, currency: 'USD' } }),
        createTestRoom(testHotel._id, { name: 'Room B', roomNumber: '102', pricing: { basePrice: 150, currency: 'USD' } })
      ]);
    });

    test('Should get all rooms for hotel (200)', async () => {
      const res = await request(app)
        .get(`/api/rooms/hotel/${testHotel._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rooms).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });

    test('Should support pagination', async () => {
      const res = await request(app)
        .get(`/api/rooms/hotel/${testHotel._id}`)
        .query({ limit: 1, page: 1 })
        .expect(200);

      expect(res.body.data.rooms).toHaveLength(1);
    });
  });

  // =====================================================================
  // PATCH /api/rooms/:id - Update Room
  // =====================================================================
  describe('PATCH /api/rooms/:id', () => {
    beforeEach(async () => {
      testRoom = await createTestRoom(testHotel._id, { name: 'Original Room', roomNumber: '101' });
    });

    describe('✅ Success Cases', () => {
      test('Should update room as owner', async () => {
        const updates = { name: 'Updated Room', 'pricing.basePrice': 120 };
        
        const res = await request(app)
          .patch(`/api/rooms/${testRoom._id}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .send(updates)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.room.name).toBe('Updated Room');
        expect(res.body.data.room.pricing.basePrice).toBe(120);
      });

      test('Should update room as admin', async () => {
        const res = await request(app)
          .patch(`/api/rooms/${testRoom._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Admin Updated' })
          .expect(200);

        expect(res.body.success).toBe(true);
      });
    });

    describe('❌ Error Cases', () => {
      test('Should reject unauthenticated request (401)', async () => {
        await request(app)
          .patch(`/api/rooms/${testRoom._id}`)
          .send({ name: 'Hacked' })
          .expect(401);
      });

      test('Should reject non-owner partner (403)', async () => {
        const otherRoom = await createTestRoom(otherHotel._id, { name: 'Other Room', roomNumber: '201' });

        const res = await request(app)
          .patch(`/api/rooms/${otherRoom._id}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .send({ name: 'Unauthorized Update' })
          .expect(403);

        expect(res.body.message).toMatch(/permission/i);
      });

      test('Should return 404 for non-existent room', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        
        await request(app)
          .patch(`/api/rooms/${fakeId}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .send({ name: 'Ghost Room' })
          .expect(404);
      });
    });
  });

  // =====================================================================
  // DELETE /api/rooms/:id - Delete Room
  // =====================================================================
  describe('DELETE /api/rooms/:id', () => {
    beforeEach(async () => {
      testRoom = await createTestRoom(testHotel._id, { name: 'Room to Delete', roomNumber: '101' });
    });

    describe('✅ Success Cases', () => {
      test('Should delete room without future bookings', async () => {
        const res = await request(app)
          .delete(`/api/rooms/${testRoom._id}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .expect(204);

        // Verify deletion
        const deletedRoom = await Room.findById(testRoom._id);
        expect(deletedRoom).toBeNull();
      });
    });

    describe('❌ Error Cases - Business Logic', () => {
      test('Should reject deletion with future bookings (400)', async () => {
        // Create future booking
        await createTestBooking({
          customer: customerUser._id,
          hotel: testHotel._id,
          room: testRoom._id,
          checkIn: new Date(Date.now() + 86400000 * 5), // 5 days from now
          checkOut: new Date(Date.now() + 86400000 * 7)
        }, { totalAmount: 200 });

        const res = await request(app)
          .delete(`/api/rooms/${testRoom._id}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .expect(400);

        expect(res.body.message).toMatch(/active future bookings/i);
      });

      test('Should allow deletion with past bookings', async () => {
        // Create past booking
        await createTestBooking({
          customer: customerUser._id,
          hotel: testHotel._id,
          room: testRoom._id,
          checkIn: new Date(Date.now() - 86400000 * 7),
          checkOut: new Date(Date.now() - 86400000 * 5)
        }, { status: 'Completed', totalAmount: 100 });

        await request(app)
          .delete(`/api/rooms/${testRoom._id}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .expect(204);
      });
    });

    describe('❌ Error Cases - Authorization', () => {
      test('Should reject unauthenticated request (401)', async () => {
        await request(app)
          .delete(`/api/rooms/${testRoom._id}`)
          .expect(401);
      });

      test('Should reject non-owner partner (403)', async () => {
        const otherRoom = await createTestRoom(otherHotel._id, { name: 'Other Room', roomNumber: '201' });

        await request(app)
          .delete(`/api/rooms/${otherRoom._id}`)
          .set('Authorization', `Bearer ${partnerToken}`)
          .expect(403);
      });
    });
  });

  // =====================================================================
  // Workflow Integration Tests
  // =====================================================================
  describe('Workflow Integration Tests', () => {
    test('Complete room lifecycle: Create → Search → Update → Delete', async () => {
      // 1. Create room
      const roomData = {
        name: 'Lifecycle Room',
        roomNumber: '999',
        type: 'deluxe',
        description: 'Test lifecycle room',
        hotel: testHotel._id,
        size: {
          value: 30,
          unit: 'sqm'
        },
        capacity: { adults: 2, children: 0, totalGuests: 2 },
        bedConfiguration: [{ type: 'queen', count: 1 }],
        pricing: { basePrice: 100, currency: 'USD' },
        amenities: [
          { name: 'WiFi', icon: 'wifi', description: 'Internet' }
        ]
      };

      const createRes = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(roomData)
        .expect(201);

      const roomId = createRes.body.data.room._id;

      // 2. Search availability - should be available
      const searchRes = await request(app)
        .get('/api/rooms/availability')
        .query({
          hotelId: testHotel._id.toString(),
          checkIn: new Date('2025-12-20').toISOString(),
          checkOut: new Date('2025-12-25').toISOString()
        })
        .expect(200);

      expect(searchRes.body.data.rooms.map(r => r._id)).toContain(roomId);

      // 3. Update room
      await request(app)
        .patch(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ name: 'Updated Lifecycle Room' })
        .expect(200);

      // 4. Delete room
      await request(app)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(204);
    });

    test('Booking conflict prevents room deletion', async () => {
      // Create room
      const room = await createTestRoom(testHotel._id, { name: 'Conflict Test Room', roomNumber: '101' });

      // Create future booking
      await createTestBooking({
        customer: customerUser._id,
        hotel: testHotel._id,
        room: room._id,
        checkIn: new Date(Date.now() + 86400000),
        checkOut: new Date(Date.now() + 86400000 * 3)
      }, { totalAmount: 200 });

      // Attempt deletion - should fail
      await request(app)
        .delete(`/api/rooms/${room._id}`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(400);

      // Verify room still exists
      const stillExists = await Room.findById(room._id);
      expect(stillExists).toBeTruthy();
    });
  });
});

