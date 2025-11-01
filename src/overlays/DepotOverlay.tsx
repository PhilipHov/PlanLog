import { Marker, Popup, LayerGroup } from "react-leaflet";
import L from "leaflet";

const depotIcon = new L.DivIcon({ className:"", html:`<div style="
  width:14px;height:14px;border-radius:50%;background:#0ea5e9;border:2px solid white"></div>` });

type Depot = { id:string; name:string; lat:number; lng:number; type:"ammo"|"fuel"|"food"; fill:number };
export function mockDepots(): Depot[]{
  return [
    {id:"d1", name:"Ammo depot Oksbøl", lat:55.62,lng:8.29,type:"ammo",fill:0.72},
    {id:"d2", name:"Fuel depot Sjælland", lat:55.60,lng:12.10,type:"fuel",fill:0.38},
    {id:"d3", name:"Food depot Aalborg", lat:57.05,lng:9.92,type:"food",fill:0.86},
  ];
}

export default function DepotOverlay({ visible }:{ visible:boolean }){
  if(!visible) return null;
  const depots = mockDepots();
  return (
    <LayerGroup>
      {depots.map(d=>(
        <Marker key={d.id} position={[d.lat,d.lng]} icon={depotIcon}>
          <Popup>
            <b>{d.name}</b><br/>Type: {d.type}<br/>Fyldning: {Math.round(d.fill*100)}%
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  );
}

