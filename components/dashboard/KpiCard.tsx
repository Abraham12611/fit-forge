'use client';

import React from 'react';
import { Card } from "@heroui/card";
import SparklineChart from './SparklineChart';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trendData?: number[]; // For sparkline
  chartElement?: React.ReactNode; // For custom chart elements like donut or progress
  subValue?: string;
  className?: string;
  onClick?: () => void; // Added onClick prop
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trendData, chartElement, subValue, className, onClick }) => {
  return (
    <Card
      className={`bg-[#161A1E] border border-gray-700 rounded-xl shadow-xl flex flex-col justify-between p-4 ${className}`}
      isPressable={!!onClick} // Make card pressable if onClick is provided
      onPress={onClick} // Use onPress for HeroUI Card interaction
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="p-2 bg-gray-700 rounded-lg mr-3">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
      </div>

      {trendData && trendData.length > 0 && (
        <div className="mt-auto mb-2">
          <SparklineChart data={trendData} width={120} height={40} />
        </div>
      )}
      {chartElement && (
         <div className="mt-auto mb-2 flex justify-center items-center h-[60px]">{chartElement}</div>
      )}
      {subValue && <p className="text-xs text-gray-500 mt-1 text-right">{subValue}</p>}
    </Card>
  );
};

export default KpiCard;