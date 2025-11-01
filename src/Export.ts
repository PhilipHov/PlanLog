import type { GenerelState } from "./types";

export function exportCSV(rows: Record<string, string|number>[], filename="rapport.csv"){
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map(r => headers.map(h => r[h] ?? "").join(",")).join("\n");
  const csv = headers.join(",") + "\n" + body;
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function exportOverviewToCSV(enheder: GenerelState[]){
  const rows = enheder.map(e => ({
    Enhed: e.navn,
    Personel_total: totalPersonel(e),
    Måltal: e.personel.mål,
    Mangler: Math.max(0, e.personel.mål - totalPersonel(e)),
    Stående_udannelse_pct: e.uddannelse.stående,
    Uddannelsesenhed_pct: e.uddannelse.uddannelsesenhed,
    Våben: e.materiel.våben,
    Bygninger: e.materiel.bygninger,
    Terræn: e.materiel.terræn
  }));
  exportCSV(rows, "haeren_logistik_overblik.csv");
}

export function totalPersonel(e: GenerelState){
  const sum = (o:Record<string,number>) => Object.values(o).reduce((a,b)=>a+b,0);
  return sum(e.personel.officerer)+sum(e.personel.befalingsmænd)+sum(e.personel.øvrige);
}

// Stub – du kan senere plugge jsPDF ind her.
export function exportPDFStub(){
  alert("PDF-export kan tilføjes med jsPDF (stub).");
}

