'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WidgetsContainerProps {
  children: React.ReactNode;
}

export default function WidgetsContainer({ children }: WidgetsContainerProps) {
  return (
    <div className="hidden lg:block w-full mb-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
      >
        <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="flex space-x-4 px-1">
            {React.Children.map(children, (child, index) => (
              <div key={index} className="flex-shrink-0">
                {child}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}