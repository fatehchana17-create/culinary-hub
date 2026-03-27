import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { 
  useListEvents, 
  useCreateEvent, 
  useUpdateEvent,
  useDeleteEvent,
  Event,
  getListEventsQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function EventsAdmin() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: events, isLoading } = useListEvents();
  const { mutate: createEvent } = useCreateEvent({ onSuccess: () => invalidate() });
  const { mutate: updateEvent } = useUpdateEvent({ onSuccess: () => invalidate() });
  const { mutate: deleteEvent } = useDeleteEvent({ onSuccess: () => invalidate() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
    setIsEditing(null);
    setIsCreating(false);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">Events & Discounts</h1>
          <p className="text-muted-foreground">Manage global store discounts.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-5 h-5" /> Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="text-muted-foreground animate-pulse col-span-full">Loading...</div>
        ) : events?.map(event => (
          <Card key={event.id} className={`p-6 flex flex-col ${event.isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border/50 opacity-70'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-muted p-3 rounded-2xl">
                <CalendarRange className={`w-6 h-6 ${event.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <Badge variant={event.isActive ? "default" : "secondary"}>
                {event.isActive ? "Active Now" : "Inactive"}
              </Badge>
            </div>
            <h3 className="font-display text-2xl font-bold mb-1">{event.name}</h3>
            <p className="text-3xl font-bold text-primary mb-4">{event.discountPercentage}% OFF</p>
            
            <div className="mt-auto space-y-2 mb-6">
              <div className="text-sm bg-background/50 border border-border/50 p-2 rounded-lg text-muted-foreground">
                <span className="font-semibold text-foreground">Start:</span> {format(new Date(event.startDate), 'PPpp')}
              </div>
              <div className="text-sm bg-background/50 border border-border/50 p-2 rounded-lg text-muted-foreground">
                <span className="font-semibold text-foreground">End:</span> {format(new Date(event.endDate), 'PPpp')}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(event)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => {
                if(confirm('Delete this event?')) deleteEvent({ id: event.id });
              }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95">
            <h2 className="font-display text-2xl mb-6">{isEditing ? "Edit Event" : "New Event"}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const payload = {
                name: fd.get('name') as string,
                discountPercentage: parseFloat(fd.get('discount') as string),
                startDate: new Date(fd.get('start') as string).toISOString(),
                endDate: new Date(fd.get('end') as string).toISOString(),
                isActive: fd.get('isActive') === 'on'
              };
              if (isEditing) updateEvent({ id: isEditing.id, data: payload });
              else createEvent({ data: payload });
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Event Name</label>
                <Input name="name" defaultValue={isEditing?.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Discount %</label>
                <Input type="number" step="1" max="100" min="0" name="discount" defaultValue={isEditing?.discountPercentage} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Start Date & Time</label>
                  <Input type="datetime-local" name="start" defaultValue={isEditing ? new Date(isEditing.startDate).toISOString().slice(0, 16) : ""} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">End Date & Time</label>
                  <Input type="datetime-local" name="end" defaultValue={isEditing ? new Date(isEditing.endDate).toISOString().slice(0, 16) : ""} required />
                </div>
              </div>
              <div className="space-y-2 flex items-center pt-4">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={isEditing ? isEditing.isActive : false} className="w-5 h-5 rounded border-border text-primary focus:ring-primary" />
                  Set Active Manually (Overrides Dates)
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border/50">
                <Button type="button" variant="ghost" onClick={() => { setIsEditing(null); setIsCreating(false); }}>Cancel</Button>
                <Button type="submit">Save Event</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
