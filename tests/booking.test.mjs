import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import ts from 'typescript';
import * as mime from 'mimetext/browser';
const source = readFileSync(new URL('../worker/index.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };

new Function('exports', 'require', 'module', compiled)(mod.exports, name => name === 'cloudflare:email' ? {EmailMessage:class {constructor(from,to,raw){Object.assign(this,{from,to,raw});}}} : name.includes('data/contact') ? {contact:{email:'school@example.com',businessName:'Santa Killa'}} : mime, mod);
const {validateBooking, handleBooking} = mod.exports;
const booking = {name:'Ana',email:'ana@example.com',phone:'+34 600 123 456',date:new Date(Date.now()+2*86400000).toISOString().slice(0,10),hour:'10:00',level:'Principiante',lesson:'grupo',people:'2',website:'',requestId:'12345678-1234-4123-8123-123456789abc'};
const env = {BOOKING_FROM:'reservas@example.com',BOOKING_EMAIL:{send:async()=>{}},BOOKING_LIMITER:{limit:async()=>({success:true})}};
const req = (data=booking,origin='https://school.example') => new Request('https://school.example/api/bookings',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
test('validates identity, dates, hours and people on the server',()=>{
 assert.ok(validateBooking(booking));
 for(const values of [{name:''},{email:'bad'},{name:'Ana\nBcc: other@example.com'},{date:'2026-02-30'},{date:'2020-01-01'},{hour:'20:00'},{people:1.5},{people:9},{lesson:'other'},{level:'other'}]) assert.equal(validateBooking({...booking,...values}),null);
});
test('sends only to fixed school recipient with reply-to and request reference',async()=>{
 let calls=0;
 const result=await handleBooking(req({...booking,to:'attacker@example.com'}),{...env,BOOKING_EMAIL:{send:async(message)=>{
  calls++; assert.equal(message.to,'school@example.com'); assert.ok(message.raw.includes('Reply-To: <ana@example.com>')); assert.ok(message.raw.includes('multipart/alternative')); assert.ok(message.raw.includes('text/html')); assert.ok(message.raw.includes('text/plain'));
  return;
 }}});
 assert.equal(result.status,200);assert.equal(calls,1);
});
test('rejects foreign origins, spam traps and invalid data without sending',async()=>{
 const protectedEnv={...env,BOOKING_EMAIL:{send:()=>{throw new Error('Must not send');}}};
 assert.equal((await handleBooking(req(booking,'https://other.example'),protectedEnv)).status,403);
 assert.equal((await handleBooking(req({...booking,website:'spam'}),protectedEnv)).status,400);
 assert.equal((await handleBooking(req({...booking,people:99}),protectedEnv)).status,400);
 assert.equal((await handleBooking(req({...booking,requestId:''}),protectedEnv)).status,400);
 assert.equal((await handleBooking(req({...booking,name:'x'.repeat(9000)}),protectedEnv)).status,413);
});
test('unconfigured delivery and rate limits never report success',async()=>{
 assert.equal((await handleBooking(req(),{})).status,503);
 assert.equal((await handleBooking(req(),{...env,BOOKING_LIMITER:{limit:async()=>({success:false})}})).status,429);
});
test('provider failures do not expose internal details or claim successful delivery',async()=>{
 for(const send of [async()=>{throw new Error('internal-provider-detail');}]) {
  const result=await handleBooking(req(),{...env,BOOKING_EMAIL:{send}}); assert.equal(result.status,502); assert.ok(!(await result.text()).includes('internal-provider-detail'));
 }
});

test('temporary test recipient is controlled by server configuration',async()=>{
 let message;
 assert.equal((await handleBooking(req(),{...env,BOOKING_TEST_TO:'test@example.com',BOOKING_EMAIL:{send:async(value)=>{message=value;}}})).status,200);
 assert.equal(message.to,'test@example.com');
 assert.ok(Buffer.from(message.raw.match(/Subject: =\?utf-8\?B\?([^?]+)/i)[1], 'base64').toString().includes('[PRUEBA]'));
});
