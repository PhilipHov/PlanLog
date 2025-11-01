import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png?url";
import marker from "leaflet/dist/images/marker-icon.png?url";
import shadow from "leaflet/dist/images/marker-shadow.png?url";
import type { GenerelState } from "./types";
import { useEffect } from "react";

const DefaultIcon = new L.Icon({
  iconUrl: marker, iconRetinaUrl: marker2x, shadowUrl: shadow,
  iconSize:[25,41], iconAnchor:[12,41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/** DK-udsnit ~ som dit PlanOps billede */
const dkBounds = L.latLngBounds([[54.35, 7.70], [58.05, 15.30]]); // finjustér hvis du vil

function ViewController({
  mode, point
}:{ mode:"country"|"point"; point?:{lat:number;lng:number} }){
  const map = useMap();
  useEffect(()=>{
    if (mode==="country") {
      map.fitBounds(dkBounds, { padding:[30,30] });
    } else if (point) {
      map.flyTo([point.lat, point.lng], 7, { duration: 0.8 });
    }
  }, [mode, point?.lat, point?.lng]);
  return null;
}

export default function MapView({
  enheder, filterReady, onSelect, viewMode, selectedPoint
}:{
  enheder: GenerelState[];
  filterReady: "alle"|"grøn"|"gul"|"rød";
  onSelect: (id:string)=>void;
  viewMode: "country"|"point";
  selectedPoint?: {lat:number; lng:number};
}){
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer
        className="map"
        style={{ width: "100%", height: "100%" }}
        bounds={dkBounds}
        boundsOptions={{padding:[30,30]}}
        scrollWheelZoom
        zoomControl
        preferCanvas
      >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ViewController mode={viewMode} point={selectedPoint} />

      {enheder.map(e=>{
        const total = totalPersonel(e);
        const ready = Math.round(Math.min(100, 100*total / Math.max(1,e.personel.mål)));
        const pass =
          filterReady==="alle" ||
          (filterReady==="grøn" && ready>=80) ||
          (filterReady==="gul" && ready>=60 && ready<80) ||
          (filterReady==="rød" && ready<60);
        if (!pass) return null;

        return (
          <Marker 
            key={e.id} 
            position={[e.lat,e.lng]}
            eventHandlers={{
              click: () => onSelect(e.id)
            }}
          />
        );
      })}
      </MapContainer>
    </div>
  );
}

function totalPersonel(e: GenerelState){
  const sum = (o:Record<string,number>) => Object.values(o).reduce((a,b)=>a+b,0);
  return sum(e.personel.officerer)+sum(e.personel.befalingsmænd)+sum(e.personel.øvrige);
}
