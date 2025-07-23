import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { useToast } from "../hooks/use-toast";
import { apiService } from "../services/apiService";
import { Filter, Plus, Edit, Trash2, Users, Eye } from "lucide-react";

interface NotificationFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedFilter {
  id: number;
  name: string;
  description?: string;
  criteria: any;
  is_active: boolean;
  recipient_count?: number;
}

export function NotificationFiltersModal({ isOpen, onClose }: NotificationFiltersModalProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    criteria: {
      package_types: [] as string[],
      membership_status: "",
      class_attendance: null as any,
    },
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchFilters();
    }
  }, [isOpen]);

  const fetchFilters = async () => {
    try {
      const response = await apiService.get("/notification-filters");
      setFilters(response.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης φίλτρων",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFilter = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε όνομα φίλτρου",
        variant: "destructive",
      });
      return;
    }

    try {
      const criteria = { ...formData.criteria };
      // Remove empty criteria
      if (criteria.package_types.length === 0) delete criteria.package_types;
      if (!criteria.membership_status) delete criteria.membership_status;
      if (!criteria.class_attendance) delete criteria.class_attendance;

      const data = {
        ...formData,
        criteria,
      };

      if (editingFilter) {
        await apiService.put(`/notification-filters/${editingFilter.id}`, data);
        toast({
          title: "Επιτυχία",
          description: "Το φίλτρο ενημερώθηκε",
        });
      } else {
        await apiService.post("/notification-filters", data);
        toast({
          title: "Επιτυχία",
          description: "Το φίλτρο δημιουργήθηκε",
        });
      }

      resetForm();
      fetchFilters();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποθήκευσης φίλτρου",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFilter = async (id: number) => {
    if (!window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το φίλτρο;")) {
      return;
    }

    try {
      await apiService.delete(`/notification-filters/${id}`);
      toast({
        title: "Επιτυχία",
        description: "Το φίλτρο διαγράφηκε",
      });
      fetchFilters();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής φίλτρου",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (filter: SavedFilter) => {
    try {
      await apiService.put(`/notification-filters/${filter.id}`, {
        is_active: !filter.is_active,
      });
      fetchFilters();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενημέρωσης κατάστασης",
        variant: "destructive",
      });
    }
  };

  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setFormData({
      name: filter.name,
      description: filter.description || "",
      criteria: filter.criteria,
      is_active: filter.is_active,
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      criteria: {
        package_types: [],
        membership_status: "",
        class_attendance: null,
      },
      is_active: true,
    });
    setEditingFilter(null);
    setShowCreateForm(false);
  };

  const getCriteriaDescription = (criteria: any) => {
    const parts = [];
    
    if (criteria.package_types?.length > 0) {
      parts.push(`Πακέτα: ${criteria.package_types.join(", ")}`);
    }
    
    if (criteria.membership_status) {
      const statusMap: any = {
        active: "Ενεργή συνδρομή",
        expired: "Ληγμένη συνδρομή",
        trial: "Δοκιμαστική περίοδος",
      };
      parts.push(statusMap[criteria.membership_status] || criteria.membership_status);
    }
    
    if (criteria.class_attendance) {
      parts.push(
        `Μαθήματα: ≥${criteria.class_attendance.min_classes} τις τελευταίες ${criteria.class_attendance.days} ημέρες`
      );
    }
    
    return parts.length > 0 ? parts.join(" • ") : "Χωρίς κριτήρια";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Διαχείριση Φίλτρων Ειδοποιήσεων
          </DialogTitle>
          <DialogDescription>
            Δημιουργήστε και διαχειριστείτε φίλτρα για στοχευμένες ειδοποιήσεις
          </DialogDescription>
        </DialogHeader>

        {!showCreateForm ? (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Νέο Φίλτρο
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Όνομα</TableHead>
                  <TableHead>Κριτήρια</TableHead>
                  <TableHead className="text-center">Παραλήπτες</TableHead>
                  <TableHead className="text-center">Κατάσταση</TableHead>
                  <TableHead className="text-right">Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Φόρτωση...
                    </TableCell>
                  </TableRow>
                ) : filters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Δεν υπάρχουν αποθηκευμένα φίλτρα
                    </TableCell>
                  </TableRow>
                ) : (
                  filters.map((filter) => (
                    <TableRow key={filter.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{filter.name}</div>
                          {filter.description && (
                            <div className="text-sm text-muted-foreground">{filter.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{getCriteriaDescription(filter.criteria)}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {filter.recipient_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={filter.is_active}
                          onCheckedChange={() => handleToggleActive(filter)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFilter(filter)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFilter(filter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Όνομα Φίλτρου</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="π.χ. Ενεργοί πελάτες με personal training"
              />
            </div>

            <div>
              <Label htmlFor="description">Περιγραφή (προαιρετικό)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Περιγράψτε το σκοπό αυτού του φίλτρου..."
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Κριτήρια Φίλτρου</Label>
              
              <div>
                <Label className="text-sm">Τύποι Πακέτων</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["personal_training", "group_fitness", "yoga_pilates", "nutrition_coaching", "online_training"].map((type) => (
                    <Badge
                      key={type}
                      variant={formData.criteria.package_types?.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const types = formData.criteria.package_types || [];
                        setFormData(prev => ({
                          ...prev,
                          criteria: {
                            ...prev.criteria,
                            package_types: types.includes(type)
                              ? types.filter(t => t !== type)
                              : [...types, type]
                          }
                        }));
                      }}
                    >
                      {type.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm">Κατάσταση Συνδρομής</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "", label: "Όλες" },
                    { value: "active", label: "Ενεργή" },
                    { value: "expired", label: "Ληγμένη" },
                    { value: "trial", label: "Δοκιμαστική" },
                  ].map((status) => (
                    <Badge
                      key={status.value}
                      variant={formData.criteria.membership_status === status.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, membership_status: status.value }
                      }))}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={!!formData.criteria.class_attendance}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      criteria: {
                        ...prev.criteria,
                        class_attendance: checked ? { days: 30, min_classes: 5 } : null
                      }
                    }));
                  }}
                />
                <Label className="text-sm cursor-pointer">
                  Φιλτράρισμα βάσει παρακολούθησης μαθημάτων
                </Label>
              </div>

              {formData.criteria.class_attendance && (
                <div className="grid grid-cols-2 gap-2 ml-6">
                  <div>
                    <Label className="text-xs">Περίοδος (ημέρες)</Label>
                    <Input
                      type="number"
                      value={formData.criteria.class_attendance.days}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          class_attendance: {
                            ...prev.criteria.class_attendance,
                            days: parseInt(e.target.value) || 30
                          }
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ελάχιστα μαθήματα</Label>
                    <Input
                      type="number"
                      value={formData.criteria.class_attendance.min_classes}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        criteria: {
                          ...prev.criteria,
                          class_attendance: {
                            ...prev.criteria.class_attendance,
                            min_classes: parseInt(e.target.value) || 0
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Ακύρωση
              </Button>
              <Button onClick={handleSaveFilter}>
                {editingFilter ? "Ενημέρωση" : "Αποθήκευση"} Φίλτρου
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}