import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
export async function GET(){
  const s=createClient();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({inquiries:[]});
  const a=createAdminClient();
  const{data:myListings}=await a.from('partial_bottle_listings').select('id').eq('seller_id',user.id).eq('status','active');
  if(!myListings?.length)return NextResponse.json({inquiries:[]});
  const{data}=await a.from('partial_listing_inquiries').select('*,partial_bottle_listings(perfume_name,seller_id),profiles(name,email)').in('listing_id',myListings.map(l=>l.id)).eq('status','pending').order('created_at',{ascending:false});
  return NextResponse.json({inquiries:data??[]});
}
export async function PATCH(req:NextRequest){
  const{id,status}=await req.json();
  const s=createClient();const{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const{data,error}=await createAdminClient().from('partial_listing_inquiries').update({status}).eq('id',id).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
