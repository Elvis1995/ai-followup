import { useState } from 'react';
import { mockMeetings } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Plus,
  Video,
  Phone,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const meetingTypeIcons = {
  video: Video,
  call: Phone,
  'in-person': MapPin,
};

const meetingTypeLabels = {
  video: 'Video Call',
  call: 'Phone Call',
  'in-person': 'In-person Meeting',
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const selectedDateMeetings = mockMeetings.filter((meeting) => {
    if (!selectedDate) return false;
    const meetingDate = new Date(meeting.date);
    return meetingDate.toDateString() === selectedDate.toDateString();
  });

  const getMeetingDates = () => {
    return mockMeetings.map((m) => new Date(m.date));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage your meetings and bookings
          </p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4" />
          New meeting
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {selectedDate?.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  Today
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0 w-full"
              modifiers={{
                hasMeeting: getMeetingDates(),
              }}
              modifiersStyles={{
                hasMeeting: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                },
              }}
            />
          </div>
        </div>

        {/* Selected day meetings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {selectedDate?.toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h2>

          {selectedDateMeetings.length > 0 ? (
            <div className="space-y-3">
              {selectedDateMeetings.map((meeting) => {
                const Icon = meetingTypeIcons[meeting.type];
                return (
                  <div
                    key={meeting.id}
                    className={cn(
                      'p-4 rounded-xl border bg-card transition-all hover:shadow-lg',
                      meeting.status === 'scheduled'
                        ? 'border-primary/30'
                        : meeting.status === 'completed'
                        ? 'border-success/30 opacity-75'
                        : 'border-destructive/30 opacity-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          meeting.status === 'scheduled'
                            ? 'bg-primary/10'
                            : meeting.status === 'completed'
                            ? 'bg-success/10'
                            : 'bg-destructive/10'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5',
                            meeting.status === 'scheduled'
                              ? 'text-primary'
                              : meeting.status === 'completed'
                              ? 'text-success'
                              : 'text-destructive'
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{meeting.leadName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meetingTypeLabels[meeting.type]}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.time}</span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs rounded-full font-medium',
                          meeting.status === 'scheduled'
                            ? 'bg-primary/10 text-primary'
                            : meeting.status === 'completed'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {meeting.status === 'scheduled'
                          ? 'Scheduled'
                          : meeting.status === 'completed'
                          ? 'Completed'
                          : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-border text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No meetings on this day</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Book meeting
              </Button>
            </div>
          )}

          {/* AI booking info */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI meeting booking active
            </h3>
            <p className="text-sm text-muted-foreground">
              AI automatically suggests meetings to leads based on your
              available times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
