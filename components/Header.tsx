
import React from 'react';
import { BrainCircuitIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="text-center py-6 border-b border-purple-500/20">
      <div className="flex items-center justify-center gap-4">
        <BrainCircuitIcon className="w-10 h-10 text-purple-400" />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          FutureMind Pro
        </h1>
      </div>
      <p className="mt-2 text-lg text-cyan-300/80">Not magic. Not mysticism. Pure human science.</p>
    </header>
  );
};

export default Header;
