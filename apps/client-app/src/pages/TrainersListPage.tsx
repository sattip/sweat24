
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trainers } from "@/data/trainers";

const TrainersListPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Meet Our Team</h1>
          <p className="text-muted-foreground mt-2">
            Our certified trainers are here to help you reach your fitness goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Link 
              to={`/trainers/${trainer.id}`} 
              key={trainer.id}
              className="transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full overflow-hidden hover:border-primary transition-colors">
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img 
                    src={trainer.imageUrl} 
                    alt={trainer.name} 
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={trainer.imageUrl} alt={trainer.name} />
                      <AvatarFallback>
                        {trainer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-sm text-muted-foreground">{trainer.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TrainersListPage;
