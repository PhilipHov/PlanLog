import { beredskabBlokke } from "../data";

export default function BeredskabPanel(){
  return (
    <div className="section">
      <h3>Beredskab</h3>
      {beredskabBlokke.map((blk,i)=>{
        const cur = blk.grupper.reduce((a,b)=>a+b.current,0);
        const tar = blk.grupper.reduce((a,b)=>a+b.target,0);
        return (
          <div className="row" key={i}>
            <div className="label">{blk.title}</div>
            <div className="value">{cur} / {tar}</div>
            <div className="small">mangler {Math.max(0,tar-cur)}</div>
          </div>
        );
      })}
    </div>
  );
}

