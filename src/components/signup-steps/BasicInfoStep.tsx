import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { SignupData } from "../SignupSteps";

interface BasicInfoStepProps {
  data: SignupData;
  updateData: (updates: Partial<SignupData>) => void;
  onNext: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const handleNext = () => {
    // Validation
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.confirmPassword) {
      toast.error("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Οι κωδικοί πρόσβασης δεν ταιριάζουν");
      return;
    }

    if (data.password.length < 6) {
      toast.error("Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Όνομα *</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Το όνομά σας"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Επώνυμο *</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Το επώνυμό σας"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="το@email.σας"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Τηλέφωνο</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="6901234567"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Ημερομηνία Γέννησης</Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => updateData({ birthDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Φύλο</Label>
          <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε φύλο" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Άνδρας</SelectItem>
              <SelectItem value="female">Γυναίκα</SelectItem>
              <SelectItem value="other">Άλλο</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Κωδικός Πρόσβασης *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => updateData({ confirmPassword: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}; 