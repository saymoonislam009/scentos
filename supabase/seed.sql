insert into public.brands(id,name,country,tier) values
('11111111-0001-0001-0001-000000000001','Dior','France','designer'),
('11111111-0001-0001-0001-000000000002','Chanel','France','designer'),
('11111111-0001-0001-0001-000000000003','Creed','France','niche'),
('11111111-0001-0001-0001-000000000004','Tom Ford','USA','niche'),
('11111111-0001-0001-0001-000000000005','Armaf','UAE','clone-house'),
('11111111-0001-0001-0001-000000000006','Lattafa','UAE','budget'),
('11111111-0001-0001-0001-000000000007','Maison Francis Kurkdjian','France','niche'),
('11111111-0001-0001-0001-000000000008','Giorgio Armani','Italy','designer')
on conflict(name) do nothing;

insert into public.notes(id,name) values
('22222222-0001-0001-0001-000000000001','Bergamot'),('22222222-0001-0001-0001-000000000002','Pink Pepper'),
('22222222-0001-0001-0001-000000000003','Ambroxan'),('22222222-0001-0001-0001-000000000004','Pineapple'),
('22222222-0001-0001-0001-000000000005','Birch'),('22222222-0001-0001-0001-000000000006','Jasmine'),
('22222222-0001-0001-0001-000000000007','Oud'),('22222222-0001-0001-0001-000000000008','Rose'),
('22222222-0001-0001-0001-000000000009','Vanilla'),('22222222-0001-0001-0001-000000000010','Sandalwood'),
('22222222-0001-0001-0001-000000000011','Patchouli'),('22222222-0001-0001-0001-000000000012','Saffron'),
('22222222-0001-0001-0001-000000000013','Vetiver'),('22222222-0001-0001-0001-000000000014','Lavender'),
('22222222-0001-0001-0001-000000000015','Amber')
on conflict(name) do nothing;

insert into public.accords(id,name) values
('33333333-0001-0001-0001-000000000001','Fresh Spicy'),('33333333-0001-0001-0001-000000000002','Woody'),
('33333333-0001-0001-0001-000000000003','Fruity'),('33333333-0001-0001-0001-000000000004','Oriental'),
('33333333-0001-0001-0001-000000000005','Floral'),('33333333-0001-0001-0001-000000000006','Aquatic'),
('33333333-0001-0001-0001-000000000007','Gourmand')
on conflict(name) do nothing;

insert into public.fragrances(id,slug,name,brand_id,release_year,concentration,description,longevity_hrs,projection,seasons,occasions,price_tier_usd) values
('44444444-0001-0001-0001-000000000001','dior-sauvage-edt','Sauvage EDT','11111111-0001-0001-0001-000000000001',2015,'EDT','Bold fresh citrus and ambroxan — the modern benchmark for versatile masculines.',7,'strong',array['spring','summer','fall'],array['office','casual','date-night'],95),
('44444444-0001-0001-0001-000000000002','dior-sauvage-edp','Sauvage EDP','11111111-0001-0001-0001-000000000001',2018,'EDP','Richer and spicier — more lavender and nutmeg, better longevity than the EDT.',9,'strong',array['fall','winter','spring'],array['office','date-night','formal'],130),
('44444444-0001-0001-0001-000000000003','chanel-bleu-de-chanel-edt','Bleu de Chanel EDT','11111111-0001-0001-0001-000000000002',2010,'EDT','The complete masculine — citrus, cedar, sandalwood, vetiver. Versatile and impossible to dislike.',7,'moderate',array['spring','summer','fall'],array['office','casual','date-night'],110),
('44444444-0001-0001-0001-000000000004','creed-aventus','Aventus','11111111-0001-0001-0001-000000000003',2010,'EDP','Pineapple, birch, oakmoss, ambergris — the most imitated fragrance of the decade.',9,'beast-mode',array['fall','winter','spring'],array['formal','date-night'],375),
('44444444-0001-0001-0001-000000000005','tom-ford-oud-wood','Oud Wood EDP','11111111-0001-0001-0001-000000000004',2007,'EDP','Oud, rosewood, cardamom, vanilla — the accessible oud that introduced Western noses to the note.',10,'moderate',array['fall','winter'],array['date-night','formal'],320),
('44444444-0001-0001-0001-000000000006','mfk-baccarat-rouge-540','Baccarat Rouge 540 EDP','11111111-0001-0001-0001-000000000007',2015,'EDP','Jasmine, saffron, ambergris, cedarwood — resinous, luminous. The defining niche hit of the 2010s.',12,'strong',array['fall','winter','spring'],array['date-night','formal'],325),
('44444444-0001-0001-0001-000000000007','armaf-club-de-nuit-intense','Club de Nuit Intense Man EDT','11111111-0001-0001-0001-000000000005',2014,'EDT','The most acclaimed Aventus alternative. Remarkable performance at the price.',6,'strong',array['fall','winter','spring'],array['date-night','casual','office'],35),
('44444444-0001-0001-0001-000000000008','lattafa-khamrah','Khamrah EDP','11111111-0001-0001-0001-000000000006',2022,'EDP','Oud, rum, tonka, musk, vanilla — intoxicating and sweet. A Lattafa masterpiece.',8,'beast-mode',array['fall','winter'],array['date-night','casual'],35),
('44444444-0001-0001-0001-000000000009','armani-acqua-di-gio-edt','Acqua di Gio EDT','11111111-0001-0001-0001-000000000008',1996,'EDT','The defining aquatic — rosemary, neroli, sea breeze. The office summer staple.',5,'moderate',array['spring','summer'],array['office','casual'],95),
('44444444-0001-0001-0001-000000000010','tom-ford-tobacco-vanille','Tobacco Vanille EDP','11111111-0001-0001-0001-000000000004',2007,'EDP','Tobacco flower, vanilla, tonka, dried fruit — the most beloved Tom Ford. Warm and enveloping.',12,'strong',array['fall','winter'],array['date-night','casual'],325)
on conflict(slug) do nothing;

