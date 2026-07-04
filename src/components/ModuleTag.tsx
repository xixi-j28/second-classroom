import React from 'react';
import { Tag } from 'antd';
import { ModuleType } from '../types';

export const MODULE_COLORS: Record<ModuleType, string> = {
  '德润农心': '#e74c3c',
  '智启农创': '#3498db',
  '体健农强': '#2ecc71',
  '美聚农韵': '#9b59b6',
  '劳铸农魂': '#f39c12',
};

interface ModuleTagProps {
  module: ModuleType;
}

export const ModuleTag: React.FC<ModuleTagProps> = ({ module }) => {
  return (
    <Tag color={MODULE_COLORS[module]} style={{ borderRadius: '4px' }}>
      {module}
    </Tag>
  );
};
