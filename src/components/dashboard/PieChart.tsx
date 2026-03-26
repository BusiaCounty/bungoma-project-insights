import { useMemo } from "react";

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}

const PieChart = ({ 
  data, 
  size = 200, 
  showLabels = true, 
  showLegend = true 
}: PieChartProps) => {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90; // Start from top

    return data.map((item) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      // Calculate path for pie slice
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const x1 = Math.cos(startAngleRad) * (size / 2 - 2);
      const y1 = Math.sin(startAngleRad) * (size / 2 - 2);
      const x2 = Math.cos(endAngleRad) * (size / 2 - 2);
      const y2 = Math.sin(endAngleRad) * (size / 2 - 2);
      
      const path = [
        `M 0 0`,
        `L ${x1} ${y1}`,
        `A ${size / 2 - 2} ${size / 2 - 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      currentAngle = endAngle;
      
      return {
        ...item,
        percentage,
        path,
        labelAngle: startAngle + angle / 2,
        labelX: Math.cos((startAngle + angle / 2) * Math.PI / 180) * (size / 3),
        labelY: Math.sin((startAngle + angle / 2) * Math.PI / 180) * (size / 3),
      };
    });
  }, [data, size]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`-${size/2} -${size/2} ${size} ${size}`}>
          {chartData.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              {showLabels && slice.percentage > 5 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-white pointer-events-none"
                >
                  {slice.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {showLegend && (
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PieChart;