insert into public.fragrance_notes(fragrance_id,note_id,position) values
('44444444-0001-0001-0001-000000000001','22222222-0001-0001-0001-000000000001','top'),
('44444444-0001-0001-0001-000000000001','22222222-0001-0001-0001-000000000002','top'),
('44444444-0001-0001-0001-000000000001','22222222-0001-0001-0001-000000000003','base'),
('44444444-0001-0001-0001-000000000004','22222222-0001-0001-0001-000000000004','top'),
('44444444-0001-0001-0001-000000000004','22222222-0001-0001-0001-000000000005','mid'),
('44444444-0001-0001-0001-000000000004','22222222-0001-0001-0001-000000000003','base'),
('44444444-0001-0001-0001-000000000005','22222222-0001-0001-0001-000000000007','mid'),
('44444444-0001-0001-0001-000000000005','22222222-0001-0001-0001-000000000010','base'),
('44444444-0001-0001-0001-000000000006','22222222-0001-0001-0001-000000000006','top'),
('44444444-0001-0001-0001-000000000006','22222222-0001-0001-0001-000000000012','top'),
('44444444-0001-0001-0001-000000000006','22222222-0001-0001-0001-000000000015','base'),
('44444444-0001-0001-0001-000000000008','22222222-0001-0001-0001-000000000007','mid'),
('44444444-0001-0001-0001-000000000008','22222222-0001-0001-0001-000000000009','base'),
('44444444-0001-0001-0001-000000000010','22222222-0001-0001-0001-000000000014','top'),
('44444444-0001-0001-0001-000000000010','22222222-0001-0001-0001-000000000009','base')
on conflict do nothing;

insert into public.fragrance_accords(fragrance_id,accord_id,strength) values
('44444444-0001-0001-0001-000000000001','33333333-0001-0001-0001-000000000001',0.9),
('44444444-0001-0001-0001-000000000001','33333333-0001-0001-0001-000000000002',0.5),
('44444444-0001-0001-0001-000000000003','33333333-0001-0001-0001-000000000001',0.8),
('44444444-0001-0001-0001-000000000003','33333333-0001-0001-0001-000000000002',0.7),
('44444444-0001-0001-0001-000000000004','33333333-0001-0001-0001-000000000003',0.8),
('44444444-0001-0001-0001-000000000005','33333333-0001-0001-0001-000000000004',0.9),
('44444444-0001-0001-0001-000000000006','33333333-0001-0001-0001-000000000004',0.85),
('44444444-0001-0001-0001-000000000006','33333333-0001-0001-0001-000000000005',0.6),
('44444444-0001-0001-0001-000000000008','33333333-0001-0001-0001-000000000004',0.9),
('44444444-0001-0001-0001-000000000008','33333333-0001-0001-0001-000000000007',0.7),
('44444444-0001-0001-0001-000000000009','33333333-0001-0001-0001-000000000006',0.95),
('44444444-0001-0001-0001-000000000010','33333333-0001-0001-0001-000000000007',0.9)
on conflict do nothing;

insert into public.dna_scores(fragrance_id,sweetness,freshness,masculine_feminine,projection,longevity,versatility,sample_size) values
('44444444-0001-0001-0001-000000000001',3,8,8,8,7,9,142),
('44444444-0001-0001-0001-000000000002',3,7,8,8,9,8,98),
('44444444-0001-0001-0001-000000000003',3,8,8,7,7,9,205),
('44444444-0001-0001-0001-000000000004',5,6,9,9,9,6,310),
('44444444-0001-0001-0001-000000000005',4,3,7,5,9,7,88),
('44444444-0001-0001-0001-000000000006',6,4,5,8,9,6,120),
('44444444-0001-0001-0001-000000000007',5,6,8,7,6,6,58),
('44444444-0001-0001-0001-000000000008',7,2,5,9,8,4,75),
('44444444-0001-0001-0001-000000000009',2,9,7,5,5,9,180),
('44444444-0001-0001-0001-000000000010',8,2,6,7,9,5,95)
on conflict(fragrance_id) do nothing;

insert into public.price_points(fragrance_id,retailer,price,url,currency) values
('44444444-0001-0001-0001-000000000001','FragranceNet',79,'https://fragrancenet.com/sauvage-edt','USD'),
('44444444-0001-0001-0001-000000000003','Sephora',110,'https://sephora.com/bleu-de-chanel','USD'),
('44444444-0001-0001-0001-000000000004','Creed Boutique',375,'https://creedboutique.com/aventus','USD'),
('44444444-0001-0001-0001-000000000006','MFK Boutique',325,'https://mfk.com/baccarat-rouge','USD')
on conflict do nothing;
