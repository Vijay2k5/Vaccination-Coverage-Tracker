# Vaccination Tracking System - Entity Relationship Diagram

## Database Normalization Design

### Normalized Database Schema

```
┌─────────────────────────┐
│      VACCINES           │
├─────────────────────────┤
│ PK vaccine_id           │
│    vaccine_name         │
│    manufacturer         │
│    required_doses       │
│    allows_booster       │
└─────────────────────────┘
         │
         │ 1
         │
         │ N
         │
┌─────────────────────────┐
│    VACCINATIONS         │
├─────────────────────────┤
│ PK cert_id              │
│ FK patient_id           │
│ FK vaccine_id           │
│ FK location_id          │
│    dose                 │
│    date_administered    │
│    administering_officer│
│    created_at           │
└─────────────────────────┘
    │              │
    │ N            │ N
    │              │
    │ 1            │ 1
    │              │
┌──────────┐  ┌──────────────┐
│ PATIENTS │  │  LOCATIONS   │
├──────────┤  ├──────────────┤
│PK pat_id │  │PK location_id│
│  name    │  │  state       │
│  email   │  │  district    │
│  age     │  │  latitude    │
│  gender  │  │  longitude   │
└──────────┘  └──────────────┘
```

## Detailed Entity Descriptions

### 1. VACCINES
**Purpose**: Stores information about different vaccine types and their requirements

| Column Name       | Data Type | Constraints | Description                          |
|-------------------|-----------|-------------|--------------------------------------|
| vaccine_id        | INT       | PK, AUTO    | Unique identifier for vaccine        |
| vaccine_name      | VARCHAR   | NOT NULL    | Name of the vaccine                  |
| manufacturer      | VARCHAR   |             | Manufacturer name                    |
| required_doses    | INT       | NOT NULL    | Number of required doses (1-3)       |
| allows_booster    | BOOLEAN   | DEFAULT TRUE| Whether booster is available         |

**Sample Data**:
- Pfizer-BioNTech: required_doses = 2, allows_booster = true
- Moderna: required_doses = 2, allows_booster = true
- Johnson & Johnson: required_doses = 1, allows_booster = true
- Covaxin: required_doses = 2, allows_booster = true

---

### 2. PATIENTS
**Purpose**: Stores patient demographic information

| Column Name    | Data Type | Constraints | Description                     |
|----------------|-----------|-------------|---------------------------------|
| patient_id     | INT       | PK, AUTO    | Unique identifier for patient   |
| name           | VARCHAR   | NOT NULL    | Full name of the patient        |
| email          | VARCHAR   | NOT NULL    | Email address                   |
| age            | INT       |             | Age of patient                  |
| gender         | VARCHAR   |             | Gender (Male/Female/Other)      |

**Note**: Email should have a UNIQUE constraint in production to prevent duplicates

---

### 3. LOCATIONS
**Purpose**: Stores geographic location information with GPS coordinates

| Column Name    | Data Type    | Constraints | Description                        |
|----------------|--------------|-------------|------------------------------------|
| location_id    | INT          | PK, AUTO    | Unique identifier for location     |
| state          | VARCHAR      | NOT NULL    | Indian state name                  |
| district       | VARCHAR      | NOT NULL    | District name                      |
| latitude       | DECIMAL(9,6) |             | GPS latitude coordinate            |
| longitude      | DECIMAL(9,6) |             | GPS longitude coordinate           |

**Composite Unique Key**: (state, district) to prevent duplicate locations

---

### 4. VACCINATIONS
**Purpose**: Central table that records vaccination events, linking patients, vaccines, and locations

| Column Name              | Data Type | Constraints | Description                           |
|--------------------------|-----------|-------------|---------------------------------------|
| cert_id                  | VARCHAR   | PK          | Vaccination certificate ID            |
| patient_id               | INT       | FK, NOT NULL| Reference to PATIENTS table           |
| vaccine_id               | INT       | FK, NOT NULL| Reference to VACCINES table           |
| location_id              | INT       | FK, NOT NULL| Reference to LOCATIONS table          |
| dose                     | VARCHAR   | NOT NULL    | Dose number (1, 2, 3, or Booster)     |
| date_administered        | DATE      | NOT NULL    | Date when vaccine was administered    |
| administering_officer    | VARCHAR   |             | Name of administering healthcare worker|
| created_at               | TIMESTAMP | DEFAULT NOW | Record creation timestamp             |

