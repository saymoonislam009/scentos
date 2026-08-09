import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function GET(req:NextRequest,{params}:{params:{id:string}}){
  const d=checkAdminSecret(req);if(d)return d;
  const{data,error}=await createAdminClient().from('price_points').select('*').eq('fragrance_id',params.id).order('captured_at',{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data??[]);
}
export async function POST(req:NextRequest,{params}:{params:{id:string}}){
  const d=checkAdminSecret(req);if(d)return d;
  const body=await req.json();
  const{data,error}=await createAdminClient().from('price_points').insert({fragrance_id:params.id,retailer:body.retailer,price:Number(body.price),url:body.url,currency:body.currency??'USD',in_stock:true}).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
