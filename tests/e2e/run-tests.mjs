import fs from 'fs';

const API = process.env.API_BASE || 'http://localhost:8080';

function writeResult(text) {
  fs.appendFileSync('tests_results.txt', text + '\n');
  console.log(text);
}

async function jsonPost(path, body, headers = {}) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: Object.assign({'Content-Type': 'application/json'}, headers),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { data = text; }
  return { status: res.status, headers: res.headers, data };
}

async function jsonGet(path, headers = {}) {
  const res = await fetch(API + path, { method: 'GET', headers });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { data = text; }
  return { status: res.status, headers: res.headers, data };
}

async function run() {
  if (fs.existsSync('tests_results.txt')) fs.unlinkSync('tests_results.txt');

  writeResult('STARTING E2E TESTS');

  const username = 'testuser';
  const email = 'testuser@example.com';
  const password = 'Password123!';

  // Register
  try {
    const reg = await jsonPost('/auth/register', { username, email, password });
    writeResult('REGISTER: ' + reg.status + ' - ' + JSON.stringify(reg.data));
  } catch (e) {
    writeResult('REGISTER ERROR: ' + e.message);
    return;
  }

  // Login
  let cookie = null;
  try {
    const login = await jsonPost('/api/auth/login', { email, password });
    writeResult('LOGIN: ' + login.status + ' - ' + JSON.stringify(login.data));

    const sc = login.headers.get('set-cookie');
    if (sc) {
      // extract JSESSIONID
      const parts = sc.split(';').map(s=>s.trim());
      cookie = parts[0];
      writeResult('COOKIE: ' + cookie);
    } else {
      writeResult('NO SET-COOKIE RECEIVED');
    }
  } catch (e) {
    writeResult('LOGIN ERROR: ' + e.message);
    return;
  }

  // Create storefront
  let storefrontSlug = 'test-store';
  try {
    const storefrontPayload = {
      businessType: 'PRODUCT',
      name: 'Test Store',
      description: 'E2E test store',
      logoUrl: null,
      bannerUrl: null,
      data: {},
    };

    const create = await jsonPost('/api/business/storefronts', storefrontPayload, cookie ? { 'Cookie': cookie } : {});
    writeResult('CREATE STOREFRONT: ' + create.status + ' - ' + JSON.stringify(create.data));
    storefrontSlug = create.data?.slug || storefrontSlug;
  } catch (e) {
    writeResult('CREATE ERROR: ' + e.message);
    return;
  }

  // Fetch public storefront
  try {
    const pub = await jsonGet('/' + storefrontSlug);
    writeResult('PUBLIC STOREFRONT GET: ' + pub.status + ' - ' + JSON.stringify(pub.data));
  } catch (e) {
    writeResult('PUBLIC GET ERROR: ' + e.message);
  }

  writeResult('E2E TESTS COMPLETE');
}

run();
