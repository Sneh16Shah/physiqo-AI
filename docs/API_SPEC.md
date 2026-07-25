# PhysiqO-AI — REST API Specification

> **Version:** 1.0.0 · **Base URL:** `/api/v1`

---

## Conventions

- **Auth:** `🔓` = JWT required, `🔓👑` = ADMIN role, `🔓?` = optional auth, `🌐` = public
- **Timestamps:** ISO 8601 UTC
- **Units:** All metric (kg, cm, ml, kcal). Frontend converts to user preference.
- **Pagination:** `?page=0&size=20&sort=createdAt,desc`
- **Error shape:** `{ status, error, message, details[], timestamp, path }`

---

## 1. Authentication

### `POST /auth/register` 🌐

Register a new user.

```
Request:  { email: string, password: string }
Response 201: { id, email, createdAt }
Errors:   409 AUTH_EMAIL_EXISTS
          422 VALIDATION_ERROR
```

### `POST /auth/login` 🌐

```
Request:  { email: string, password: string }
Response 200: { accessToken, refreshToken, expiresIn: number }
Errors:   401 AUTH_INVALID_CREDENTIALS
          403 AUTH_ACCOUNT_DISABLED
```

### `POST /auth/refresh` 🌐

```
Request:  { refreshToken: string }
Response 200: { accessToken, expiresIn }
Errors:   401 AUTH_TOKEN_EXPIRED
          401 AUTH_TOKEN_INVALID
```

### `POST /auth/logout` 🔓

Invalidates the refresh token.

```
Request:  { refreshToken: string }
Response 204: (no content)
```

### `POST /auth/change-password` 🔓

```
Request:  { currentPassword, newPassword }
Response 204: (no content)
Errors:   401 AUTH_INVALID_CREDENTIALS
          422 VALIDATION_ERROR
```

---

## 2. User Profile

### `GET /profile` 🔓

```
Response 200: {
  id, userId, displayName, dateOfBirth, gender,
  heightCm, activityLevel, fitnessGoal,
  unitPreference, avatarUrl, timezone,
  createdAt, updatedAt
}
Errors:   404 NOT_FOUND_PROFILE
```

### `PUT /profile` 🔓

Create or update profile.

```
Request: {
  displayName?, dateOfBirth?, gender?,
  heightCm?, activityLevel?, fitnessGoal?,
  unitPreference?, timezone?
}
Response 200: { ...profile }
Errors:   422 VALIDATION_ERROR
```

### `POST /profile/avatar` 🔓

Upload avatar image (multipart).

```
Request:  multipart/form-data { file: image }
Response 200: { avatarUrl }
Errors:   413 STORAGE_FILE_TOO_LARGE
          415 VALIDATION_UNSUPPORTED_TYPE
```

---

## 3. Body Composition

### `POST /body-composition/reports` 🔓

Create a report (manual entry).

```
Request: {
  reportDate: string (YYYY-MM-DD),
  reportType: "DEXA" | "INBODY" | "BIOIMPEDANCE" | "MANUAL",
  measurements: [
    { metricName: string, metricValue: number, metricUnit: string }
  ],
  notes?: string
}
Response 201: { id, ...report, measurements[] }
Errors:   422 VALIDATION_ERROR
```

### `POST /body-composition/reports/upload` 🔓

Upload a body composition scan image for OCR extraction.

```
Request:  multipart/form-data { file: image, reportType: string }
Response 202: {
  reportId: UUID,
  status: "PENDING_REVIEW",
  extraction: {
    measurements: [
      { metricName, metricValue, metricUnit, confidence }
    ],
    overallConfidence: number
  }
}
Errors:   413 STORAGE_FILE_TOO_LARGE
          502 AI_SERVICE_UNAVAILABLE
          422 AI_EXTRACTION_FAILED
```

### `PUT /body-composition/reports/{id}/confirm` 🔓

User confirms or corrects extracted data.

```
Request: {
  measurements: [
    { metricName, metricValue, metricUnit }
  ]
}
Response 200: { ...confirmedReport }
Errors:   404 NOT_FOUND_REPORT
          409 REPORT_ALREADY_CONFIRMED
```

