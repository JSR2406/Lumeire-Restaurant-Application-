/**
 * Teable API Client - Server-side only
 * @description Streamlined API client with SQL query as the primary data access method
 *
 * ⚠️ IMPORTANT: This module must only be used in server-side code (API routes, server actions).
 * Never import this in client-side components.
 */

import "../temp.ts"

import type {
  RecordFields,
  IRecord,
  ICreateRecordsInput,
  ICreateRecordsResponse,
  IUpdateRecordsInput,
  IAttachmentSignatureInput,
  IAttachmentSignatureResponse,
  IAttachmentNotifyResponse,
} from "./teable.types"

// Re-export types for convenience
export type * from "./teable.types"

// ============================================================================
// Configuration
// ============================================================================

const BASE_ID = "bseAChAwHk1SZHNggO2"

const TABLES = {
  Dishes: `"${BASE_ID}"."Dishes"`,
  Events: `"${BASE_ID}"."Events"`,
  TimeSlots: `"${BASE_ID}"."Reservation_Slots"`,
  Reservations: `"${BASE_ID}"."New_table_12xP0VoLvG7X"`,
}

function getConfig() {
  const baseUrl = process.env.TEABLE_API_URL
  const token = process.env.TEABLE_APP_TOKEN

  if (!baseUrl || !token) {
    return null
  }

  return { baseUrl, token }
}

export function isTeableConfigured(): boolean {
  const baseUrl = process.env.TEABLE_API_URL
  const token = process.env.TEABLE_APP_TOKEN
  return Boolean(baseUrl && token)
}

export function getConfigError(): string | null {
  const baseUrl = process.env.TEABLE_API_URL
  const token = process.env.TEABLE_APP_TOKEN

  if (!baseUrl) {
    return "TEABLE_API_URL environment variable is not set"
  }
  if (!token) {
    return "TEABLE_APP_TOKEN environment variable is not set"
  }
  return null
}

// ============================================================================
// HTTP Client
// ============================================================================

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  params?: Record<string, unknown>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const config = getConfig()

  if (!config) {
    throw new Error(getConfigError() || "Teable API not configured")
  }

  const { baseUrl, token } = config
  const { method = "GET", body, params } = options

  let url = `${baseUrl}/api${endpoint}`
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(`Teable API Error [${response.status}]: ${error.message || "Unknown error"}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

// ============================================================================
// SQL Query API (Primary Data Access Method)
// ============================================================================

interface ISqlQueryResponse {
  rows: Record<string, unknown>[]
}

/**
 * Execute SQL query on the database (READ-ONLY)
 */
export async function sqlQuery(baseId: string, sql: string): Promise<ISqlQueryResponse> {
  return request<ISqlQueryResponse>(`/base/${baseId}/sql-query`, {
    method: "POST",
    body: { sql },
  })
}

// ============================================================================
// JSON Parsing Utility
// ============================================================================

/**
 * Safely parse JSON fields from SQL results.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeParseJson(value: unknown): any {
  if (!value) return null
  if (typeof value === "object") return value
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return null
}

// ============================================================================
// Attachment URL Signing
// ============================================================================

/**
 * Sign attachment URLs to get presigned URLs for browser display.
 */
export async function signAttachments<T extends { path: string; token: string; mimetype?: string }>(
  baseId: string,
  attachments: T[],
): Promise<Array<T & { presignedUrl: string }>> {
  if (!attachments || attachments.length === 0) return []

  const response = await request<{ attachments: { token: string; url: string }[] }>(
    `/base/${baseId}/sign-attachment-urls`,
    {
      method: "POST",
      body: { attachments: attachments.map((att) => ({ path: att.path, token: att.token, mimetype: att.mimetype })) },
    },
  )

  const urlMap = new Map(response.attachments.map((s) => [s.token, s.url]))

  return attachments.map((att) => ({
    ...att,
    presignedUrl: urlMap.get(att.token) || "",
  }))
}

// ============================================================================
// Records Write API (Create/Update/Delete)
// ============================================================================

export async function createRecords(tableId: string, records: ICreateRecordsInput[]): Promise<ICreateRecordsResponse> {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("Records must be a non-empty array")
  }

  return request<ICreateRecordsResponse>(`/table/${tableId}/record`, {
    method: "POST",
    body: {
      fieldKeyType: "id",
      typecast: true,
      records,
    },
  })
}

export async function createRecord(tableId: string, fields: RecordFields): Promise<IRecord> {
  const { records } = await createRecords(tableId, [{ fields }])
  return records[0]
}

export async function updateRecord(tableId: string, recordId: string, fields: RecordFields): Promise<IRecord> {
  return request<IRecord>(`/table/${tableId}/record/${recordId}`, {
    method: "PATCH",
    body: {
      fieldKeyType: "id",
      typecast: true,
      record: { fields },
    },
  })
}

export async function updateRecords(tableId: string, records: IUpdateRecordsInput[]): Promise<IRecord[]> {
  const response = await request<{ records: IRecord[] }>(`/table/${tableId}/record`, {
    method: "PATCH",
    body: {
      fieldKeyType: "id",
      typecast: true,
      records,
    },
  })
  return response.records
}

export async function deleteRecord(tableId: string, recordId: string): Promise<void> {
  await request(`/table/${tableId}/record/${recordId}`, { method: "DELETE" })
}

export async function deleteRecords(tableId: string, recordIds: string[]): Promise<void> {
  await request(`/table/${tableId}/record`, {
    method: "DELETE",
    params: { recordIds: recordIds.join(",") },
  })
}

// ============================================================================
// Attachments API
// ============================================================================

export async function getAttachmentSignature(input: IAttachmentSignatureInput): Promise<IAttachmentSignatureResponse> {
  return request<IAttachmentSignatureResponse>("/attachments/signature", {
    method: "POST",
    body: {
      ...input,
      type: 1,
    },
  })
}

export async function notifyAttachmentUpload(token: string, filename: string): Promise<IAttachmentNotifyResponse> {
  return request<IAttachmentNotifyResponse>(`/attachments/notify/${token}`, {
    method: "POST",
    params: { filename },
  })
}

export async function uploadAttachmentToRecord(
  tableId: string,
  recordId: string,
  fieldId: string,
  file: Blob | { url: string },
): Promise<void> {
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/api/table/${tableId}/record/${recordId}/${fieldId}/uploadAttachment`

  const formData = new FormData()
  if ("url" in file) {
    formData.append("fileUrl", file.url)
  } else {
    formData.append("file", file)
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(`Teable API Error [${response.status}]: ${error.message || "Unknown error"}`)
  }
}

