"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

const CATEGORIES = ["Appetizers", "Main Course", "Desserts", "Beverages", "Specials"]

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

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)

  useEffect(() => {
    async function fetchDishes() {
      try {
        const response = await fetch("/api/dishes")
        const data = await response.json()

        if (data.success) {
          setDishes(data.dishes)
        } else {
          setError(data.error || "Failed to fetch dishes")
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDishes()
  }, [])

  const dishesByCategory = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = dishes.filter((dish) => dish.category === category)
      return acc
    },
    {} as Record<string, Dish[]>,
  )

  if (loading) {
    return (
      <div className="min-h-screen pt-20 py-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading menu...</div>
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
            <div className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Culinary Excellence</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 leading-tight">Our Menu</h1>
            <div className="w-24 h-px bg-primary/60 mx-auto mb-6" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our carefully curated selection of dishes, crafted with passion and the finest ingredients
            </p>
          </div>

          {error ? (
            <div className="text-center py-20">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif text-destructive mb-4">Error Loading Menu</h2>
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground mt-4">Please check your Teable connection and try again.</p>
              </div>
            </div>
          ) : dishes.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-muted/30 border border-border rounded-lg p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif mb-4">No Menu Items Available</h2>
                <p className="text-muted-foreground mb-4">
                  There are currently no dishes to display. This could be because:
                </p>
                <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-2">
                  <li>• No dishes have been added to the Dishes table yet</li>
                  <li>• All dishes are marked as "Not Available" in the database</li>
                  <li>• The Teable database connection needs to be configured</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Menu Categories */}
              {CATEGORIES.map((category) => {
                const categoryDishes = dishesByCategory[category]

                if (!categoryDishes || categoryDishes.length === 0) return null

                return (
                  <section key={category} className="mb-20">
                    <div className="mb-12">
                      <h2 className="text-3xl md:text-4xl font-serif text-center mb-2">{category}</h2>
                      <div className="w-16 h-px bg-primary/60 mx-auto" />
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryDishes.map((dish) => {
                        const imageUrl =
                          dish.image ||
                          `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(dish.name || "restaurant dish")}`

                        return (
                          <div
                            key={dish.id}
                            onClick={() => setSelectedDish(dish)}
                            className={`bg-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                              dish.featured ? "ring-2 ring-primary/40" : ""
                            }`}
                          >
                            {/* Dish Image */}
                            <div className="relative h-56 overflow-hidden">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={dish.name || "Dish"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(dish.name || "restaurant dish")}`
                                }}
                              />
                              {dish.featured && (
                                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                                  Featured
                                </div>
                              )}
                            </div>

                            {/* Dish Info */}
                            <div className="p-5">
                              <h3 className="text-xl font-serif mb-2 line-clamp-1">{dish.name}</h3>
                              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{dish.description}</p>
                              <div className="text-2xl font-serif text-primary">${dish.price?.toFixed(2)}</div>
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

      {/* Modal for dish details */}
      {selectedDish && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="bg-background max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedDish(null)}
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
                  src={
                    selectedDish.image ||
                    `/placeholder.svg?height=600&width=800&query=${encodeURIComponent(selectedDish.name || "restaurant dish")}`
                  }
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=600&width=800&query=${encodeURIComponent(selectedDish.name || "restaurant dish")}`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Featured Badge */}
                {selectedDish.featured && (
                  <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-widest font-semibold">
                    Chef's Featured
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest text-primary mb-2">{selectedDish.category}</div>
                    <h2 className="text-3xl md:text-4xl font-serif mb-4">{selectedDish.name}</h2>
                  </div>
                  <div className="text-3xl font-serif text-primary ml-6">${selectedDish.price?.toFixed(2)}</div>
                </div>

                <div className="w-16 h-px bg-primary/60 mb-6" />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Description</h3>
                    <p className="text-base leading-relaxed">{selectedDish.description}</p>
                  </div>

                  {selectedDish.ingredients && (
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Ingredients</h3>
                      <p className="text-base leading-relaxed">{selectedDish.ingredients}</p>
                    </div>
                  )}

                  <div className="flex gap-8 pt-4 border-t border-border">
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Category</h3>
                      <p className="text-base">{selectedDish.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Availability</h3>
                      <p className="text-base">{selectedDish.available ? "Available Now" : "Currently Unavailable"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
