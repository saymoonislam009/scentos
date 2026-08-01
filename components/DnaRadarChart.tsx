'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
type Props = { dna:{ sweetness:number; freshness:number; masculineFeminine:number; projection:number; longevity:number; versatility:number } };
export function DnaRadarChart({ dna }:Props) {
  const data=[
    {axis:'Sweetness',value:dna.sweetness},{axis:'Freshness',value:dna.freshness},
    {axis:'Masc/Fem',value:dna.masculineFeminine},{axis:'Projection',value:dna.projection},
    {axis:'Longevity',value:dna.longevity},{axis:'Versatility',value:dna.versatility},
  ];
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(237,232,223,0.08)"/>
          <PolarAngleAxis dataKey="axis" tick={{fill:'#9C9488',fontSize:11,fontFamily:'var(--font-jetbrains)'}}/>
          <PolarRadiusAxis domain={[0,10]} tick={false} axisLine={false}/>
          <Radar dataKey="value" stroke="#C9A24B" fill="#4F8CFF" fillOpacity={0.2} strokeWidth={1.5} dot={{fill:'#C9A24B',r:3}}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
