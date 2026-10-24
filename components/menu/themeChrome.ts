export type ThemeChrome = {
  page: string;
  card: string;
  title: string;
  sticky: string;
  input: string;
  footer: string;
  empty: string;
  menuChip: string;
  catPill: (active: boolean) => string;
  dietPill: (type: "ALL" | "VEG" | "NON_VEG", active: boolean) => string;
  popularPill: (active: boolean) => string;
  modal: string;
  modalMuted: string;
};

const baseDiet = (type: "ALL" | "VEG" | "NON_VEG", active: boolean, on: string, off: string) => {
  if (active) {
    if (type === "VEG") return "bg-emerald-600 text-white border-transparent";
    if (type === "NON_VEG") return "bg-red-600 text-white border-transparent";
    return on;
  }
  return off;
};

export function getThemeChrome(theme: string): ThemeChrome {
  if (theme === "gourmet") {
    return {
      page: "bg-[#0c0d10] text-[#eaeaea]",
      card: "bg-[#13151b] border-amber-900/10 text-white",
      title: "text-amber-500 font-serif font-black",
      sticky: "bg-[#0c0d10]/95 border-slate-900/80",
      input: "bg-[#13151b] border-slate-800 focus:ring-amber-500/20 focus:border-amber-500 text-white placeholder-slate-600",
      footer: "border-slate-900 bg-[#0c0d10] text-slate-500",
      empty: "bg-[#13151b] border-slate-900 text-slate-300",
      menuChip: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      catPill: (active) =>
        active ? "bg-amber-500 text-slate-950 border-amber-500 font-bold" : "bg-[#13151b] border-slate-800 text-slate-400",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-amber-500 text-slate-950 border-transparent font-bold", "bg-[#13151b] border-slate-800 text-slate-400"),
      popularPill: (active) =>
        active ? "bg-amber-500 text-slate-950 border-transparent font-bold" : "bg-[#13151b] border border-slate-800 text-amber-500",
      modal: "bg-[#13151b] text-white border border-slate-800",
      modalMuted: "text-slate-400",
    };
  }

  if (theme === "street") {
    return {
      page: "bg-[#fffdf9] text-slate-800",
      card: "bg-white border-orange-100 text-slate-900",
      title: "text-orange-600 font-black",
      sticky: "bg-[#fffdf9]/95 border-orange-100/50",
      input: "bg-white border-orange-100 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800",
      footer: "border-orange-100 bg-white text-slate-400",
      empty: "bg-white border-orange-100 text-slate-800",
      menuChip: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      catPill: (active) =>
        active ? "bg-orange-500 text-white border-transparent" : "bg-white border-orange-100 text-orange-950",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-orange-500 text-white border-transparent font-bold", "bg-white border border-orange-100 text-orange-950"),
      popularPill: (active) =>
        active ? "bg-orange-500 text-white border-transparent font-bold" : "bg-white border border-orange-100 text-amber-600",
      modal: "bg-white text-slate-800",
      modalMuted: "text-slate-500",
    };
  }

  if (theme === "premium") {
    return {
      page: "bg-[#FCFAF2] text-slate-800",
      card: "bg-[#FCFAF2] border-amber-200 text-slate-900",
      title: "text-amber-950 font-serif font-black",
      sticky: "bg-[#FCFAF2]/95 border-amber-200/30",
      input: "bg-[#fcfbf7] border-amber-200 focus:ring-amber-500/20 focus:border-amber-700 text-slate-800",
      footer: "border-amber-100 bg-[#FCFAF2] text-slate-400",
      empty: "bg-[#FCFAF4] border-amber-200 text-slate-800",
      menuChip: "bg-amber-50 text-amber-900 border-amber-200",
      catPill: (active) =>
        active ? "bg-amber-900 text-white border-amber-900" : "bg-[#FCFAF4] border-amber-200 text-amber-900",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-amber-900 text-white border-transparent", "bg-[#FCFAF4] border border-amber-200 text-amber-900"),
      popularPill: (active) =>
        active ? "bg-amber-800 text-white border-transparent font-bold" : "bg-[#FCFAF4] border border-amber-200 text-amber-800",
      modal: "bg-[#FCFAF4] text-slate-800",
      modalMuted: "text-slate-600",
    };
  }

  if (theme === "cafe") {
    return {
      page: "bg-[#faf6f0] text-slate-850",
      card: "bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#1e293b]",
      title: "text-slate-950 font-black",
      sticky: "bg-[#faf6f0]/95 border-slate-900/10",
      input: "bg-white border-2 border-slate-900 focus:ring-2 focus:ring-slate-900 text-slate-900",
      footer: "border-slate-900 bg-[#faf6f0] text-slate-500",
      empty: "bg-white border-2 border-slate-900 text-slate-800",
      menuChip: "bg-amber-400 text-slate-950 border-slate-900",
      catPill: (active) =>
        active ? "bg-slate-950 text-white border-slate-950" : "bg-white border-2 border-slate-900 text-slate-950",
      dietPill: (type, active) =>
        active ? "bg-slate-950 text-white border-2 border-slate-900" : "bg-white border-2 border-slate-900 text-slate-950",
      popularPill: (active) =>
        active ? "bg-amber-400 text-slate-950 border-2 border-slate-900 font-bold" : "bg-white border-2 border-slate-900 text-amber-700",
      modal: "bg-white text-slate-800 border-2 border-slate-900",
      modalMuted: "text-slate-600",
    };
  }

  if (theme === "editorial") {
    return {
      page: "bg-[#f3eee4] text-[#2b241c]",
      card: "bg-[#faf6ee] border-[#d8cfc0] text-[#2b241c]",
      title: "text-[#2b241c] font-serif font-black",
      sticky: "bg-[#f3eee4]/95 border-[#d8cfc0]",
      input: "bg-[#faf6ee] border-[#d8cfc0] focus:ring-[#8a6a3b]/20 focus:border-[#8a6a3b] text-[#2b241c]",
      footer: "border-[#d8cfc0] bg-[#efe8da] text-[#6d6356]",
      empty: "bg-[#faf6ee] border-[#d8cfc0] text-[#2b241c]",
      menuChip: "bg-[#2b241c] text-[#f3eee4] border-[#2b241c]",
      catPill: (active) =>
        active ? "bg-[#2b241c] text-[#f3eee4] border-[#2b241c]" : "bg-transparent border-[#2b241c] text-[#2b241c]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#2b241c] text-[#f3eee4] border-transparent", "bg-transparent border border-[#2b241c] text-[#2b241c]"),
      popularPill: (active) =>
        active ? "bg-[#8a6a3b] text-white border-transparent" : "bg-transparent border border-[#8a6a3b] text-[#8a6a3b]",
      modal: "bg-[#faf6ee] text-[#2b241c]",
      modalMuted: "text-[#6d6356]",
    };
  }

  if (theme === "ticket") {
    return {
      page: "bg-[#e9dfc8] text-[#1c1914]",
      card: "bg-[#f7f1df] border-[#c9b78a] text-[#1c1914]",
      title: "text-[#1c1914] font-black uppercase tracking-wider",
      sticky: "bg-[#e9dfc8]/95 border-[#c9b78a]",
      input: "bg-[#f7f1df] border-[#c9b78a] focus:ring-[#b42318]/20 focus:border-[#b42318] text-[#1c1914] font-mono",
      footer: "border-[#c9b78a] bg-[#e9dfc8] text-[#6b6250]",
      empty: "bg-[#f7f1df] border-[#c9b78a] text-[#1c1914]",
      menuChip: "bg-[#b42318] text-white border-[#b42318]",
      catPill: (active) =>
        active ? "bg-[#1c1914] text-[#f7f1df] border-[#1c1914]" : "bg-[#f7f1df] border-[#1c1914] text-[#1c1914]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#1c1914] text-[#f7f1df] border-transparent", "bg-[#f7f1df] border border-[#1c1914] text-[#1c1914]"),
      popularPill: (active) =>
        active ? "bg-[#b42318] text-white border-transparent" : "bg-[#f7f1df] border border-[#b42318] text-[#b42318]",
      modal: "bg-[#f7f1df] text-[#1c1914]",
      modalMuted: "text-[#6b6250]",
    };
  }

  if (theme === "neon") {
    return {
      page: "bg-[#0a0612] text-[#f5f0ff]",
      card: "bg-[#140c22] border-[#3a1d55] text-[#f5f0ff]",
      title: "text-[#ff4d9a] font-black",
      sticky: "bg-[#0a0612]/95 border-[#2a1540]",
      input: "bg-[#140c22] border-[#3a1d55] focus:ring-[#2de2e6]/30 focus:border-[#2de2e6] text-white placeholder-slate-500",
      footer: "border-[#2a1540] bg-[#0a0612] text-slate-500",
      empty: "bg-[#140c22] border-[#3a1d55] text-[#f5f0ff]",
      menuChip: "bg-[#ff4d9a]/15 text-[#ff4d9a] border-[#ff4d9a]/40",
      catPill: (active) =>
        active ? "bg-[#ff4d9a] text-[#0a0612] border-[#ff4d9a]" : "bg-[#140c22] border-[#3a1d55] text-[#c9b6e0]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#2de2e6] text-[#0a0612] border-transparent font-bold", "bg-[#140c22] border border-[#3a1d55] text-[#c9b6e0]"),
      popularPill: (active) =>
        active ? "bg-[#ff4d9a] text-[#0a0612] border-transparent font-bold" : "bg-[#140c22] border border-[#ff4d9a]/40 text-[#ff4d9a]",
      modal: "bg-[#140c22] text-[#f5f0ff] border border-[#3a1d55]",
      modalMuted: "text-[#c9b6e0]",
    };
  }

  if (theme === "thali") {
    return {
      page: "bg-[#f6ead8] text-[#3d2414]",
      card: "bg-[#fff6ea] border-[#e2c39a] text-[#3d2414]",
      title: "text-[#8b3d12] font-black",
      sticky: "bg-[#f6ead8]/95 border-[#e2c39a]",
      input: "bg-[#fff6ea] border-[#e2c39a] focus:ring-[#c45c26]/20 focus:border-[#c45c26] text-[#3d2414]",
      footer: "border-[#e2c39a] bg-[#efe0c8] text-[#7a5a3a]",
      empty: "bg-[#fff6ea] border-[#e2c39a] text-[#3d2414]",
      menuChip: "bg-[#c45c26] text-white border-[#c45c26]",
      catPill: (active) =>
        active ? "bg-[#c45c26] text-white border-[#c45c26]" : "bg-[#fff6ea] border-[#c45c26] text-[#8b3d12]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#c45c26] text-white border-transparent", "bg-[#fff6ea] border border-[#c45c26] text-[#8b3d12]"),
      popularPill: (active) =>
        active ? "bg-[#d4a017] text-[#3d2414] border-transparent font-bold" : "bg-[#fff6ea] border border-[#d4a017] text-[#8b3d12]",
      modal: "bg-[#fff6ea] text-[#3d2414]",
      modalMuted: "text-[#7a5a3a]",
    };
  }

  if (theme === "garden") {
    return {
      page: "bg-[#eef4ea] text-[#243026]",
      card: "bg-[#f7fbf4] border-[#c5d4bf] text-[#243026]",
      title: "text-[#2f5d3a] font-serif font-black",
      sticky: "bg-[#eef4ea]/95 border-[#c5d4bf]",
      input: "bg-[#f7fbf4] border-[#c5d4bf] focus:ring-[#2f5d3a]/20 focus:border-[#2f5d3a] text-[#243026]",
      footer: "border-[#c5d4bf] bg-[#e4eee0] text-[#5b6b5d]",
      empty: "bg-[#f7fbf4] border-[#c5d4bf] text-[#243026]",
      menuChip: "bg-[#2f5d3a] text-[#f7fbf4] border-[#2f5d3a]",
      catPill: (active) =>
        active ? "bg-[#2f5d3a] text-[#f7fbf4] border-[#2f5d3a]" : "bg-[#f7fbf4] border-[#2f5d3a]/40 text-[#2f5d3a]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#2f5d3a] text-[#f7fbf4] border-transparent", "bg-[#f7fbf4] border border-[#2f5d3a]/40 text-[#2f5d3a]"),
      popularPill: (active) =>
        active ? "bg-[#d7a441] text-[#243026] border-transparent font-bold" : "bg-[#f7fbf4] border border-[#d7a441] text-[#8a6a20]",
      modal: "bg-[#f7fbf4] text-[#243026]",
      modalMuted: "text-[#5b6b5d]",
    };
  }

  if (theme === "stamp") {
    return {
      page: "bg-[#f4efe4] text-[#1d3557]",
      card: "bg-[#fffdf8] border-[#1d3557] text-[#1d3557]",
      title: "text-[#1d3557] font-serif font-black",
      sticky: "bg-[#f4efe4]/95 border-[#d8cfbe]",
      input: "bg-[#fffdf8] border-[#1d3557]/30 focus:ring-[#c1121f]/20 focus:border-[#c1121f] text-[#1d3557]",
      footer: "border-[#d8cfbe] bg-[#efe8d8] text-[#5c6b80]",
      empty: "bg-[#fffdf8] border-[#1d3557] text-[#1d3557]",
      menuChip: "bg-[#c1121f] text-white border-[#c1121f]",
      catPill: (active) =>
        active ? "bg-[#1d3557] text-white border-[#1d3557]" : "bg-[#fffdf8] border-[#1d3557] text-[#1d3557]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#1d3557] text-white border-transparent", "bg-[#fffdf8] border border-[#1d3557] text-[#1d3557]"),
      popularPill: (active) =>
        active ? "bg-[#c1121f] text-white border-transparent" : "bg-[#fffdf8] border border-[#c1121f] text-[#c1121f]",
      modal: "bg-[#fffdf8] text-[#1d3557]",
      modalMuted: "text-[#5c6b80]",
    };
  }

  if (theme === "playbill") {
    return {
      page: "bg-[#1a1510] text-[#f6ead8]",
      card: "bg-[#241c16] border-[#e8c39e]/30 text-[#f6ead8]",
      title: "text-[#f6ead8] font-serif font-black",
      sticky: "bg-[#1a1510]/95 border-[#3a2e24]",
      input: "bg-[#241c16] border-[#3a2e24] focus:ring-[#e8c39e]/20 focus:border-[#e8c39e] text-[#f6ead8] placeholder-stone-500",
      footer: "border-[#3a2e24] bg-[#1a1510] text-[#c9b49a]",
      empty: "bg-[#241c16] border-[#3a2e24] text-[#f6ead8]",
      menuChip: "bg-[#e8c39e] text-[#1a1510] border-[#e8c39e]",
      catPill: (active) =>
        active ? "bg-[#e8c39e] text-[#1a1510] border-[#e8c39e]" : "bg-[#241c16] border-[#e8c39e]/40 text-[#e8c39e]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#e8c39e] text-[#1a1510] border-transparent", "bg-[#241c16] border border-[#e8c39e]/40 text-[#e8c39e]"),
      popularPill: (active) =>
        active ? "bg-[#e8c39e] text-[#1a1510] border-transparent font-bold" : "bg-[#241c16] border border-[#e8c39e]/40 text-[#e8c39e]",
      modal: "bg-[#241c16] text-[#f6ead8] border border-[#3a2e24]",
      modalMuted: "text-[#c9b49a]",
    };
  }

  if (theme === "board") {
    return {
      page: "bg-[#0b0c0f] text-amber-100",
      card: "bg-[#12141a] border-amber-900/40 text-amber-100",
      title: "text-amber-400 font-mono font-black uppercase tracking-wider",
      sticky: "bg-[#0b0c0f]/95 border-amber-900/40",
      input: "bg-[#12141a] border-amber-900/40 focus:ring-amber-400/20 focus:border-amber-400 text-amber-100 placeholder-amber-900 font-mono",
      footer: "border-amber-900/40 bg-[#0b0c0f] text-amber-700",
      empty: "bg-[#12141a] border-amber-900/40 text-amber-100",
      menuChip: "bg-amber-400 text-[#0b0c0f] border-amber-400",
      catPill: (active) =>
        active ? "bg-amber-400 text-[#0b0c0f] border-amber-400" : "bg-[#12141a] border-amber-900/40 text-amber-400",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-amber-400 text-[#0b0c0f] border-transparent font-bold", "bg-[#12141a] border border-amber-900/40 text-amber-400"),
      popularPill: (active) =>
        active ? "bg-amber-400 text-[#0b0c0f] border-transparent font-bold" : "bg-[#12141a] border border-amber-400/40 text-amber-400",
      modal: "bg-[#12141a] text-amber-100 border border-amber-900/40",
      modalMuted: "text-amber-700",
    };
  }

  if (theme === "lantern") {
    return {
      page: "bg-[#2a0f12] text-[#fff4d6]",
      card: "bg-[#3a1418] border-[#f3c97a]/30 text-[#fff4d6]",
      title: "text-[#f3c97a] font-black",
      sticky: "bg-[#2a0f12]/95 border-[#5c1216]",
      input: "bg-[#3a1418] border-[#5c1216] focus:ring-[#f3c97a]/20 focus:border-[#f3c97a] text-[#fff4d6] placeholder-rose-200/40",
      footer: "border-[#5c1216] bg-[#2a0f12] text-[#e8c39e]",
      empty: "bg-[#3a1418] border-[#5c1216] text-[#fff4d6]",
      menuChip: "bg-[#f3c97a] text-[#3a1012] border-[#f3c97a]",
      catPill: (active) =>
        active ? "bg-[#f3c97a] text-[#3a1012] border-[#f3c97a]" : "bg-[#3a1418] border-[#f3c97a]/40 text-[#f3c97a]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#f3c97a] text-[#3a1012] border-transparent", "bg-[#3a1418] border border-[#f3c97a]/40 text-[#f3c97a]"),
      popularPill: (active) =>
        active ? "bg-[#f3c97a] text-[#3a1012] border-transparent font-bold" : "bg-[#3a1418] border border-[#f3c97a]/40 text-[#f3c97a]",
      modal: "bg-[#3a1418] text-[#fff4d6] border border-[#5c1216]",
      modalMuted: "text-[#e8c39e]",
    };
  }

  if (theme === "polaroid") {
    return {
      page: "bg-[#d9c4a0] text-[#3d2a1a]",
      card: "bg-[#efe4cc] border-[#c4ae8a] text-[#3d2a1a]",
      title: "text-[#3d2a1a] font-black",
      sticky: "bg-[#d9c4a0]/95 border-[#c4ae8a]",
      input: "bg-[#efe4cc] border-[#c4ae8a] focus:ring-[#c45c26]/20 focus:border-[#c45c26] text-[#3d2a1a]",
      footer: "border-[#c4ae8a] bg-[#cbb892] text-[#6b5340]",
      empty: "bg-[#efe4cc] border-[#c4ae8a] text-[#3d2a1a]",
      menuChip: "bg-[#c45c26] text-white border-[#c45c26]",
      catPill: (active) =>
        active ? "bg-[#3d2a1a] text-[#efe4cc] border-[#3d2a1a]" : "bg-[#efe4cc] border-[#3d2a1a]/40 text-[#3d2a1a]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#3d2a1a] text-[#efe4cc] border-transparent", "bg-[#efe4cc] border border-[#3d2a1a]/40 text-[#3d2a1a]"),
      popularPill: (active) =>
        active ? "bg-[#c45c26] text-white border-transparent" : "bg-[#efe4cc] border border-[#c45c26] text-[#c45c26]",
      modal: "bg-[#efe4cc] text-[#3d2a1a]",
      modalMuted: "text-[#6b5340]",
    };
  }

  if (theme === "bento") {
    return {
      page: "bg-[#f3efe6] text-[#2b2118]",
      card: "bg-[#fffaf1] border-[#2b2118] text-[#2b2118]",
      title: "text-[#2b2118] font-black",
      sticky: "bg-[#f3efe6]/95 border-[#2b2118]/20",
      input: "bg-[#fffaf1] border-[#2b2118]/30 focus:ring-[#b42318]/20 focus:border-[#b42318] text-[#2b2118]",
      footer: "border-[#2b2118]/20 bg-[#e8e0d2] text-[#6b6250]",
      empty: "bg-[#fffaf1] border-[#2b2118] text-[#2b2118]",
      menuChip: "bg-[#2b2118] text-[#fffaf1] border-[#2b2118]",
      catPill: (active) =>
        active ? "bg-[#2b2118] text-[#fffaf1] border-[#2b2118]" : "bg-[#fffaf1] border-[#2b2118] text-[#2b2118]",
      dietPill: (type, active) =>
        baseDiet(type, active, "bg-[#2b2118] text-[#fffaf1] border-transparent", "bg-[#fffaf1] border border-[#2b2118] text-[#2b2118]"),
      popularPill: (active) =>
        active ? "bg-[#b42318] text-white border-transparent" : "bg-[#fffaf1] border border-[#b42318] text-[#b42318]",
      modal: "bg-[#fffaf1] text-[#2b2118]",
      modalMuted: "text-[#6b6250]",
    };
  }

  return {
    page: "bg-slate-50 text-slate-800",
    card: "bg-white border-slate-200/80 text-slate-900",
    title: "text-slate-900 font-black",
    sticky: "bg-slate-50/90 border-slate-200/80",
    input: "bg-white border-slate-200 focus:ring-primary/10 focus:border-primary text-slate-800",
    footer: "border-slate-200 bg-white text-slate-400",
    empty: "bg-white border-slate-200 text-slate-800",
    menuChip: "bg-primary/5 text-primary border-primary/10",
    catPill: (active) =>
      active ? "bg-[#001B50] text-white border-[#001B50]" : "bg-white border-slate-200 text-slate-700",
    dietPill: (type, active) =>
      baseDiet(type, active, "bg-[#001B50] text-white border-transparent", "bg-white border border-slate-200 text-slate-650"),
    popularPill: (active) =>
      active ? "bg-amber-500 text-slate-950 border-transparent font-bold" : "bg-white border border-slate-200 text-amber-600",
    modal: "bg-white text-slate-800",
    modalMuted: "text-slate-500",
  };
}
