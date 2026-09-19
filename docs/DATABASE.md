# BloodBridge Database Specification

## Overview

The database is built on PostgreSQL (hosted on Supabase) and managed using Prisma ORM.

---

## Schema Diagram & Entity Relationships

```
+--------------------+            +--------------------+
|        User        | 1        1 |       Donor        |
|--------------------|<---------->|--------------------|
| id (PK/Supabase)   |            | id (PK)            |
| email              |            | userId (FK, Unique)|
| name               |            | bloodGroup         |
| phone              |            | dateOfBirth        |
| role               |            | lastDonationDate   |
+--------------------+            | latitude/longitude |
          | 1                     | availabilityStatus |
          |                       | verificationStatus |
          v 1                     +--------------------+
+--------------------+                      ^ 1
|      Hospital      |                      |
|--------------------|                      | *
| id (PK)            |            +--------------------+
| userId (FK, Unique)|            |       Match        |
| name               |            |--------------------|
| district           |            | id (PK)            |
| latitude/longitude |            | requestId (FK)     |
+--------------------+            | donorId (FK)       |
          | 1                     | distanceKm         |
          |                       | matchScore         |
          v *                     | status             |
+--------------------+            +--------------------+
|    BloodRequest    |                      ^ *
|--------------------|                      |
| id (PK)            |----------------------+
| hospitalId (FK)    | 1
| bloodGroup         |
| unitsRequired      |
| urgency            |
| status             |
+--------------------+
```

---

## Entity Details

### 1. `User`
Primary user identity entity, mapped 1-to-1 with Supabase Auth (`id` string matching Supabase JWT `sub`).

- `id`: `String` (Primary Key, Supabase Auth UUID)
- `email`: `String` (Unique)
- `name`: `String`
- `phone`: `String?`
- `role`: `UserRole` (`DONOR`, `HOSPITAL`, `ADMIN`)
- `createdAt`, `updatedAt`: `DateTime`

### 2. `Donor`
Donor profile entity attached to a `User` record with role `DONOR`.

- `id`: `String` (Primary Key, UUID)
- `userId`: `String` (Foreign Key -> `User.id`, Unique)
- `bloodGroup`: `BloodGroup` (`A_POS`, `A_NEG`, `B_POS`, `B_NEG`, `AB_POS`, `AB_NEG`, `O_POS`, `O_NEG`)
- `dateOfBirth`: `DateTime?`
- `lastDonationDate`: `DateTime?`
- `latitude`, `longitude`: `Float`
- `availabilityStatus`: `AvailabilityStatus` (`AVAILABLE`, `UNAVAILABLE`, `PAUSED`, default `AVAILABLE`)
- `verificationStatus`: `VerificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`, default `PENDING`)
- **Indexes**: `(bloodGroup, availabilityStatus, verificationStatus)`, `(latitude, longitude)`

### 3. `Hospital`
Hospital profile entity attached to a `User` record with role `HOSPITAL`.

- `id`: `String` (Primary Key, UUID)
- `userId`: `String` (Foreign Key -> `User.id`, Unique)
- `name`: `String`
- `address`: `String`
- `district`: `String`
- `latitude`, `longitude`: `Float`
- `verificationStatus`: `VerificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`, default `PENDING`)
- **Indexes**: `(district)`

### 4. `BloodRequest`
Emergency blood request created by a verified `Hospital`.

- `id`: `String` (Primary Key, UUID)
- `hospitalId`: `String` (Foreign Key -> `Hospital.id`)
- `bloodGroup`: `BloodGroup`
- `unitsRequired`: `Int`
- `urgency`: `UrgencyLevel` (`NORMAL`, `URGENT`, `CRITICAL`, default `URGENT`)
- `latitude`, `longitude`: `Float`
- `requiredBy`: `DateTime`
- `status`: `RequestStatus` (`OPEN`, `MATCHING`, `PARTIALLY_FULFILLED`, `FULFILLED`, `EXPIRED`, `CANCELLED`, default `OPEN`)
- `notes`: `String?`
- **Indexes**: `(status, bloodGroup)`, `(hospitalId)`

### 5. `Match`
Match record pairing a compatible donor with an open blood request.

- `id`: `String` (Primary Key, UUID)
- `requestId`: `String` (Foreign Key -> `BloodRequest.id`)
- `donorId`: `String` (Foreign Key -> `Donor.id`)
- `distanceKm`: `Float`
- `matchScore`: `Int`
- `status`: `MatchStatus` (`PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED`, default `PENDING`)
- `notifiedAt`: `DateTime?`
- `respondedAt`: `DateTime?`
- **Unique Constraint**: `@@unique([requestId, donorId])`
- **Indexes**: `(requestId)`, `(donorId)`, `(status)`

### 6. `DonationRecord`
Historical record created when a donor completes a donation for a request.

- `id`: `String` (Primary Key, UUID)
- `donorId`: `String` (Foreign Key -> `Donor.id`)
- `requestId`: `String` (Foreign Key -> `BloodRequest.id`)
- `hospitalId`: `String` (Foreign Key -> `Hospital.id`)
- `units`: `Int`
- `donatedAt`: `DateTime` (Default `now()`)
- **Indexes**: `(donorId)`, `(hospitalId)`
