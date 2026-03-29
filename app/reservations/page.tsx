import ReservationForm from "@/components/reservation-form"

export default function ReservationsPage() {
  return (
    <div className="min-h-screen pt-20 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Reservations</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 leading-tight">Reserve Your Table</h1>
          <div className="w-24 h-px bg-primary/60 mx-auto mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Book your dining experience at Lumière. We look forward to serving you.
          </p>
        </div>

        {/* Reservation Info */}
        <div className="mb-12 p-8 bg-secondary/20 border border-border/50">
          <h3 className="font-serif text-2xl mb-6 text-center">Reservation Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold uppercase tracking-widest mb-3 text-primary">Hours of Operation</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Tuesday - Thursday: 10:00 AM - 10:00 PM</li>
                <li>Friday - Sunday: 10:00 AM - 11:00 PM</li>
                <li>Monday: Closed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold uppercase tracking-widest mb-3 text-primary">Please Note</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Reservations available 90 days in advance</li>
                <li>Tables available on first-come, first-serve basis for walk-ins</li>
                <li>Credit card required for reservation</li>
                <li>Cancellations accepted up to 24 hours before</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="bg-card shadow-2xl p-8 md:p-12 border border-border/50">
          <ReservationForm />
        </div>

        {/* Contact Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl mb-2">Hours</h3>
            <p className="text-muted-foreground text-sm">Tue-Thu: 10am-10pm</p>
            <p className="text-muted-foreground text-sm">Fri-Sun: 10am-11pm</p>
            <p className="text-muted-foreground text-sm">Mon: Closed</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl mb-2">Contact</h3>
            <p className="text-muted-foreground text-sm">(555) 123-4567</p>
            <p className="text-muted-foreground text-sm">info@lumiere.com</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-xl mb-2">Location</h3>
            <p className="text-muted-foreground text-sm">123 Culinary Lane</p>
            <p className="text-muted-foreground text-sm">Foodie City, FC 12345</p>
          </div>
        </div>
      </div>
    </div>
  )
}