### `GET /body-composition/reports` 🔓

```
Query:    ?page=0&size=20&from=2026-01-01&to=2026-07-01
Response 200: { content: [report], page, size, totalElements, totalPages }
```

### `GET /body-composition/reports/{id}` 🔓

```
Response 200: { ...report, measurements[] }
Errors:   404 NOT_FOUND_REPORT
```

### `DELETE /body-composition/reports/{id}` 🔓

```
Response 204
Errors:   404 NOT_FOUND_REPORT
```

### `GET /body-composition/trends` 🔓

```
Query:    ?metric=body_fat_pct&from=2026-01-01&to=2026-07-01
Response 200: {
  metric: string,
  dataPoints: [{ date, value }],
  trend: { direction: "UP"|"DOWN"|"STABLE", changePercent }
}
```

---

## 4. Body Measurements

### `POST /body-measurements` 🔓

```
Request: {
  measuredAt: string,
  weightKg?, neckCm?, chestCm?, waistCm?, hipsCm?,
  leftBicepCm?, rightBicepCm?, leftForearmCm?, rightForearmCm?,
  leftThighCm?, rightThighCm?, leftCalfCm?, rightCalfCm?,
  notes?
}
Response 201: { id, ...measurement }
```

### `GET /body-measurements` 🔓

```
Query:    ?page=0&size=20&from=&to=
Response 200: { content: [measurement], ...pagination }
```

### `GET /body-measurements/{id}` 🔓

```
Response 200: { ...measurement }
Errors:   404 NOT_FOUND_MEASUREMENT
```

### `PUT /body-measurements/{id}` 🔓

```
Request:  { ...fields to update }
Response 200: { ...measurement }
```

### `DELETE /body-measurements/{id}` 🔓

```
Response 204
```

---

## 5. Muscles & Exercises

### `GET /muscles` 🔓

```
Query:    ?group=CHEST
Response 200: [{ id, name, muscleGroup, description }]
```

### `GET /exercises` 🔓

```
Query:    ?category=COMPOUND&equipment=BARBELL&muscle=uuid&search=squat&page=0&size=20
Response 200: { content: [{ id, name, category, equipment, difficulty, muscles[] }], ...pagination }
```

### `GET /exercises/{id}` 🔓

```
Response 200: { ...exercise, muscles[], instructions }
```

### `POST /exercises` 🔓

Create a custom exercise.

```
Request: {
  name, description?, category, equipment?, difficulty?,
  instructions?, muscleIds: [{ muscleId, involvement }]
}
Response 201: { ...exercise }
```

### `PUT /exercises/{id}` 🔓

Only custom exercises owned by the user.

```
Request:  { ...fields }
Response 200: { ...exercise }
Errors:   403 FORBIDDEN — cannot edit system exercises
```

### `DELETE /exercises/{id}` 🔓

```
Response 204
Errors:   403 FORBIDDEN
          409 EXERCISE_IN_USE
```

---

## 6. Workouts

### `POST /workout-plans` 🔓

```
Request: {
  name, description?, goal?, difficulty?,
  days: [{
    dayNumber, name, notes?,
    exercises: [{
      exerciseId, orderIndex, targetSets?, targetReps?, targetWeightKg?, restSeconds?, notes?
    }]
  }]
}
Response 201: { ...plan with days and exercises }
```

### `GET /workout-plans` 🔓

```
Query:    ?active=true&page=0&size=10
Response 200: { content: [plan summary], ...pagination }
```

### `GET /workout-plans/{id}` 🔓

```
Response 200: { ...plan, days: [{ ...day, exercises: [...] }] }
```

### `PUT /workout-plans/{id}` 🔓

```
Request:  { name?, description?, goal?, difficulty?, isActive? }
Response 200: { ...plan }
```

### `DELETE /workout-plans/{id}` 🔓

```
Response 204
```

### `POST /workout-sessions` 🔓

Start a workout session.

```
Request: { planId?, dayId?, startedAt }
Response 201: { id, ...session }
```

### `PUT /workout-sessions/{id}` 🔓

Complete or update a session.

```
Request: { completedAt?, notes?, rating? }
Response 200: { ...session }
```

