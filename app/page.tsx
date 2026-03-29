"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Dish {
  id: string
  name: string
  description: string
  price: number
  category: string
  ingredients: string
  image: string | null
  available: boolean
  featured: boolean
}

export default function HomePage() {
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedDishes() {
      try {
        const response = await fetch("/api/featured-dishes")
        const data = await response.json()

        if (data.success) {
          setFeaturedDishes(data.dishes)
        }
      } catch (error) {
        console.error("Error fetching featured dishes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedDishes()
  }, [])

  const getDishImageUrl = (dish: Dish) => {
    if (dish.image) {
      return dish.image
    }
    return `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(dish.name || "gourmet restaurant dish")}`
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/elegant-restaurant-interior.png"
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
          <div className="mb-4 text-sm uppercase tracking-[0.3em] text-primary/90">Fine Dining</div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 text-balance font-bold tracking-tight">
            Lumière
          </h1>
          <div className="w-24 h-px bg-primary/60 mx-auto mb-6" />
          <p className="text-lg md:text-xl mb-10 text-balance leading-relaxed text-white/90 max-w-2xl mx-auto">
            Celebrating the grand Art Deco tradition with exceptional cuisine and rich culinary heritage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm uppercase tracking-widest px-10 py-6"
            >
              <Link href="/reservations">Reserve a Table</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-sm uppercase tracking-widest px-10 py-6 bg-white/95 hover:bg-white text-foreground border-2"
            >
              <Link href="/menu">View Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Our Story</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8 leading-tight">Welcome to Excellence</h2>
            <div className="w-16 h-px bg-primary/60 mb-8" />
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At Lumière, we believe every meal should be an experience to remember. Inspired by the great Art Deco
              lobbies of Europe, we combine timeless elegance with innovative culinary artistry.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Our chefs craft each dish with passion, using only the finest locally-sourced ingredients to create
              moments that last a lifetime.
            </p>
            <Button asChild variant="default" size="lg" className="uppercase tracking-widest text-sm">
              <Link href="/menu">Explore Our Menu</Link>
            </Button>
          </div>
          <div className="relative h-[600px] order-1 lg:order-2">
            <img
              src="/gourmet-dish-plated-beautifully.jpg"
              alt="Featured dish"
              className="w-full h-full object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {featuredDishes.length > 0 && (
        <section className="py-24 px-4 bg-secondary/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Signature Selections</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Chef's Selections</h2>
              <div className="w-24 h-px bg-primary/60 mx-auto mb-6" />
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Signature dishes that define our culinary excellence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDishes.slice(0, 3).map((dish) => {
                const imageUrl = getDishImageUrl(dish)

                return (
                  <div
                    key={dish.id}
                    className="bg-card overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(dish.name || "gourmet restaurant dish")}`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs uppercase tracking-wider px-3 py-1 font-medium">
                        Featured
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-serif mb-3">{dish.name}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{dish.description}</p>
                      {dish.ingredients && (
                        <p className="text-sm text-muted-foreground/80 mb-4 italic line-clamp-1">{dish.ingredients}</p>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <span className="text-2xl font-serif text-primary">${dish.price?.toFixed(2)}</span>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">{dish.category}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-16">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="uppercase tracking-widest text-sm border-2 bg-transparent"
              >
                <Link href="/menu">View Full Menu</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Reservation CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Book Now</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-balance leading-tight">
            Reserve Your Experience
          </h2>
          <div className="w-24 h-px bg-primary/60 mx-auto mb-8" />
          <p className="text-lg text-muted-foreground mb-10 text-balance leading-relaxed max-w-2xl mx-auto">
            Join us for an exceptional dining experience. Reservations are available 90 days in advance. Book early to
            secure your preferred time.
          </p>
          <Button asChild size="lg" className="text-sm uppercase tracking-widest px-10 py-6">
            <Link href="/reservations">Make a Reservation</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
