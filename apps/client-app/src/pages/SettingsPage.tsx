
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Moon, Sun, ChevronRight, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SettingsPage = () => {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    bookings: true,
    promotions: true,
    referrals: true,
  });
  
  const navigate = useNavigate();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`${newTheme === "light" ? "Light" : "Dark"} mode activated`);
    // In a real app, we would apply the theme change to the entire application
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => {
      const newSettings = { ...prev, [type]: !prev[type] };
      toast.success(`${type} notifications ${newSettings[type] ? 'enabled' : 'disabled'}`);
      return newSettings;
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast.success(`Language changed to ${value === "en" ? "English" : "Ελληνικά"}`);
    // In a real app, we would apply the language change
  };

  const navigateToPage = (page: string) => {
    navigate(page);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your app experience
          </p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="el">Ελληνικά</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                {theme === "light" ? (
                  <Sun className="h-5 w-5 mr-3 text-muted-foreground" />
                ) : (
                  <Moon className="h-5 w-5 mr-3 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Appearance</p>
                  <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Toggle 
                  variant="outline" 
                  pressed={theme === "light"} 
                  onClick={() => handleThemeChange("light")}
                  className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Sun className="h-4 w-4 mr-1" /> Light
                </Toggle>
                <Toggle 
                  variant="outline" 
                  pressed={theme === "dark"} 
                  onClick={() => handleThemeChange("dark")}
                  className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Moon className="h-4 w-4 mr-1" /> Dark
                </Toggle>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-3 text-muted-foreground" />
                <p className="font-medium">Notification Preferences</p>
              </div>
              <p className="text-sm text-muted-foreground ml-8">Manage your notification settings</p>
            </div>
            
            <Separator />
            
            <div className="p-4 flex items-center justify-between">
              <p>Booking Confirmations & Reminders</p>
              <Switch 
                checked={notifications.bookings} 
                onCheckedChange={() => handleNotificationChange("bookings")} 
              />
            </div>
            
            <Separator />
            
            <div className="p-4 flex items-center justify-between">
              <p>Promotions & Announcements</p>
              <Switch 
                checked={notifications.promotions} 
                onCheckedChange={() => handleNotificationChange("promotions")} 
              />
            </div>
            
            <Separator />
            
            <div className="p-4 flex items-center justify-between">
              <p>Referral Program Updates</p>
              <Switch 
                checked={notifications.referrals} 
                onCheckedChange={() => handleNotificationChange("referrals")} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-0">
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto font-normal text-base"
              onClick={() => toast.info("Change Password feature coming soon!")}
            >
              <span>Change Password</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <Separator />
            
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto font-normal text-base"
              onClick={() => toast.info("Privacy Policy coming soon!")}
            >
              <span>Privacy Policy</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <Separator />
            
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto font-normal text-base"
              onClick={() => toast.info("Terms of Service coming soon!")}
            >
              <span>Terms of Service</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          Version 1.0.0
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
