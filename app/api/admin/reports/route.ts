import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function GET(req:NextRequest){
  const d=checkAdminSecret(req);if(d)return d;
  const a=createAdminClient();
  const{data,error}=await a.from('reports').select('*,reporter:reporter_id(name,email),reported_user:reported_user_id(id,name,email,is_suspended),partial_bottle_listings(id,perfume_name,status)').order('created_at',{ascending:false});
  if(error)return NextResponse.json({error:error.message},{status:500});
  const userIds=[...new Set((data??[]).map((r:any)=>r.reported_user?.id).filter(Boolean))];
  const counts=new Map<string,number>();
  if(userIds.length){
    const{data:allReports}=await a.from('reports').select('reported_user_id').in('reported_user_id',userIds);
    for(const r of allReports??[])if(r.reported_user_id)counts.set(r.reported_user_id,(counts.get(r.reported_user_id)??0)+1);
  }
  const enriched=(data??[]).map((r:any)=>({...r,reportedUserTotalReports:r.reported_user?.id?counts.get(r.reported_user.id)??0:0}));
  return NextResponse.json(enriched);
}
