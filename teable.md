# Teable Integration Guide

## ⚠️ Critical Rules

1. **Server Actions Only**: Wrap all Teable calls in `"use server"` functions
2. **SQL for Queries**: Use `sqlQuery()` with `dbTableName` and `dbFieldName` from schema
3. **Field IDs for Writes**: Use `fldXXX` IDs when creating/updating records
4. **Double Quotes**: All SQL identifiers must use double quotes: `"schema"."table"`

## Quick Start

\`\`\`typescript
// Server Action
"use server";
import { sqlQuery, createRecord, signAttachments, safeParseJson } from '@/lib/teable';

// Query (use dbTableName/dbFieldName from schema)
export async function getUsers() {
  const { rows } = await sqlQuery('bseXXX', 
    `SELECT "__id", "fld_name", "fld_status" FROM "bseXXX"."tbl_users" WHERE "fld_status" = 'Active' LIMIT 100`
  );
  return rows;
}

// Aggregation
export async function getStats() {
  const { rows } = await sqlQuery('bseXXX',
    `SELECT COUNT(*) as "total", SUM(CAST("fld_amount" AS numeric)) as "sum" FROM "bseXXX"."tbl_orders"`
  );
  return rows[0];
}

// Create (use field IDs)
export async function addUser(name: string) {
  return createRecord('tblXXX', { fldName: name, fldStatus: 'Active' });
}
\`\`\`

## SQL Reference

| Rule | Example |
|------|---------|
| Table name | `"bseXXX"."tbl_users"` (from `dbTableName`) |
| Field name | `"fld_name"` (from `dbFieldName`) |
| Record ID | `"__id"` |
| String value | `'Active'` (single quotes) |
| Always add | `LIMIT 100` for non-aggregate queries |

### Field Type → SQL

| Type | SQL Usage |
|------|-----------|
| text | `"fld_name" = 'value'` |
| number | `CAST("fld_amount" AS numeric)` for SUM/AVG |
| checkbox | `"fld_done" = true` |
| singleSelect | `"fld_status" = 'Active'` |
| multipleSelect | `"fld_tags" @> '["tag1"]'` |
| date | `"fld_date" > '2024-01-01'` |
| attachment | Parse JSON, use `signAttachments()` |

### Link Field (Important!)

Single-value links have **two columns**: JSON (`dbFieldName`) and FK (`options.foreignKeyName`).

| Type | JSON Column | FK Column |
|------|-------------|-----------|
| Single (ManyOne/OneOne) | `{"id":"recXXX","title":"..."}` | `"__fk_fldXXX"` = `recXXX` |
| Multi (OneMany/ManyMany) | `[{"id":".."},{}]` | N/A (use JSON) |

**⚠️ For single-value links, prefer FK column (more reliable):**

\`\`\`sql
-- ✅ BEST: Use FK column for JOIN (find foreignKeyName in schema options)
SELECT t.*, p."fld_name" as "project_name"
FROM "bseXXX"."tbl_tasks" t
LEFT JOIN "bseXXX"."tbl_projects" p ON p."__id" = t."__fk_fldProject";

-- Group by linked record using FK
SELECT t."__fk_fldProject", p."fld_name", COUNT(*) as "count"
FROM "bseXXX"."tbl_tasks" t
LEFT JOIN "bseXXX"."tbl_projects" p ON p."__id" = t."__fk_fldProject"
GROUP BY 1, 2;

-- ⚠️ JSON extraction (may be null/malformed)
SELECT "fld_project"::jsonb->>'id' as "project_id" FROM "bseXXX"."tbl_tasks";
\`\`\`

**Multi-value links (use JSON):**
\`\`\`sql
SELECT * FROM "bseXXX"."tbl_projects" WHERE "fld_tasks"::jsonb @> '[{"id":"recXXX"}]';
SELECT "fld_name", jsonb_array_length("fld_tasks"::jsonb) as "count" FROM "bseXXX"."tbl_projects";
\`\`\`

### User Field

User fields: `{ id, title, email? }`. Check `isMultipleCellValue` for single vs multi.

\`\`\`sql
-- Single user
SELECT "fld_assignee"::jsonb->>'id' as "user_id", "fld_assignee"::jsonb->>'title' as "user_name"
FROM "bseXXX"."tbl_tasks";

-- Multi user: check contains
SELECT * FROM "bseXXX"."tbl_tasks" WHERE "fld_members"::jsonb @> '[{"id":"usrXXX"}]';
\`\`\`

## Attachments

Batch ALL attachments in ONE request:

\`\`\`typescript
const { rows } = await sqlQuery(baseId, `SELECT "__id", "fld_files" FROM "bseXXX"."tbl_docs" LIMIT 50`);

// Collect all attachments (use safeParseJson from above)
const all = rows.flatMap(row => {
  const files = safeParseJson(row.fld_files) || [];
  return files.map((f: any) => ({ ...f, rowId: row.__id }));
});

// Sign once
const signed = await signAttachments(baseId, all);
\`\`\`

## Write Operations

Use field IDs (`fldXXX`), not `dbFieldName`:

\`\`\`typescript
await createRecord('tblXXX', { fldName: 'Task', fldStatus: 'Pending' });
await updateRecord('tblXXX', 'recXXX', { fldStatus: 'Done' });
await deleteRecord('tblXXX', 'recXXX');
\`\`\`

| Type | Format |
|------|--------|
| Text | `"value"` |
| Number | `123.45` |
| Checkbox | `true` / `false` |
| Date | `"2024-01-15T00:00:00.000Z"` |
| Select | `"Option"` or `["A", "B"]` |
| User/Link | `["usrXXX"]` / `["recXXX"]` |

## ⚠️ Common Mistakes

### 1. Wrong field name
\`\`\`sql
-- ❌ SELECT "Access Key" FROM ...     (uses 'name' with spaces)
-- ✅ SELECT "Access_Key" FROM ...     (uses 'dbFieldName')
\`\`\`

### 2. Missing quotes
\`\`\`sql
-- ❌ SELECT fld_name FROM bseXXX.users
-- ✅ SELECT "fld_name" FROM "bseXXX"."users"
\`\`\`

### 3. Reserved words (must quote)
`"Group"`, `"Order"`, `"User"`, `"Date"`, `"Name"`, `"Status"`, `"Type"`, `"Key"`

### 4. Alias without quotes
\`\`\`sql
-- ❌ SELECT "Group" as group FROM ...
-- ✅ SELECT "Group" as "group_name" FROM ...
\`\`\`

### 5. Quote rule
- **Double quotes** `"..."` → identifiers (tables, fields, aliases)
- **Single quotes** `'...'` → string values

### 6. JSON field parsing
JSON fields (User, Link, Attachment) may be string OR already-parsed object. Always use safe parse:

\`\`\`typescript
function safeParseJson(value: unknown): any {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return null;
}

// Usage
const user = safeParseJson(row.fld_assignee);
const attachments = safeParseJson(row.fld_files) || [];
\`\`\`

## Schema Files

`schema/table-{id}.json` contains:
- `dbTableName`: Use in SQL (e.g., `"bseXXX"."tbl_xxx"`)
- `fields[].dbFieldName`: Column name for SQL
- `fields[].id`: Field ID for write operations
- `fields[].isMultipleCellValue`: true = multi-value (link/user)
- `fields[].options.foreignKeyName`: FK column for single-value link (e.g., `"__fk_fldXXX"`)

## Runtime

Keep `<ErrorReporter />` in `app/layout.tsx`.

## Teable Resources Context

### Current Teable Base

- Base ID: `bseAChAwHk1SZHNggO2`
- Use this `baseId` for any API that requires a base identifier

### Teable Resources Schema

All Teable table schemas are stored as JSON files under the `schema/` directory of this project.

Available tables (id → name → schema file):

- `tbl6fU40l1eGopfdmr5` → New table 11 → `schema/table-tbl6fU40l1eGopfdmr5.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_11"`)
- `tbltLExLgmcp6gP5kNS` → Makeup Products → `schema/table-tbltLExLgmcp6gP5kNS.json` (SQL: `"bseAChAwHk1SZHNggO2"."Cai_Zhuang_Chan_Pin_Ku"`)
- `tblMvHrzOt2BYRqXfTU` → Makeup Looks → `schema/table-tblMvHrzOt2BYRqXfTU.json` (SQL: `"bseAChAwHk1SZHNggO2"."Se_Xi_Da_Pei_Fang_An"`)
- `tblRKz4H7flO88kmiCj` → Bills & Payments → `schema/table-tblRKz4H7flO88kmiCj.json` (SQL: `"bseAChAwHk1SZHNggO2"."Bills_Payments"`)
- `tblqxH0Vz9whAA8e0r9` → Smart Bill Collection → `schema/table-tblqxH0Vz9whAA8e0r9.json` (SQL: `"bseAChAwHk1SZHNggO2"."Smart_Bill_Collection"`)
- `tblF8LubVxXr65Zq2wA` → 繁花与利剑2025年12月5日-2026年4月6日 → `schema/table-tblF8LubVxXr65Zq2wA.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table"`)
- `tblVj1cakTjnHzXwk14` → 莫卧儿珍宝展品 → `schema/table-tblVj1cakTjnHzXwk14.json` (SQL: `"bseAChAwHk1SZHNggO2"."Mo_Wo_Er_Zhen_Bao_Zhan_Pin"`)
- `tblSD9rCSplrJE6mTfa` → 观众评论 → `schema/table-tblSD9rCSplrJE6mTfa.json` (SQL: `"bseAChAwHk1SZHNggO2"."Guan_Zhong_Ping_Lun"`)
- `tbljCRcjyfeacwPywOg` → Events → `schema/table-tbljCRcjyfeacwPywOg.json` (SQL: `"bseAChAwHk1SZHNggO2"."Events"`)
- `tblMUeVFWXDpYFChdgd` → Time Slots → `schema/table-tblMUeVFWXDpYFChdgd.json` (SQL: `"bseAChAwHk1SZHNggO2"."Reservation_Slots"`)
- `tblIz9nhFBYofTkFgLI` → Dishes → `schema/table-tblIz9nhFBYofTkFgLI.json` (SQL: `"bseAChAwHk1SZHNggO2"."Dishes"`)
- `tblpcTrBgV01avhTVog` → New table → `schema/table-tblpcTrBgV01avhTVog.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_tableGhasfm7ist"`)
- `tblFAuhsl498eGCdBgF` → 客户信息 → `schema/table-tblFAuhsl498eGCdBgF.json` (SQL: `"bseAChAwHk1SZHNggO2"."Ke_Hu_Xin_Xi"`)
- `tbl8IWSwBFdElXMHHNy` → 销售跟进 → `schema/table-tbl8IWSwBFdElXMHHNy.json` (SQL: `"bseAChAwHk1SZHNggO2"."Xiao_Shou_Gen_Jin"`)
- `tbloP9hLMO03MV8ixLU` → 合同管理 → `schema/table-tbloP9hLMO03MV8ixLU.json` (SQL: `"bseAChAwHk1SZHNggO2"."He_Tong_Guan_Li"`)
- `tblVdbyg4Qb0aVzeZh1` → 财务收款 → `schema/table-tblVdbyg4Qb0aVzeZh1.json` (SQL: `"bseAChAwHk1SZHNggO2"."Cai_Wu_Shou_Kuan"`)
- `tblNyxiv46lhgveMLNi` → New table 2 → `schema/table-tblNyxiv46lhgveMLNi.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_2"`)
- `tblA28H8X9sETWGQl90` → Amazon Customer Reviews → `schema/table-tblA28H8X9sETWGQl90.json` (SQL: `"bseAChAwHk1SZHNggO2"."Amazon_Customer_Reviews"`)
- `tblJQmqWVgJHhgapGVR` → New table 3 → `schema/table-tblJQmqWVgJHhgapGVR.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_3"`)
- `tblLYBMuWXVLI7pEcEA` → Iceland Trip - Bookings → `schema/table-tblLYBMuWXVLI7pEcEA.json` (SQL: `"bseAChAwHk1SZHNggO2"."Iceland_Trip_Bookings"`)
- `tblL03EF7zktMKqErE7` → Iceland Trip - Itinerary → `schema/table-tblL03EF7zktMKqErE7.json` (SQL: `"bseAChAwHk1SZHNggO2"."Iceland_Trip_Itinerary"`)
- `tblDXlnehKNRyazfQOP` → Iceland Trip - Photos → `schema/table-tblDXlnehKNRyazfQOP.json` (SQL: `"bseAChAwHk1SZHNggO2"."Iceland_Trip_Photos"`)
- `tbl1otasEZs0ZbHYo9h` → Iceland Trip - Expenses → `schema/table-tbl1otasEZs0ZbHYo9h.json` (SQL: `"bseAChAwHk1SZHNggO2"."Iceland_Trip_Expenses"`)
- `tbl2hgRlMXiZricsoZv` → Iceland Trip - Discussions → `schema/table-tbl2hgRlMXiZricsoZv.json` (SQL: `"bseAChAwHk1SZHNggO2"."Iceland_Trip_Discussions"`)
- `tblIRxZUQsJYaiwejCR` → Iceland Trip - Travelers → `schema/table-tblIRxZUQsJYaiwejCR.json` (SQL: `"bseAChAwHk1SZHNggO2"."Iceland_Trip_Travelers"`)
- `tblSl1kuDT7Uf0m8ag4` → New table 4 → `schema/table-tblSl1kuDT7Uf0m8ag4.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_4"`)
- `tblEBIv66Xc6dz5jMci` → Sales Pipeline → `schema/table-tblEBIv66Xc6dz5jMci.json` (SQL: `"bseAChAwHk1SZHNggO2"."Sales_Pipeline"`)
- `tbleT41s1t6QfOnLfLo` → New table 5 → `schema/table-tbleT41s1t6QfOnLfLo.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_5"`)
- `tblCmduD2AxYjefNBMW` → New table 6 → `schema/table-tblCmduD2AxYjefNBMW.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_6"`)
- `tblHq1HhkCGbKyYpZlC` → Receipt Tracker → `schema/table-tblHq1HhkCGbKyYpZlC.json` (SQL: `"bseAChAwHk1SZHNggO2"."Receipt_Tracker"`)
- `tblAlIfTmQUQQRWlcxP` → CRM - Companies → `schema/table-tblAlIfTmQUQQRWlcxP.json` (SQL: `"bseAChAwHk1SZHNggO2"."CRM_Companies"`)
- `tblMFBuSzEcDjRgDuqm` → CRM - Contacts → `schema/table-tblMFBuSzEcDjRgDuqm.json` (SQL: `"bseAChAwHk1SZHNggO2"."CRM_Contacts"`)
- `tblm8YxHZpXRtJeANwX` → CRM - Tasks → `schema/table-tblm8YxHZpXRtJeANwX.json` (SQL: `"bseAChAwHk1SZHNggO2"."CRM_Tasks"`)
- `tblbltjuYtAfVpXEoP7` → CRM - Invoices → `schema/table-tblbltjuYtAfVpXEoP7.json` (SQL: `"bseAChAwHk1SZHNggO2"."CRM_Invoices"`)
- `tblGj6hp8mV1AFSHll7` → CRM - Deals → `schema/table-tblGj6hp8mV1AFSHll7.json` (SQL: `"bseAChAwHk1SZHNggO2"."CRM_Deals"`)
- `tblL5BmY6I2MLWqvBmW` → CRM - Activities → `schema/table-tblL5BmY6I2MLWqvBmW.json` (SQL: `"bseAChAwHk1SZHNggO2"."CRM_Activities"`)
- `tblDrCApgqpmyRz360h` → New table 7 → `schema/table-tblDrCApgqpmyRz360h.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_7"`)
- `tblbK2Cu7Edec8xDQYL` → New table 8 → `schema/table-tblbK2Cu7Edec8xDQYL.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_8"`)
- `tbluKh77AImnulYTUDh` → Barista Staff → `schema/table-tbluKh77AImnulYTUDh.json` (SQL: `"bseAChAwHk1SZHNggO2"."Barista_Staff"`)
- `tblh8TMAfxZ5mlDJFWu` → Availability → `schema/table-tblh8TMAfxZ5mlDJFWu.json` (SQL: `"bseAChAwHk1SZHNggO2"."Availability"`)
- `tblarOTcY7wPxBX5KrL` → Shift Schedules → `schema/table-tblarOTcY7wPxBX5KrL.json` (SQL: `"bseAChAwHk1SZHNggO2"."Shift_Schedules"`)
- `tbl8nu0lFB1ol269v2f` → Time Off Requests → `schema/table-tbl8nu0lFB1ol269v2f.json` (SQL: `"bseAChAwHk1SZHNggO2"."Time_Off_Requests"`)
- `tblxSzQ26BxyhAbYy4h` → New table 9 → `schema/table-tblxSzQ26BxyhAbYy4h.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_9qyuHmUfIeB"`)
- `tblVvdAcc1peNtwJhDS` → Job Candidates → `schema/table-tblVvdAcc1peNtwJhDS.json` (SQL: `"bseAChAwHk1SZHNggO2"."Job_Candidates"`)
- `tbltrS9IbDBOfXeeTpg` → New table 10 → `schema/table-tbltrS9IbDBOfXeeTpg.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_10"`)
- `tbluxlDnJfcttcJB8zn` → Candidate Resumes → `schema/table-tbluxlDnJfcttcJB8zn.json` (SQL: `"bseAChAwHk1SZHNggO2"."Candidate_Resumes"`)
- `tblxs6uzkSO6IUN4Jii` → Events Copy → `schema/table-tblxs6uzkSO6IUN4Jii.json` (SQL: `"bseAChAwHk1SZHNggO2"."Events_Copy"`)
- `tbljwrF2f1Q31FLfAUa` → Dishes Copy → `schema/table-tbljwrF2f1Q31FLfAUa.json` (SQL: `"bseAChAwHk1SZHNggO2"."Dishes_Copy"`)
- `tblXSYlI9xolIlqniRI` → Slots Copy → `schema/table-tblXSYlI9xolIlqniRI.json` (SQL: `"bseAChAwHk1SZHNggO2"."Slots_Copy"`)
- `tbldsbsykCHAoTIVGYB` → Restaurant Setting → `schema/table-tbldsbsykCHAoTIVGYB.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_12hSIVXTPG3b"`)
- `tblCw3ypByBcUZubGd0` → Reservations → `schema/table-tblCw3ypByBcUZubGd0.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_12xP0VoLvG7X"`)
- `tblcYs2ZTtso4FBKnK2` → confirm → `schema/table-tblcYs2ZTtso4FBKnK2.json` (SQL: `"bseAChAwHk1SZHNggO2"."New_table_12GQcgsAEWmr"`)
- `tblc2zXr4fyus93YeF3` → 预约待确认 → `schema/table-tblc2zXr4fyus93YeF3.json` (SQL: `"bseAChAwHk1SZHNggO2"."Yu_Yue_Dai_Que_Ren"`)
- `tbl9yVwEAnhnyQdBmas` → 员工信息 → `schema/table-tbl9yVwEAnhnyQdBmas.json` (SQL: `"bseAChAwHk1SZHNggO2"."Yuan_Gong_Xin_Xi"`)
- `tblPXZsjaVoIxdwOocs` → 月度工资 → `schema/table-tblPXZsjaVoIxdwOocs.json` (SQL: `"bseAChAwHk1SZHNggO2"."Yue_Du_Gong_Zi"`)
- `tblTF5r5r0xfRWIeANQ` → 银行发薪导入表 → `schema/table-tblTF5r5r0xfRWIeANQ.json` (SQL: `"bseAChAwHk1SZHNggO2"."Yin_Xing_Fa_Xin_Dao_Ru_BiaoYpQPBhB222"`)
