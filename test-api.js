const axios = require('axios');

const API_BASE_URL = 'http://localhost:3333/api';

// Test data
const testVendor = {
  name: 'Test Vendor',
  email: 'test@example.com',
  password: 'password123'
};

const testStore = {
  name: 'Test Store',
  description: 'A test store for API testing',
  socialLinks: {
    facebook: 'https://facebook.com/teststore',
    website: 'https://teststore.com'
  }
};

const testProduct = {
  name: 'Test Product',
  description: 'A test product',
  price: 25.99,
  stock: 50,
  category: 'Test Category',
  images: ['https://example.com/test-image.jpg']
};

let authToken = '';
let storeId = '';
let productId = '';

async function runTests() {
  try {
    console.log('🚀 Starting API Tests...\n');

    // Test 1: Register Vendor
    console.log('1. Testing Vendor Registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testVendor);
    authToken = registerResponse.data.token;
    console.log('✅ Vendor registered successfully');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);

    // Test 2: Login Vendor
    console.log('\n2. Testing Vendor Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testVendor.email,
      password: testVendor.password
    });
    console.log('✅ Vendor login successful');

    // Test 3: Get Current Vendor
    console.log('\n3. Testing Get Current Vendor...');
    const meResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get current vendor successful');
    console.log(`   Vendor: ${meResponse.data.vendor.name} (${meResponse.data.vendor.email})`);

    // Test 4: Create Store
    console.log('\n4. Testing Store Creation...');
    const storeResponse = await axios.post(`${API_BASE_URL}/stores`, testStore, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    storeId = storeResponse.data.store._id;
    console.log('✅ Store created successfully');
    console.log(`   Store ID: ${storeId}`);

    // Test 5: Get Store
    console.log('\n5. Testing Get Store...');
    const getStoreResponse = await axios.get(`${API_BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get store successful');
    console.log(`   Store: ${getStoreResponse.data.store.name}`);

    // Test 6: Add Product
    console.log('\n6. Testing Product Creation...');
    const productResponse = await axios.post(`${API_BASE_URL}/products`, testProduct, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    productId = productResponse.data.product._id;
    console.log('✅ Product created successfully');
    console.log(`   Product ID: ${productId}`);

    // Test 7: List Products
    console.log('\n7. Testing List Products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ List products successful');
    console.log(`   Found ${productsResponse.data.products.length} products`);

    // Test 8: Get Product Details
    console.log('\n8. Testing Get Product Details...');
    const productDetailsResponse = await axios.get(`${API_BASE_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get product details successful');
    console.log(`   Product: ${productDetailsResponse.data.product.name}`);

    // Test 9: Dashboard Stats
    console.log('\n9. Testing Dashboard Stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Dashboard stats successful');
    console.log(`   Total Products: ${statsResponse.data.products.total}`);

    // Test 10: Health Check
    console.log('\n10. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check successful');
    console.log(`   Status: ${healthResponse.data.status}`);

    console.log('\n🎉 All tests passed successfully!\n');
    console.log('API is working correctly. You can now:');
    console.log('1. Use the Postman collection to test more endpoints');
    console.log('2. Run "npm run seed" to add sample data');
    console.log('3. Start building your frontend application');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('Server error - make sure MongoDB is running');
    }
  }
}

// Add axios dependency to package.json if not present
async function installAxios() {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    await execPromise('npm list axios');
  } catch (error) {
    console.log('Installing axios for testing...');
    await execPromise('npm install axios');
  }
}

// Run tests
if (require.main === module) {
  installAxios().then(() => {
    setTimeout(runTests, 2000); // Wait 2 seconds for server to start
  });
}

module.exports = { runTests };
