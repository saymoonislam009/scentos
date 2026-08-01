import {NextRequest,NextResponse} from 'next/server';
import {checkAdminSecret} from '@/lib/adminAuth';
import {createAdminClient} from '@/lib/supabase/admin';
export async function PATCH(req:NextRequest,{params}:{params:{id:string}}){
  const d=checkAdminSecret(req);if(d)return d;
  const body=await req.json(); const a=createAdminClient();
  if(body.toggleDiscontinued){
    const{data:cur}=await a.from('fragrances').select('discontinued').eq('id',params.id).single();
    const{data,error}=await a.from('fragrances').update({discontinued:!cur?.discontinued}).eq('id',params.id).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json(data);
  }
  const allowed:Record<string,any>={};
  for(const f of['name','description','concentration','release_year','price_tier_usd','seasons','occasions','hero_image_url','discontinued'])if(body[f]!==undefined)allowed[f]=body[f];
  const{data,error}=await a.from('fragrances').update(allowed).eq('id',params.id).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
export async function DELETE(req:NextRequest,{params}:{params:{id:string}}){
  const d=checkAdminSecret(req);if(d)return d;
  const{error}=await createAdminClient().from('fragrances').delete().eq('id',params.id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({deleted:true});
}
