import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';

export default function Schedule() {
  const scheduleData = [
    {
      date: '2026-12-05',
      day: 'Day 1',
      events: [
        {
          id: 1,
          title: 'Opening Ceremony',
          description: 'Official welcome and tournament inauguration featuring keynote addresses',
          category: 'other',
          start_time: '09:00',
          end_time: '11:00',
          location: 'Main Auditorium',
          is_public: true,
        },
        {
          id: 2,
          title: 'Registration & Briefing',
          description: 'Participant registration, badge collection, and orientation briefing',
          category: 'other',
          start_time: '11:00',
          end_time: '14:00',
          location: 'Registration Hall',
          is_public: false,
        },
        {
          id: 3,
          title: 'Adjudicators Academy - Session 1',
          description: 'Introduction to BP format and judging criteria',
          category: 'academy',
          start_time: '14:00',
          end_time: '17:00',
          location: 'Training Room A',
          is_public: false,
        }
      ]
    },
    {
      date: '2026-12-06',
      day: 'Day 2',
      events: [
        {
          id: 6,
          title: 'Public Speaking Competition - Heats',
          description: 'Individual public speaking preliminary rounds',
          category: 'speaking',
          start_time: '09:00',
          end_time: '12:00',
          location: 'Seminar Room B',
          is_public: true,
        }
      ]
    },
    {
      date: '2026-12-07',
      day: 'Day 3',
      events: [
        {
          id: 7,
          title: 'Preliminary Round 3',
          description: 'Third debate round of the championship',
          category: 'debate',
          start_time: '14:00',
          end_time: '16:00',
          location: 'Multiple Venues',
          is_public: false,
        },
        {
          id: 11,
          title: 'Preliminary Round 5',
          description: 'Fifth debate round of the championship',
          category: 'debate',
          start_time: '09:00',
          end_time: '11:00',
          location: 'Multiple Venues',
          is_public: false,
        }
      ]
    },
    {
      date: '2026-12-13',
      day: 'Day 9',
      events: [
        {
          id: 20,
          title: 'Grand Final',
          description: 'Championship final debate',
          category: 'debate',
          start_time: '14:00',
          end_time: '16:00',
          location: 'Main Auditorium',
          is_public: true,
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#185E3B] to-[#124a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Tournament Schedule
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
            December 5-13, 2026 • Veritas University, Abuja
          </p>
        </div>
      </section>

      {/* Schedule Content */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 md:space-y-12">
            {scheduleData.map((daySchedule) => (
              <div key={daySchedule.date} className="relative pl-4 md:pl-0">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Date Sidebar */}
                  <div className="md:w-48 flex-shrink-0">
                    <div className="sticky top-24 bg-white py-2 md:py-4">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">{daySchedule.day}</h2>
                      <p className="text-sm md:text-base text-gray-600">{daySchedule.date}</p>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="flex-1 space-y-4 md:space-y-6">
                    {daySchedule.events.map((event) => (
                      <Card key={event.id} className="border-l-4 border-l-[#C84B46] hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                            <div className="space-y-1 md:space-y-2">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900">{event.title}</h3>
                              <p className="text-sm md:text-base text-gray-600">{event.description}</p>

                              <div className="flex flex-wrap gap-3 md:gap-4 mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#C84B46]" />
                                  <span>{event.start_time} - {event.end_time}</span>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#C84B46]" />
                                  <span>{event.location}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold ${event.category === 'debate' ? 'bg-blue-100 text-blue-800' :
                                  event.category === 'academy' ? 'bg-purple-100 text-purple-800' :
                                    event.category === 'speaking' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                }`}>
                                {event.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}