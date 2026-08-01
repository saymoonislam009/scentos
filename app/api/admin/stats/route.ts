import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function GET(req:NextRequest){
  const d=checkAdminSecret(req); if(d) return d;
  const a=createAdminClient();
  const cnt=async(t:string,f?:(q:any)=>any)=>{let q=a.from(t).select('*',{count:'exact',head:true});if(f)q=f(q);const{count:c}=await q;return c??0;};
  const [fragrances,brands,users,orders,activeListings,reviews,partialListings,openReports]=await Promise.all([cnt('fragrances'),cnt('brands'),cnt('profiles'),cnt('orders'),cnt('decant_listings',q=>q.eq('status','active')),cnt('reviews'),cnt('partial_bottle_listings',q=>q.eq('status','active')),cnt('reports',q=>q.eq('status','open'))]);
  return NextResponse.json({fragrances,brands,users,orders,activeListings,reviews,partialListings,openReports});
}
