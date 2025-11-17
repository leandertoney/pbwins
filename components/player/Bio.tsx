interface BioProps {
  bio: string;
}

export default function Bio({ bio }: BioProps) {
  return (
    <section className="rounded-2xl border border-white/5 bg-white/5/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <h2 className="text-lg font-semibold text-white">Biography</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{bio}</p>
    </section>
  );
}
