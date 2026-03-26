import { useEffect, useCallback, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Project } from "@/data/projects";

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom coloured marker icons
const createColorIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const statusIcons: Record<string, L.Icon> = {
  Completed: createColorIcon("green"),
  Ongoing: createColorIcon("blue"),
  Stalled: createColorIcon("red"),
};

// Map tile layer options for different detail levels
const mapLayers = {
  standard: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  detailed: {
    name: "Detailed",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

// Child component to fit map bounds to markers
function FitBounds({ projects }: { projects: Project[] }) {
  const map = useMap();

  useEffect(() => {
    const coords = projects
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => [p.latitude!, p.longitude!] as [number, number]);

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [projects, map]);

  return null;
}

// Child component to handle panning to a highlighted project
function PanToHighlight({
  highlightedId,
  projects,
}: {
  highlightedId: string | null;
  projects: Project[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!highlightedId) return;
    const project = projects.find((p) => p.id === highlightedId);
    if (project && project.latitude != null && project.longitude != null) {
      map.setView([project.latitude, project.longitude], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [highlightedId, projects, map]);

  return null;
}

interface ProjectLocationMapProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  highlightedId?: string | null;
  className?: string;
}

export default function ProjectLocationMap({
  projects,
  onProjectClick,
  highlightedId,
  className = "",
}: ProjectLocationMapProps) {
  const [selectedLayer, setSelectedLayer] = useState<keyof typeof mapLayers>("detailed");
  
  // Only show projects with valid coordinates
  const mappableProjects = projects.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  // Busia County center coordinates
  const defaultCenter: [number, number] = [0.4608, 34.1115];
  const defaultZoom = 11;

  const statusColor = (s: string) => {
    if (s === "Completed") return "bg-emerald-500/15 text-emerald-600 border-emerald-200";
    if (s === "Ongoing") return "bg-blue-500/15 text-blue-600 border-blue-200";
    return "bg-amber-500/15 text-amber-600 border-amber-200";
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border shadow-sm ${className}`}>
      {/* Map layer selector */}
      <div className="absolute top-3 left-3 z-[1000] bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg">
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value as keyof typeof mapLayers)}
          className="px-3 py-2 text-xs font-medium bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer"
        >
          {Object.entries(mapLayers).map(([key, layer]) => (
            <option key={key} value={key} className="bg-card text-foreground">
              {layer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project count badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[11px] font-bold text-foreground">
          {mappableProjects.length}{" "}
          <span className="text-muted-foreground font-normal">
            of {projects.length} projects mapped
          </span>
        </p>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-2.5 shadow-lg">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Legend</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[11px] text-foreground">Ongoing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[11px] text-foreground">Stalled</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
        style={{ background: "#f8f9fa" }}
      >
        <TileLayer
          attribution={mapLayers[selectedLayer].attribution}
          url={mapLayers[selectedLayer].url}
          maxZoom={19}
          minZoom={3}
        />

        <FitBounds projects={projects} />
        <PanToHighlight highlightedId={highlightedId ?? null} projects={mappableProjects} />

        {mappableProjects.map((project) => (
          <Marker
            key={project.id}
            position={[project.latitude!, project.longitude!]}
            icon={statusIcons[project.status] || statusIcons.Ongoing}
            eventHandlers={{
              click: () => onProjectClick?.(project),
            }}
          >
            <Popup maxWidth={280} className="project-popup">
              <div className="p-1">
                <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">
                  {project.name}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {project.sector}
                  </span>
                </div>
                <div className="space-y-0.5 text-[11px] text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Location:</span>{" "}
                    {project.ward}, {project.sub_county}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Budget:</span>{" "}
                    KES {Number(project.budget).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Progress:</span>{" "}
                    {project.progress}%
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">FY:</span>{" "}
                    {project.fy}
                  </p>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor:
                        project.status === "Completed"
                          ? "#10b981"
                          : project.status === "Ongoing"
                            ? "#3b82f6"
                            : "#f59e0b",
                    }}
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
