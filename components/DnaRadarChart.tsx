'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export function DnaRadarChart({
  dna,
}: {
  dna: {
    sweetness: number;
    freshness: number;
    masculineFeminine: number;
    projection: number;
    longevity: number;
    versatility: number;
  };
}) {
  const data = [
    { axis: 'Sweetness', value: dna.sweetness },
    { axis: 'Freshness', value: dna.freshness },
    { axis: 'Masc/Fem', value: dna.masculineFeminine },
    { axis: 'Projection', value: dna.projection },
    { axis: 'Longevity', value: dna.longevity },
    { axis: 'Versatility', value: dna.versatility },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="rgba(237,234,227,0.12)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#9C9892', fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#C9A24B" fill="#4F8CFF" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
