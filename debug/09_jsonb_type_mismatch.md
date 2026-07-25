# Bug #9: JSONB Type Mismatch — Hibernate varchar vs PostgreSQL jsonb

## Symptom
- File uploads to MinIO ✅
- `uploaded_files` row saved to DB ✅
- Then `body_composition_reports` INSERT fails → HTTP 500
- Browser Console: `AxiosError: Request failed with status code 500`

## How to Investigate

### Step 1: Backend Logs
```powershell
docker logs physiqo-backend --tail 50
```
Look for `SQLGrammarException`:
```
ERROR: column "ai_raw_response" is of type jsonb but expression is of type character varying
  Hint: You will need to rewrite or cast the expression.
```

### Step 2: Check the DB Column Type
```powershell
docker exec physiqo-postgres psql -U physiqo -d physiqo -c "\d body_composition_reports"
```
Output:
```
ai_raw_response | jsonb    ← PostgreSQL type
```

### Step 3: Check the JPA Entity
```java
// BodyCompositionReport.java
@Column(name = "ai_raw_response", columnDefinition = "jsonb")
private String aiRawResponse;  // Java String ← Hibernate sends as varchar
```

The `columnDefinition = "jsonb"` annotation only affects DDL generation (CREATE TABLE). It does NOT tell Hibernate how to bind the parameter in INSERT/UPDATE statements. Hibernate still sends it as `varchar`.

## Root Cause
**Hibernate doesn't know how to convert Java `String` → PostgreSQL `jsonb` automatically.**

- `columnDefinition = "jsonb"` only affects schema generation
- At runtime, Hibernate binds the parameter as `SqlTypes.VARCHAR`
- PostgreSQL rejects it: `column is of type jsonb but expression is of type character varying`

## Fix Applied
- **File**: `backend/src/main/java/com/physiqo/bodycomp/entity/BodyCompositionReport.java`
- **Change**: Added `@JdbcTypeCode(SqlTypes.JSON)` annotation:
  ```java
  import org.hibernate.annotations.JdbcTypeCode;
  import org.hibernate.type.SqlTypes;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "ai_raw_response", columnDefinition = "jsonb")
  private String aiRawResponse;
  ```

## How This Annotation Works
```
Without @JdbcTypeCode:
  Java String → Hibernate VARCHAR → PostgreSQL rejects (expects jsonb) ❌

With @JdbcTypeCode(SqlTypes.JSON):
  Java String → Hibernate JSON → PostgreSQL accepts (jsonb) ✅
```

## Other Ways to Fix (Alternatives)
```java
// Option 1: @JdbcTypeCode (what we used — cleanest)
@JdbcTypeCode(SqlTypes.JSON)
@Column(name = "ai_raw_response", columnDefinition = "jsonb")
private String aiRawResponse;

// Option 2: @Type annotation (older Hibernate approach)
@Type(JsonType.class)
@Column(name = "ai_raw_response", columnDefinition = "jsonb")
private String aiRawResponse;

// Option 3: Cast in native query (workaround, not recommended)
// INSERT INTO ... VALUES (?::jsonb)
```

## Lesson Learned
> `columnDefinition = "jsonb"` is NOT enough — it only affects DDL, not runtime INSERT/UPDATE.
> For PostgreSQL `jsonb` columns, you MUST add `@JdbcTypeCode(SqlTypes.JSON)` in Hibernate 6+.
> This is one of the most common PostgreSQL + Hibernate gotchas.
> Always check if your `columnDefinition` types need a matching `@JdbcTypeCode` annotation.
