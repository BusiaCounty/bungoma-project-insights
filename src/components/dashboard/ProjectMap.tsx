import type { Project } from "@/data/projects";
import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ProjectMapProps {
  projects: Project[];
}

// Generate deterministic random coordinates per project within Busia bounds
function seededRandom(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  hash = Math.imul(hash ^ (hash >>> 15), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

const statusColor: Record<string, string> = {
  Completed: "hsl(142 71% 45%)", // success
  Ongoing: "hsl(221.2 83.2% 53.3%)", // primary
  Stalled: "hsl(0 80% 45%)", // stalled
};

const createIcon = (status: string) => {
  const color = statusColor[status] || "gray";
  const html = `
    <div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
      <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon bg-transparent border-none", // override leaflet styles that block styling
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

const ProjectMap = ({ projects }: ProjectMapProps) => {
  // Bungoma Center roughly
  const bungomaCenter: [number, number] = [0.56, 34.56];

  const mapData = useMemo(() => {
    return projects.map((p) => {
      // Simulate lat/lng inside Busia
      // Latitude: ~ 0.4 to 0.9
      // Longitude: ~ 34.3 to 34.8
      const lat = 0.4 + seededRandom(p.id + "lat") * 0.5;
      const lng = 34.3 + seededRandom(p.id + "lng") * 0.5;
      return { ...p, lat, lng };
    });
  }, [projects]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden h-[600px] flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <h3 className="text-sm font-bold text-foreground">
          Interactive Project Map
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Showing simulated project locations across Bungoma County
        </p>
      </div>

      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={bungomaCenter}
          zoom={10}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {mapData.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createIcon(p.status)}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="space-y-2 p-1 max-w-[200px]">
                  <div>
                    <h4 className="font-bold text-xs text-foreground leading-tight mb-1">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {p.ward}, {p.sub_county}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: statusColor[p.status],
                        color: "white",
                      }}
                    >
                      {p.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {p.progress}% Complete
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground font-semibold">
                    Budget: KES {Number(p.budget).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        /* Overrides to make popup fit better in dark/light mode */
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          background-color: hsl(var(--card));
          color: hsl(var(--foreground));
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          border: 1px solid hsl(var(--border));
        }
        .leaflet-popup-tip {
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }
        .custom-leaflet-icon:hover > div {
          transform: scale(1.15);
        }
        .leaflet-container {
          background: hsl(var(--muted) / 0.3);
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default ProjectMap;