### `POST /workout-sessions/{id}/sets` 🔓

Log a set.

```
Request: {
  exerciseId, setNumber, setType?,
  weightKg?, reps?, durationSeconds?, rpe?, completed?, notes?
}
Response 201: { ...set }
```

### `PUT /workout-sessions/{sessionId}/sets/{setId}` 🔓

```
Request:  { ...fields }
Response 200: { ...set }
```

### `GET /workout-sessions` 🔓

```
Query:    ?from=&to=&planId=&page=0&size=20
Response 200: { content: [session with sets], ...pagination }
```

### `GET /workout-sessions/{id}` 🔓

```
Response 200: { ...session, sets: [...] }
```

### `DELETE /workout-sessions/{id}` 🔓

```
Response 204
```

---

## 7. Nutrition

### `GET /foods` 🔓

```
Query:    ?search=chicken&custom=false&page=0&size=20
Response 200: { content: [food], ...pagination }
```

### `POST /foods` 🔓

Create custom food.

```
Request: {
  name, brand?, servingSizeG, servingLabel?,
  caloriesKcal, proteinG, carbsG, fatG,
  fiberG?, sugarG?, sodiumMg?
}
Response 201: { ...food }
```

### `POST /meals` 🔓

```
Request: {
  mealType, mealDate, mealTime?,
  items: [{ foodId, quantity }],
  notes?
}
Response 201: { ...meal, items[], totals: { calories, protein, carbs, fat } }
```

### `GET /meals` 🔓

```
Query:    ?date=2026-07-19&from=&to=&page=0&size=20
Response 200: { content: [meal with items and totals], ...pagination }
```

### `GET /meals/daily-summary` 🔓

```
Query:    ?date=2026-07-19
Response 200: {
  date, totalCalories, totalProtein, totalCarbs, totalFat,
  goal: { calories, protein, carbs, fat } | null,
  meals: [{ mealType, calories, protein, carbs, fat }]
}
```

### `PUT /meals/{id}` 🔓

```
Request:  { mealType?, mealTime?, items?, notes? }
Response 200: { ...meal }
```

### `DELETE /meals/{id}` 🔓

```
Response 204
```

### `GET /nutrition-goals/current` 🔓

```
Response 200: { ...goal } | 404
```

### `POST /nutrition-goals` 🔓

```
Request: { caloriesKcal?, proteinG?, carbsG?, fatG?, effectiveFrom }
Response 201: { ...goal }
```

---

## 8. AI Endpoints

### `POST /ai/analyze-progress` 🔓

```
Request: { fromDate, toDate, includeBodyComp: bool, includeWorkouts: bool, includeNutrition: bool }
Response 200: {
  summary: string,
  insights: [{ category, title, description, confidence }],
  recommendations: [{ category, priority, suggestion }],
  aiProvider: string, aiModel: string
}
Errors:   422 AI_INSUFFICIENT_DATA
          502 AI_SERVICE_UNAVAILABLE
```

### `POST /ai/analyze-workout` 🔓

```
Request: { sessionId: UUID }
Response 200: {
  volumeAnalysis: { totalSets, totalReps, totalVolumeKg },
  muscleDistribution: [{ muscle, sets, involvement }],
  suggestions: [string],
  confidence: number
}
```

### `POST /ai/estimate-meal` 🔓

Estimate nutrition from a meal photo.

```
Request:  multipart/form-data { file: image }
Response 200: {
  estimatedItems: [{ name, estimatedServingG, calories, protein, carbs, fat, confidence }],
  overallConfidence: number,
  disclaimer: string
}
```

### `POST /ai/suggest-diet` 🔓

```
Request: { targetCalories, targetProtein?, targetCarbs?, targetFat?, mealsPerDay, preferences?: string[] }
Response 200: {
  plan: {
    dailyCalories, meals: [{
      mealType, suggestions: [{ foodName, servingSize, calories, protein, carbs, fat }]
    }]
  },
  disclaimer: string
}
```

### `GET /ai/insights` 🔓

```
Query:    ?type=BODY_COMP_TREND&dismissed=false&page=0&size=10
Response 200: { content: [insight], ...pagination }
```

