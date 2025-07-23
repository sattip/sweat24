import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isSameDay, addDays, subDays, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { el } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Session {
  id: number;
  trainer_id: number;
  trainer_name: string;
  class_type: string;
  type?: string;
  start_time: string;
  end_time: string;
  date: string;
  participants?: number;
  max_participants?: number;
}

interface MatrixViewCalendarProps {
  sessions: Session[];
  trainers: { id: number; name: string }[];
  onSessionClick?: (session: Session) => void;
}

const MatrixViewCalendar: React.FC<MatrixViewCalendarProps> = ({ sessions, trainers, onSessionClick }) => {
  // Add a special "unassigned" trainer for sessions without trainer
  const allTrainers = [
    { id: 0, name: 'Χωρίς Προπονητή' },
    ...trainers
  ];
  
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(),
    to: new Date()
  });
  const [tempDateRange, setTempDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Time slots from 07:00 to 22:00
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const navigateDay = (direction: 'prev' | 'next') => {
    if (!dateRange.from) {
      const today = new Date();
      setDateRange({
        from: today,
        to: today
      });
      return;
    }
    
    if (direction === 'prev') {
      setDateRange({
        from: subDays(dateRange.from, 1),
        to: dateRange.to ? subDays(dateRange.to, 1) : subDays(dateRange.from, 1)
      });
    } else {
      setDateRange({
        from: addDays(dateRange.from, 1),
        to: dateRange.to ? addDays(dateRange.to, 1) : addDays(dateRange.from, 1)
      });
    }
  };
  
  const daysInRange = dateRange.from && dateRange.to 
    ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
    : dateRange.from 
    ? [dateRange.from]
    : [new Date()];

  const getSessionForSlot = (trainerId: number, day: Date, timeSlot: string) => {
    const found = sessions.find(session => {
      try {
        const sessionDate = typeof session.date === 'string' ? parseISO(session.date) : new Date(session.date);
        const sessionStartTime = session.start_time.slice(0, 5);
        const sessionTrainerId = session.trainer_id === null || session.trainer_id === undefined 
          ? 0  // Assign to "unassigned" trainer
          : (typeof session.trainer_id === 'string' ? parseInt(session.trainer_id) : session.trainer_id);
        
        const trainerMatch = sessionTrainerId === trainerId;
        const dayMatch = isSameDay(sessionDate, day);
        const timeMatch = sessionStartTime === timeSlot;
        
        return trainerMatch && dayMatch && timeMatch;
      } catch (error) {
        console.error('Error parsing session:', session, error);
        return false;
      }
    });
    return found;
  };

  const getSessionColor = (session: Session) => {
    
    const lowerType = (session.type || session.class_type || '').toLowerCase();
    const lowerName = (session.class_type || '').toLowerCase();
    
    // Check for personal training - check both type and name
    if (lowerType === 'personal' || lowerType.includes('personal') || 
        lowerName.includes('personal') || lowerName.includes('1-on-1') || 
        lowerName.includes('private')) {
      return 'bg-pink-300 hover:bg-pink-400';
    }
    
    // Check for group training
    if (lowerType === 'group' || lowerName.includes('yoga') || 
        lowerName.includes('hiit') || lowerName.includes('power') || 
        lowerName.includes('group') || lowerName.includes('class')) {
      return 'bg-green-300 hover:bg-green-400';
    }
    
    // Everything else is blue
    return 'bg-blue-300 hover:bg-blue-400';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ημερήσιο Πρόγραμμα</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover open={isCalendarOpen} onOpenChange={(open) => {
              setIsCalendarOpen(open);
              if (open) {
                // Reset temp range when opening
                setTempDateRange({ from: undefined, to: undefined });
              }
            }}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "min-w-[240px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to 
                    ? dateRange.from.getTime() === dateRange.to.getTime()
                      ? format(dateRange.from, "EEEE, dd MMMM yyyy", { locale: el })
                      : `${format(dateRange.from, "dd MMM", { locale: el })} - ${format(dateRange.to, "dd MMM yyyy", { locale: el })}`
                    : dateRange.from
                    ? format(dateRange.from, "EEEE, dd MMMM yyyy", { locale: el })
                    : "Επιλέξτε ημερομηνία"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <div>
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onDayClick={(date) => {
                      if (!tempDateRange.from) {
                        // First click
                        setTempDateRange({ from: date, to: undefined });
                      } else {
                        // Second click
                        const from = tempDateRange.from;
                        const to = date;
                        
                        // Set the range (auto-sort dates)
                        if (from.getTime() === to.getTime()) {
                          // Same day clicked twice
                          setDateRange({ from, to });
                        } else if (from <= to) {
                          setDateRange({ from, to });
                        } else {
                          setDateRange({ from: to, to: from });
                        }
                        setIsCalendarOpen(false);
                      }
                    }}
                    modifiers={{
                      selected: tempDateRange.from ? [tempDateRange.from] : [],
                      range_start: dateRange.from ? [dateRange.from] : [],
                      range_end: dateRange.to ? [dateRange.to] : [],
                      range_middle: dateRange.from && dateRange.to
                        ? eachDayOfInterval({ start: addDays(dateRange.from, 1), end: subDays(dateRange.to, 1) })
                        : []
                    }}
                    modifiersStyles={{
                      selected: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
                      range_start: { backgroundColor: 'hsl(var(--primary) / 0.1)' },
                      range_end: { backgroundColor: 'hsl(var(--primary) / 0.1)' },
                      range_middle: { backgroundColor: 'hsl(var(--primary) / 0.05)' }
                    }}
                    initialFocus
                  />
                  <div className="px-3 pb-3 text-sm text-muted-foreground text-center">
                    Επιλέξτε ημερομηνία έναρξης και λήξης (κλικ στην ίδια ημερομηνία δύο φορές για μία μέρα)
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Color Legend */}
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-300 rounded"></div>
            <span>Personal Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span>Group Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <span>Άλλο</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left bg-gray-50 min-w-[80px]">Ώρα</th>
                {allTrainers.map(trainer => (
                  <th key={trainer.id} className="border p-2 text-center bg-gray-50 min-w-[120px]">
                    {trainer.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="border p-2 font-medium bg-gray-50">{timeSlot}</td>
                  {allTrainers.map(trainer => (
                    <td key={trainer.id} className="border p-1">
                      <div className={`grid grid-cols-${Math.min(daysInRange.length, 7)} gap-1`}>
                        {daysInRange.map((day) => {
                          const session = getSessionForSlot(trainer.id, day, timeSlot);
                          return (
                            <div key={day.getTime()} className="relative">
                              {session ? (
                                <div
                                  className={`p-1 rounded cursor-pointer ${getSessionColor(session)} text-gray-800`}
                                  onClick={() => onSessionClick && onSessionClick(session)}
                                  title={`${session.class_type} - ${format(day, 'dd/MM')}${session.participants !== undefined ? ` (${session.participants}/${session.max_participants || '∞'})` : ''}`}
                                >
                                  <div className="text-xs font-medium truncate">{session.class_type}</div>
                                  <div className="text-xs">{format(day, 'dd/MM')}</div>
                                </div>
                              ) : (
                                <div className="h-10"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixViewCalendar;