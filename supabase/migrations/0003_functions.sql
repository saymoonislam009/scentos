create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,email,name,avatar_url) values(new.id,new.email,new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'avatar_url'); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.create_decant_order(p_listing_id uuid) returns public.orders language plpgsql security definer set search_path=public as $$
declare v_listing public.decant_listings; v_order public.orders;
begin
  select * into v_listing from public.decant_listings where id=p_listing_id for update;
  if v_listing is null or v_listing.status<>'active' then raise exception 'Listing unavailable'; end if;
  if v_listing.seller_id=auth.uid() then raise exception 'Cannot buy your own listing'; end if;
  update public.decant_listings set status='sold' where id=p_listing_id;
  insert into public.orders(listing_id,buyer_id,seller_id,amount,status) values(p_listing_id,auth.uid(),v_listing.seller_id,v_listing.price,'pending') returning * into v_order;
  return v_order;
end; $$;

create function public.mark_order_shipped(p_order_id uuid,p_tracking_number text) returns public.orders language plpgsql security definer set search_path=public as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id=p_order_id;
  if v_order is null or v_order.seller_id<>auth.uid() then raise exception 'Not authorized'; end if;
  update public.orders set status='shipped',tracking_number=p_tracking_number where id=p_order_id returning * into v_order;
  return v_order;
end; $$;

create function public.confirm_order_delivered(p_order_id uuid) returns public.orders language plpgsql security definer set search_path=public as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id=p_order_id;
  if v_order is null or v_order.buyer_id<>auth.uid() then raise exception 'Not authorized'; end if;
  update public.orders set status='delivered',escrow_release_at=now()+interval '72 hours' where id=p_order_id returning * into v_order;
  return v_order;
end; $$;

create function public.dispute_order(p_order_id uuid) returns public.orders language plpgsql security definer set search_path=public as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id=p_order_id;
  if v_order is null or(v_order.buyer_id<>auth.uid() and v_order.seller_id<>auth.uid()) then raise exception 'Not authorized'; end if;
  update public.orders set status='disputed' where id=p_order_id returning * into v_order;
  return v_order;
end; $$;

create function public.search_fragrances(p_query text default null,p_season text default null,p_occasion text default null,p_max_price_tier int default null,p_limit int default 24,p_offset int default 0)
returns setof public.fragrances language sql stable as $$
  select f.* from public.fragrances f
  where (p_query is null or f.name % p_query or f.name ilike '%'||p_query||'%')
    and (p_season is null or p_season=any(f.seasons))
    and (p_occasion is null or p_occasion=any(f.occasions))
    and (p_max_price_tier is null or f.price_tier_usd<=p_max_price_tier)
    and f.discontinued=false
  order by case when p_query is null then 0 else similarity(f.name,p_query) end desc,f.created_at desc
  limit p_limit offset p_offset; $$;

create function public.match_fragrance_genome(p_fragrance_id uuid,p_match_count int default 8)
returns table(fragrance_id uuid,similarity numeric) language sql stable as $$
  select f2.id,1-(f1.embedding<=>f2.embedding) as similarity
  from public.fragrances f1 join public.fragrances f2 on f2.id<>f1.id and f2.embedding is not null
  where f1.id=p_fragrance_id and f1.embedding is not null
  order by f1.embedding<=>f2.embedding limit p_match_count; $$;

create function public.trending_fragrances(p_days int default 30,p_limit int default 20)
returns table(fragrance_id uuid,name text,brand_name text,slug text,signal_count bigint) language sql stable as $$
  select f.id,f.name,b.name as brand_name,f.slug,count(*) as signal_count
  from(select fragrance_id from public.collection_items where created_at>=now()-(p_days||' days')::interval
       union all select fragrance_id from public.reviews where created_at>=now()-(p_days||' days')::interval) signals
  join public.fragrances f on f.id=signals.fragrance_id
  join public.brands b on b.id=f.brand_id
  group by f.id,f.name,b.name,f.slug order by signal_count desc limit p_limit; $$;
