import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
function slugify(n:string,b:string){return `${b}-${n}`.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_]+/g,'-').replace(/(^-|-$)/g,'');}
export async function GET(req:NextRequest){
  const d=checkAdminSecret(req);if(d)return d;
  const {data,error}=await createAdminClient().from('fragrances').select('*,brands(name),embedding').order('created_at',{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
export async function POST(req:NextRequest){
  const d=checkAdminSecret(req);if(d)return d;
  const body=await req.json(); const a=createAdminClient();
  const{data:ex}=await a.from('brands').select('id').eq('name',body.brandName).maybeSingle();
  let brandId=ex?.id;
  if(!brandId){const{data:cr}=await a.from('brands').insert({name:body.brandName}).select('id').single();brandId=cr?.id;}
  if(!brandId)return NextResponse.json({error:'Could not resolve brand'},{status:500});
  const{data,error}=await a.from('fragrances').insert({slug:body.slug||slugify(body.name,body.brandName),name:body.name,brand_id:brandId,release_year:body.releaseYear?Number(body.releaseYear):null,concentration:body.concentration||null,description:body.description||null,price_tier_usd:body.priceTierUsd?Number(body.priceTierUsd):null,seasons:body.seasons??[],occasions:body.occasions??[]}).select('*,brands(name)').single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
