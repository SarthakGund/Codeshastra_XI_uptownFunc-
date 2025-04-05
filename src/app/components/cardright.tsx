import React from 'react';
import { ThreeDCardDemo } from './card';

export default function CardRight() {
  return (
    <div className="flex h-full w-full">
      <div className="w-1/2"></div>
      <div className="w-1/2 flex justify-center items-center">
        <ThreeDCardDemo />
      </div>

    </div>
  );
}
