import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Files, UploadCloud, FileType, CheckCircle2, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DocumentsMedia() {
  const fileTypes = [
    { type: "PDF Documents", allowed: true, ext: ".pdf", size: "15MB max" },
    { type: "Images", allowed: true, ext: ".jpg, .png", size: "5MB max" },
    { type: "Spreadsheets", allowed: true, ext: ".xlsx, .csv", size: "10MB max" },
    { type: "Archives", allowed: false, ext: ".zip, .rar", size: "N/A" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents & Media</h2>
          <p className="text-muted-foreground text-sm">Configure evidence uploads, file types, and global storage policies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Storage Usage */}
         <Card className="border-border shadow-sm col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle>Storage Utilization</CardTitle>
                  <CardDescription>Global object storage for system media files.</CardDescription>
                </div>
                <Files className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-foreground">420.5 GB Used</span>
                        <span className="text-muted-foreground text-xs font-bold pt-1">500.0 GB Total</span>
                    </div>
                    <Progress value={84} className="h-3" indicatorColor="bg-primary" />
                    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1 mt-2">
                        <ShieldAlert className="w-3.5 h-3.5" /> Approaching storage quota limits. Consider upgrading or archiving old data.
                    </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                   <h5 className="text-xs font-black uppercase text-muted-foreground mb-3 border-b border-border pb-2">Global Upload Policy Requirements</h5>
                   <ul className="text-xs space-y-2 text-foreground font-medium">
                       <li className="flex items-start gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Requirements for "Ongoing" status change: Minimum 1 site photo required.
                       </li>
                       <li className="flex items-start gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Requirements for "Completed" status: Handover report (PDF) and 3+ exit photos required.
                       </li>
                       <li className="flex items-start gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Photo geotagging enforced: Yes (Embedded Exif verification active).
                       </li>
                   </ul>
                </div>
            </CardContent>
         </Card>

         {/* File Constraints */}
         <Card className="border-border shadow-sm">
             <CardHeader>
                <CardTitle>Allowed Formats</CardTitle>
                <CardDescription>System-wide upload restrictions</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-3">
                     {fileTypes.map((ft) => (
                         <div key={ft.type} className="flex items-center justify-between p-2 pb-3 border-b border-border last:border-0">
                             <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${ft.allowed ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <FileType className="w-4 h-4" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm leading-none">{ft.type}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1 font-mono tracking-tighter">{ft.ext} | {ft.size}</span>
                                </div>
                             </div>
                             <div className="flex items-center h-full"> {/* Switch placeholder */}
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${ft.allowed ? 'bg-primary' : 'bg-input'}`}>
                                   <div className={`w-3 h-3 bg-background rounded-full transition-transform transform ${ft.allowed ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                             </div>
                         </div>
                     ))}
                 </div>

                 <Button className="w-full mt-6 bg-card text-foreground border border-border hover:bg-muted shadow-sm" variant="outline">
                    <UploadCloud className="w-4 h-4 mr-2" /> Global Watermark Config
                 </Button>
             </CardContent>
         </Card>
      </div>
    </div>
  );
}
