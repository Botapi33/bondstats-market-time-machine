export const fmtPct = v => Number.isFinite(v) ? `${v.toFixed(2)}%` : '—';
export const fmtBp = v => Number.isFinite(v) ? `${v > 0 ? '+' : ''}${Math.round(v)} bp` : '—';
export const fmtIndex = v => Number.isFinite(v) ? v.toFixed(1) : '—';
export const prettyDate = iso => new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${iso}T12:00:00Z`)).toUpperCase();
