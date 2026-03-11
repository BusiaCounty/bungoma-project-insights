import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Map, MapPin, Edit, Plus } from "lucide-react";

export default function GeoAdmin() {
  const geoStructure = [
    {
      county: "Bungoma County",
      subCounties: [
        { name: "Kanduyi", wards: ["Township", "Khalaba", "Bukembe West"] },
        { name: "Webuye West", wards: ["Misikhu", "Bokoli", "Matulo"] },
        { name: "Kimilili", wards: ["Kibingei", "Kamtukwii", "Kimilili Rural"] },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Geographic Administration</h2>
          <p className="text-muted-foreground text-sm">Configure locations, sub-counties, wards, and map settings.</p>
        </div>
        <Button className="gap-2 shrink-0">
          <Map className="w-4 h-4" /> Manage Map Layers
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Administrative Hierarchy</CardTitle>
              <CardDescription>Regions used for project assignment.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
             <Accordion type="single" collapsible className="w-full">
                {geoStructure.map((system) => (
                  <AccordionItem value="item-1" key={system.county}>
                    <AccordionTrigger className="font-bold text-base hover:no-underline">
                       <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary"/>{system.county}</div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 space-y-4">
                        {system.subCounties.map(sub => (
                           <div key={sub.name} className="border border-border rounded-lg overflow-hidden">
                               <div className="bg-muted p-2 flex justify-between items-center font-medium">
                                   <span className="text-sm">{sub.name} Sub-County</span>
                                    <div className="flex gap-1">
                                       <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="w-3 h-3 text-muted-foreground"/></Button>
                                       <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="w-3 h-3 text-muted-foreground"/></Button>
                                   </div>
                               </div>
                               <div className="p-2 space-y-1">
                                   {sub.wards.map(ward => (
                                       <div key={ward} className="text-xs text-muted-foreground pl-4 py-1 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-border"></div> {ward} Ward
                                       </div>
                                   ))}
                               </div>
                           </div>
                        ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* GIS Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>GIS Integration Settings</CardTitle>
            <CardDescription>Configure map providers and geographic bounds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-card border border-border flex flex-col gap-1">
                  <span className="text-sm font-semibold">Map Provider Layer URL</span>
                  <code className="text-xs bg-muted p-2 rounded text-muted-foreground mt-1 block w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png
                  </code>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border flex flex-col gap-1 text-sm">
                      <span className="font-semibold">Default Coordinates</span>
                      <span className="text-muted-foreground">0.5695° N, 34.5584° E</span>
                  </div>
                   <div className="p-4 rounded-lg bg-card border border-border flex flex-col gap-1 text-sm">
                      <span className="font-semibold">Default Zoom Level</span>
                      <span className="text-muted-foreground text-xl font-bold">11</span>
                  </div>
              </div>
              
              <Button variant="outline" className="w-full">Update Coordinates</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
