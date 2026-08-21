const fs = require('fs');
const { URL } = require('url');

(async function(){
  const env = fs.readFileSync('.env','utf8').split(/\r?\n/).filter(Boolean).reduce((acc,line)=>{const idx=line.indexOf('='); if(idx>0) acc[line.slice(0,idx)]=line.slice(idx+1); return acc; },{});
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;
  if(!email || !password){ console.error('NO_ADMIN_CREDS'); process.exit(1); }

  const loginRes = await fetch('http://localhost:3000/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }), redirect: 'manual' });
  const cookies = loginRes.headers.get('set-cookie');
  const body = await loginRes.text();
  console.log('LOGIN_STATUS', loginRes.status);
  try{ console.log('LOGIN_BODY', JSON.parse(body)); }catch(e){ console.log('LOGIN_BODY_TEXT', body.slice(0,200)); }
  if(!cookies){ console.log('NO_COOKIE_SET'); process.exit(1); }
  const cookieHeader = cookies.split(/, (?=[^ ;]+=)/).map(c=>c.split(';')[0]).join('; ');

  const meRes = await fetch('http://localhost:3000/api/auth/me', { headers: { Cookie: cookieHeader } });
  console.log('ME_STATUS', meRes.status);
  try{ console.log('ME_BODY', await meRes.json()); }catch(e){ console.log('ME_BODY_TEXT', await meRes.text()); }

  const statsRes = await fetch('http://localhost:3000/api/admin/stats', { headers: { Cookie: cookieHeader } });
  console.log('STATS_STATUS', statsRes.status);
  try{ console.log('STATS_BODY', await statsRes.json()); }catch(e){ console.log('STATS_BODY_TEXT', await statsRes.text()); }
})();
