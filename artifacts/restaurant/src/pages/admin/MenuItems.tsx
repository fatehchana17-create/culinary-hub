import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { 
  useListMenuItems, 
  useCreateMenuItem, 
  useUpdateMenuItem,
  useDeleteMenuItem,
  MenuItem,
  getListMenuItemsQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function MenuItemsAdmin() {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [isEditing, setIsEditing] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data, isLoading } = useListMenuItems({ page, limit: 100 });
  const { mutate: createItem } = useCreateMenuItem({ onSuccess: () => invalidate() });
  const { mutate: updateItem } = useUpdateMenuItem({ onSuccess: () => invalidate() });
  const { mutate: deleteItem } = useDeleteMenuItem({ onSuccess: () => invalidate() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Menu Items</h1>
          <p className="text-muted-foreground">Manage your restaurant's offerings.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-5 h-5" /> Add Item
        </Button>
      </div>

      <Card className="overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Prep Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : data?.items.map(item => (
                <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <img src={item.imageUrl || `${import.meta.env.BASE_URL}images/food-placeholder.png`} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                  </td>
                  <td className="px-6 py-4 font-semibold text-base">{item.name}</td>
                  <td className="px-6 py-4"><Badge variant="outline">{item.category}</Badge></td>
                  <td className="px-6 py-4 font-medium">${item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{item.prepTimeLimit} mins</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.isAvailable ? "success" : "destructive"}>
                      {item.isAvailable ? "Available" : "Sold Out"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(item)}>
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if(confirm('Are you sure you want to delete this item?')) deleteItem({ id: item.id });
                      }}>
                        <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Very Simple Modal inline for Create/Edit */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <h2 className="font-display text-2xl mb-6">{isEditing ? "Edit Item" : "New Item"}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const payload = {
                name: fd.get('name') as string,
                category: fd.get('category') as string,
                price: parseFloat(fd.get('price') as string),
                imageUrl: (fd.get('imageUrl') as string) || null,
                prepTimeLimit: parseInt(fd.get('prepTimeLimit') as string),
                isAvailable: fd.get('isAvailable') === 'on'
              };
              if (isEditing) updateItem({ id: isEditing.id, data: payload });
              else createItem({ data: payload });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold">Name</label>
                  <Input name="name" defaultValue={isEditing?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category</label>
                  <Input name="category" defaultValue={isEditing?.category} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Price ($)</label>
                  <Input type="number" step="0.01" name="price" defaultValue={isEditing?.price} required />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-semibold">Image URL</label>
                  <Input name="imageUrl" defaultValue={isEditing?.imageUrl || ""} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Prep Time (mins)</label>
                  <Input type="number" name="prepTimeLimit" defaultValue={isEditing?.prepTimeLimit || 15} required />
                </div>
                <div className="space-y-2 flex items-center pt-8">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" name="isAvailable" defaultChecked={isEditing ? isEditing.isAvailable : true} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                    Available for Order
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border/50">
                <Button type="button" variant="ghost" onClick={() => { setIsEditing(null); setIsCreating(false); }}>Cancel</Button>
                <Button type="submit">Save Item</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
