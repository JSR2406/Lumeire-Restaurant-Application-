"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function ConfirmReservationPage() {
  const searchParams = useSearchParams()
  const reservationId = searchParams.get("id")
  const [status, setStatus] = useState<"loading" | "confirming" | "success" | "error" | "already_confirmed">("loading")
  const [reservation, setReservation] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (reservationId) {
      fetchReservation()
    } else {
      setStatus("error")
      setErrorMessage("No reservation ID provided")
    }
  }, [reservationId])

  const fetchReservation = async () => {
    try {
      const response = await fetch(`/api/confirm-reservation?id=${reservationId}`)
      const data = await response.json()

      if (data.error) {
        setStatus("error")
        setErrorMessage(data.error)
        return
      }

      setReservation(data.reservation)

      // Check if already confirmed
      if (data.reservation?.confirmed === true) {
        setStatus("already_confirmed")
      } else {
        setStatus("loading")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("Failed to load reservation details")
    }
  }

  const confirmReservation = async () => {
    setStatus("confirming")
    try {
      const response = await fetch(`/api/confirm-reservation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservationId }),
      })

      const data = await response.json()

      if (data.error) {
        setStatus("error")
        setErrorMessage(data.error)
        return
      }

      setStatus("success")
    } catch (error) {
      setStatus("error")
      setErrorMessage("Failed to confirm reservation")
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not specified"
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif text-primary">
            {status === "success" && "Reservation Confirmed!"}
            {status === "already_confirmed" && "Already Confirmed"}
            {status === "error" && "Error"}
            {(status === "loading" || status === "confirming") && "Confirm Your Reservation"}
          </CardTitle>
          <CardDescription>
            {status === "success" && "Thank you for confirming. We look forward to seeing you!"}
            {status === "already_confirmed" && "This reservation has already been confirmed."}
            {status === "error" && errorMessage}
            {status === "loading" && "Please review your reservation details below."}
            {status === "confirming" && "Processing your confirmation..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Icons */}
          {status === "success" && (
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          )}

          {status === "already_confirmed" && (
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-blue-500" />
            </div>
          )}

          {status === "error" && (
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
          )}

          {status === "confirming" && (
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
          )}

          {/* Reservation Details */}
          {reservation && (status === "loading" || status === "success" || status === "already_confirmed") && (
            <div className="space-y-4 bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground">Reservation Details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{reservation.customerName || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(reservation.reservationDate)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{reservation.timeSlot || "Not specified"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Guests:</span>
                  <span className="font-medium">{reservation.numberOfGuests || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {status === "loading" && (
              <Button onClick={confirmReservation} className="w-full bg-primary hover:bg-primary/90">
                Confirm My Reservation
              </Button>
            )}

            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                {status === "success" || status === "already_confirmed" ? "Return to Home" : "Cancel"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
