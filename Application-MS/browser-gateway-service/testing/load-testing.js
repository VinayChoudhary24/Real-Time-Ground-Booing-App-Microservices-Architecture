import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    // load_test: {
    //   executor: 'constant-vus',
    //   exec: 'loadTest',
    //   vus: 2,
    //   duration: '10s',
    // },
    load_test: {
      executor: 'per-vu-iterations',
      exec: 'loadTest',
      vus: 5, // 10 virtual users
      iterations: 5, // Each does 1 iteration
      maxDuration: '1s', // Complete all within 1 second
    },
    // stress_test: {
    //   executor: 'ramping-vus',
    //   exec: 'stressTest',
    //   startVUs: 0,
    //   stages: [
    //     { duration: '30s', target: 50 },
    //     { duration: '30s', target: 100 },
    //     { duration: '30s', target: 150 },
    //     { duration: '30s', target: 0 },
    //   ],
    //   startTime: '55s', // shifted to start after load test ends
    // },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
  },
};

// Shared payload generator
function generatePayload() {
  const uniqueEmail = `ksixstsstest${Math.floor(Math.random() * 10000000)}@gmail.com`;

  return JSON.stringify({
    firstName: 'ksix',
    lastName: 'stress',
    email: uniqueEmail,
    password: 'StrongPass123!',
    location: {
      name: 'stress',
      address: {
        addressLine: 'testing',
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        postalCode: '313011',
      },
      phone: '9876776288',
    },
  });
}

const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Load Test Function
export function loadTest() {
  const res = http.post('http://127.0.0.1:6069/api/merchant/register', generatePayload(), params);
  check(res, {
    'status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}

// Stress Test Function
// export function stressTest() {
//   const res = http.post('http://localhost:6069/api/merchant/register', generatePayload(), params);
//   check(res, {
//     'status is 201 or 200': (r) => r.status === 201 || r.status === 200,
//     'response time < 3s': (r) => r.timings.duration < 3000,
//   });
//   sleep(0.5);
// }
