import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { newMemberInfoService } from "@/services/apiService";
import Header from "@/components/Header";
import {
  Info,
  ListChecks,
  Star,
  Calendar,
  Dumbbell,
  HelpCircle,
  Sparkles
} from "lucide-react";

interface NewMemberInfo {
  id: number;
  category: string;
  title: string;
  content: string;
  display_order: number;
  is_active: boolean;
  icon?: string;
}

const CATEGORY_CONFIG = {
  general: {
    label: "Γενικές Πληροφορίες",
    icon: Info,
    color: "bg-blue-500",
  },
  rules: {
    label: "Κανόνες",
    icon: ListChecks,
    color: "bg-red-500",
  },
  benefits: {
    label: "Οφέλη",
    icon: Star,
    color: "bg-yellow-500",
  },
  schedule: {
    label: "Πρόγραμμα",
    icon: Calendar,
    color: "bg-green-500",
  },
  equipment: {
    label: "Εξοπλισμός",
    icon: Dumbbell,
    color: "bg-purple-500",
  },
  faq: {
    label: "Συχνές Ερωτήσεις",
    icon: HelpCircle,
    color: "bg-orange-500",
  },
};

const NewMemberInfoPage: React.FC = () => {
  const [infoItems, setInfoItems] = useState<NewMemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchInfo = async () => {
      setIsLoading(true);
      try {
        const data = await newMemberInfoService.getAll(true); // Only active items
        setInfoItems(data);
      } catch (error) {
        console.error("Error fetching new member info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, []);

  // Group items by category
  const groupedItems = infoItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NewMemberInfo[]>);

  // Sort items within each category by display_order
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => a.display_order - b.display_order);
  });

  const renderCategoryIcon = (category: string) => {
    const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
    if (!config) return null;

    const IconComponent = config.icon;
    return (
      <div className={`${config.color} p-2 rounded-lg text-white`}>
        <IconComponent className="h-5 w-5" />
      </div>
    );
  };

  const renderInfoCard = (item: NewMemberInfo) => (
    <Card key={item.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start gap-3">
          {renderCategoryIcon(item.category)}
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </CardContent>
    </Card>
  );

  const renderAllContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (infoItems.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Δεν υπάρχουν διαθέσιμες πληροφορίες αυτή τη στιγμή.</p>
          </CardContent>
        </Card>
      );
    }

    // Group items by category and render each category
    return (
      <div className="space-y-8">
        {Object.keys(CATEGORY_CONFIG).map((category) => {
          const items = groupedItems[category] || [];
          if (items.length === 0) return null;

          const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
          const IconComponent = config.icon;

          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`${config.color} p-2 rounded-lg text-white`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold">{config.label}</h2>
                <Badge variant="secondary" className="ml-2">
                  {items.length}
                </Badge>
              </div>
              <div className="space-y-4">
                {items.map(renderInfoCard)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategoryContent = (category: string) => {
    const items = groupedItems[category] || [];

    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Δεν υπάρχουν διαθέσιμες πληροφορίες για αυτή την κατηγορία.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {items.map(renderInfoCard)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Καλώς Ήρθατε στο Sweat93!</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Όλες οι πληροφορίες που χρειάζεστε για να ξεκινήσετε το ταξίδι σας μαζί μας
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-8 h-auto gap-2 bg-transparent p-0">
          {/* All tab */}
          <TabsTrigger
            value="all"
            className="flex flex-col items-center gap-2 py-4 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted hover:bg-muted/80 rounded-lg border-2 border-transparent data-[state=active]:border-primary transition-all"
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-xs font-medium">Όλα</span>
            <Badge variant="secondary" className="bg-white/20">
              {infoItems.length}
            </Badge>
          </TabsTrigger>

          {/* Category tabs */}
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const IconComponent = config.icon;
            const itemCount = groupedItems[key]?.length || 0;

            return (
              <TabsTrigger
                key={key}
                value={key}
                className="flex flex-col items-center gap-2 py-4 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted hover:bg-muted/80 rounded-lg border-2 border-transparent data-[state=active]:border-primary transition-all"
              >
                <div className={`${config.color} p-2 rounded-lg text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{config.label}</span>
                {itemCount > 0 && (
                  <Badge variant="secondary" className="bg-white/20">
                    {itemCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* All content */}
        <TabsContent value="all">
          {renderAllContent()}
        </TabsContent>

        {/* Individual category contents */}
        {Object.keys(CATEGORY_CONFIG).map((category) => (
          <TabsContent key={category} value={category}>
            {renderCategoryContent(category)}
          </TabsContent>
        ))}
        </Tabs>
      </main>
    </div>
  );
};

export default NewMemberInfoPage;
