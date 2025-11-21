"use client";

import { useState } from "react";
import WinsmasModal from "./WinsmasModal";

export default function WinsmasBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 bg-red-600 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <h2
              className="text-white font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight"
              style={{ fontFamily: 'Nunito, system-ui, sans-serif' }}
            >
              WINSMAS: First to 25 verified wins in December wins a $120 paddle
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-white font-semibold text-lg sm:text-xl underline underline-offset-4 hover:text-white/90 transition-colors"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              enter now
            </button>
          </div>
        </div>
      </div>

      <WinsmasModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
