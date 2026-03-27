import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { 
  useListAds, 
  useCreateAd, 
  useUpdateAd,
  useDeleteAd,
  Ad,
  getListAdsQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AdsAdmin() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<Ad | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: ads, isLoading } = useListAds();
  const { mutate: createAd } = useCreateAd({ onSuccess: () => invalidate() });
  const { mutate: updateAd } = useUpdateAd({ onSuccess: () => invalidate() });
  const { mutate: deleteAd } = useDeleteAd({ onSuccess: () => invalidate() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListAdsQueryKey() });
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Hero Ads</h1>
          <p className="text-muted-foreground">Manage the public facing carousel banners.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-5 h-5" /> Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="text-muted-foreground animate-pulse col-span-full">Loading...</div>
        ) : ads?.map(ad => (
          <Card key={ad.id} className="overflow-hidden group flex flex-col">
            <div className="relative h-48">
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute top-4 right-4">
                <Badge variant={ad.isActive ? "success" : "secondary"} className="shadow-lg backdrop-blur-md">
                  {ad.isActive ? "Live" : "Hidden"}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-display text-2xl font-bold shadow-black drop-shadow-md">{ad.title}</h3>
                {ad.subText && <p className="text-sm opacity-90 drop-shadow">{ad.subText}</p>}
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col bg-card">
              {ad.link && (
                <div className="flex items-center gap-2 text-sm text-primary mb-4 bg-primary/10 p-2 rounded-lg">
                  <LinkIcon className="w-4 h-4" /> 
                  <span className="truncate">{ad.link}</span>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-border/50">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(ad)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => {
                  if(confirm('Delete this ad?')) deleteAd({ id: ad.id });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <h2 className="font-display text-2xl mb-6">{isEditing ? "Edit Ad" : "New Ad Banner"}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const payload = {
                title: fd.get('title') as string,
                imageUrl: fd.get('imageUrl') as string,
                subText: (fd.get('subText') as string) || null,
                link: (fd.get('link') as string) || null,
                isActive: fd.get('isActive') === 'on'
              };
              if (isEditing) updateAd({ id: isEditing.id, data: payload });
              else createAd({ data: payload });
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Title</label>
                <Input name="title" defaultValue={isEditing?.title} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Image URL</label>
                <Input name="imageUrl" defaultValue={isEditing?.imageUrl} required placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Subtext (Optional)</label>
                <Input name="subText" defaultValue={isEditing?.subText || ""} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">CTA Link (Optional)</label>
                <Input name="link" defaultValue={isEditing?.link || ""} placeholder="https://..." />
              </div>
              <div className="space-y-2 flex items-center pt-4">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={isEditing ? isEditing.isActive : true} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                  Live on Website
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border/50">
                <Button type="button" variant="ghost" onClick={() => { setIsEditing(null); setIsCreating(false); }}>Cancel</Button>
                <Button type="submit">Save Ad</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
