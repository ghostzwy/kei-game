import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-[#00ff41]">{title}</h2>
      {description && <p className="text-gray-400 mb-2">{description}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default Card;