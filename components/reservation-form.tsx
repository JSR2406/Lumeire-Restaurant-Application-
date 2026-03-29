"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Loader2 } from "lucide-react"

interface AvailableDate {
  date: string
  recordId: string
  formattedDate: string
}

interface TimeSlot {
  id: string
  time: string
}

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    date: "",
    timeSlot: "",
    numberOfGuests: "",
    specialRequests: "",
  })

  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlotRecordId, setSelectedSlotRecordId] = useState<string | null>(null)
  const [loadingDates, setLoadingDates] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [datesError, setDatesError] = useState("")
  const [slotsError, setSlotsError] = useState("")

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reservationId, setReservationId] = useState("")
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchDates() {
      setLoadingDates(true)
      setDatesError("")
      try {
        const response = await fetch("/api/available-dates", {
          signal: AbortSignal.timeout(12000),
        })
        const data = await response.json()

        if (data.error) {
          setDatesError(data.error)
        }

        setAvailableDates(data.dates || [])
      } catch (err: any) {
        setDatesError("Failed to load available dates")
      } finally {
        setLoadingDates(false)
      }
    }

    fetchDates()
  }, [])

  useEffect(() => {
    async function fetchTimeSlots() {
      if (!formData.date) {
        setTimeSlots([])
        setSelectedSlotRecordId(null)
        return
      }

      setLoadingSlots(true)
      setSlotsError("")
      setTimeSlots([])
      setFormData((prev) => ({ ...prev, timeSlot: "" }))

      try {
        const response = await fetch(`/api/reservation-slots?date=${formData.date}`, {
          signal: AbortSignal.timeout(15000),
        })
        const data = await response.json()

        if (data.error) {
          setSlotsError(data.error)
        }

        setTimeSlots(data.slots || [])
        setSelectedSlotRecordId(data.recordId || null)
      } catch (err: any) {
        setSlotsError("Failed to load time slots")
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchTimeSlots()
  }, [formData.date])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+?86)?1[3-9]\d{9}$|^(\+?1)?[\d\s\-()]{10,}$/
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ""))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      errors.customerName = "Name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone is required"
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Invalid phone format"
    }

    if (!formData.numberOfGuests) {
      errors.numberOfGuests = "Number of guests is required"
    }

    if (!formData.date) {
      errors.date = "Date is required"
    }

    if (!formData.timeSlot) {
      errors.timeSlot = "Time slot is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          numberOfGuests: Number.parseInt(formData.numberOfGuests),
          specialRequests: formData.specialRequests,
          date: formData.date,
          timeSlot: formData.timeSlot,
          slotRecordId: selectedSlotRecordId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create reservation")
      }

      setReservationId(result.reservationId || result.reservation?.reservationId || "")
      setSuccess(true)

      // Clear form
      setFormData({
        customerName: "",
        email: "",
        phone: "",
        date: "",
        timeSlot: "",
        numberOfGuests: "",
        specialRequests: "",
      })
      setTimeSlots([])
      setSelectedSlotRecordId(null)
      setValidationErrors({})
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div>
      {success && (
        <Alert className="mb-6 bg-green-100 border-2 border-green-500 shadow-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-700 font-bold text-xl">Reservation Submitted!</AlertTitle>
          <AlertDescription className="text-green-700 font-semibold text-base mt-2">
            {reservationId && (
              <p className="mb-2 text-lg">
                Reservation ID: <span className="font-mono bg-green-200 px-2 py-1 rounded">{reservationId}</span>
              </p>
            )}
            <p>
              Thank you for your reservation. We will send you a confirmation email once your request has been verified.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 bg-destructive/10 border-destructive">
          <AlertTitle className="text-destructive">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="customerName">Full Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleFieldChange("customerName", e.target.value)}
              placeholder="John Doe"
              className={validationErrors.customerName ? "border-red-500" : ""}
            />
            {validationErrors.customerName && <p className="text-red-500 text-sm">{validationErrors.customerName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="john@example.com"
              className={validationErrors.email ? "border-red-500" : ""}
            />
            {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className={validationErrors.phone ? "border-red-500" : ""}
            />
            {validationErrors.phone && <p className="text-red-500 text-sm">{validationErrors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfGuests">Number of Guests *</Label>
            <Input
              id="numberOfGuests"
              type="number"
              min="1"
              max="20"
              value={formData.numberOfGuests}
              onChange={(e) => handleFieldChange("numberOfGuests", e.target.value)}
              placeholder="2"
              className={validationErrors.numberOfGuests ? "border-red-500" : ""}
            />
            {validationErrors.numberOfGuests && (
              <p className="text-red-500 text-sm">{validationErrors.numberOfGuests}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Reservation Date *</Label>
            {loadingDates ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading available dates...</span>
              </div>
            ) : datesError ? (
              <div className="text-red-500 text-sm p-2 border border-red-300 rounded bg-red-50">{datesError}</div>
            ) : availableDates.length === 0 ? (
              <div className="text-amber-600 text-sm p-2 border border-amber-300 rounded bg-amber-50">
                No available dates. Please check back later.
              </div>
            ) : (
              <Select value={formData.date} onValueChange={(value) => handleFieldChange("date", value)}>
                <SelectTrigger className={validationErrors.date ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((dateInfo) => (
                    <SelectItem key={dateInfo.date} value={dateInfo.date}>
                      {dateInfo.formattedDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {validationErrors.date && <p className="text-red-500 text-sm">{validationErrors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeSlot">Time Slot *</Label>
            {!formData.date ? (
              <div className="text-muted-foreground text-sm p-2 border rounded bg-muted">
                Please select a date first
              </div>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading time slots...</span>
              </div>
            ) : slotsError ? (
              <div className="text-red-500 text-sm p-2 border border-red-300 rounded bg-red-50">{slotsError}</div>
            ) : timeSlots.length === 0 ? (
              <div className="text-amber-600 text-sm p-2 border border-amber-300 rounded bg-amber-50">
                No available time slots for this date
              </div>
            ) : (
              <Select value={formData.timeSlot} onValueChange={(value) => handleFieldChange("timeSlot", value)}>
                <SelectTrigger className={validationErrors.timeSlot ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {validationErrors.timeSlot && <p className="text-red-500 text-sm">{validationErrors.timeSlot}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => handleFieldChange("specialRequests", e.target.value)}
            placeholder="Dietary restrictions, allergies, special occasions, etc."
            rows={4}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || loadingDates || availableDates.length === 0}
        >
          {loading ? "Processing..." : "Confirm Reservation"}
        </Button>
      </form>
    </div>
  )
}
