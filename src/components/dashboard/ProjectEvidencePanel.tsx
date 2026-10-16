import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProjectEvidence, uploadProjectEvidence, removeProjectEvidence } from "@/data/projectEvidence";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function ProjectEvidencePanel({ projectId }: { projectId: string }) {
  const { role } = useAdminAuth();
  const canEdit = role === 'admin' || role === 'staff';
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const queryKey = ['project-evidence', projectId];
  const evidence = useQuery({ queryKey, queryFn: () => fetchProjectEvidence(projectId), refetchInterval: 240000 });
  const upload = useMutation({ mutationFn: async () => {
    if (!file) throw new Error('Choose a file.');
    await uploadProjectEvidence(projectId, file, caption);
  }, onSuccess: () => { setFile(null); setCaption(''); if (input.current) input.current.value = ''; queryClient.invalidateQueries({ queryKey }); } });
  const remove = useMutation({ mutationFn: removeProjectEvidence, onSuccess: () => queryClient.invalidateQueries({ queryKey }) });
  return <section className="space-y-4">
    <h3 className="font-semibold">Photographs & evidence</h3>
    {canEdit && <form className="space-y-3 border-b border-border pb-4" onSubmit={e => { e.preventDefault(); upload.mutate(); }}>
      <label className="block text-sm" htmlFor="evidence-file">Photograph or PDF (up to 20 MB)</label>
      <Input ref={input} id="evidence-file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <Input aria-label="Evidence caption" placeholder="Caption" maxLength={1000} value={caption} onChange={e => setCaption(e.target.value)} />
      <Button type="submit" disabled={!file || upload.isPending}><Upload className="mr-2 h-4 w-4" />{upload.isPending ? 'Uploading…' : 'Upload evidence'}</Button>
    </form>}
    {(upload.error || remove.error || evidence.error) && <p role="alert" className="text-sm text-destructive">{(upload.error || remove.error || evidence.error)?.message}</p>}
    {evidence.isLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading evidence" /> : evidence.data?.length === 0 ? <p className="text-sm text-muted-foreground">No photographs or evidence recorded.</p> : null}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {evidence.data?.map(item => <article key={item.id} className="border border-border rounded-lg overflow-hidden min-w-0">
        {item.url && item.mime_type.startsWith('image/') && <a href={item.url} target="_blank" rel="noreferrer"><img src={item.url} alt={item.caption || item.file_name} className="w-full h-48 object-contain bg-muted" /></a>}
        <div className="p-3 space-y-2"><p className="text-sm font-medium break-words">{item.file_name}</p>
          {item.caption && <p className="text-sm text-muted-foreground break-words">{item.caption}</p>}
          <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('en-KE')} · {(item.file_size / 1024).toFixed(0)} KB</p>
          <div className="flex gap-2 items-center">
            {item.url ? <Button asChild variant="outline" size="sm"><a href={item.url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open evidence</a></Button> : <span className="text-sm text-destructive">File unavailable</span>}
            {canEdit && <Button variant="ghost" size="icon" title="Remove evidence" aria-label={`Remove ${item.file_name}`} disabled={remove.isPending} onClick={() => { if (window.confirm(`Remove ${item.file_name}?`)) remove.mutate(item); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}