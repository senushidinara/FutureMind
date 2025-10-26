import React, { useState } from 'react';
import { AnalysisResult, Prediction } from '../types';
import { BrainCircuitIcon, DnaIcon, BarChartIcon } from './icons';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/20 shadow-lg">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-purple-400">{icon}</div>
      <h3 className="text-xl font-bold text-cyan-300">{title}</h3>
    </div>
    <div className="space-y-4 text-gray-300">{children}</div>
  </div>
);

const RadarChart: React.FC<{ predictions: Prediction[] }> = ({ predictions }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const size = 320;
  const center = size / 2;
  const numLevels = 4;
  const radius = center - 50;
  const numAxes = predictions.length > 0 ? predictions.length : 1;
  const angleSlice = (Math.PI * 2) / numAxes;

  const getPoint = (index: number, value: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = radius * (value / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = predictions.map((p, i) => getPoint(i, p.probability));
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const hoveredPrediction = hoveredIndex !== null ? predictions[hoveredIndex] : null;
  const tooltipPosition = hoveredIndex !== null ? getPoint(hoveredIndex, predictions[hoveredIndex].probability) : { x: 0, y: 0 };


  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform transition-transform duration-500 hover:scale-105" overflow="visible">
        {/* Grid and Axes */}
        <g>
          {[...Array(numLevels)].map((_, level) => {
            const levelRadius = radius * ((level + 1) / numLevels);
            const levelPoints = [...Array(numAxes)].map((_, i) => {
              const angle = angleSlice * i - Math.PI / 2;
              return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
            }).join(' ');
            return <polygon key={level} points={levelPoints} fill="none" stroke="rgba(107, 114, 128, 0.5)" strokeWidth="1" />;
          })}

          {[...Array(numAxes)].map((_, i) => {
            const endPoint = getPoint(i, 100);
            return <line key={i} x1={center} y1={center} x2={endPoint.x} y2={endPoint.y} stroke="rgba(107, 114, 128, 0.5)" strokeWidth="1" />;
          })}
        </g>
        
        {/* Data Polygon and Points */}
        <g>
          {predictions.map((p, i) => {
            const labelPoint = getPoint(i, 120);
            return (
              <text key={p.area} x={labelPoint.x} y={labelPoint.y} fontSize="12" fill={hoveredIndex === i ? '#c4b5fd' : '#9CA3AF'} textAnchor="middle" dominantBaseline="middle" className="font-semibold transition-colors duration-200">
                {p.area}
              </text>
            );
          })}
          
          <polygon
            points={dataPath}
            fill="rgba(167, 139, 250, 0.4)"
            fillOpacity={hoveredIndex !== null ? 0.6 : 0.4}
            stroke="#A78BFA"
            strokeWidth="2"
            style={{ transition: 'all 0.3s ease-out' }}
          />

          {dataPoints.map((p, i) => (
             <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <circle cx={p.x} cy={p.y} r="15" fill="transparent" /> 
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredIndex === i ? 7 : 4}
                fill="#A78BFA"
                className="transition-all duration-200"
                style={{ filter: hoveredIndex === i ? 'drop-shadow(0 0 5px #c4b5fd)' : 'none' }}
              />
            </g>
          ))}
        </g>
        
        {/* Tooltip */}
        {hoveredPrediction && (
          <g 
            transform={`translate(${tooltipPosition.x + 10}, ${tooltipPosition.y - 20})`}
            className="pointer-events-none transition-opacity duration-200"
            style={{ opacity: hoveredIndex !== null ? 1 : 0 }}
          >
            <rect x="0" y="0" width="130" height="45" rx="8" fill="rgba(17, 24, 39, 0.9)" stroke="#A78BFA" strokeWidth="1"/>
            <text x="10" y="20" fill="#c4b5fd" fontSize="14" fontWeight="bold">{hoveredPrediction.area}</text>
            <text x="10" y="38" fill="#E5E7EB" fontSize="12">
              Probability: <tspan fontWeight="bold">{hoveredPrediction.probability}%</tspan>
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  return (
    <div className="bg-gray-900/30 p-4 rounded-2xl border border-cyan-500/20 my-4 animate-fadeIn">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Your Scientific Future Analysis</h2>
            <p className="mt-1 text-sm text-gray-400">A summary based on our conversation.</p>
        </div>

        <div className="space-y-6">
             <ResultCard title={result.personalitySummary.title} icon={<DnaIcon className="w-6 h-6" />}>
                <p>{result.personalitySummary.description}</p>
                <ul className="space-y-3 pt-2">
                    {result.personalitySummary.traits.map(trait => (
                    <li key={trait.trait}>
                        <strong className="text-cyan-400">{trait.trait} ({trait.level}):</strong> {trait.description}
                    </li>
                    ))}
                </ul>
            </ResultCard>

            <ResultCard title="Future Trajectory Predictions" icon={<BarChartIcon className="w-6 h-6" />}>
                {result.predictions.length > 0 ? (
                    <RadarChart predictions={result.predictions} />
                ) : (
                    <p>No prediction data available.</p>
                )}
            </ResultCard>

            <ResultCard title={result.behavioralInsights.title} icon={<BrainCircuitIcon className="w-6 h-6" />}>
                <ul className="list-disc list-inside space-y-2">
                    {result.behavioralInsights.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                </ul>
            </ResultCard>
        </div>
    </div>
  )
}