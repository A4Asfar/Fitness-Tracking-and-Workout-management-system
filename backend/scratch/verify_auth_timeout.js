const { auth } = require('../middleware/auth');
const { errorHandler } = require('../middleware/errorMiddleware');
const jwt = require('jsonwebtoken');

// Set dummy secrets
process.env.JWT_SECRET = 'supersecretkeyfortesting123';
process.env.NODE_ENV = 'development';

async function runTests() {
  console.log('🧪 Starting Authentication & Error Middleware Unit Tests...\n');

  let testPassed = true;

  // Helper to create mock response object
  const createMockResponse = () => {
    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      }
    };
    return res;
  };

  // Test 1: Missing Authorization Header
  {
    console.log('Test 1: Missing Authorization Header');
    const req = {
      header: (name) => null,
      requestId: 'REQ-1',
      startTime: Date.now()
    };
    const res = createMockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await auth(req, res, next);

    if (res.statusCode === 401 && res.body.message === 'Authentication required.' && !nextCalled) {
      console.log('✅ Test 1 Passed');
    } else {
      console.error(`❌ Test 1 Failed: Status=${res.statusCode}, Msg=${res.body?.message}, nextCalled=${nextCalled}`);
      testPassed = false;
    }
  }

  // Test 2: Invalid Bearer Prefix
  {
    console.log('\nTest 2: Invalid Bearer Prefix');
    const req = {
      header: (name) => 'Basic token123',
      requestId: 'REQ-2',
      startTime: Date.now()
    };
    const res = createMockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await auth(req, res, next);

    if (res.statusCode === 401 && res.body.message === 'Authentication required.' && !nextCalled) {
      console.log('✅ Test 2 Passed');
    } else {
      console.error(`❌ Test 2 Failed: Status=${res.statusCode}, Msg=${res.body?.message}`);
      testPassed = false;
    }
  }

  // Test 3: Invalid Token (JsonWebTokenError)
  {
    console.log('\nTest 3: Invalid Token');
    const req = {
      header: (name) => 'Bearer invalid-token-string',
      requestId: 'REQ-3',
      startTime: Date.now()
    };
    const res = createMockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await auth(req, res, next);

    if (res.statusCode === 401 && res.body.message === 'Authentication failed.' && !nextCalled) {
      console.log('✅ Test 3 Passed');
    } else {
      console.error(`❌ Test 3 Failed: Status=${res.statusCode}, Msg=${res.body?.message}`);
      testPassed = false;
    }
  }

  // Test 4: Expired Token (TokenExpiredError)
  {
    console.log('\nTest 4: Expired Token');
    const expiredToken = jwt.sign({ userId: '123' }, process.env.JWT_SECRET, { expiresIn: '0s' });
    
    // Wait a tiny bit so it expires
    await new Promise(r => setTimeout(r, 10));

    const req = {
      header: (name) => `Bearer ${expiredToken}`,
      requestId: 'REQ-4',
      startTime: Date.now()
    };
    const res = createMockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await auth(req, res, next);

    if (res.statusCode === 401 && res.body.message === 'Your session has expired. Please sign in again.' && !nextCalled) {
      console.log('✅ Test 4 Passed');
    } else {
      console.error(`❌ Test 4 Failed: Status=${res.statusCode}, Msg=${res.body?.message}`);
      testPassed = false;
    }
  }

  // Test 5: Global Error Middleware - Mongoose ValidationError
  {
    console.log('\nTest 5: Global Error Handler - Validation Error');
    const validationError = new Error();
    validationError.name = 'ValidationError';
    validationError.errors = {
      email: { message: 'Email is required' },
      password: { message: 'Password is too short' }
    };

    const req = {
      requestId: 'REQ-5',
      startTime: Date.now(),
      method: 'POST',
      originalUrl: '/api/auth/register'
    };
    const res = createMockResponse();

    errorHandler(validationError, req, res, () => {});

    if (res.statusCode === 400 && res.body.message.includes('Email is required') && req.errorCategory === 'VALIDATION_ERROR') {
      console.log('✅ Test 5 Passed');
    } else {
      console.error(`❌ Test 5 Failed: Status=${res.statusCode}, Msg=${res.body?.message}, Category=${req.errorCategory}`);
      testPassed = false;
    }
  }

  // Test 6: Global Error Middleware - Timeout Error
  {
    console.log('\nTest 6: Global Error Handler - Timeout Error');
    const timeoutError = new Error('Gateway Timeout');
    timeoutError.code = 'ETIMEDOUT';

    const req = {
      requestId: 'REQ-6',
      startTime: Date.now(),
      method: 'GET',
      originalUrl: '/api/workouts'
    };
    const res = createMockResponse();

    errorHandler(timeoutError, req, res, () => {});

    if (res.statusCode === 408 && res.body.message === 'Request timed out. Please try again.' && req.errorCategory === 'TIMEOUT_ERROR') {
      console.log('✅ Test 6 Passed');
    } else {
      console.error(`❌ Test 6 Failed: Status=${res.statusCode}, Msg=${res.body?.message}, Category=${req.errorCategory}`);
      testPassed = false;
    }
  }

  console.log('\n========================================');
  if (testPassed) {
    console.log('🎉 ALL LOCAL VERIFICATION TESTS PASSED!');
    process.exit(0);
  } else {
    console.error('❌ SOME LOCAL VERIFICATION TESTS FAILED.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test script crashed:', err);
  process.exit(1);
});
