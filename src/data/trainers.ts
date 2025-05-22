
export interface Service {
  name: string;
  description: string;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  services: Service[];
}

export const trainers: Trainer[] = [
  {
    id: "alex-rodriguez",
    name: "Alex Rodriguez",
    title: "Head Personal Trainer",
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    bio: "Alex has been with Sweat24 since our founding and brings over 15 years of fitness expertise to our team. With a background in competitive athletics and strength training, he specializes in helping clients transform their physique while building sustainable fitness habits.\n\nAlex's training philosophy centers on progressive overload with perfect form, ensuring clients build strength safely while avoiding plateaus. His sessions are known for their intensity, but also for his encouraging approach that keeps clients motivated through challenging workouts.",
    specialties: ["Strength Training", "Weight Loss", "Sports Performance"],
    certifications: [
      "National Academy of Sports Medicine (NASM) Certified Personal Trainer",
      "Certified Strength and Conditioning Specialist (CSCS)",
      "TRX Suspension Training Certified",
      "Precision Nutrition Level 2 Coach"
    ],
    services: [
      {
        name: "1-on-1 Personal Training",
        description: "Customized training sessions tailored to your specific goals and fitness level."
      },
      {
        name: "Nutrition Coaching",
        description: "Detailed meal plans and nutrition guidance to complement your training."
      },
      {
        name: "Body Transformation Program",
        description: "12-week intensive program designed to create significant physical changes."
      }
    ]
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    title: "Group Fitness Director",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    bio: "Sarah's energetic and motivational coaching style has made her one of our most requested trainers. With a background in dance and gymnastics, she brings a dynamic approach to fitness focused on functional movement patterns and core strength.\n\nAs our Group Fitness Director, Sarah designs many of our signature class formats and trains our instructors. Her holistic approach considers not just physical fitness, but stress management and wellness practices that create sustainable results.",
    specialties: ["HIIT Training", "Core Conditioning", "Mobility Work"],
    certifications: [
      "ACE Certified Group Fitness Instructor",
      "Yoga Alliance 200-Hour Certification",
      "Les Mills BODYPUMP Instructor",
      "AFAA Primary Group Exercise Certification"
    ],
    services: [
      {
        name: "Small Group HIIT",
        description: "High-intensity interval training in a motivating small group setting (3-6 people)."
      },
      {
        name: "Core & Mobility Sessions",
        description: "Focused sessions to improve posture, reduce pain, and enhance athletic performance."
      },
      {
        name: "Fitness Assessment",
        description: "Comprehensive analysis of your current fitness level with customized recommendations."
      }
    ]
  },
  {
    id: "marcus-williams",
    name: "Marcus Williams",
    title: "CrossFit Coach & Nutrition Specialist",
    imageUrl: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
    bio: "Marcus combines his expertise in functional fitness with an evidence-based approach to nutrition. As a former collegiate athlete, he understands the demands of high-level training and how to balance intensity with proper recovery.\n\nSpecializing in CrossFit methodology and Olympic lifting, Marcus helps clients build impressive strength and conditioning while prioritizing proper technique. His nutrition protocols have helped dozens of members achieve significant body composition changes.",
    specialties: ["CrossFit", "Olympic Weightlifting", "Sports Nutrition"],
    certifications: [
      "CrossFit Level 2 Trainer",
      "USA Weightlifting Sports Performance Coach",
      "Precision Nutrition Level 2 Certification",
      "CrossFit Gymnastics Certification"
    ],
    services: [
      {
        name: "Olympic Lifting Technique",
        description: "Mastering clean, jerk, and snatch movements with proper progression."
      },
      {
        name: "CrossFit Performance",
        description: "Personalized CrossFit programming to improve your competitive performance."
      },
      {
        name: "Nutrition for Athletes",
        description: "Targeted nutrition strategies for performance, recovery, and body composition."
      }
    ]
  },
  {
    id: "emily-chen",
    name: "Emily Chen",
    title: "Yoga & Mindfulness Coach",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    bio: "Emily brings a calming presence to Sweat24 with her expertise in yoga, mobility, and mindfulness practices. After spending five years studying various yoga disciplines throughout Asia, she developed an approach that blends traditional practices with modern movement science.\n\nEmily specializes in helping clients recover from injuries, improve flexibility, and develop mind-body awareness. Her sessions focus not just on the physical aspects of fitness but incorporate breathing techniques and mindfulness to reduce stress and improve overall wellbeing.",
    specialties: ["Yoga", "Recovery", "Stress Management"],
    certifications: [
      "500-Hour Registered Yoga Teacher (RYT-500)",
      "Functional Range Conditioning Mobility Specialist",
      "Mindfulness-Based Stress Reduction Certified Teacher",
      "Thai Massage Practitioner"
    ],
    services: [
      {
        name: "Private Yoga Sessions",
        description: "Personalized yoga practice designed for your body and goals."
      },
      {
        name: "Mobility & Recovery",
        description: "Specialized techniques to improve range of motion and accelerate recovery."
      },
      {
        name: "Stress Management",
        description: "Learn practical mindfulness techniques to reduce stress and improve focus."
      }
    ]
  },
  {
    id: "james-taylor",
    name: "James Taylor",
    title: "Senior Strength Coach",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    bio: "James has spent over a decade refining his approach to strength and hypertrophy training. With a background in powerlifting and bodybuilding, he brings technical expertise to help clients build impressive strength and muscle mass.\n\nKnown for his methodical approach to programming, James creates highly structured training plans that deliver consistent progress. He specializes in helping clients break through plateaus with advanced techniques while maintaining strict attention to proper form and injury prevention.",
    specialties: ["Strength Training", "Muscle Building", "Powerlifting"],
    certifications: [
      "National Strength and Conditioning Association (NSCA) Certified Strength Coach",
      "Westside Barbell Certified",
      "Certified Sports Nutritionist",
      "First Aid/CPR/AED Certified"
    ],
    services: [
      {
        name: "Strength Foundations",
        description: "Master the fundamentals of the squat, bench press, deadlift, and overhead press."
      },
      {
        name: "Hypertrophy Focus",
        description: "Specialized training to maximize muscle growth and aesthetic development."
      },
      {
        name: "Elite Lifter Program",
        description: "Advanced programming for competitive powerlifters and experienced trainees."
      }
    ]
  }
];