export async function uploadNewAttachment(
  file: Blob,
  filename: string,
  baseId?: string,
): Promise<{ name: string; token: string }> {
  const signature = await getAttachmentSignature({
    contentType: file.type || "application/octet-stream",
    contentLength: file.size,
    baseId,
  })

  const uploadHeaders: Record<string, string> = { ...signature.requestHeaders }
  delete uploadHeaders["Content-Length"]

  const uploadResponse = await fetch(signature.url, {
    method: signature.uploadMethod,
    headers: uploadHeaders,
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file to storage: ${uploadResponse.statusText}`)
  }

  const notifyResult = await notifyAttachmentUpload(signature.token, filename)

  return {
    name: filename,
    token: notifyResult.token,
  }
}

// ============================================================================
// Domain-Specific Functions (Using SQL Query)
// ============================================================================

export async function getDishes() {
  const { rows } = await sqlQuery(
    BASE_ID,
    `SELECT 
      "__id",
      "Dish_Name",
      "Description",
      "Price",
      "Category",
      "Ingredients",
      "Image",
      "Available",
      "Featured"
    FROM ${TABLES.Dishes}
    WHERE "Available" = true
    ORDER BY "Category", "Dish_Name"
    LIMIT 100`,
  )

  const allAttachments: Array<{ path: string; token: string; mimetype?: string; rowId: string }> = []
  rows.forEach((row) => {
    const images = safeParseJson(row.Image) || []
    images.forEach((img: { path: string; token: string; mimetype?: string }) => {
      allAttachments.push({ ...img, rowId: row.__id as string })
    })
  })

  let signedMap = new Map<string, string>()
  if (allAttachments.length > 0) {
    const signedAttachments = await signAttachments(BASE_ID, allAttachments)
    signedMap = new Map(signedAttachments.map((a) => [`${a.rowId}-${a.token}`, a.presignedUrl]))
  }

  return rows.map((row) => {
    const images = safeParseJson(row.Image) || []
    const signedImages = images.map((img: { path: string; token: string }) => ({
      ...img,
      presignedUrl: signedMap.get(`${row.__id}-${img.token}`) || "",
    }))

    return {
      id: row.__id as string,
      name: row.Dish_Name as string,
      description: row.Description as string,
      price: row.Price as number,
      category: row.Category as string,
      ingredients: row.Ingredients as string,
      image: signedImages[0]?.presignedUrl || null,
      available: row.Available as boolean,
      featured: row.Featured as boolean,
    }
  })
}

export async function getFeaturedDishes() {
  const { rows } = await sqlQuery(
    BASE_ID,
    `SELECT 
      "__id",
      "Dish_Name",
      "Description",
      "Price",
      "Category",
      "Ingredients",
      "Image",
      "Available",
      "Featured"
    FROM ${TABLES.Dishes}
    WHERE "Featured" = true AND "Available" = true
    ORDER BY "Category", "Dish_Name"
    LIMIT 20`,
  )

  const allAttachments: Array<{ path: string; token: string; mimetype?: string; rowId: string }> = []
  rows.forEach((row) => {
    const images = safeParseJson(row.Image) || []
    images.forEach((img: { path: string; token: string; mimetype?: string }) => {
      allAttachments.push({ ...img, rowId: row.__id as string })
    })
  })

  let signedMap = new Map<string, string>()
  if (allAttachments.length > 0) {
    const signedAttachments = await signAttachments(BASE_ID, allAttachments)
    signedMap = new Map(signedAttachments.map((a) => [`${a.rowId}-${a.token}`, a.presignedUrl]))
  }

  return rows.map((row) => {
    const images = safeParseJson(row.Image) || []
    const signedImages = images.map((img: { path: string; token: string }) => ({
      ...img,
      presignedUrl: signedMap.get(`${row.__id}-${img.token}`) || "",
    }))

    return {
      id: row.__id as string,
      name: row.Dish_Name as string,
      description: row.Description as string,
      price: row.Price as number,
      category: row.Category as string,
      ingredients: row.Ingredients as string,
      image: signedImages[0]?.presignedUrl || null,
      available: row.Available as boolean,
      featured: row.Featured as boolean,
    }
  })
}

export async function getEvents() {
  const { rows } = await sqlQuery(
    BASE_ID,
    `SELECT 
      "__id",
      "Event_Name",
      "Description",
      "Ingredients",
      "price",
      "Event_Date",
      "Event_Date_Copy",
      "Status",
      "Image"
    FROM ${TABLES.Events}
    WHERE "Status" IN ('Upcoming', 'Ongoing')
    ORDER BY "Event_Date"
    LIMIT 50`,
  )

  const allAttachments: Array<{ path: string; token: string; mimetype?: string; rowId: string }> = []
  rows.forEach((row) => {
    const images = safeParseJson(row.Image) || []
    images.forEach((img: { path: string; token: string; mimetype?: string }) => {
      allAttachments.push({ ...img, rowId: row.__id as string })
    })
  })

  let signedMap = new Map<string, string>()
  if (allAttachments.length > 0) {
    const signedAttachments = await signAttachments(BASE_ID, allAttachments)
    signedMap = new Map(signedAttachments.map((a) => [`${a.rowId}-${a.token}`, a.presignedUrl]))
  }

  return rows.map((row) => {
    const images = safeParseJson(row.Image) || []
    const signedImages = images.map((img: { path: string; token: string }) => ({
      ...img,
      presignedUrl: signedMap.get(`${row.__id}-${img.token}`) || "",
    }))

    return {
      id: row.__id as string,
      name: row.Event_Name as string,
      description: row.Description as string,
      highlights: row.Ingredients as string,
      price: row.price as number,
      startDate: row.Event_Date as string,
      endDate: row.Event_Date_Copy as string,
      status: row.Status as string,
      image: signedImages[0]?.presignedUrl || null,
    }
  })
}

export async function getAvailableDatesWithRecords() {
  const { rows } = await sqlQuery(
    BASE_ID,
    `SELECT 
      "__id",
      "Date"
    FROM ${TABLES.TimeSlots}
    WHERE "Date" >= CURRENT_DATE
    ORDER BY "Date"
    LIMIT 100`,
  )

  return rows.map((row) => ({
    recordId: row.__id as string,
    date: row.Date as string,
  }))
}

export async function getTimeSlotsForDate(date: string) {
  const { rows } = await sqlQuery(
    BASE_ID,
    `SELECT 
      "__id",
      "Date",
      "Time_Slot_Copy" as "slot_a",
      "Time_Slot" as "slot_b",
      "Time_Slot_Copy_2" as "slot_c",
      "Time_Slot_Copy_2_Copy" as "slot_d",
      "Time_Slot_Copy_2_Copy_Copy" as "slot_e",
      "Time_Slot_E_Copy" as "slot_f"
    FROM ${TABLES.TimeSlots}
    WHERE "Date"::date = '${date}'::date
    LIMIT 1`,
  )

  if (rows.length === 0) {
    return { slots: [], recordId: null }
  }

  const row = rows[0]
  const slots: string[] = []

  if (row.slot_a) slots.push(row.slot_a as string)
  if (row.slot_b) slots.push(row.slot_b as string)
  if (row.slot_c) slots.push(row.slot_c as string)
  if (row.slot_d) slots.push(row.slot_d as string)
  if (row.slot_e) slots.push(row.slot_e as string)
  if (row.slot_f) slots.push(row.slot_f as string)

  return {
    slots,
    recordId: row.__id as string,
  }
}

interface ReservationData {
  customerName: string
  email: string
  phone: string
  numberOfGuests: number
  specialRequests?: string
  date: string
  timeSlot: string
  slotRecordId?: string
}

export async function createReservation(data: ReservationData) {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.floor(1000 + Math.random() * 9000)
  const reservationId = `RSV-${dateStr}-${random}`

  const RESERVATIONS_TABLE_ID = "tblCw3ypByBcUZubGd0"

  const fields: RecordFields = {
    fldyInOgkAtn2oARMV6: reservationId,
    fldnd9FOYwlNkZS3HIy: data.customerName,
    fldYOukZjq5XESmQrIZ: data.email,
    fldNH8aUBclxtM9Twbc: data.phone,
    fld2KphH1VLSNWVGrFG: data.numberOfGuests,
    fldUUVFJ9Tfi36g0hVW: data.date,
    fldOA5JfXwAKYBCbMVh: data.timeSlot,
    fldRhCbLtUvtgJwPpkM: data.specialRequests || "",
    fldPY8bjN3Mdug2FkHR: false,
  }

  if (data.slotRecordId) {
    fields.fldWDEBMWTd32E832aS = [data.slotRecordId]
  }

  const record = await createRecord(RESERVATIONS_TABLE_ID, fields)

  return {
    ...record,
    reservationId,
  }
}

export async function confirmReservation(recordId: string) {
  const RESERVATIONS_TABLE_ID = "tblCw3ypByBcUZubGd0"

  return updateRecord(RESERVATIONS_TABLE_ID, recordId, {
    fldPY8bjN3Mdug2FkHR: true,
  })
}

export async function getReservation(recordId: string) {
  const { rows } = await sqlQuery(
    BASE_ID,
    `SELECT 
      "__id",
      "Label" as "reservation_id",
      "Customer_Name",
      "Email",
      "Phone",
      "Number_of_Guests",
      "Reservation_Date",
      "Time_Slot",
      "Special_Requests",
      "Confirm",
      "Created_Time"
    FROM ${TABLES.Reservations}
    WHERE "__id" = '${recordId}'
    LIMIT 1`,
  )

  if (rows.length === 0) {
    return null
  }

  const row = rows[0]
  return {
    id: row.__id as string,
    reservationId: row.reservation_id as string,
    customerName: row.Customer_Name as string,
    email: row.Email as string,
    phone: row.Phone as string,
    numberOfGuests: row.Number_of_Guests as number,
    reservationDate: row.Reservation_Date as string,
    timeSlot: row.Time_Slot as string,
    specialRequests: row.Special_Requests as string,
    confirmed: row.Confirm as boolean,
    createdTime: row.Created_Time as string,
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const teable = {
  sqlQuery,
  safeParseJson,
  signAttachments,
  createRecord,
  createRecords,
  updateRecord,
  updateRecords,
  deleteRecord,
  deleteRecords,
  getAttachmentSignature,
  notifyAttachmentUpload,
  uploadAttachmentToRecord,
  uploadNewAttachment,
  getDishes,
  getFeaturedDishes,
  getEvents,
  getAvailableDatesWithRecords,
  getTimeSlotsForDate,
  createReservation,
  confirmReservation,
  getReservation,
}

export default teable
