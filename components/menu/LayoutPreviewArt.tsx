type Props = { themeId: string; large?: boolean };

function Bar({ className }: { className: string }) {
  return <div className={`rounded-full ${className}`} />;
}

export default function LayoutPreviewArt({ themeId, large = false }: Props) {
  const h = large ? "h-56 sm:h-72 overflow-hidden" : "h-24 overflow-hidden";

  if (themeId === "editorial") {
    return (
      <div className={`${h} bg-[#f3eee4] p-2 flex flex-col gap-1.5 overflow-hidden`}>
        <div className="h-1/2 bg-[#2b241c] relative">
          <div className="absolute bottom-1 left-1 right-8 h-2 bg-[#faf6ee]/80" />
        </div>
        <Bar className="h-1.5 w-16 bg-[#2b241c]" />
        <Bar className="h-1 w-full bg-[#d8cfc0]" />
        <Bar className="h-1 w-4/5 bg-[#d8cfc0]" />
        <Bar className="h-1 w-full bg-[#d8cfc0]" />
      </div>
    );
  }

  if (themeId === "ticket") {
    return (
      <div className={`${h} bg-[#e9dfc8] p-2`}>
        <div className="h-full bg-[#f7f1df] border border-dashed border-[#1c1914] p-2 space-y-1.5">
          <Bar className="h-1 w-12 mx-auto bg-[#1c1914]" />
          <Bar className="h-1 w-full bg-[#1c1914]/40" />
          <Bar className="h-1 w-full bg-[#1c1914]/40" />
          <Bar className="h-1 w-3/4 bg-[#1c1914]/40" />
          <Bar className="h-1 w-full bg-[#1c1914]/40" />
        </div>
      </div>
    );
  }

  if (themeId === "neon") {
    return (
      <div className={`${h} bg-[#0a0612] p-2 flex gap-2 overflow-hidden`}>
        <div className="w-2/3 rounded-xl bg-[#140c22] border border-[#ff4d9a]/40 p-1.5 space-y-1">
          <div className="h-10 rounded-lg bg-[#ff4d9a]/30" />
          <Bar className="h-1.5 w-16 bg-[#2de2e6]" />
        </div>
        <div className="w-1/3 rounded-xl bg-[#140c22] border border-[#3a1d55] p-1.5">
          <div className="h-10 rounded-lg bg-[#2de2e6]/20" />
        </div>
      </div>
    );
  }

  if (themeId === "thali") {
    return (
      <div className={`${h} bg-[#f6ead8] p-2 flex items-center gap-1`}>
        <div className="w-1.5 h-16 rounded-full bg-[#d4a017]" />
        <div className="flex-1 min-w-0 rounded-2xl border-2 border-[#d4a017] grid grid-cols-2 gap-1.5 p-1.5 bg-[#fff8ee]">
          {["#c45c26", "#d4a017", "#8b3d12", "#e2c39a"].map((color) => (
            <div key={color} className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full border-2 border-[#d4a017]" style={{ background: color }} />
              <Bar className="h-1 w-7 bg-[#8b3d12]/50" />
            </div>
          ))}
        </div>
        <div className="w-2 h-10 rounded-full bg-[#d4a017]" />
      </div>
    );
  }

  if (themeId === "garden") {
    return (
      <div className={`${h} bg-[#eef4ea] p-2 space-y-1.5`}>
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-2 bg-[#f7fbf4] border border-[#c5d4bf] rounded-xl p-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#2f5d3a]/30" />
            <div className="flex-1 space-y-1 pt-0.5">
              <Bar className="h-1.5 w-16 bg-[#2f5d3a]" />
              <Bar className="h-1 w-10 bg-[#c5d4bf]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (themeId === "gourmet") {
    return (
      <div className={`${h} bg-[#0c0d10] p-2 space-y-1.5`}>
        <Bar className="h-1.5 w-20 mx-auto bg-amber-500" />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-12 rounded-xl bg-[#13151b] border border-amber-900/40" />
          <div className="h-12 rounded-xl bg-[#13151b] border border-amber-900/40" />
        </div>
      </div>
    );
  }

  if (themeId === "street") {
    return (
      <div className={`${h} bg-[#fffdf9] p-2 grid grid-cols-2 gap-1.5`}>
        <div className="rounded-xl bg-white border border-orange-100 overflow-hidden">
          <div className="h-8 bg-orange-400/70" />
          <Bar className="h-1.5 w-10 m-1.5 bg-orange-600" />
        </div>
        <div className="rounded-xl bg-white border border-orange-100 overflow-hidden">
          <div className="h-8 bg-red-400/60" />
          <Bar className="h-1.5 w-10 m-1.5 bg-orange-600" />
        </div>
      </div>
    );
  }

  if (themeId === "cafe") {
    return (
      <div className={`${h} bg-[#faf6f0] p-2 space-y-1.5`}>
        <div className="h-5 w-20 bg-slate-900 rounded-md" />
        <div className="h-14 border-2 border-slate-900 rounded-xl bg-white shadow-[3px_3px_0_#1e293b]" />
      </div>
    );
  }

  if (themeId === "premium") {
    return (
      <div className={`${h} bg-[#FCFAF2] p-2 space-y-2`}>
        <Bar className="h-2 w-24 mx-auto bg-amber-800/70" />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-12 rounded-xl border-2 border-double border-amber-300 bg-[#FCFAF4]" />
          <div className="h-12 rounded-xl border-2 border-double border-amber-300 bg-[#FCFAF4]" />
        </div>
      </div>
    );
  }

  if (themeId === "minimal") {
    return (
      <div className={`${h} bg-white p-3 space-y-2`}>
        <Bar className="h-1.5 w-16 mx-auto bg-slate-800" />
        <Bar className="h-1 w-full bg-slate-200" />
        <Bar className="h-1 w-full bg-slate-200" />
        <Bar className="h-1 w-4/5 bg-slate-200" />
      </div>
    );
  }

  if (themeId === "stamp") {
    return (
      <div className={`${h} bg-[#f4efe4] p-2 grid grid-cols-2 gap-1.5`}>
        <div className="border border-dashed border-[#1d3557] p-1 space-y-1">
          <div className="h-8 bg-[#c1121f]/30" />
          <Bar className="h-1 w-10 bg-[#1d3557]" />
        </div>
        <div className="border border-dashed border-[#1d3557] p-1 space-y-1">
          <div className="h-8 bg-[#1d3557]/20" />
          <Bar className="h-1 w-8 bg-[#1d3557]" />
        </div>
      </div>
    );
  }

  if (themeId === "playbill") {
    return (
      <div className={`${h} bg-[#1a1510] p-3 space-y-2 text-center`}>
        <Bar className="h-1 w-10 mx-auto bg-[#e8c39e]" />
        <Bar className="h-2 w-20 mx-auto bg-[#f6ead8]" />
        <Bar className="h-1 w-full bg-[#3a2e24]" />
        <Bar className="h-1 w-4/5 mx-auto bg-[#3a2e24]" />
      </div>
    );
  }

  if (themeId === "board") {
    return (
      <div className={`${h} bg-[#0b0c0f] p-2 space-y-1.5`}>
        <Bar className="h-2 w-16 bg-amber-400" />
        <Bar className="h-1.5 w-full bg-amber-700/50" />
        <Bar className="h-1.5 w-full bg-amber-700/50" />
        <Bar className="h-1.5 w-3/4 bg-amber-700/50" />
      </div>
    );
  }

  if (themeId === "lantern") {
    return (
      <div className={`${h} bg-[#2a0f12] p-2 flex items-end justify-center gap-2`}>
        <div className="w-10 rounded-b-2xl bg-[#8b1e24] border border-[#f3c97a]/50 h-16" />
        <div className="w-10 rounded-b-2xl bg-[#8b1e24] border border-[#f3c97a]/50 h-12" />
      </div>
    );
  }

  if (themeId === "polaroid") {
    return (
      <div className={`${h} bg-[#d9c4a0] p-2 flex items-center justify-center gap-2`}>
        <div className="w-12 bg-white p-1 -rotate-6 shadow-sm">
          <div className="h-8 bg-[#c45c26]/40" />
        </div>
        <div className="w-12 bg-white p-1 rotate-6 shadow-sm">
          <div className="h-8 bg-[#3d2a1a]/30" />
        </div>
      </div>
    );
  }

  if (themeId === "bento") {
    return (
      <div className={`${h} bg-[#f3efe6] p-2`}>
        <div className="h-full border-2 border-[#2b2118] grid grid-cols-2 gap-1 p-1">
          <div className="col-span-2 bg-[#e8dcc6]" />
          <div className="bg-[#d7c7aa]" />
          <div className="bg-[#c45c26]/30" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${h} bg-slate-50 p-2 space-y-1.5`}>
      <div className="h-12 rounded-2xl bg-white border border-slate-200 flex overflow-hidden">
        <div className="flex-1 p-1.5 space-y-1">
          <Bar className="h-1.5 w-14 bg-slate-800" />
          <Bar className="h-1 w-10 bg-slate-300" />
        </div>
        <div className="w-10 bg-slate-300" />
      </div>
      <div className="h-12 rounded-2xl bg-white border border-slate-200" />
    </div>
  );
}