**Note**: cert_id follows format: VAX-YYYYMMDD-XXXXXX (e.g., VAX-20260212-000001)

---

## Relationships

### 1. VACCINES → VACCINATIONS (One-to-Many)
- **Cardinality**: One vaccine can be used in many vaccination records
- **Foreign Key**: vaccinations.vaccine_id → vaccines.vaccine_id
- **Referential Integrity**: ON DELETE RESTRICT (cannot delete vaccine if vaccinations exist)

### 2. PATIENTS → VACCINATIONS (One-to-Many)
- **Cardinality**: One patient can have many vaccination records
- **Foreign Key**: vaccinations.patient_id → patients.patient_id
- **Referential Integrity**: ON DELETE CASCADE (optional, depending on data retention policy)

### 3. LOCATIONS → VACCINATIONS (One-to-Many)
- **Cardinality**: One location can be used in many vaccination records
- **Foreign Key**: vaccinations.location_id → locations.location_id
- **Referential Integrity**: ON DELETE RESTRICT (cannot delete location if vaccinations exist)

---

## Benefits of Normalization

### 1. **Eliminates Data Redundancy**
- Patient information stored once, referenced multiple times
- Location data (coordinates) stored once per district
- Vaccine properties defined once, reused across records

### 2. **Improves Data Integrity**
- Foreign key constraints ensure referential integrity
- Consistent vaccine information across all records
- Accurate location coordinates for all vaccinations in same district

### 3. **Easier Maintenance**
- Update patient email in one place (PATIENTS table)
- Correct location coordinates once (LOCATIONS table)
- Modify vaccine properties without affecting historical records

### 4. **Better Query Performance**
- Efficient joins on indexed foreign keys
- Smaller table sizes reduce storage requirements
- Faster aggregations by location or vaccine type

### 5. **Flexible Reporting**
- Easy to generate patient vaccination history
- Quick location-based heatmap queries
- Vaccine-specific analytics and statistics

---

## Sample Queries

### Get all vaccinations for a patient:
```sql
SELECT v.cert_id, vac.vaccine_name, v.dose, v.date_administered, 
       l.state, l.district
FROM vaccinations v
JOIN patients p ON v.patient_id = p.patient_id
JOIN vaccines vac ON v.vaccine_id = vac.vaccine_id
JOIN locations l ON v.location_id = l.location_id
WHERE p.email = 'patient@example.com';
```

### Get vaccination statistics by location:
```sql
SELECT l.state, l.district, COUNT(*) as vaccination_count
FROM vaccinations v
JOIN locations l ON v.location_id = l.location_id
GROUP BY l.state, l.district
ORDER BY vaccination_count DESC;
```

### Get vaccine-specific dose distribution:
```sql
SELECT vac.vaccine_name, v.dose, COUNT(*) as count
FROM vaccinations v
JOIN vaccines vac ON v.vaccine_id = vac.vaccine_id
GROUP BY vac.vaccine_name, v.dose
ORDER BY vac.vaccine_name, v.dose;
```

---

## Implementation Notes

### Current Implementation (KV Store)
The current system uses a key-value store with a denormalized structure. Each vaccination record contains all information inline:
- `vaccination:{certId}` → Full record with patient, vaccine, and location data
- `state:{state}` → Aggregate count
- `district:{state}:{district}` → Aggregate count

### Migration Path
To migrate to the normalized structure:
1. Extract unique vaccines → VACCINES table
2. Extract unique patients → PATIENTS table
3. Extract unique locations → LOCATIONS table
4. Create VACCINATIONS records with foreign key references
5. Update application queries to use JOIN operations

### Backward Compatibility
Maintain both structures during transition:
- Write to both KV store and relational tables
- Gradually migrate reads to relational queries
- Validate data consistency
- Sunset KV store after successful migration

---

## Conclusion

This normalized database design follows Third Normal Form (3NF) principles:
- **1NF**: All attributes are atomic (no repeating groups)
- **2NF**: All non-key attributes depend on the entire primary key
- **3NF**: No transitive dependencies (non-key attributes don't depend on other non-key attributes)

The design provides a solid foundation for a scalable vaccination tracking system with improved data integrity, reduced redundancy, and better query performance.
