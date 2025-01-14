/* eslint-disable react/prop-types */
import React from 'react';
import { Trash } from "lucide-react";

export default function TagClassStudent({ text, onRemove, removable }) {
  return (
    <div className={`border rounded border-textBg-300 w-fit flex items-center py-2 px-4 bg-white ${removable ? 'cursor-pointer' : 'cursor-default'}  `}>
      <div className="rounded-full bg-primary-500 w-3 h-3 mr-3"></div>
      <p className="text-textBg-700 text-base mr-3">{text}</p>
      {removable && (
        <Trash size={14} onClick={onRemove} />
      )}   
    </div>
  );
}