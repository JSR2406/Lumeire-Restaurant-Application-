"use client"

import { useEffect, useState } from "react"
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react"

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
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([])
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id)
      if (existing) {
        return prev.map((item) => (item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { dish, quantity: 1 }]
    })
  }

  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dishId)
      if (existing && existing.quantity > 1) {
        return prev.map((item) => (item.dish.id === dishId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prev.filter((item) => item.dish.id !== dishId)
    })
  }

  const clearCart = () => setCart([])

  const totalAmount = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

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
                            <div className="p-5 flex flex-col h-full">
                              <div className="flex-1">
                                <h3 className="text-xl font-serif mb-2 line-clamp-1">{dish.name}</h3>
                                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{dish.description}</p>
                                <div className="text-2xl font-serif text-primary mb-4">${dish.price?.toFixed(2)}</div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addToCart(dish)
                                }}
                                className="w-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/20 py-2 px-4 transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-semibold"
                              >
                                <Plus className="w-4 h-4" />
                                Add to Order
                              </button>
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

                {/* Add to Order Button */}
                <div className="p-8 pt-0 mt-4 h-full">
                  <button
                    onClick={() => {
                      addToCart(selectedDish)
                      setSelectedDish(null)
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 transition-all duration-300 flex items-center justify-center gap-3 text-lg uppercase tracking-widest font-semibold shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Your Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Order Button */}
      {totalItems > 0 && !showOrderSummary && (
        <button
          onClick={() => setShowOrderSummary(true)}
          className="fixed bottom-8 right-8 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl z-40 flex items-center gap-3 hover:scale-110 transition-all duration-300 group"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-destructive text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary font-bold">
              {totalItems}
            </span>
          </div>
          <span className="font-semibold uppercase tracking-widest text-sm pr-2">View Order</span>
        </button>
      )}

      {/* Order Summary Overlay */}
      {showOrderSummary && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div
            className="bg-background w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-serif">Your Order</h2>
              </div>
              <button onClick={() => setShowOrderSummary(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingBag className="w-16 h-16 mb-4 stroke-1" />
                  <p className="text-lg">Your cart is empty</p>
                  <button
                    onClick={() => setShowOrderSummary(false)}
                    className="mt-4 text-primary hover:underline font-semibold"
                  >
                    Start adding dishes
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.dish.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={item.dish.image || "/placeholder.svg"}
                          alt={item.dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-lg leading-tight mb-1 truncate">{item.dish.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">${item.dish.price.toFixed(2)} each</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden h-8">
                            <button
                              onClick={() => removeFromCart(item.dish.id)}
                              className="px-2 bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item.dish.id as any)}
                              className="px-2 bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-lg mb-2">${(item.dish.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => setCart((prev) => prev.filter((i) => i.dish.id !== item.dish.id))}
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/30 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service Fee (10%)</span>
                    <span>${(totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span className="text-primary">${(totalAmount * 1.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={clearCart}
                    className="py-3 border border-border hover:bg-muted transition-colors text-sm uppercase tracking-widest font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      setOrderComplete(true)
                      setTimeout(() => {
                        setOrderComplete(false)
                        setCart([])
                        setShowOrderSummary(false)
                      }, 3000)
                    }}
                    className="py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm uppercase tracking-widest font-semibold shadow-lg"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {orderComplete && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in duration-300">
          <div className="bg-background border border-primary/20 shadow-2xl rounded-2xl p-6 flex flex-col items-center min-w-[300px]">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-serif mb-2">Order Confirmed!</h3>
            <p className="text-muted-foreground text-center">
              Your gourmet selection has been sent to our kitchen.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
