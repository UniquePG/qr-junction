const ADD_LABELS: Record<string, string> = {
  modern: "Add to plate",
  minimal: "Add to plate",
  premium: "Add to the table",
  gourmet: "Add to the table",
  cafe: "Add to the tray",
  street: "Grab this",
  neon: "Grab this",
  ticket: "Add to the check",
  board: "Add to the check",
  thali: "Add to the thali",
  bento: "Add to the thali",
  garden: "Add to the spread",
  lantern: "Add to the spread",
  stamp: "Save this dish",
  polaroid: "Save this dish",
  playbill: "Save this dish",
  editorial: "Save this dish",
};

export function addLabelForTheme(theme?: string | null) {
  return ADD_LABELS[theme || "modern"] || "Add to plate";
}
