import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tourUrl: string;
  title: string;
}

export const VRTourViewer = ({ isOpen, onClose, tourUrl, title }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="text-white">
                <h3 className="text-xl font-serif font-bold">{title}</h3>
                <p className="text-xs text-stone-300 uppercase tracking-widest">Immersive VR Tour</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <iframe
              src={tourUrl}
              className="w-full h-full border-none"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white text-sm flex items-center gap-3">
              <Maximize2 size={16} /> Use your mouse or VR headset to explore
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
