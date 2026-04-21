import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function Schedule() {
  const scheduleData = [
    {
      date: '2026-12-05',
      day: 'Day 1: Arrival',
      events: [
        {
          id: 1,
          title: 'Arrivals and Pickup from Airport',
          time: '12:00PM - 11:00PM',
          category: 'arrival'
        },
        {
          id: 2,
          title: 'Casual Introductions and Hangout',
          time: '5:00PM - 9:00PM',
          category: 'social'
        }
      ]
    },
    {
      date: '2026-12-06',
      day: 'Day 2: Opening Ceremony & PS Rounds 1-3',
      events: [
        {
          id: 3,
          title: 'Opening Ceremony and Master\'s Round',
          time: '9:00AM - 11:30AM',
          category: 'ceremony'
        },
        {
          id: 4,
          title: 'Judges and Speaker Briefing',
          time: '12:00PM - 1:00PM',
          category: 'briefing'
        },
        {
          id: 5,
          title: 'Public Speaking Rounds 1-3',
          time: '2:00PM - 6:10PM',
          category: 'speaking'
        },
        {
          id: 6,
          title: 'Socials',
          time: '8:15PM - 11:00PM',
          category: 'social'
        }
      ]
    },
    {
      date: '2026-12-07',
      day: 'Day 3: Debate Rounds 1-3 & PS Round 4',
      events: [
        {
          id: 7,
          title: 'Morning Briefing and Rollcall',
          time: '9:30AM - 10:00AM',
          category: 'briefing'
        },
        {
          id: 8,
          title: 'Debate Rounds 1-3',
          time: '10:00AM - 5:00PM',
          category: 'debate'
        },
        {
          id: 9,
          title: 'Public Speaking Round 4',
          time: '5:00PM - 6:30PM',
          category: 'speaking'
        },
        {
          id: 10,
          title: 'Socials',
          time: '8:00PM - 11:30PM',
          category: 'social'
        }
      ]
    },
    {
      date: '2026-12-08',
      day: 'Day 4: Debate Rounds 4-6 & Civic Panel',
      events: [
        {
          id: 11,
          title: 'Civic Panel: Rethinking Pan Africanism for the New Generation',
          time: '9:00AM - 11:30AM',
          category: 'panel'
        },
        {
          id: 12,
          title: 'Morning Briefing and Rollcall',
          time: '11:30AM - 12:00PM',
          category: 'briefing'
        },
        {
          id: 13,
          title: 'Debate Rounds 4-6',
          time: '12:00PM - 6:30PM',
          category: 'debate'
        },
        {
          id: 14,
          title: 'Socials',
          time: '8:00PM - 11:30PM',
          category: 'social'
        }
      ]
    },
    {
      date: '2026-12-09',
      day: 'Day 5: Debate Rounds 7-9 & PS Round 5',
      events: [
        {
          id: 15,
          title: 'Morning Briefing and Rollcall',
          time: '9:30AM - 10:00AM',
          category: 'briefing'
        },
        {
          id: 16,
          title: 'Debate Rounds 7-9',
          time: '10:00AM - 5:00PM',
          category: 'debate'
        },
        {
          id: 17,
          title: 'Public Speaking Round 5',
          time: '5:00PM - 6:30PM',
          category: 'speaking'
        },
        {
          id: 18,
          title: 'Break Night Socials',
          time: '8:00PM - 11:30PM',
          category: 'social'
        }
      ]
    },
    {
      date: '2026-12-10',
      day: 'Day 6: Free Day',
      events: [
        {
          id: 19,
          title: 'Recreation and Abuja Tour',
          time: 'Full Day',
          category: 'break'
        }
      ]
    },
    {
      date: '2026-12-11',
      day: 'Day 7: Out Rounds 1-3 & PS Out Round 1',
      events: [
        {
          id: 20,
          title: 'Post-Break Briefing and Rollcall',
          time: '9:30AM - 10:00AM',
          category: 'briefing'
        },
        {
          id: 21,
          title: 'Debate Out Rounds 1-3',
          time: '10:00AM - 5:00PM',
          category: 'debate'
        },
        {
          id: 22,
          title: 'Public Speaking Out Round 1',
          time: '5:00PM - 6:30PM',
          category: 'speaking'
        },
        {
          id: 23,
          title: 'Socials',
          time: '8:00PM - 11:30PM',
          category: 'social'
        }
      ]
    },
    {
      date: '2026-12-12',
      day: 'Day 8: Semi-Finals & Grand Finale',
      events: [
        {
          id: 24,
          title: 'Public Speaking Semi-Finals',
          time: '10:00AM - 11:30AM',
          category: 'speaking'
        },
        {
          id: 25,
          title: 'Debate Semi-Finals',
          time: '11:30AM - 1:30PM',
          category: 'debate'
        },
        {
          id: 26,
          title: 'Legacy Lab Idea Pitch semi-Finals',
          time: '1:30PM - 3:00PM',
          category: 'other'
        },
        {
          id: 27,
          title: 'Grand Finale & Awards',
          time: '6:00PM - 9:00PM',
          category: 'final'
        }
      ]
    },
    {
      date: '2026-12-13',
      day: 'Day 9: Departure',
      events: [
        {
          id: 28,
          title: 'Departure',
          time: 'Throughout the Day',
          category: 'closing'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Schedule"
        description="PAUDC 2026 tournament schedule. December 5-13, 2026 in Abuja, Nigeria. Full event itinerary and round times."
        canonical="https://www.paudc2026.com/schedule"
      />
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
                      <Card key={event.id} className="border-l-4 border-l-[#C8A046] hover:shadow-md transition-shadow">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                            <div className="space-y-1 md:space-y-2">
                              <h3 className="text-lg md:text-xl font-bold text-gray-900">{event.title}</h3>
                              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                                <Clock className="h-4 w-4 text-[#C8A046]" />
                                <span>{event.time}</span>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${event.category === 'debate' ? 'bg-blue-100 text-blue-800' :
                                event.category === 'speaking' ? 'bg-green-100 text-green-800' :
                                  event.category === 'final' ? 'bg-red-100 text-red-800' :
                                    event.category === 'ceremony' ? 'bg-purple-100 text-purple-800' :
                                      event.category === 'panel' ? 'bg-yellow-100 text-yellow-800' :
                                        event.category === 'social' ? 'bg-pink-100 text-pink-800' :
                                          event.category === 'briefing' ? 'bg-orange-100 text-orange-800' :
                                            event.category === 'break' ? 'bg-indigo-100 text-indigo-800' :
                                              event.category === 'arrival' ? 'bg-cyan-100 text-cyan-800' :
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