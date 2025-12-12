/**
 * Partner Verification API Integration Tests
 * 
 * End-to-end tests for partner verification workflow
 * Tests the full HTTP request/response cycle
 */

const request = require('supertest');
const app = require('../../server'); // Will need to export app from server.js
const { createAdminUser, createPartner, generateToken } = require('../helpers');

describe('Partner Verification API Integration Tests', () => {
  let adminToken;
  let admin;

  beforeEach(async () => {
    admin = await createAdminUser();
    adminToken = generateToken(admin._id);
  });

  describe('PATCH /api/partner/applications/:id/approve', () => {
    describe('✅ Success Scenarios', () => {
      test('Should approve pending partner application (200)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('approved');
        expect(response.body.data.partner.partnerInfo.verificationStatus).toBe('verified');
        expect(response.body.data.partner.status).toBe('active');
        expect(response.body.data.partner.partnerInfo.verifiedAt).toBeDefined();
        expect(response.body.data.partner.partnerInfo.verifiedBy).toBeDefined();
      });
    });

    describe('❌ Error Scenarios - Bug #1 Validation', () => {
      test('Should reject already verified partner (400)', async () => {
        const partner = await createPartner({
          partnerInfo: { 
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            verifiedBy: admin._id
          }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already verified');
      });

      test('Should reject previously rejected partner (400)', async () => {
        const partner = await createPartner({
          partnerInfo: { 
            verificationStatus: 'rejected',
            rejectionReason: 'Invalid documents'
          }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('rejected');
        expect(response.body.message).toContain('resubmit');
      });
    });

    describe('❌ Error Scenarios - Bug #2 Suspended Check', () => {
      test('Should reject suspended partner (400)', async () => {
        const partner = await createPartner({
          status: 'suspended',
          partnerInfo: { verificationStatus: 'pending' }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('suspended');
        expect(response.body.message).toContain('unsuspend');
      });
    });

    describe('❌ Error Scenarios - Authentication & Authorization', () => {
      test('Should reject request without token (401)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .expect(401);
      });

      test('Should reject request with invalid token (401)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .set('Authorization', 'Bearer invalid-token-here')
          .expect(401);
      });

      test('Should reject non-admin user (403)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        // Create customer user (non-admin)
        const customer = await createPartner({ 
          email: 'customer@test.com',
          role: 'Customer' 
        });
        const customerToken = generateToken(customer._id);

        await request(app)
          .patch(`/api/partner/applications/${partner._id}/approve`)
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(403);
      });
    });

    describe('❌ Error Scenarios - Not Found', () => {
      test('Should return 404 for non-existent partner', async () => {
        const response = await request(app)
          .patch('/api/partner/applications/507f1f77bcf86cd799439011/approve')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('not found');
      });
    });
  });

  describe('PATCH /api/partner/applications/:id/reject', () => {
    describe('✅ Success Scenarios', () => {
      test('Should reject pending partner with valid reason (200)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ rejectionReason: 'Invalid business license documentation' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('rejected');
        expect(response.body.data.partner.partnerInfo.verificationStatus).toBe('rejected');
        expect(response.body.data.partner.status).toBe('inactive');
        expect(response.body.data.partner.partnerInfo.rejectionReason).toBe('Invalid business license documentation');
      });
    });

    describe('❌ Error Scenarios - Validation', () => {
      test('Should reject if rejection reason is missing (400)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({}) // No rejectionReason
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('required');
      });

      test('Should reject if rejection reason is empty string (400)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ rejectionReason: '' })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('❌ Error Scenarios - Bug #1 Validation', () => {
      test('Should not reject already verified partner (400)', async () => {
        const partner = await createPartner({
          partnerInfo: { 
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            verifiedBy: admin._id
          }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ rejectionReason: 'Test reason' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('verified');
      });

      test('Should not reject already rejected partner (400)', async () => {
        const partner = await createPartner({
          partnerInfo: { 
            verificationStatus: 'rejected',
            rejectionReason: 'Previous rejection'
          }
        });

        const response = await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ rejectionReason: 'Another reason' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already rejected');
      });
    });

    describe('❌ Error Scenarios - Authentication & Authorization', () => {
      test('Should reject request without token (401)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .send({ rejectionReason: 'Test reason' })
          .expect(401);
      });

      test('Should reject non-admin user (403)', async () => {
        const partner = await createPartner({
          partnerInfo: { verificationStatus: 'pending' }
        });

        const customer = await createPartner({ 
          email: 'customer2@test.com',
          role: 'Customer' 
        });
        const customerToken = generateToken(customer._id);

        await request(app)
          .patch(`/api/partner/applications/${partner._id}/reject`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ rejectionReason: 'Test reason' })
          .expect(403);
      });
    });
  });

  describe('Workflow Integration Tests', () => {
    test('Should follow complete approve workflow: pending → verified → cannot approve again', async () => {
      const partner = await createPartner({
        partnerInfo: { verificationStatus: 'pending' }
      });

      // Step 1: Approve pending partner
      const approveResponse = await request(app)
        .patch(`/api/partner/applications/${partner._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(approveResponse.body.data.partner.partnerInfo.verificationStatus).toBe('verified');

      // Step 2: Try to approve again (should fail)
      const secondApproveResponse = await request(app)
        .patch(`/api/partner/applications/${partner._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(secondApproveResponse.body.message).toContain('already verified');
    });

    test('Should follow complete reject workflow: pending → rejected → cannot reject again', async () => {
      const partner = await createPartner({
        partnerInfo: { verificationStatus: 'pending' }
      });

      // Step 1: Reject pending partner
      const rejectResponse = await request(app)
        .patch(`/api/partner/applications/${partner._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Invalid documents' })
        .expect(200);

      expect(rejectResponse.body.data.partner.partnerInfo.verificationStatus).toBe('rejected');

      // Step 2: Try to reject again (should fail)
      const secondRejectResponse = await request(app)
        .patch(`/api/partner/applications/${partner._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Another reason' })
        .expect(400);

      expect(secondRejectResponse.body.message).toContain('already rejected');
    });

    test('Should prevent approving rejected partner', async () => {
      const partner = await createPartner({
        partnerInfo: { verificationStatus: 'pending' }
      });

      // Step 1: Reject partner
      await request(app)
        .patch(`/api/partner/applications/${partner._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Invalid documents' })
        .expect(200);

      // Step 2: Try to approve rejected partner (should fail)
      const approveResponse = await request(app)
        .patch(`/api/partner/applications/${partner._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(approveResponse.body.message).toContain('rejected');
      expect(approveResponse.body.message).toContain('resubmit');
    });

    test('Should prevent rejecting verified partner', async () => {
      const partner = await createPartner({
        partnerInfo: { verificationStatus: 'pending' }
      });

      // Step 1: Approve partner
      await request(app)
        .patch(`/api/partner/applications/${partner._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Step 2: Try to reject verified partner (should fail)
      const rejectResponse = await request(app)
        .patch(`/api/partner/applications/${partner._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Test reason' })
        .expect(400);

      expect(rejectResponse.body.message).toContain('verified');
    });
  });
});
