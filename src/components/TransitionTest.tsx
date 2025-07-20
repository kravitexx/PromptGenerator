'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function TransitionTest() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-4 bg-blue-500 text-white rounded"
    >
      Transition Test Component
    </motion.div>
  );
}