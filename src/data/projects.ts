export interface Project {
  id: number;
  name: string;
  subCounty: string;
  ward: string;
  sector: string;
  status: "Completed" | "Ongoing" | "Stalled";
  budget: number;
  fy: string;
  description: string;
  lat?: number;
  lng?: number;
  progress: number;
}

export const SUB_COUNTIES = [
  "Bumula", "Kabuchai", "Kanduyi", "Kimilili", "Mt. Elgon",
  "Sirisia", "Tongaren", "Webuye East", "Webuye West"
];

export const SECTORS = [
  "Health", "Education", "Roads & Infrastructure", "Water & Sanitation",
  "Agriculture", "Energy", "Trade & Industry", "ICT"
];

export const STATUSES = ["Completed", "Ongoing", "Stalled"] as const;

export const FINANCIAL_YEARS = [
  "2020/2021", "2021/2022", "2022/2023", "2023/2024", "2024/2025"
];

const WARDS: Record<string, string[]> = {
  "Bumula": ["Bumula", "Khasoko", "Kabula", "South Bukusu", "Siboti", "West Bukusu"],
  "Kabuchai": ["Kabuchai", "Chwele/Kabula", "West Nalondo", "Bwake/Luuya"],
  "Kanduyi": ["Khalaba", "Musikoma", "East Sang'alo", "Marakaru/Tuuti", "Sang'alo/West", "Township"],
  "Kimilili": ["Kimilili", "Kibingei", "Maeni", "Kamukuywa"],
  "Mt. Elgon": ["Cheptais", "Chesikaki", "Chepyuk", "Kapkateny", "Kaptama", "Elgon"],
  "Sirisia": ["Sirisia", "Malakisi/South Kulisiru", "Lwandanyi", "Namwela"],
  "Tongaren": ["Tongaren", "Naitiri/Kabuyefwe", "Milima", "Ndalu/Tabani", "Soysambu/Mitua"],
  "Webuye East": ["Mihuu", "Ndivisi", "Maraka"],
  "Webuye West": ["Sitikho", "Matulo", "Bokoli", "Misikhu"],
};

export const getWards = (subCounty?: string) => {
  if (!subCounty || subCounty === "all") return Object.values(WARDS).flat();
  return WARDS[subCounty] || [];
};

// Generate sample projects
function generateProjects(): Project[] {
  const projects: Project[] = [];
  let id = 1;
  const projectNames = [
    "Construction of Health Center", "Borehole Drilling", "Road Grading & Murram",
    "School Classroom Construction", "Market Shed Construction", "Solar Streetlights Installation",
    "Bridge Construction", "ECD Center Development", "Water Pipeline Extension",
    "Agricultural Training Center", "ICT Hub Development", "Dispensary Upgrade",
    "Cattle Dip Rehabilitation", "Vocational Training Center", "Drainage System Construction",
    "Community Hall Construction", "Fish Pond Development", "Milk Cooling Plant",
    "Rural Electrification", "Sanitation Block Construction"
  ];

  for (const sc of SUB_COUNTIES) {
    const wards = WARDS[sc] || [];
    for (const ward of wards) {
      const numProjects = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numProjects; i++) {
        const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const fy = FINANCIAL_YEARS[Math.floor(Math.random() * FINANCIAL_YEARS.length)];
        const budget = (Math.floor(Math.random() * 50) + 5) * 100000;
        const progress = status === "Completed" ? 100 : status === "Stalled" ? Math.floor(Math.random() * 40) : 40 + Math.floor(Math.random() * 55);
        projects.push({
          id: id++,
          name: `${projectNames[Math.floor(Math.random() * projectNames.length)]} - ${ward}`,
          subCounty: sc,
          ward,
          sector,
          status,
          budget,
          fy,
          description: `${sector} project in ${ward}, ${sc} Sub County.`,
          progress,
        });
      }
    }
  }
  return projects;
}

export const PROJECTS = generateProjects();
