import { Polyline, Marker, Popup, LayerGroup } from "react-leaflet";
import L from "leaflet";

type Leg = { from:[number,number]; to:[number,number]; status:"afsendt"|"på vej"|"fremme"|"forsinket"; id:string };

const convoyIcon = new L.DivIcon({className:"", html:`<div style="
  width:12px;height:12px;border-radius:3px;background:#22c55e;border:2px solid white"></div>`});

export default function TransportOverlay({ visible }:{ visible:boolean }){
  if(!visible) return null;
  const legs:Leg[] = [
    {id:"t1", from:[55.62,8.28], to:[55.86,12.43], status:"på vej"},
    {id:"t2", from:[55.40,11.35], to:[55.86,12.43], status:"afsendt"},
  ];
  return (
    <LayerGroup>
      {legs.map(l=>(
        <LayerGroup key={l.id}>
          <Polyline positions={[l.from,l.to]} pathOptions={{color:l.status==="forsinket"?"red":"#22c55e", dashArray:"6 6"}}/>
          <Marker position={l.to} icon={convoyIcon}>
            <Popup>Konvoj {l.id} — {l.status}</Popup>
          </Marker>
        </LayerGroup>
      ))}
    </LayerGroup>
  );
}

