'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBrandsChart, ActivityTrendChart } from '@/components/admin/AdminCharts';
import { NotesAccordsEditor } from '@/components/admin/NotesAccordsEditor';
import { useConfirm, usePrompt } from '@/components/ui/ConfirmProvider';
import { useToast } from '@/components/Toast';
type Tab = 'overview'|'fragrances'|'prices'|'orders'|'users'|'partial-listings'|'reports'|'import'|'settings';
function af(path:string,secret:string,init:RequestInit={}):Promise<any>{
  return fetch(path,{...init,headers:{'Content-Type':'application/json','x-admin-secret':secret,...(init.headers as any||{})}}).then(r=>r.json());
}
export default function AdminPage(){
  const params=useParams(); const router=useRouter();
  const secret=Array.isArray(params.secret)?params.secret[0]:params.secret as string;
  const[authed,setAuthed]=useState(false);
  const[tab,setTab]=useState<Tab>('overview');
  useEffect(()=>{fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret})}).then(r=>r.json()).then(d=>{if(d.ok)setAuthed(true);else router.replace('/')}).catch(()=>router.replace('/'));},[secret,router]);
  if(!authed)return<div className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent"/><p className="text-sm text-ash">Verifying…</p></div></div>;
  const TABS:{id:Tab;label:string}[]=[{id:'overview',label:'Overview'},{id:'fragrances',label:'Fragrances'},{id:'prices',label:'Prices'},{id:'orders',label:'Orders'},{id:'users',label:'Users'},{id:'partial-listings',label:'Used Bottles'},{id:'reports',label:'Reports'},{id:'import',label:'Import'},{id:'settings',label:'Settings'}];
  return(
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between"><div><p className="section-label mb-1">Private</p><h1 className="font-display text-3xl text-bone">Admin Panel</h1></div><span className="font-mono text-2xs text-ash">ScentOS</span></div>
      <div className="mt-8 flex flex-wrap gap-1 border-b border-bone/[0.07]">
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-2.5 text-sm transition-colors ${tab===t.id?'border-b-2 border-gold text-bone':'text-ash hover:text-bone'}`}>{t.label}</button>)}
      </div>
      <div className="mt-8">
        {tab==='overview'&&<Overview secret={secret}/>}
        {tab==='fragrances'&&<Fragrances secret={secret}/>}
        {tab==='prices'&&<Prices secret={secret}/>}
        {tab==='orders'&&<Orders secret={secret}/>}
        {tab==='users'&&<Users secret={secret}/>}
        {tab==='partial-listings'&&<PartialListings secret={secret}/>}
        {tab==='reports'&&<Reports secret={secret}/>}
        {tab==='import'&&<Import secret={secret}/>}
        {tab==='settings'&&<Settings secret={secret}/>}
      </div>
    </div>
  );
}
function StatCard({label,value}:{label:string;value:any}){return<div className="glass rounded-2xl p-5"><p className="font-mono text-2xs uppercase tracking-wider text-ash">{label}</p><p className="mt-2 font-display text-3xl text-gold">{value}</p></div>;}
function Overview({secret}:{secret:string}){
  const[stats,setStats]=useState<any>(null);const[bfl,setBfl]=useState(false);const[msg,setMsg]=useState('');
  useEffect(()=>{af('/api/admin/stats',secret).then(setStats);},[secret]);
  async function backfill(){setBfl(true);setMsg('');const r=await af('/api/admin/backfill-embeddings',secret,{method:'POST'}).catch(()=>null);setMsg(r?`Updated ${r.updated}/${r.total??0} fragrances.`:'Failed — check OPENAI_API_KEY.');setBfl(false);}
  if(!stats)return<div className="h-48 animate-pulse rounded-2xl bg-obsidian2"/>;
  return<div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Fragrances" value={stats.fragrances}/><StatCard label="Brands" value={stats.brands}/><StatCard label="Users" value={stats.users}/><StatCard label="Orders" value={stats.orders}/><StatCard label="Active decant listings" value={stats.activeListings}/><StatCard label="Used bottle listings" value={stats.partialListings}/><StatCard label="Reviews" value={stats.reviews}/><StatCard label="Open reports" value={stats.openReports}/></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass rounded-2xl p-6"><h2 className="mb-4 font-display text-lg text-bone">Top brands by catalog size</h2><TopBrandsChart data={stats.topBrands??[]}/></div>
      <div className="glass rounded-2xl p-6"><h2 className="mb-4 font-display text-lg text-bone">Collection activity — 14 days</h2><ActivityTrendChart data={stats.activityTrend??[]}/></div>
    </div>
    <div className="glass rounded-2xl p-6"><h2 className="font-display text-lg text-bone">Fragrance Genome — embeddings</h2><p className="mt-2 text-sm text-ash">Generates OpenAI vectors for fragrances missing them. Run after importing fragrances.</p><button onClick={backfill} disabled={bfl} className="btn-gold mt-4 disabled:opacity-50">{bfl?'Backfilling…':'Run backfill'}</button>{msg&&<p className="mt-3 text-sm text-electric">{msg}</p>}</div>
  </div>;
}
function Fragrances({secret}:{secret:string}){
  const confirmDialog=useConfirm();
  const{toast}=useToast();
  const[items,setItems]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[search,setSearch]=useState('');const[editing,setEditing]=useState<any>(null);const[notesEditingId,setNotesEditingId]=useState<string|null>(null);
  const[form,setForm]=useState({name:'',brandName:'',concentration:'',priceTierUsd:'',releaseYear:'',longevityHrs:'',projection:'',description:'',seasons:'',occasions:''});const[error,setError]=useState('');
  const[justCreatedId,setJustCreatedId]=useState<string|null>(null);
  const refresh=()=>{setLoading(true);af('/api/admin/fragrances',secret).then(setItems).finally(()=>setLoading(false));};
  useEffect(refresh,[secret]);
  const filtered=items.filter(f=>f.name?.toLowerCase().includes(search.toLowerCase())||f.brands?.name?.toLowerCase().includes(search.toLowerCase()));
  async function create(e:React.FormEvent){e.preventDefault();setError('');const r=await af('/api/admin/fragrances',secret,{method:'POST',body:JSON.stringify({name:form.name,brandName:form.brandName,concentration:form.concentration||undefined,priceTierUsd:form.priceTierUsd?Number(form.priceTierUsd):undefined,releaseYear:form.releaseYear?Number(form.releaseYear):undefined,longevityHrs:form.longevityHrs?Number(form.longevityHrs):undefined,projection:form.projection||undefined,description:form.description||undefined,seasons:form.seasons?form.seasons.split(',').map((s:string)=>s.trim()):[],occasions:form.occasions?form.occasions.split(',').map((s:string)=>s.trim()):[],})});if(r.error){setError(r.error);return;}setForm({name:'',brandName:'',concentration:'',priceTierUsd:'',releaseYear:'',longevityHrs:'',projection:'',description:'',seasons:'',occasions:''});refresh();if(r.id)setJustCreatedId(r.id);}
  async function saveEdit(){if(!editing)return;await af(`/api/admin/fragrances/${editing.id}`,secret,{method:'PATCH',body:JSON.stringify({name:editing.name,description:editing.description,concentration:editing.concentration,price_tier_usd:editing.price_tier_usd,seasons:typeof editing.seasons==='string'?editing.seasons.split(',').map((s:string)=>s.trim()):editing.seasons,occasions:typeof editing.occasions==='string'?editing.occasions.split(',').map((s:string)=>s.trim()):editing.occasions})});setEditing(null);toast('Changes saved.','success');refresh();}
  return<div className="space-y-6">
    {editing&&<div className="glass rounded-2xl p-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg text-bone">Editing: {editing.name}</h2><button onClick={()=>setEditing(null)} className="text-sm text-ash">Cancel</button></div><div className="grid gap-3 sm:grid-cols-2">{(['name','concentration','price_tier_usd','seasons','occasions'] as const).map((k,i)=>{const l=['Name','Concentration','Price tier','Seasons (comma sep)','Occasions (comma sep)'][i];return(<label key={k} className="block"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">{l}</span><input value={Array.isArray(editing[k])?editing[k].join(', '):String(editing[k]??'')} onChange={e=>setEditing((v:any)=>({...v,[k]:e.target.value}))} className="input"/></label>);})}<label className="block sm:col-span-2"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">Description</span><textarea rows={3} value={editing.description??''} onChange={e=>setEditing((v:any)=>({...v,description:e.target.value}))} className="input resize-none"/></label></div><button onClick={saveEdit} className="btn-gold mt-4">Save changes</button></div>}
    <form onSubmit={create} className="glass rounded-2xl p-6"><h2 className="mb-4 font-display text-lg text-bone">Add fragrance manually</h2><div className="grid gap-3 sm:grid-cols-3">{(['name','brandName','concentration','priceTierUsd','releaseYear','longevityHrs','seasons','occasions'] as const).map((k,i)=>{const l=['Name *','Brand *','Concentration','Price tier (USD)','Release year','Longevity (hrs)','Seasons (spring,summer…)','Occasions (office,casual…)'][i];const req=i<2;const t=['releaseYear','longevityHrs','priceTierUsd'].includes(k)?'number':'text';return(<label key={k} className="block"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">{l}</span><input type={t} required={req} value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="input"/></label>);})}<label className="block"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">Projection</span><select value={form.projection} onChange={e=>setForm(f=>({...f,projection:e.target.value}))} className="input"><option value="">—</option><option value="intimate">Intimate</option><option value="moderate">Moderate</option><option value="strong">Strong</option><option value="beast-mode">Beast mode</option></select></label></div><label className="mt-3 block"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">Description</span><textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="input resize-none"/></label>{error&&<p className="mt-3 text-sm text-ember">{error}</p>}<button type="submit" className="btn-gold mt-4">Add fragrance</button>
      {justCreatedId&&<div className="mt-4 flex items-center gap-3 rounded-xl border border-electric/25 bg-electric/[0.06] px-4 py-3"><p className="flex-1 text-sm text-bone">Fragrance added. Add notes and accords now?</p><button type="button" onClick={()=>{setNotesEditingId(justCreatedId);setJustCreatedId(null);}} className="btn-electric text-xs !py-1.5 !px-3">Add now</button><button type="button" onClick={()=>setJustCreatedId(null)} className="text-xs text-ash">Later</button></div>}
    </form>
    <div className="glass rounded-2xl p-4"><div className="mb-4 flex items-center gap-3"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="input max-w-xs"/><p className="text-sm text-ash">{filtered.length}</p></div>
      {loading?<div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-10 animate-pulse rounded-lg bg-obsidian2"/>)}</div>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-bone/[0.07]">{['Name','Brand','Type','Price','Emb','Status',''].map(h=><th key={h} className="pb-3 pr-4 font-mono text-2xs uppercase tracking-wider text-ash">{h}</th>)}</tr></thead><tbody>{filtered.map(f=><tr key={f.id} className="border-b border-bone/[0.04] hover:bg-bone/[0.02]"><td className="py-2.5 pr-4 text-bone">{f.name}</td><td className="py-2.5 pr-4 text-ash">{f.brands?.name}</td><td className="py-2.5 pr-4 font-mono text-xs text-ash">{f.concentration||'—'}</td><td className="py-2.5 pr-4 font-mono text-xs text-ash">{f.price_tier_usd?`$${f.price_tier_usd}`:'—'}</td><td className="py-2.5 pr-4">{f.embedding?<span className="text-electric">✓</span>:<span className="text-ash/40">—</span>}</td><td className="py-2.5 pr-4"><button onClick={()=>af(`/api/admin/fragrances/${f.id}`,secret,{method:'PATCH',body:JSON.stringify({toggleDiscontinued:true})}).then(refresh)} className={`font-mono text-2xs ${f.discontinued?'text-ember':'text-electric'}`}>{f.discontinued?'Disc.':'Active'}</button></td><td className="py-2.5 text-right"><button onClick={()=>setNotesEditingId(f.id)} className="mr-3 text-xs text-electric hover:underline">Notes/Accords</button><button onClick={()=>setEditing(f)} className="mr-3 text-xs text-bone hover:text-gold">Edit</button><button onClick={async()=>{const ok=await confirmDialog({title:'Delete fragrance',message:`Permanently delete "${f.name}"? This also removes its notes, accords, and price history.`,confirmLabel:'Delete',danger:true});if(!ok)return;const r=await af(`/api/admin/fragrances/${f.id}`,secret,{method:'DELETE'});if(r?.error){toast(r.error,'error');return;}toast('Fragrance deleted.','success');refresh();}} className="text-xs text-ember">Del</button></td></tr>)}</tbody></table></div>}
    </div>
    {notesEditingId&&<NotesAccordsEditor fragranceId={notesEditingId} secret={secret} onClose={()=>setNotesEditingId(null)}/>}
  </div>;
}
function Prices({secret}:{secret:string}){
  const[fragrances,setFragrances]=useState<any[]>([]);const[sel,setSel]=useState('');const[prices,setPrices]=useState<any[]>([]);const[loading,setLoading]=useState(false);
  const[form,setForm]=useState({retailer:'',price:'',url:'',currency:'USD'});const[error,setError]=useState('');
  useEffect(()=>{af('/api/admin/fragrances',secret).then(setFragrances);},[secret]);
  async function load(id:string){setSel(id);setLoading(true);const r=await af(`/api/admin/prices/${id}`,secret);setPrices(r??[]);setLoading(false);}
  async function add(e:React.FormEvent){e.preventDefault();setError('');const r=await af(`/api/admin/prices/${sel}`,secret,{method:'POST',body:JSON.stringify({retailer:form.retailer,price:Number(form.price),url:form.url,currency:form.currency})});if(r.error){setError(r.error);return;}setForm({retailer:'',price:'',url:'',currency:'USD'});load(sel);}
  return<div className="space-y-6"><div className="glass rounded-2xl p-6"><h2 className="mb-4 font-display text-lg text-bone">Select fragrance</h2><select value={sel} onChange={e=>load(e.target.value)} className="input max-w-sm"><option value="">Choose…</option>{fragrances.map(f=><option key={f.id} value={f.id}>{f.name} — {f.brands?.name}</option>)}</select></div>
    {sel&&<><form onSubmit={add} className="glass rounded-2xl p-6"><h2 className="mb-4 font-display text-lg text-bone">Add price point</h2><div className="grid gap-3 sm:grid-cols-4">{(['retailer','price','url'] as const).map((k,i)=>{const l=['Retailer','Price','URL'][i];const t=k==='price'?'number':'text';return(<label key={k} className="block"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">{l}</span><input type={t} required value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="input"/></label>);})}<label className="block"><span className="mb-1 block font-mono text-2xs uppercase tracking-wider text-ash">Currency</span><select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))} className="input"><option>USD</option><option>BDT</option><option>GBP</option><option>EUR</option></select></label></div>{error&&<p className="mt-3 text-sm text-ember">{error}</p>}<button type="submit" className="btn-gold mt-4">Add price</button></form>
    <div className="glass rounded-2xl p-4">{loading?<p className="text-ash">Loading…</p>:prices.length===0?<p className="text-ash">No prices yet.</p>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-bone/[0.07]">{['Retailer','Price','Currency',''].map(h=><th key={h} className="pb-2 pr-4 text-left font-mono text-2xs uppercase text-ash">{h}</th>)}</tr></thead><tbody>{prices.map((p:any)=><tr key={p.id} className="border-b border-bone/[0.04]"><td className="py-2 pr-4 text-bone">{p.retailer}</td><td className="py-2 pr-4 font-mono text-gold">{p.price}</td><td className="py-2 pr-4 text-ash">{p.currency}</td><td className="py-2 text-right"><button onClick={()=>af(`/api/admin/prices/point/${p.id}`,secret,{method:'DELETE'}).then(()=>load(sel))} className="text-xs text-ember">Del</button></td></tr>)}</tbody></table></div>}</div></>}
  </div>;
}
function Orders({secret}:{secret:string}){
  const[orders,setOrders]=useState<any[]>([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{af('/api/admin/orders',secret).then(setOrders).finally(()=>setLoading(false));},[secret]);
  if(loading)return<div className="h-48 animate-pulse rounded-2xl bg-obsidian2"/>;
  if(!orders.length)return<p className="text-ash">No orders yet.</p>;
  return<div className="glass rounded-2xl p-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-bone/[0.07]">{['Fragrance','Buyer','Seller','Amount','Status','Date'].map(h=><th key={h} className="pb-3 pr-4 text-left font-mono text-2xs uppercase text-ash">{h}</th>)}</tr></thead><tbody>{orders.map(o=><tr key={o.id} className="border-b border-bone/[0.04]"><td className="py-2.5 pr-4 text-bone">{(o.decant_listings as any)?.fragrances?.name??'—'}</td><td className="py-2.5 pr-4 text-ash">{(o.buyer as any)?.email??'—'}</td><td className="py-2.5 pr-4 text-ash">{(o.seller as any)?.email??'—'}</td><td className="py-2.5 pr-4 font-mono text-gold">${Number(o.amount).toFixed(2)}</td><td className="py-2.5 pr-4 font-mono text-2xs text-ash">{o.status}</td><td className="py-2.5 text-xs text-ash">{new Date(o.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>;
}
function Users({secret}:{secret:string}){
  const[users,setUsers]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[search,setSearch]=useState('');
  useEffect(()=>{af('/api/admin/users',secret).then(setUsers).finally(()=>setLoading(false));},[secret]);
  const filtered=users.filter(u=>(u.email||'').toLowerCase().includes(search.toLowerCase())||(u.name||'').toLowerCase().includes(search.toLowerCase()));
  return<div className="space-y-4"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="input max-w-sm"/><div className="glass rounded-2xl p-4 overflow-x-auto">{loading?<div className="h-48 animate-pulse rounded-xl bg-obsidian2"/>:<table className="w-full text-sm"><thead><tr className="border-b border-bone/[0.07]">{['Name','Email','Country','Collection','Reviews','Joined'].map(h=><th key={h} className="pb-3 pr-4 text-left font-mono text-2xs uppercase text-ash">{h}</th>)}</tr></thead><tbody>{filtered.map(u=><tr key={u.id} className="border-b border-bone/[0.04]"><td className="py-2.5 pr-4 text-bone">{u.name??'—'}</td><td className="py-2.5 pr-4 text-ash">{u.email}</td><td className="py-2.5 pr-4 text-ash">{u.country??'—'}</td><td className="py-2.5 pr-4 text-ash">{u.collection_count}</td><td className="py-2.5 pr-4 text-ash">{u.review_count}</td><td className="py-2.5 text-xs text-ash">{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>}</div></div>;
}
function PartialListings({secret}:{secret:string}){
  const[listings,setListings]=useState<any[]>([]);const[loading,setLoading]=useState(true);
  const refresh=()=>{setLoading(true);af('/api/admin/partial-listings',secret).then(setListings).finally(()=>setLoading(false));};
  useEffect(refresh,[secret]);
  if(loading)return<div className="h-48 animate-pulse rounded-2xl bg-obsidian2"/>;
  if(!listings.length)return<p className="text-ash">No listings yet.</p>;
  return<div className="glass rounded-2xl p-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-bone/[0.07]">{['Bottle','Seller','Price','Inq','Rep','Status',''].map(h=><th key={h} className="pb-3 pr-4 text-left font-mono text-2xs uppercase text-ash">{h}</th>)}</tr></thead><tbody>{listings.map(l=><tr key={l.id} className="border-b border-bone/[0.04]"><td className="py-2.5 pr-4 text-bone">{l.perfume_name}</td><td className="py-2.5 pr-4 text-ash">{(l.profiles as any)?.email??'—'}</td><td className="py-2.5 pr-4 font-mono text-gold">{l.currency} {Number(l.price).toFixed(0)}</td><td className="py-2.5 pr-4 text-electric">{l.inquiry_count}</td><td className={`py-2.5 pr-4 ${l.report_count>0?'text-ember font-bold':'text-ash'}`}>{l.report_count}</td><td className={`py-2.5 pr-4 font-mono text-2xs ${l.status==='active'?'text-electric':'text-ember'}`}>{l.status}</td><td className="py-2.5 text-right">{l.status==='active'?<button onClick={()=>af(`/api/admin/partial-listings/${l.id}`,secret,{method:'PATCH',body:JSON.stringify({status:'removed'})}).then(refresh)} className="text-xs text-ember">Remove</button>:<button onClick={()=>af(`/api/admin/partial-listings/${l.id}`,secret,{method:'PATCH',body:JSON.stringify({status:'active'})}).then(refresh)} className="text-xs text-electric">Restore</button>}</td></tr>)}</tbody></table></div>;
}
function Reports({secret}:{secret:string}){
  const confirmDialog=useConfirm();const promptDialog=usePrompt();const{toast}=useToast();
  const[reports,setReports]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[groupBy,setGroupBy]=useState<'none'|'user'|'listing'>('none');
  const refresh=()=>{setLoading(true);af('/api/admin/reports',secret).then(setReports).finally(()=>setLoading(false));};
  useEffect(refresh,[secret]);
  async function removeListing(listingId:string){
    const ok=await confirmDialog({title:'Remove listing',message:'This takes the listing off the marketplace immediately.',confirmLabel:'Remove',danger:true});
    if(!ok)return;
    const r=await af(`/api/admin/partial-listings/${listingId}`,secret,{method:'PATCH',body:JSON.stringify({status:'removed'})});
    if(r?.error){toast(r.error,'error');return;}
    toast('Listing removed.','success');refresh();
  }
  async function suspendUser(userId:string,email:string){
    const reason=await promptDialog({title:'Suspend user',message:`Suspending ${email} blocks them from creating new listings, decants, reviews, or posts. Why?`,placeholder:'Reason (shown only to admins)',confirmLabel:'Suspend'});
    if(reason===null)return;
    const r=await af(`/api/admin/users/${userId}/suspend`,secret,{method:'POST',body:JSON.stringify({reason})});
    if(r?.error){toast(r.error,'error');return;}
    toast(`${email} suspended.`,'success');refresh();
  }
  async function unsuspendUser(userId:string,email:string){
    const ok=await confirmDialog({message:`Restore ${email}'s ability to post listings, decants, reviews, and posts?`,confirmLabel:'Unsuspend'});
    if(!ok)return;
    const r=await af(`/api/admin/users/${userId}/suspend`,secret,{method:'DELETE'});
    if(r?.error){toast(r.error,'error');return;}
    toast(`${email} unsuspended.`,'success');refresh();
  }
  const groups=new Map<string,any[]>();
  if(groupBy==='none')groups.set('all',reports);
  else if(groupBy==='user')for(const r of reports){const k=(r.reported_user as any)?.email??'Unknown';groups.set(k,[...(groups.get(k)??[]),r]);}
  else for(const r of reports){const k=(r.partial_bottle_listings as any)?.perfume_name??'Unknown';groups.set(k,[...(groups.get(k)??[]),r]);}
  if(loading)return<div className="h-48 animate-pulse rounded-2xl bg-obsidian2"/>;
  if(!reports.length)return<p className="text-ash">No reports.</p>;
  return<div><div className="mb-5 flex gap-2">{(['none','user','listing'] as const).map(g=><button key={g} onClick={()=>setGroupBy(g)} className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${groupBy===g?'bg-gold text-matte':'bg-bone/5 text-ash hover:bg-bone/10'}`}>{g==='none'?'All reports':`By ${g}`}</button>)}</div>
    <div className="space-y-5">{[...groups.entries()].map(([key,group])=>(
      <div key={key}>
        {groupBy!=='none'&&<p className="mb-2 font-mono text-2xs uppercase tracking-wider text-ash">{key} — {group.length}</p>}
        <div className="space-y-3">{group.map(r=>{
          const reportedUser=r.reported_user as any;
          const listing=r.partial_bottle_listings as any;
          return(
            <div key={r.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-bone">{r.reason}</p>
                  {r.details&&<p className="mt-1 text-sm text-ash">{r.details}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 font-mono text-2xs text-ash">
                    <span>By {(r.reporter as any)?.email}</span>
                    {reportedUser&&<span>Against: {reportedUser.email}{reportedUser.is_suspended&&<span className="ml-1.5 text-ember">· suspended</span>}</span>}
                    {listing&&<span>Listing: &ldquo;{listing.perfume_name}&rdquo;{listing.status!=='active'&&<span className="ml-1.5 text-ash/60">· {listing.status}</span>}</span>}
                    {r.reportedUserTotalReports>1&&<span className="text-ember">{r.reportedUserTotalReports} total reports against this user</span>}
                  </div>
                </div>
                <select value={r.status} onChange={e=>af(`/api/admin/reports/${r.id}`,secret,{method:'PATCH',body:JSON.stringify({status:e.target.value})}).then(refresh)} className="input w-auto shrink-0 py-1.5 text-xs"><option value="open">Open</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select>
              </div>
              {(listing||reportedUser)&&<div className="mt-4 flex flex-wrap gap-2 border-t border-bone/[0.06] pt-4">
                {listing&&listing.status==='active'&&<button onClick={()=>removeListing(listing.id)} className="rounded-full border border-ember/30 px-3 py-1.5 text-xs text-ember hover:bg-ember/10">Remove listing</button>}
                {reportedUser&&(reportedUser.is_suspended
                  ?<button onClick={()=>unsuspendUser(reportedUser.id,reportedUser.email)} className="rounded-full border border-electric/30 px-3 py-1.5 text-xs text-electric hover:bg-electric/10">Unsuspend user</button>
                  :<button onClick={()=>suspendUser(reportedUser.id,reportedUser.email)} className="rounded-full border border-ember/30 px-3 py-1.5 text-xs text-ember hover:bg-ember/10">Suspend user</button>
                )}
              </div>}
            </div>
          );
        })}</div>
      </div>
    ))}</div>
  </div>;
}
function Import({secret}:{secret:string}){
  const[mode,setMode]=useState<'csv'|'pdf'>('csv');
  return<div className="space-y-6">
    <div className="flex gap-2">
      <button onClick={()=>setMode('csv')} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${mode==='csv'?'bg-gold/15 text-gold border border-gold/30':'text-ash hover:text-bone border border-transparent'}`}>CSV Import</button>
      <button onClick={()=>setMode('pdf')} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${mode==='pdf'?'bg-gold/15 text-gold border border-gold/30':'text-ash hover:text-bone border border-transparent'}`}>PDF Import (AI)</button>
    </div>
    {mode==='csv'?<CsvImport secret={secret}/>:<PdfImport secret={secret}/>}
  </div>;
}
function CsvImport({secret}:{secret:string}){
  const[file,setFile]=useState<File|null>(null);const[preview,setPreview]=useState<any[]>([]);const[importing,setImporting]=useState(false);const[result,setResult]=useState<any>(null);const[error,setError]=useState('');
  function parseCSV(text:string){const lines=text.trim().split('\n');const headers=lines[0].split(',').map(h=>h.trim().replace(/^"|"$/g,'').toLowerCase().replace(/\s+/g,'_'));return lines.slice(1).filter(Boolean).map(line=>{const vals=line.match(/(".*?"|[^,]+)/g)?.map(v=>v.trim().replace(/^"|"$/g,''))??[];return Object.fromEntries(headers.map((h,i)=>[h,vals[i]??'']));});}
  async function onFile(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;setFile(f);setResult(null);setError('');const text=await f.text();setPreview(parseCSV(text).slice(0,5));}
  async function doImport(){if(!file)return;setImporting(true);setError('');setResult(null);const text=await file.text();const rows=parseCSV(text);const r=await fetch('/api/admin/import',{method:'POST',headers:{'Content-Type':'application/json','x-admin-secret':secret},body:JSON.stringify({rows})}).then(x=>x.json()).catch(()=>null);setImporting(false);if(!r||r.error){setError(r?.error??'Import failed');return;}setResult(r);}
  return<div className="space-y-6">
    <div className="glass rounded-2xl p-6"><h2 className="font-display text-xl text-bone">Bulk import via CSV</h2><p className="mt-2 text-sm text-ash">Upload a CSV to add fragrances. Use <code className="text-gold">|</code> for multiple seasons/occasions.</p><div className="mt-4 rounded-xl border border-bone/10 bg-obsidian2 p-4"><p className="font-mono text-2xs text-ash">Required: <span className="text-electric">name, brand</span></p><p className="mt-1 font-mono text-2xs text-ash">Optional: <span className="text-bone">concentration, description, price_tier_usd, release_year, seasons, occasions</span></p></div><label className="mt-5 block"><span className="btn-ghost cursor-pointer text-sm">Choose CSV file</span><input type="file" accept=".csv" onChange={onFile} className="hidden"/></label>{file&&<p className="mt-2 font-mono text-2xs text-electric">{file.name}</p>}</div>
    {preview.length>0&&<div className="glass rounded-2xl p-4"><p className="mb-3 font-mono text-2xs uppercase tracking-wider text-ash">Preview — first {preview.length} rows</p><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-bone/[0.07]">{Object.keys(preview[0]).map(k=><th key={k} className="pb-2 pr-4 text-left font-mono text-2xs uppercase text-ash">{k}</th>)}</tr></thead><tbody>{preview.map((row,i)=><tr key={i} className="border-b border-bone/[0.04]">{Object.values(row).map((v:any,j)=><td key={j} className="py-2 pr-4 text-bone">{v}</td>)}</tr>)}</tbody></table></div><button onClick={doImport} disabled={importing} className="btn-gold mt-5 disabled:opacity-50">{importing?'Importing…':`Import all rows from ${file?.name}`}</button></div>}
    {error&&<p className="text-sm text-ember">{error}</p>}
    {result&&<div className="glass rounded-2xl p-6"><div className="flex gap-6"><div><p className="font-mono text-2xs uppercase text-ash">Imported</p><p className="font-display text-3xl text-electric">{result.ok}</p></div><div><p className="font-mono text-2xs uppercase text-ash">Failed</p><p className={`font-display text-3xl ${result.failed>0?'text-ember':'text-ash'}`}>{result.failed}</p></div></div>{result.results?.filter((r:any)=>r.status==='error').map((r:any)=><div key={r.row} className="mt-2 rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">Row {r.row} — {r.name}: {r.error}</div>)}</div>}
  </div>;
}
function PdfImport({secret}:{secret:string}){
  const[file,setFile]=useState<File|null>(null);const[extracting,setExtracting]=useState(false);const[extracted,setExtracted]=useState<any[]|null>(null);const[error,setError]=useState('');
  const[importing,setImporting]=useState(false);const[result,setResult]=useState<any>(null);const[selected,setSelected]=useState<Set<number>>(new Set());

  function fileToBase64(f:File):Promise<string>{
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{const result=reader.result as string;resolve(result.split(',')[1]);};
      reader.onerror=reject;
      reader.readAsDataURL(f);
    });
  }

  async function onFile(e:React.ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>10*1024*1024){setError('PDF is too large (max 10MB).');return;}
    setFile(f);setExtracted(null);setResult(null);setError('');
  }

  async function extract(){
    if(!file)return;
    setExtracting(true);setError('');setExtracted(null);
    try{
      const base64=await fileToBase64(file);
      const r=await fetch('/api/admin/import-pdf',{method:'POST',headers:{'Content-Type':'application/json','x-admin-secret':secret},body:JSON.stringify({fileBase64:base64})}).then(x=>x.json());
      if(r.error){setError(r.error);return;}
      const frags=r.fragrances??[];
      setExtracted(frags);
      setSelected(new Set(frags.map((_:any,i:number)=>i)));
    }catch(e:any){setError(e.message??'Failed to read PDF.');}
    finally{setExtracting(false);}
  }

  function toggle(i:number){setSelected(s=>{const n=new Set(s);if(n.has(i))n.delete(i);else n.add(i);return n;});}

  function updateField(i:number,key:string,value:string){
    setExtracted(prev=>{
      if(!prev)return prev;
      const next=[...prev];
      next[i]={...next[i],[key]:value};
      return next;
    });
  }

  async function commitImport(){
    if(!extracted)return;
    const toImport=extracted.filter((_,i)=>selected.has(i));
    if(toImport.length===0){setError('Select at least one fragrance to import.');return;}
    setImporting(true);setError('');setResult(null);
    const r=await fetch('/api/admin/import-structured',{method:'POST',headers:{'Content-Type':'application/json','x-admin-secret':secret},body:JSON.stringify({fragrances:toImport})}).then(x=>x.json()).catch(()=>null);
    setImporting(false);
    if(!r||r.error){setError(r?.error??'Import failed');return;}
    setResult(r);
  }

  return<div className="space-y-6">
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl text-bone">Import via PDF (AI-powered)</h2>
      <p className="mt-2 text-sm text-ash">Upload a supplier catalog, price list, or spec sheet PDF. Claude reads it and extracts fragrance data — names, brands, notes, accords, prices — for you to review before importing.</p>
      <div className="mt-4 rounded-xl border border-bone/10 bg-obsidian2 p-4">
        <p className="font-mono text-2xs text-ash">Works best with: catalogs, price lists, spec sheets, brand line sheets.</p>
        <p className="mt-1 font-mono text-2xs text-ash">Nothing is added to your database until you review and confirm below.</p>
      </div>
      <label className="mt-5 block"><span className="btn-ghost cursor-pointer text-sm">Choose PDF file</span><input type="file" accept=".pdf,application/pdf" onChange={onFile} className="hidden"/></label>
      {file&&<p className="mt-2 font-mono text-2xs text-electric">{file.name} · {(file.size/1024/1024).toFixed(1)}MB</p>}
      {file&&!extracted&&<button onClick={extract} disabled={extracting} className="btn-gold mt-4 disabled:opacity-50">{extracting?'Reading PDF with AI…':'Extract fragrances'}</button>}
      {error&&<p className="mt-3 text-sm text-ember">{error}</p>}
    </div>

    {extracted&&extracted.length===0&&<div className="glass rounded-2xl p-6 text-center"><p className="text-ash">No fragrances found in this document. Try a different file.</p></div>}

    {extracted&&extracted.length>0&&!result&&(
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-2xs uppercase tracking-wider text-ash">Found {extracted.length} fragrance{extracted.length!==1?'s':''} · {selected.size} selected</p>
          <div className="flex gap-3">
            <button onClick={()=>setSelected(new Set(extracted.map((_,i)=>i)))} className="text-xs text-electric hover:underline">Select all</button>
            <button onClick={()=>setSelected(new Set())} className="text-xs text-ash hover:text-bone">Deselect all</button>
          </div>
        </div>
        <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {extracted.map((f,i)=>(
            <div key={i} className={`rounded-xl border p-4 transition-colors ${selected.has(i)?'border-gold/30 bg-gold/[0.04]':'border-bone/10'}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.has(i)} onChange={()=>toggle(i)} className="mt-1 h-4 w-4 shrink-0 accent-gold"/>
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <input value={f.name??''} onChange={e=>updateField(i,'name',e.target.value)} placeholder="Name" className="input py-1.5 text-sm"/>
                  <input value={f.brand??''} onChange={e=>updateField(i,'brand',e.target.value)} placeholder="Brand" className="input py-1.5 text-sm"/>
                </div>
              </div>
              <div className="mt-2 ml-7 flex flex-wrap gap-1.5 font-mono text-2xs text-ash">
                {f.concentration&&<span className="badge border border-bone/10">{f.concentration}</span>}
                {f.priceTierUsd&&<span className="badge border border-gold/20 text-gold">${f.priceTierUsd}</span>}
                {f.releaseYear&&<span className="badge border border-bone/10">{f.releaseYear}</span>}
                {(f.notes?.top?.length||f.notes?.mid?.length||f.notes?.base?.length)?<span className="badge border border-electric/20 text-electric">{(f.notes?.top?.length??0)+(f.notes?.mid?.length??0)+(f.notes?.base?.length??0)} notes</span>:null}
                {f.accords?.length>0&&<span className="badge border border-bone/10">{f.accords.length} accords</span>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={commitImport} disabled={importing||selected.size===0} className="btn-gold mt-5 disabled:opacity-50">{importing?'Importing…':`Import ${selected.size} selected fragrance${selected.size!==1?'s':''}`}</button>
      </div>
    )}

    {result&&<div className="glass rounded-2xl p-6"><div className="flex gap-6"><div><p className="font-mono text-2xs uppercase text-ash">Imported</p><p className="font-display text-3xl text-electric">{result.ok}</p></div><div><p className="font-mono text-2xs uppercase text-ash">Failed</p><p className={`font-display text-3xl ${result.failed>0?'text-ember':'text-ash'}`}>{result.failed}</p></div></div>{result.results?.filter((r:any)=>r.status==='error').map((r:any)=><div key={r.row} className="mt-2 rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">Row {r.row} — {r.name}: {r.error}</div>)}
      <button onClick={()=>{setFile(null);setExtracted(null);setResult(null);}} className="mt-4 font-mono text-2xs text-electric hover:underline">Import another PDF</button>
    </div>}
  </div>;
}

