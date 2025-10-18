import http from 'k6/http';
import { check } from 'k6';
import type { Options } from 'k6/options';

// Run commands:
// 1. Compile: npx tsc
// 2. Run:     k6 run dist/load-tester.js

export const options: Options = {
  vus: 5, // 100 concurrent users
  iterations: 5, // total of 200 requests
  duration: '10s', // all requests within 2 seconds
  thresholds: {
    http_req_failed: ['rate<0.02'], // <2% should fail
    http_req_duration: ['p(95)<2500'], // 95% < 2500ms
    checks: ['rate>0.99'], // >99% of checks must pass
  },
};

export default function () {
  const url = 'http://127.0.0.1:6069/api/merchant/register';

  // Generate a unique email per request
  const email = `loadtest+${__VU}-${__ITER}@example.com`;

  const payload = JSON.stringify({
    firstName: 'Load',
    lastName: 'Tester',
    email,
    password: 'StrongPass123!',
    location: {
      name: 'K6 Test Location',
      address: {
        addressLine: '123 Testing Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
      },
      phone: '9999999999',
    },
  });

  const headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, headers);

  // Debug line (optional): helps catch issues
  // console.log(`VU: ${__VU}, Iter: ${__ITER}, Status: ${res.status}, Body: ${res.body}`);

  check(res, {
    'status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
