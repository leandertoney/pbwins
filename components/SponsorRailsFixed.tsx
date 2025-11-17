"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SponsorCircle from "./SponsorCircle";
import SPONSORS_POOL from "@/data/sponsors";

const getSponsorId = (sponsor: { name: string; tagline: string; url?: string }) =>
  `${sponsor.name}|${sponsor.tagline}|${sponsor.url ?? ""}`;

interface SponsorRailsFixedProps {
  leftClassName?: string;
  rightClassName?: string;
  idPrefix?: string;
}

export default function SponsorRailsFixed({
  leftClassName = "fixed left-4 top-[60px] h-[calc(100vh-120px)] w-[160px] hidden lg:flex flex-col justify-between items-center gap-2 z-50",
  rightClassName = "fixed right-4 top-[60px] h-[calc(100vh-120px)] w-[160px] hidden lg:flex flex-col justify-between items-center gap-2 z-50",
  idPrefix = "sponsor",
}: SponsorRailsFixedProps) {
  const [currentVisible, setCurrentVisible] = useState(() => SPONSORS_POOL.slice(0, 10));
  const rotationIndexRef = useRef(10);
  const lastSlotSponsorRef = useRef(SPONSORS_POOL.slice(0, 10).map((s) => getSponsorId(s)));
  const currentVisibleRef = useRef(currentVisible);

  useEffect(() => {
    currentVisibleRef.current = currentVisible;
  }, [currentVisible]);

  const triggerFlipAnimation = useCallback(
    (slot: number) => {
      const el = document.getElementById(`${idPrefix}-slot-${slot}`);
      if (!el) return;
      el.classList.remove("sponsor-flip");
      void el.offsetWidth;
      el.classList.add("sponsor-flip");
    },
    [idPrefix]
  );

  useEffect(() => {
    const rotateSponsors = () => {
      const newVisible = [...currentVisibleRef.current];
      const used = new Set(newVisible.map((s) => getSponsorId(s)));

      for (let slot = 0; slot < 10; slot++) {
        const lastSponsor = lastSlotSponsorRef.current[slot];
        let nextSponsor = null;
        let attempts = 0;

        while (!nextSponsor && attempts < SPONSORS_POOL.length) {
          const s = SPONSORS_POOL[rotationIndexRef.current];
          rotationIndexRef.current = (rotationIndexRef.current + 1) % SPONSORS_POOL.length;
          attempts++;

          const id = getSponsorId(s);

          if (!used.has(id) && id !== lastSponsor) {
            nextSponsor = s;
            used.add(id);
          }
        }

        if (nextSponsor) {
          newVisible[slot] = nextSponsor;
          lastSlotSponsorRef.current[slot] = getSponsorId(nextSponsor);
        }
      }

      for (let slot = 0; slot < 10; slot++) {
        setTimeout(() => {
          triggerFlipAnimation(slot);
          setTimeout(() => {
            setCurrentVisible((prev) => {
              const updated = [...prev];
              updated[slot] = newVisible[slot];
              return updated;
            });
          }, 500);
        }, slot * 200);
      }
    };

    const interval = setInterval(rotateSponsors, 10000);
    return () => clearInterval(interval);
  }, [triggerFlipAnimation]);

  return (
    <>
      <div className={leftClassName}>
        {currentVisible.slice(0, 5).map((sponsor, idx) => (
          <SponsorCircle key={`left-${idx}`} slotIndex={idx} sponsor={sponsor} idPrefix={idPrefix} />
        ))}
      </div>
      <div className={rightClassName}>
        {currentVisible.slice(5, 10).map((sponsor, idx) => (
          <SponsorCircle key={`right-${idx}`} slotIndex={idx + 5} sponsor={sponsor} idPrefix={idPrefix} />
        ))}
      </div>
    </>
  );
}
