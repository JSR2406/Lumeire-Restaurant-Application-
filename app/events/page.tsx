"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { X, Calendar, Clock, DollarSign, Sparkles } from "lucide-react"

const EVENT_CATEGORIES = ["Upcoming", "Ongoing"]

interface Event {
  id: string
  name: string
  description: string
  highlights: string
  price: number
  startDate: string
  endDate: string
  status: string
  image: string | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events")

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setEvents(data.events || [])
        } else {
          setError(data.error || "Failed to fetch events")
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const eventsByCategory = EVENT_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = events.filter((event) => event.status === category)
      return acc
    },
    {} as Record<string, Event[]>,
  )

  const formatPrice = (price: number | undefined) => {
    if (!price) return null
    return `$${price.toFixed(2)}`
  }

  const getImageUrl = (event: Event) => {
    return (
      event.image ||
      `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(event.name || "restaurant event")}`
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 py-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading events...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen pt-20 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Special Occasions</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 leading-tight">Our Events</h1>
            <div className="w-24 h-px bg-primary/60 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join us for special occasions, themed dinners, and exclusive culinary experiences
            </p>
          </div>

          {error ? (
            <div className="text-center py-20">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif text-destructive mb-4">Error Loading Events</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-muted/30 border border-border rounded-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif mb-4">No Events Available</h2>
                <p className="text-muted-foreground">Check back soon for upcoming events.</p>
              </div>
            </div>
          ) : (
            <>
              {EVENT_CATEGORIES.map((category) => {
                const categoryEvents = eventsByCategory[category]
                if (!categoryEvents || categoryEvents.length === 0) return null

                return (
                  <section key={category} className="mb-20">
                    {/* Category Header */}
                    <div className="mb-12">
                      <h2 className="text-3xl md:text-4xl font-serif text-center mb-2">{category}</h2>
                      <div className="w-16 h-px bg-primary/60 mx-auto" />
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryEvents.map((event) => {
                        const isOngoing = event.status === "Ongoing"

                        return (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`bg-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                              isOngoing ? "ring-2 ring-primary/40" : ""
                            }`}
                          >
                            {/* Event Image */}
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={getImageUrl(event) || "/placeholder.svg"}
                                alt={event.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(event.name || "restaurant event")}`
                                }}
                              />
                              {/* Status Badge */}
                              {isOngoing && (
                                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                                  Happening Now
                                </div>
                              )}
                            </div>

                            {/* Event Info */}
                            <div className="p-5">
                              <h3 className="text-xl font-serif mb-2 line-clamp-1">{event.name}</h3>

                              {/* Date Range */}
                              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {event.startDate ? format(new Date(event.startDate), "MMM dd") : "TBA"}
                                  {event.endDate && ` - ${format(new Date(event.endDate), "MMM dd, yyyy")}`}
                                  {!event.endDate &&
                                    event.startDate &&
                                    `, ${format(new Date(event.startDate), "yyyy")}`}
                                </span>
                              </div>

                              {/* Price */}
                              {event.price && (
                                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{formatPrice(event.price)}</span>
                                </div>
                              )}

                              {/* Highlights */}
                              {event.highlights && (
                                <div className="flex items-start gap-2 text-muted-foreground text-sm">
                                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{event.highlights}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-background max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-background/90 hover:bg-background p-2 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="relative">
              {/* Large Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                  src={getImageUrl(selectedEvent) || "/placeholder.svg"}
                  alt={selectedEvent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=600&width=800&query=${encodeURIComponent(selectedEvent.name || "restaurant event")}`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Status Badge */}
                {selectedEvent.status === "Ongoing" && (
                  <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-widest font-semibold">
                    Happening Now
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-8">
                {/* Header with Name and Status */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">{selectedEvent.name}</h2>
                  </div>
                  <div className="text-sm font-medium text-primary ml-6 px-3 py-1 bg-primary/10 uppercase tracking-wider">
                    {selectedEvent.status}
                  </div>
                </div>

                <div className="w-16 h-px bg-primary/60 mb-6" />

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Start Date */}
                  <div className="bg-muted/30 p-4 rounded">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Start Date</span>
                    </div>
                    <p className="text-base font-medium">
                      {selectedEvent.startDate ? format(new Date(selectedEvent.startDate), "MMM dd, yyyy") : "TBA"}
                    </p>
                  </div>

                  {/* End Date */}
                  <div className="bg-muted/30 p-4 rounded">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      <span>End Date</span>
                    </div>
                    <p className="text-base font-medium">
                      {selectedEvent.endDate ? format(new Date(selectedEvent.endDate), "MMM dd, yyyy") : "TBA"}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="bg-muted/30 p-4 rounded">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span>Price</span>
                    </div>
                    <p className="text-base font-medium text-primary">{formatPrice(selectedEvent.price) || "Free"}</p>
                  </div>

                  {/* Status */}
                  <div className="bg-muted/30 p-4 rounded">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Status</span>
                    </div>
                    <p className="text-base font-medium">{selectedEvent.status}</p>
                  </div>
                </div>

                {/* Highlights */}
                {selectedEvent.highlights && (
                  <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Highlights</h3>
                    <p className="text-base leading-relaxed bg-primary/5 p-4 rounded border-l-4 border-primary">
                      {selectedEvent.highlights}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Event Details</h3>
                    <p className="text-base leading-relaxed whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
