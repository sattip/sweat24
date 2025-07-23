import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Bell, Send, Users } from "lucide-react";
import { NOTIFICATION_TYPES, NOTIFICATION_EMOJIS, NotificationType } from "@/utils/notificationTypes";

interface NotificationCreateSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NotificationCreateSimple({ isOpen, onClose, onSuccess }: NotificationCreateSimpleProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    channels: ["in_app"],
  });

  const [filters, setFilters] = useState({
    package_types: [] as string[],
    membership_status: "all",
    gender: "all",
    area: "all",
    age_min: 0,
    age_max: 100,
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Παρακαλώ συμπληρώστε τον τίτλο και το μήνυμα");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Η ειδοποίηση στάλθηκε επιτυχώς!");
      
      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "info",
        priority: "medium",
        channels: ["in_app"],
      });
      
      setFilters({
        package_types: [],
        membership_status: "all",
        gender: "all",
        area: "all",
        age_min: 0,
        age_max: 100,
      });
      
      setLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const togglePackageType = (type: string) => {
    setFilters(prev => ({
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
                    <SelectItem value="urgent">🚨 Επείγουσα</SelectItem>
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

          {/* Target Audience Filters */}
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

            {/* Package Types */}
            <div>
              <Label className="text-sm">Τύπος Πακέτου</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["personal_training", "group_fitness", "yoga_pilates", "nutrition_coaching", "online_training"].map((type) => (
                  <Badge
                    key={type}
                    variant={filters.package_types.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePackageType(type)}
                  >
                    {type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Membership Status */}
            <div>
              <Label className="text-sm">Κατάσταση Συνδρομής</Label>
              <Select 
                value={filters.membership_status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, membership_status: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Όλες οι καταστάσεις" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες</SelectItem>
                  <SelectItem value="active">Ενεργή</SelectItem>
                  <SelectItem value="expired">Ληγμένη</SelectItem>
                  <SelectItem value="pending">Εκκρεμής</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div>
              <Label className="text-sm">Φύλο</Label>
              <Select 
                value={filters.gender} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Όλα τα φύλα" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλα</SelectItem>
                  <SelectItem value="male">Άνδρας</SelectItem>
                  <SelectItem value="female">Γυναίκα</SelectItem>
                  <SelectItem value="other">Άλλο</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Area */}
            <div>
              <Label className="text-sm">Περιοχή</Label>
              <Select 
                value={filters.area} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, area: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Όλες οι περιοχές" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Όλες</SelectItem>
                  <SelectItem value="center">Κέντρο</SelectItem>
                  <SelectItem value="north">Βόρεια Προάστια</SelectItem>
                  <SelectItem value="south">Νότια Προάστια</SelectItem>
                  <SelectItem value="east">Ανατολικά Προάστια</SelectItem>
                  <SelectItem value="west">Δυτικά Προάστια</SelectItem>
                  <SelectItem value="piraeus">Πειραιάς</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Range */}
            <div>
              <Label className="text-sm">Ηλικιακό Εύρος</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Από (έτη)</Label>
                  <Input
                    type="number"
                    value={filters.age_min}
                    onChange={(e) => setFilters(prev => ({ ...prev, age_min: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label className="text-xs">Έως (έτη)</Label>
                  <Input
                    type="number"
                    value={filters.age_max}
                    onChange={(e) => setFilters(prev => ({ ...prev, age_max: parseInt(e.target.value) || 100 }))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Ακύρωση
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>Αποστολή...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Αποστολή Ειδοποίησης
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}