function Settings({secret}:{secret:string}){
  const{toast}=useToast();
  const confirmDialog=useConfirm();
  const[keys,setKeys]=useState<any[]|null>(null);
  const[editing,setEditing]=useState<string|null>(null);
  const[value,setValue]=useState('');
  const[saving,setSaving]=useState(false);
  const[testing,setTesting]=useState<string|null>(null);
  const refresh=()=>{af('/api/admin/settings',secret).then(setKeys);};
  useEffect(refresh,[secret]);

  async function save(dbKey:string){
    if(!value.trim()){toast('Enter a key first.','error');return;}
    setSaving(true);
    const r=await af('/api/admin/settings',secret,{method:'POST',body:JSON.stringify({dbKey,value:value.trim()})});
    setSaving(false);
    if(r?.error){toast(r.error,'error');return;}
    toast('Key saved. Takes effect within ~2 minutes.','success');
    setEditing(null);setValue('');refresh();
  }
  async function revert(dbKey:string,label:string){
    const ok=await confirmDialog({title:'Revert to environment variable',message:`This removes the admin-set override for ${label} and falls back to whatever's in your Vercel environment variables.`,confirmLabel:'Revert'});
    if(!ok)return;
    const r=await af(`/api/admin/settings?dbKey=${dbKey}`,secret,{method:'DELETE'});
    if(r?.error){toast(r.error,'error');return;}
    toast(`Reverted to ${r.revertedTo==='env'?'environment variable':'nothing — no key configured'}.`,'success');
    refresh();
  }
  async function testConnection(dbKey:string){
    setTesting(dbKey);
    const r=await af('/api/admin/settings/test',secret,{method:'POST',body:JSON.stringify({dbKey})});
    setTesting(null);
    if(r?.ok)toast('Connection successful.','success');
    else toast(r?.error??'Connection failed.','error');
  }

  return<div className="space-y-6">
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl text-bone">AI provider keys</h2>
      <p className="mt-2 text-sm text-ash">These power the AI Advisor, ScentGPT, Layering, PDF import, and the Genome embeddings backfill. Setting a key here overrides your Vercel environment variable without needing a redeploy — changes take effect within about 2 minutes.</p>
    </div>
    {!keys?<div className="h-32 animate-pulse rounded-2xl bg-obsidian2"/>:keys.map((k:any)=>(
      <div key={k.dbKey} className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-display text-lg text-bone">{k.label}</h3>
              <span className={`badge border text-2xs ${k.source==='admin'?'border-gold/30 text-gold':k.source==='env'?'border-electric/30 text-electric':'border-ember/30 text-ember'}`}>
                {k.source==='admin'?'Set in admin':k.source==='env'?'From environment':'Not configured'}
              </span>
            </div>
            <p className="mt-1.5 font-mono text-xs text-ash">{k.masked||'No key found'}</p>
            {k.updatedAt&&<p className="mt-1 font-mono text-2xs text-ash/50">Updated {new Date(k.updatedAt).toLocaleString()}</p>}
          </div>
          <div className="flex gap-2">
            {k.source!=='none'&&<button onClick={()=>testConnection(k.dbKey)} disabled={testing===k.dbKey} className="btn-ghost text-xs disabled:opacity-50">{testing===k.dbKey?'Testing…':'Test connection'}</button>}
            {k.source==='admin'&&<button onClick={()=>revert(k.dbKey,k.label)} className="rounded-full border border-ember/30 px-3 py-1.5 text-xs text-ember hover:bg-ember/10">Revert to env</button>}
          </div>
        </div>
        {editing===k.dbKey?(
          <div className="mt-4 flex gap-2">
            <input type="password" value={value} onChange={e=>setValue(e.target.value)} placeholder={k.dbKey==='anthropic_api_key'?'sk-ant-…':'sk-…'} className="input flex-1" autoFocus/>
            <button onClick={()=>save(k.dbKey)} disabled={saving} className="btn-gold shrink-0 disabled:opacity-50">{saving?'Saving…':'Save'}</button>
            <button onClick={()=>{setEditing(null);setValue('');}} className="shrink-0 text-sm text-ash">Cancel</button>
          </div>
        ):(
          <button onClick={()=>{setEditing(k.dbKey);setValue('');}} className="btn-ghost mt-4 text-xs">{k.source==='none'?'Add key':'Replace key'}</button>
        )}
      </div>
    ))}
    <div className="hairline rounded-2xl p-6">
      <p className="font-mono text-2xs uppercase tracking-wider text-ash">Not managed here</p>
      <p className="mt-2 text-sm text-ash">Supabase connection details and the admin secret itself stay in Vercel environment variables only — they're needed before the app can even reach this database, so storing them in the database would be circular. Update those in Vercel → Settings → Environment Variables.</p>
    </div>
  </div>;
}
