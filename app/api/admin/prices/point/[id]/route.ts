import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function DELETE(req:NextRequest,{params}:{params:{id:string}}){
  const d=checkAdminSecret(req);if(d)return d;
  const{error}=await createAdminClient().from('price_points').delete().eq('id',params.id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({deleted:true});
}
