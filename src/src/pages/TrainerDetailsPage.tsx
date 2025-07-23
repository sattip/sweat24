
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trainerService } from "@/services/apiService";
import { ArrowLeft, Star, Loader2 } from "lucide-react";

const TrainerDetailsPage = () => {
  const { trainerId } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getById(trainerId);
        setTrainer(data);
      } catch (err) {
        console.error('Failed to fetch trainer:', err);
        setError('Αποτυχία φόρτωσης προπονητή');
      } finally {
        setLoading(false);
      }
    };

    if (trainerId) {
      fetchTrainer();
    }
  }, [trainerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-12 text-center">
          <h1 className="text-3xl font-bold">Προπονητής δεν βρέθηκε</h1>
          <p className="mt-4">{error || 'Ο προπονητής που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.'}</p>
          <Link to="/trainers" className="mt-6 inline-block">
            <Button>Επιστροφή στη λίστα προπονητών</Button>
          </Link>
        </main>
      </div>
    );
  }
  
  // Mock data for trainer rating - this would come from your backend in a real app
  const trainerRating = {
    average: 4.7,
    count: 38
  };
  
  // Function to render rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`full-${i}`} 
          className="w-4 h-4 fill-yellow-400 text-yellow-400" 
        />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative">
          <Star className="w-4 h-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className="w-4 h-4 text-gray-300" 
        />
      );
    }
    
    return stars;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-4xl mx-auto">
        <Link to="/trainers" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Επιστροφή στους προπονητές
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Image and basic info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 overflow-hidden">
              <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                <img 
                  src={trainer.imageUrl} 
                  alt={trainer.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{trainer.name}</h2>
                  <p className="text-muted-foreground">{trainer.title}</p>
                  
                  {/* Trainer Rating Display */}
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="flex">
                      {renderRatingStars(trainerRating.average)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {trainerRating.average.toFixed(1)}/5 ({trainerRating.count} reviews)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 py-2">
                    {trainer.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">{specialty}</Badge>
                    ))}
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Bio and services */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Σχετικά</h3>
              <div className="prose prose-sm max-w-none">
                {trainer.bio.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Πιστοποιήσεις</h3>
              <ul className="list-disc pl-5 space-y-1">
                {trainer.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Υπηρεσίες</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trainer.services.map((service, index) => (
                  <Card key={index} className="hover:border-primary transition-colors">
                    <CardContent className="p-4">
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainerDetailsPage;
