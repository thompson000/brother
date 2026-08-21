const dns = require('dns').promises;
const fs = require('fs');
const { MongoClient } = require('mongodb');

(async function(){
  const host = 'cluster0.bru7xev.mongodb.net';
  try{
    const srv = await dns.resolveSrv('_mongodb._tcp.'+host);
    console.log('SRV_COUNT', srv.length);
    srv.forEach(s => console.log('SRV', s.name, s.port, s.priority, s.weight));
  }catch(e){
    console.error('SRV_ERR', e.code || e.message);
  }

  try{
    const a = await dns.lookup(host, { all: true });
    console.log('A_COUNT', a.length);
    a.forEach(x => console.log('A', x.address));
  }catch(e){
    console.error('A_ERR', e.code || e.message);
  }

  const env = fs.readFileSync('.env','utf8').split(/\r?\n/).filter(Boolean).reduce((acc,line)=>{
    const idx = line.indexOf('='); if(idx>0) acc[line.slice(0,idx)] = line.slice(idx+1); return acc;
  },{});
  const uri = env.MONGO_URI || '';
  if(!uri){ console.error('NO_URI'); process.exit(1); }
  const sanitized = uri.replace(/[?&]appName=[^&]*/g,'');

  try{
    const client = new MongoClient(sanitized, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    console.log('MONGO_CONNECTED');
    await client.db(env.MONGO_DB_NAME||'test').command({ ping: 1 });
    await client.close();
  }catch(e){
    console.error('MONGO_ERROR', e.name || '', e.code || '', e.message);
    process.exit(1);
  }
})();