### `PUT /ai/insights/{id}/dismiss` 🔓

```
Response 204
```

---

## 9. Products

### `GET /products` 🔓

```
Query:    ?category=WHEY&brand=&search=&verified=true&page=0&size=20
Response 200: { content: [product with nutrition], ...pagination }
```

### `GET /products/{id}` 🔓

```
Response 200: { ...product, nutrition, latestPrices: [price], verifications: [verification] }
```

### `POST /products` 🔓

```
Request: {
  name, brand, category, description?, url?,
  nutrition: { servingSizeG, caloriesKcal, proteinG, carbsG, fatG, ... }
}
Response 201: { ...product }
```

### `PUT /products/{id}` 🔓

```
Request:  { ...fields }
Response 200: { ...product }
```

### `POST /products/{id}/prices` 🔓

```
Request: { retailer, price, currency?, url? }
Response 201: { ...price }
```

### `GET /products/{id}/prices` 🔓

```
Query:    ?from=&to=&retailer=
Response 200: [price]
```

### `POST /products/{id}/verify` 🔓

```
Request:  multipart/form-data { verificationType, notes?, file? }
Response 201: { ...verification }
```

### `GET /products/compare` 🔓

```
Query:    ?ids=uuid1,uuid2,uuid3
Response 200: {
  products: [{ id, name, brand, nutrition, pricePerServing }]
}
```

---

## 10. Price Alerts

### `POST /price-alerts` 🔓

```
Request: { productId, targetPrice, currency? }
Response 201: { ...alert }
Errors:   409 ALERT_ALREADY_EXISTS
```

### `GET /price-alerts` 🔓

```
Response 200: [{ ...alert, product: { id, name, brand, latestPrice } }]
```

### `PUT /price-alerts/{id}` 🔓

```
Request: { targetPrice?, isActive? }
Response 200: { ...alert }
```

### `DELETE /price-alerts/{id}` 🔓

```
Response 204
```

---

## 11. Notifications

### `GET /notifications` 🔓

```
Query:    ?read=false&type=PRICE_ALERT&page=0&size=20
Response 200: { content: [notification], ...pagination, unreadCount: number }
```

### `PUT /notifications/{id}/read` 🔓

```
Response 204
```

### `PUT /notifications/read-all` 🔓

```
Response 204
```

---

## 12. File Upload (Generic)

### `POST /files/upload` 🔓

```
Request:  multipart/form-data { file, category: "BODY_COMPOSITION"|"MEAL"|"PRODUCT"|"PROFILE" }
Response 201: { id, originalFilename, contentType, sizeBytes, url, createdAt }
Errors:   413 STORAGE_FILE_TOO_LARGE (>10MB)
          415 VALIDATION_UNSUPPORTED_TYPE
```

---

## Python AI Service — Internal API

> These endpoints are called by Spring Boot only, not exposed to the frontend.

### `POST /api/v1/ocr/body-composition`

```
Request: { image_url: string, report_type: string }
Response 200: {
  measurements: [{ metric_name, metric_value, metric_unit, confidence }],
  overall_confidence: float,
  raw_text: string,
  processing_time_ms: int
}
Errors:   422 { detail: "extraction_failed", message: string }
```

### `POST /api/v1/analysis/progress`

```
Request: { user_data: { body_comp: [], workouts: [], nutrition: [] }, date_range: { from, to } }
Response 200: { summary, insights: [], recommendations: [] }
```

### `POST /api/v1/analysis/workout`

```
Request: { session: { sets: [], duration_minutes }, user_profile: {} }
Response 200: { volume_analysis, muscle_distribution, suggestions }
```

### `POST /api/v1/estimation/meal`

```
Request: { image_url: string }
Response 200: { estimated_items: [], overall_confidence, disclaimer }
```

### `POST /api/v1/estimation/diet-plan`

```
Request: { targets: { calories, protein, carbs, fat }, meals_per_day, preferences }
Response 200: { plan: { daily_calories, meals: [] }, disclaimer }
```

### `GET /api/v1/health`

```
Response 200: { status: "ok", ai_provider: string, version: string }
```
