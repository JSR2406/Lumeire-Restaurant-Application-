import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-foreground/95 text-background border-t border-primary/20 mt-32">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="font-serif text-2xl mb-6 text-primary">Lumière</h3>
            <p className="text-background/70 leading-relaxed text-sm">
              Celebrating the grand Art Deco tradition with exceptional cuisine and timeless elegance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-widest text-sm mb-6 text-primary">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Reservations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-widest text-sm mb-6 text-primary">Hours</h4>
            <ul className="space-y-3 text-background/70 text-sm">
              <li>Tuesday - Thursday: 10:00 AM - 10:00 PM</li>
              <li>Friday - Sunday: 10:00 AM - 11:00 PM</li>
              <li className="pt-2">Monday: Closed</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-widest text-sm mb-6 text-primary">Contact</h4>
            <ul className="space-y-3 text-background/70 text-sm">
              <li>123 Culinary Lane</li>
              <li>Foodie City, FC 12345</li>
              <li className="pt-2">(555) 123-4567</li>
              <li>info@lumiere.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary/20 text-center text-background/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Lumière. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
