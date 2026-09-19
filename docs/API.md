# BloodBridge API Specification

This document details the active RESTful API endpoints for the BloodBridge backend.

## Environment Base URL
- Local Development: `http://localhost:5000`

---

## Active Endpoints

### 1. System Health
- **Method**: `GET`
- **Path**: `/api/health`
- **Auth**: None
- **Response**: `{ "status": "ok", "timestamp": "...", "database": "connected" }`

---

### 2. Authentication & User Profile (`/api/auth`)

#### Synchronize Supabase User Profile
- **Method**: `POST`
- **Path**: `/api/auth/sync`
- **Auth**: Bearer `<SUPABASE_ACCESS_TOKEN>`

#### Get Current User
- **Method**: `GET`
- **Path**: `/api/auth/me`

---

### 3. Donor Management (`/api/donors`)

#### Create Donor Profile
- **Method**: `POST`
- **Path**: `/api/donors`
- **Auth**: Bearer `<TOKEN>` (Role: `DONOR` | `ADMIN`)

#### Get Current / Specified Donor Profile
- **Method**: `GET`
- **Path**: `/api/donors/me` / `/api/donors/:id`

#### Update Donor Profile / Availability
- **Method**: `PATCH`
- **Path**: `/api/donors/me` / `/api/donors/me/availability`

---

### 4. Hospital Management (`/api/hospitals`)

#### Create / Get / Update Hospital Profile
- **Method**: `POST` / `GET` / `PATCH`
- **Path**: `/api/hospitals/me`

---

### 5. Blood Requests & Matching Engine (`/api/requests`, `/api/matches`)

#### Create Emergency Blood Request
- **Method**: `POST`
- **Path**: `/api/requests`
- **Auth**: Bearer `<TOKEN>` (Role: `HOSPITAL` | `ADMIN`)

#### List / Get Blood Requests
- **Method**: `GET`
- **Path**: `/api/requests` / `/api/requests/:id`

#### Execute Matching Engine for Request
Generates and persists ranked candidate matches for an emergency blood request.
- **Method**: `POST`
- **Path**: `/api/requests/:id/match`
- **Auth**: Bearer `<TOKEN>` (Owner Hospital or `ADMIN`)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "requestId": "req-uuid",
      "totalMatches": 3,
      "matches": [
        {
          "id": "match-uuid",
          "requestId": "req-uuid",
          "donorId": "donor-uuid",
          "distanceKm": 4.25,
          "matchScore": 92,
          "status": "PENDING",
          "donor": {
            "id": "donor-uuid",
            "bloodGroup": "O_POS",
            "availabilityStatus": "AVAILABLE",
            "verificationStatus": "VERIFIED",
            "user": { "name": "John Doe" }
          }
        }
      ]
    }
  }
  ```

#### Get Ranked Matches for Request
- **Method**: `GET`
- **Path**: `/api/requests/:id/matches`
- **Auth**: Bearer `<TOKEN>` (Owner Hospital or `ADMIN`)

#### Accept Match Request (Donor)
- **Method**: `POST`
- **Path**: `/api/matches/:id/accept`
- **Auth**: Bearer `<TOKEN>` (Matched Donor or `ADMIN`)

#### Decline Match Request (Donor)
- **Method**: `POST`
- **Path**: `/api/matches/:id/reject`
- **Auth**: Bearer `<TOKEN>` (Matched Donor or `ADMIN`)
