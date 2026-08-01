import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function GET(req:NextRequest){
  const d=checkAdminSecret(req);if(d)return d;
  const{data,error}=await createAdminClient().from('reports').select('*,reporter:reporter_id(name,email),reported_user:reported_user_id(name,email),partial_bottle_listings(perfume_name)').order('created_at',{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
