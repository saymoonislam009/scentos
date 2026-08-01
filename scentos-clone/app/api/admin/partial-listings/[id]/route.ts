import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function PATCH(req:NextRequest,{params}:{params:{id:string}}){
  const d=checkAdminSecret(req);if(d)return d;
  const{status}=await req.json();
  const{data,error}=await createAdminClient().from('partial_bottle_listings').update({status}).eq('id',params.id).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
