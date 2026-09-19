# BloodBridge Matching Engine Specification

## Overview & Design Principles

The BloodBridge Donor Matching Engine is a deterministic, rule-based algorithm designed to rank compatible donors for emergency hospital blood requests.

### Implementation Status
- **Status**: FULLY IMPLEMENTED & TESTED (Phase 3)
- **Pipeline Architecture**: Modular services in `backend/src/services/matching/`

---

## 1. Matching Pipeline Stages

```
             [ Blood Request ]
                     |
                     v
      +-----------------------------+
      | 1. Database Pre-Filtering   |  (AVAILABLE, VERIFIED, Compatible Blood Groups)
      +--------------+--------------+
                     |
                     v
      +-----------------------------+
      | 2. Compatibility Service    |  (Deterministic ABO/Rh Matrix)
      +--------------+--------------+
                     |
                     v
      +-----------------------------+
      | 3. Eligibility Service      |  (Donation Gap >= 56 Days, Verification)
      +--------------+--------------+
                     |
                     v
      +-----------------------------+
      | 4. Haversine Distance       |  (Straight-line km calculation)
      +--------------+--------------+
                     |
                     v
      +-----------------------------+
      | 5. Priority Ranking Engine  |  (Deterministic Match Priority Score 0 - 100)
      +--------------+--------------+
                     |
                     v
             [ Ranked Donors ]
                     |
                     v
             [ Atomic Matches ]
```

---

## 2. Blood Compatibility Rules (ABO / Rh Red-Cell Compatibility)

Medical blood compatibility is strictly rule-based and deterministic. AI is never involved in medical compatibility.

| Donor Blood Group | Compatible Recipient Blood Groups |
| :--- | :--- |
| **O-** (Universal Donor) | O-, O+, A-, A+, B-, B+, AB-, AB+ |
| **O+** | O+, A+, B+, AB+ |
| **A-** | A-, A+, AB-, AB+ |
| **A+** | A+, AB+ |
| **B-** | B-, B+, AB-, AB+ |
| **B+** | B+, AB+ |
| **AB-** | AB-, AB+ |
| **AB+** | AB+ (Universal Recipient) |

---

## 3. Eligibility Rules

Donors enter the active candidate pool only when all eligibility conditions pass:
1. **Verification Status**: `VerificationStatus.VERIFIED`
2. **Availability Status**: `AvailabilityStatus.AVAILABLE`
3. **Donation Interval**: If `lastDonationDate` is recorded, at least 56 days (8 weeks) must have elapsed since the last donation.

---

## 4. Haversine Distance Formula

Straight-line distance $d$ in kilometers between donor coordinates $(\phi_1, \lambda_1)$ and request coordinates $(\phi_2, \lambda_2)$:

\[
a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cdot\cos(\phi_2)\cdot\sin^2\left(\frac{\Delta\lambda}{2}\right)
\]
\[
c = 2\cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)
\]
\[
d = R \cdot c \quad \text{where } R = 6371\text{ km}
\]

Results are rounded to 2 decimal places.

---

## 5. Match Priority Score Formula

The numerical score assigned to each candidate donor is termed **Match Priority Score** (range: 0 - 100). It is **not** a medical probability prediction.

### Formula Components:
1. **Distance Score (Max 50 pts)**:
   \[
   \text{Points} = \max(0, 50 - \text{distanceKm} \times 1.5)
   \]
2. **Urgency Boost (Max 30 pts)**:
   - `CRITICAL`: +30 pts
   - `URGENT`: +20 pts
   - `NORMAL`: +10 pts
3. **Verification & Donation Recency Bonus (Max 20 pts)**:
   - `VERIFIED` Status: +15 pts
   - `lastDonationDate == null` or $> 180$ days: +5 pts

Total score is clamped between 0 and 100:
\[
\text{MatchScore} = \min(100, \max(0, \text{Round}(\text{DistancePoints} + \text{UrgencyPoints} + \text{Bonus})))
\]

### Deterministic Sorting Order:
1. Primary: `matchScore` (Descending)
2. Secondary: `distanceKm` (Ascending)
3. Tertiary: `donorId` string (Alphabetical ascending for stable sorting)

---

## 6. Match Response Lifecycle

```
[ Matching Executed ] ---> PENDING
                               |
               +---------------+---------------+
               |                               |
               v                               v
            ACCEPTED                        REJECTED
       (respondedAt set)               (respondedAt set)
```

- **Hospital Permission**: Only the creating hospital or `ADMIN` can execute or view request matches.
- **Donor Permission**: Only the matched donor or `ADMIN` can accept or decline their match request.
