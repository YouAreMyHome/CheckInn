/**
 * Test Frontend-Backend Integration for User Status
 */

// Test trực tiếp từ browser console để debug
console.log('🧪 Testing User Status Integration');

// Test function để gọi từ browser
window.debugUserStatus = async function() {
  try {
    // 1. Check if userService is available
    const userService = window.userService;
    if (!userService) {
      console.error('❌ userService not found. Make sure to import and expose it.');
      return;
    }

    console.log('1️⃣ Testing getUsers API...');
    const response = await userService.getUsers({ page: 1, limit: 5 });
    
    console.log('📋 API Response:', response);
    
    if (response.success && response.data.users) {
      const users = response.data.users;
      console.log('✅ Users fetched successfully');
      console.log('👥 Total users:', users.length);
      
      users.forEach((user, index) => {
        console.log(`📝 User ${index + 1}:`, {
          id: user._id,
          name: user.name || user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          active: user.active
        });
      });

      // Test status update if there are users
      if (users.length > 0) {
        const testUser = users[0];
        const newStatus = testUser.status === 'active' ? 'suspended' : 'active';
        
        console.log('\n2️⃣ Testing status update...');
        console.log('🎯 Target user:', testUser.name || testUser.fullName);
        console.log('📝 Current status:', testUser.status);
        console.log('📝 New status:', newStatus);

        const updateResponse = await userService.updateUserStatus(testUser._id, newStatus);
        console.log('✅ Update response:', updateResponse);

        // Revert back
        setTimeout(async () => {
          console.log('🔄 Reverting status back...');
          await userService.updateUserStatus(testUser._id, testUser.status);
          console.log('✅ Status reverted');
        }, 2000);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

console.log('✅ Debug function ready. Run: window.debugUserStatus()');