import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { apiRequest } from "../config/api";
import { Bell, Send, Calendar as CalendarIcon, Users, Filter, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { cn } from "../lib/utils";
import { NOTIFICATION_TYPES, NOTIFICATION_EMOJIS, NotificationType } from "@/utils/notificationTypes";

interface NotificationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SavedFilter {
  id: number;
  name: string;
  description?: string;
  recipient_count: number;
}

export function NotificationCreateModal({ isOpen, onClose, onSuccess }: NotificationCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [recipientPreview, setRecipientPreview] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    channels: ["in_app"],
    filters: {
      filter_ids: [] as number[],
      inline: {} as any,
    },
    scheduled_at: null as Date | null,
    send_now: false,
  });

  const [inlineFilters, setInlineFilters] = useState({
    package_types: [] as string[],
    membership_status: "all",
    class_attendance: {
      days: 30,
      min_classes: 0,
    },
    age_range: {
      min: 0,
      max: 100,
    },
    gender: "all",
    location: "",
    last_activity_days: 0,
    membership_duration_months: 0,
    preferred_classes: [] as string[],
    payment_status: "all",
  });

  useEffect(() => {
    if (isOpen) {
      fetchSavedFilters();
    }
  }, [isOpen]);

  const fetchSavedFilters = async () => {
    try {
      const response = await apiRequest("/api/v1/notification-filters?active=true");
      setSavedFilters(response || []);
    } catch (error) {
      console.error("Error fetching filters:", error);
      setSavedFilters([]);
    }
  };

  const handlePreviewRecipients = async () => {
    setPreviewLoading(true);
    try {
      const filters = {
        filter_ids: formData.filters.filter_ids,
        inline: buildInlineFilters(),
      };

      const response = await apiRequest("/api/v1/notifications/preview-recipients", {
        method: 'POST',
        body: JSON.stringify({ filters })
      });
      setRecipientPreview(response);
    } catch (error) {
      toast.error("Αποτυχία προεπισκόπησης παραληπτών");
    } finally {
      setPreviewLoading(false);
    }
  };

  const buildInlineFilters = () => {
    const filters: any = {};
    
    if (inlineFilters.package_types.length > 0) {
      filters.package_types = inlineFilters.package_types;
    }
    
    if (inlineFilters.membership_status && inlineFilters.membership_status !== 'all') {
      filters.membership_status = inlineFilters.membership_status;
    }
    
    if (inlineFilters.class_attendance.min_classes > 0) {
      filters.class_attendance = inlineFilters.class_attendance;
    }
    
    if (inlineFilters.age_range.min > 0 || inlineFilters.age_range.max < 100) {
      filters.age_range = inlineFilters.age_range;
    }
    
    if (inlineFilters.gender && inlineFilters.gender !== 'all') {
      filters.gender = inlineFilters.gender;
    }
    
    if (inlineFilters.location) {
      filters.location = inlineFilters.location;
    }
    
    if (inlineFilters.last_activity_days > 0) {
      filters.last_activity_days = inlineFilters.last_activity_days;
    }
    
    if (inlineFilters.membership_duration_months > 0) {
      filters.membership_duration_months = inlineFilters.membership_duration_months;
    }
    
    if (inlineFilters.preferred_classes.length > 0) {
      filters.preferred_classes = inlineFilters.preferred_classes;
    }
    
    if (inlineFilters.payment_status && inlineFilters.payment_status !== 'all') {
      filters.payment_status = inlineFilters.payment_status;
    }
    
    return filters;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Παρακαλώ συμπληρώστε τον τίτλο και το μήνυμα");
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        filters: {
          filter_ids: formData.filters.filter_ids,
          inline: buildInlineFilters(),
        },
        scheduled_at: formData.scheduled_at?.toISOString(),
      };

      await apiRequest("/api/v1/notifications", {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      toast.success(formData.send_now ? "Η ειδοποίηση στάλθηκε επιτυχώς" : "Η ειδοποίηση δημιουργήθηκε");
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Αποτυχία δημιουργίας ειδοποίησης");
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const toggleSavedFilter = (filterId: number) => {
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        filter_ids: prev.filters.filter_ids.includes(filterId)
          ? prev.filters.filter_ids.filter(id => id !== filterId)
          : [...prev.filters.filter_ids, filterId]
      }
    }));
  };

  const togglePackageType = (type: string) => {
    setInlineFilters(prev => ({
      ...prev,
      package_types: prev.package_types.includes(type)
        ? prev.package_types.filter(t => t !== type)
        : [...prev.package_types, type]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Δημιουργία Νέας Ειδοποίησης
          </DialogTitle>
          <DialogDescription>
            Δημιουργήστε και στείλτε στοχευμένες ειδοποιήσεις στους πελάτες σας
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Τίτλος Ειδοποίησης</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="π.χ. Νέο Πρόγραμμα HIIT!"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/100 χαρακτήρες
              </p>
            </div>

            <div>
              <Label htmlFor="message">Μήνυμα</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Γράψτε το μήνυμά σας εδώ..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.message.length}/500 χαρακτήρες
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Τύπος</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NOTIFICATION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {NOTIFICATION_EMOJIS[key as NotificationType]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Προτεραιότητα</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Χαμηλή</SelectItem>
                    <SelectItem value="medium">🟡 Μεσαία</SelectItem>
                    <SelectItem value="high">🔴 Υψηλή</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <Label>Κανάλια Αποστολής</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_app"
                  checked={formData.channels.includes("in_app")}
                  onCheckedChange={() => toggleChannel("in_app")}
                />
                <label htmlFor="in_app" className="text-sm cursor-pointer">
                  📱 Εφαρμογή
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={formData.channels.includes("email")}
                  onCheckedChange={() => toggleChannel("email")}
                />
                <label htmlFor="email" className="text-sm cursor-pointer">
                  📧 Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={formData.channels.includes("sms")}
                  onCheckedChange={() => toggleChannel("sms")}
                />
                <label htmlFor="sms" className="text-sm cursor-pointer">
                  📲 SMS
                </label>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Στόχευση Παραληπτών
              </Label>
              <p className="text-sm text-muted-foreground">
                Επιλέξτε φίλτρα για να στοχεύσετε συγκεκριμένες ομάδες πελατών
              </p>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div>
                <Label className="text-sm">Αποθηκευμένα Φίλτρα</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {savedFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant={formData.filters.filter_ids.includes(filter.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSavedFilter(filter.id)}
                    >
                      {filter.name} ({filter.recipient_count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Filters */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Τύπος Πακέτου</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["personal_training", "group_fitness", "yoga_pilates", "nutrition_coaching", "online_training"].map((type) => (
                    <Badge
                      key={type}
                      variant={inlineFilters.package_types.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePackageType(type)}
                    >
                      {type.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Κατάσταση Συνδρομής</Label>
                <Select 
                  value={inlineFilters.membership_status} 
                  onValueChange={(value) => setInlineFilters(prev => ({ ...prev, membership_status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Επιλέξτε κατάσταση" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Όλες</SelectItem>
                    <SelectItem value="active">Ενεργή</SelectItem>
                    <SelectItem value="expired">Ληγμένη</SelectItem>
                    <SelectItem value="trial">Δοκιμαστική</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Παρακολούθηση Μαθημάτων</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Περίοδος (ημέρες)</Label>
                    <Input
                      type="number"
                      value={inlineFilters.class_attendance.days}
                      onChange={(e) => setInlineFilters(prev => ({
                        ...prev,
                        class_attendance: { ...prev.class_attendance, days: parseInt(e.target.value) || 30 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ελάχιστα μαθήματα</Label>
                    <Input
                      type="number"
                      value={inlineFilters.class_attendance.min_classes}
                      onChange={(e) => setInlineFilters(prev => ({
                        ...prev,
                        class_attendance: { ...prev.class_attendance, min_classes: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Ηλικιακό Εύρος</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Από (έτη)</Label>
                    <Input
                      type="number"
                      value={inlineFilters.age_range.min}
                      onChange={(e) => setInlineFilters(prev => ({
                        ...prev,
                        age_range: { ...prev.age_range, min: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Έως (έτη)</Label>
                    <Input
                      type="number"
                      value={inlineFilters.age_range.max}
                      onChange={(e) => setInlineFilters(prev => ({
                        ...prev,
                        age_range: { ...prev.age_range, max: parseInt(e.target.value) || 100 }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Φύλο</Label>
                <Select 
                  value={inlineFilters.gender} 
                  onValueChange={(value) => setInlineFilters(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Επιλέξτε φύλο" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Όλα</SelectItem>
                    <SelectItem value="male">Άνδρας</SelectItem>
                    <SelectItem value="female">Γυναίκα</SelectItem>
                    <SelectItem value="other">Άλλο</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Περιοχή</Label>
                <Input
                  value={inlineFilters.location}
                  onChange={(e) => setInlineFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="π.χ. Κέντρο, Βόρεια Προάστια"
                />
              </div>

              <div>
                <Label className="text-sm">Τελευταία Δραστηριότητα (ημέρες)</Label>
                <Input
                  type="number"
                  value={inlineFilters.last_activity_days}
                  onChange={(e) => setInlineFilters(prev => ({ ...prev, last_activity_days: parseInt(e.target.value) || 0 }))}
                  placeholder="π.χ. 30 για ανενεργούς τις τελευταίες 30 ημέρες"
                />
              </div>

              <div>
                <Label className="text-sm">Διάρκεια Συνδρομής (μήνες)</Label>
                <Input
                  type="number"
                  value={inlineFilters.membership_duration_months}
                  onChange={(e) => setInlineFilters(prev => ({ ...prev, membership_duration_months: parseInt(e.target.value) || 0 }))}
                  placeholder="π.χ. 6 για μέλη πάνω από 6 μήνες"
                />
              </div>

              <div>
                <Label className="text-sm">Κατάσταση Πληρωμής</Label>
                <Select 
                  value={inlineFilters.payment_status} 
                  onValueChange={(value) => setInlineFilters(prev => ({ ...prev, payment_status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Επιλέξτε κατάσταση" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Όλες</SelectItem>
                    <SelectItem value="paid">Πληρωμένο</SelectItem>
                    <SelectItem value="pending">Εκκρεμεί</SelectItem>
                    <SelectItem value="overdue">Ληξιπρόθεσμο</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Recipients */}
            <div>
              <Button 
                variant="outline" 
                onClick={handlePreviewRecipients}
                disabled={previewLoading}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                {previewLoading ? "Φόρτωση..." : "Προεπισκόπηση Παραληπτών"}
              </Button>
              
              {recipientPreview && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    Συνολικοί Παραλήπτες: {recipientPreview.count}
                  </p>
                  {recipientPreview.sample && recipientPreview.sample.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Δείγμα παραληπτών:</p>
                      <div className="text-sm space-y-1">
                        {recipientPreview.sample.slice(0, 5).map((user: any) => (
                          <div key={user.id}>
                            {user.name} - {user.email}
                          </div>
                        ))}
                        {recipientPreview.count > 5 && (
                          <div className="text-muted-foreground">
                            ... και {recipientPreview.count - 5} ακόμη
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <Label>Χρονοπρογραμματισμός</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_now"
                  checked={formData.send_now}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    send_now: checked as boolean,
                    scheduled_at: checked ? null : prev.scheduled_at 
                  }))}
                />
                <label htmlFor="send_now" className="text-sm cursor-pointer">
                  Άμεση αποστολή
                </label>
              </div>

              {!formData.send_now && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.scheduled_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_at ? (
                        format(formData.scheduled_at, "PPP HH:mm", { locale: el })
                      ) : (
                        <span>Επιλέξτε ημερομηνία</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_at || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_at: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Ακύρωση
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              "Αποστολή..."
            ) : (
              <>
                {formData.send_now ? <Send className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {formData.send_now ? "Αποστολή Τώρα" : "Δημιουργία"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}