import jsPDF from "jspdf";

export function exportReportPNG(idOfNode: string, _title="Logistikrapport"){
  const node = document.getElementById(idOfNode);
  if(!node) return;
  // enkel print: udnyt browserens print til PDF
  window.print();
}

export function exportReportPDFSimple(lines: string[]){
  const pdf = new jsPDF();
  pdf.setFontSize(14);
  pdf.text("Hærens logistiske status", 14, 16);
  pdf.setFontSize(11);
  let y=26;
  lines.forEach((l)=>{ pdf.text(l, 14, y); y+=6; });
  pdf.save("haeren-logistik-rapport.pdf");
}

export function exportKasernerPDF(enheder: {
  id:string; navn:string;
  personel:{ mål:number; officerer:Record<string,number>; befalingsmænd:Record<string,number>; øvrige:Record<string,number> };
  materiel:{ bygninger:number; våben:number; terræn:number };
  uddannelse:{ stående:number; uddannelsesenhed:number };
}[]){
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  enheder.forEach((e, idx)=>{
    if (idx>0) pdf.addPage();
    const s=(o:Record<string,number>)=>Object.values(o).reduce((a,b)=>a+b,0);
    const tot=s(e.personel.officerer)+s(e.personel.befalingsmænd)+s(e.personel.øvrige);
    const ready=Math.round(100*tot/Math.max(1,e.personel.mål));

    pdf.setFont("helvetica","bold"); pdf.setFontSize(16);
    pdf.text(e.navn, 40, 50);
    pdf.setFontSize(11); pdf.setFont("helvetica","normal");

    const lines = [
      `Readiness: ${ready}%`,
      `Personel: ${tot} / ${e.personel.mål}`,
      `Uddannelse: Stående ${e.uddannelse.stående}% · Enhed ${e.uddannelse.uddannelsesenhed}%`,
      `Materiel: Bygninger ${e.materiel.bygninger} · Våben ${e.materiel.våben} · Terræn ${e.materiel.terræn}`
    ];
    let y=80; lines.forEach(l=>{ pdf.text(l, 40, y); y+=18; });

    // simpel status-bjælke
    const barW = 400, barH = 12; const x=40, yy=y+10;
    pdf.setDrawColor(200); pdf.rect(x, yy, barW, barH);
    const r = ready>=80 ? 34 : ready>=60 ? 245 : 239;
    const g = ready>=80 ? 197 : ready>=60 ? 158 : 68;
    const b = ready>=80 ? 94 : ready>=60 ? 11 : 68;
    pdf.setFillColor(r, g, b); // grøn/gul/rød
    pdf.rect(x, yy, Math.round(barW*ready/100), barH, "F");
    pdf.setTextColor(80); pdf.text(`${ready}%`, x+barW+10, yy+barH-2);

    pdf.setTextColor(0);
    pdf.text("Auto-genereret af Hæren Logistik Overblik", 40, 820);
  });
  pdf.save("haeren-logistik-rapport.pdf");
}

