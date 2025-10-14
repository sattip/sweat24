/**
 * Test Script for Muscle Groups API
 *
 * How to run:
 * 1. Make sure you're logged in to the app first to get a valid auth token
 * 2. Open browser console on the app
 * 3. Copy and paste this script into the console
 * 4. Update the variables below with your actual values
 * 5. Run the test functions
 */

// Configuration - UPDATE THESE VALUES
const TEST_CONFIG = {
  baseUrl: 'https://api.sweat93.gr/api/v1',
  authToken: localStorage.getItem('auth_token') || 'YOUR_AUTH_TOKEN_HERE',
  testBookingId: 1, // Replace with actual booking ID from your test data
  testUserId: 1, // Replace with actual user ID
};

console.log('=== Muscle Groups API Test Script ===\n');
console.log('Auth Token:', TEST_CONFIG.authToken ? '✓ Found' : '✗ Not found');
console.log('Base URL:', TEST_CONFIG.baseUrl);
console.log('\n');

// Test 1: Save muscle groups
async function testSaveMuscleGroups() {
  console.log('🧪 Test 1: Save Muscle Groups');
  console.log('Endpoint: POST /api/v1/workouts/{bookingId}/muscle-groups');

  const payload = {
    muscle_groups: ['legs', 'core']
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/workouts/${TEST_CONFIG.testBookingId}/muscle-groups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log('Status:', response.status, response.ok ? '✓' : '✗');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Test PASSED: Muscle groups saved successfully\n');
      return data;
    } else {
      console.error('❌ Test FAILED:', data.message || 'Unknown error\n');
      return null;
    }
  } catch (error) {
    console.error('❌ Test FAILED with error:', error, '\n');
    return null;
  }
}

// Test 2: Get muscle groups
async function testGetMuscleGroups() {
  console.log('🧪 Test 2: Get Muscle Groups');
  console.log('Endpoint: GET /api/v1/workouts/{bookingId}/muscle-groups');

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/workouts/${TEST_CONFIG.testBookingId}/muscle-groups`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    console.log('Status:', response.status, response.ok ? '✓' : '✗');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Test PASSED: Muscle groups retrieved successfully\n');
      return data;
    } else if (response.status === 404) {
      console.log('ℹ️  Test PASSED: No muscle groups recorded yet (404 expected)\n');
      return null;
    } else {
      console.error('❌ Test FAILED:', data.message || 'Unknown error\n');
      return null;
    }
  } catch (error) {
    console.error('❌ Test FAILED with error:', error, '\n');
    return null;
  }
}

// Test 3: Get workout history with muscle groups
async function testGetWorkoutHistory() {
  console.log('🧪 Test 3: Get Workout History (with muscle groups)');
  console.log('Endpoint: GET /api/test-history?user_id={userId}');

  try {
    const response = await fetch(
      `https://api.sweat93.gr/api/test-history?user_id=${TEST_CONFIG.testUserId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    const data = await response.json();

    console.log('Status:', response.status, response.ok ? '✓' : '✗');

    if (response.ok && Array.isArray(data)) {
      console.log(`Found ${data.length} workouts`);

      // Show first workout as example
      if (data.length > 0) {
        console.log('\nExample workout (first item):');
        console.log(JSON.stringify(data[0], null, 2));

        // Check if muscle groups fields are present
        const hasFields = data[0].hasOwnProperty('muscle_groups') &&
                         data[0].hasOwnProperty('muscle_groups_recorded');

        if (hasFields) {
          console.log('✅ Test PASSED: Muscle groups fields are present\n');
        } else {
          console.error('❌ Test FAILED: Missing muscle_groups or muscle_groups_recorded fields\n');
        }
      }

      return data;
    } else {
      console.error('❌ Test FAILED:', data.message || 'Invalid response\n');
      return null;
    }
  } catch (error) {
    console.error('❌ Test FAILED with error:', error, '\n');
    return null;
  }
}

// Test 4: Update muscle groups (different values)
async function testUpdateMuscleGroups() {
  console.log('🧪 Test 4: Update Muscle Groups');
  console.log('Endpoint: POST /api/v1/workouts/{bookingId}/muscle-groups (update)');

  const payload = {
    muscle_groups: ['total_body']
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/workouts/${TEST_CONFIG.testBookingId}/muscle-groups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log('Status:', response.status, response.ok ? '✓' : '✗');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Test PASSED: Muscle groups updated successfully\n');
      return data;
    } else {
      console.error('❌ Test FAILED:', data.message || 'Unknown error\n');
      return null;
    }
  } catch (error) {
    console.error('❌ Test FAILED with error:', error, '\n');
    return null;
  }
}

// Test 5: Validation test (empty array - should fail)
async function testValidationEmptyArray() {
  console.log('🧪 Test 5: Validation Test (Empty Array - Should Fail)');
  console.log('Endpoint: POST /api/v1/workouts/{bookingId}/muscle-groups');

  const payload = {
    muscle_groups: []
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/workouts/${TEST_CONFIG.testBookingId}/muscle-groups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log('Status:', response.status, response.ok ? '✓' : '✗');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (!response.ok && response.status === 422) {
      console.log('✅ Test PASSED: Validation correctly rejected empty array\n');
      return data;
    } else {
      console.error('❌ Test FAILED: Should have returned 422 validation error\n');
      return null;
    }
  } catch (error) {
    console.error('❌ Test FAILED with error:', error, '\n');
    return null;
  }
}

// Test 6: Validation test (invalid muscle group - should fail)
async function testValidationInvalidGroup() {
  console.log('🧪 Test 6: Validation Test (Invalid Muscle Group - Should Fail)');
  console.log('Endpoint: POST /api/v1/workouts/{bookingId}/muscle-groups');

  const payload = {
    muscle_groups: ['invalid_muscle_group']
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(
      `${TEST_CONFIG.baseUrl}/workouts/${TEST_CONFIG.testBookingId}/muscle-groups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log('Status:', response.status, response.ok ? '✓' : '✗');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (!response.ok && response.status === 422) {
      console.log('✅ Test PASSED: Validation correctly rejected invalid muscle group\n');
      return data;
    } else {
      console.error('❌ Test FAILED: Should have returned 422 validation error\n');
      return null;
    }
  } catch (error) {
    console.error('❌ Test FAILED with error:', error, '\n');
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all tests...\n');
  console.log('='.repeat(60), '\n');

  await testSaveMuscleGroups();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testGetMuscleGroups();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testUpdateMuscleGroups();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testGetWorkoutHistory();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testValidationEmptyArray();
  await new Promise(resolve => setTimeout(resolve, 500));

  await testValidationInvalidGroup();

  console.log('='.repeat(60));
  console.log('\n✅ All tests completed!\n');
}

// Export functions for manual testing
console.log('Available test functions:');
console.log('  - runAllTests()');
console.log('  - testSaveMuscleGroups()');
console.log('  - testGetMuscleGroups()');
console.log('  - testUpdateMuscleGroups()');
console.log('  - testGetWorkoutHistory()');
console.log('  - testValidationEmptyArray()');
console.log('  - testValidationInvalidGroup()');
console.log('\nRun runAllTests() to execute all tests\n');

// Uncomment to run all tests automatically:
// runAllTests();
