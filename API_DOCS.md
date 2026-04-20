# LandBlocks API Docs

## Interactive Documentation

- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- ReDoc: `http://127.0.0.1:8000/api/redoc/`
- OpenAPI Schema: `http://127.0.0.1:8000/api/schema/`

## Response Envelope

All API responses now follow:

- success:
  - `{"success": true, "error": null, "data": ..., "message"?: "...", "pagination"?: {...}}`
- error:
  - `{"success": false, "error": {"code": 4xx/5xx, "message": "...", "details": ...}, "data": null}`

Format is aligned with the requested formatter shape from `ResponseFromater.py`.

## Authentication

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`
- `PATCH /api/auth/me/` (multipart supported for `profile_photo`)

## Core Endpoints

- `GET /api/properties/`
- `GET /api/properties/{id}/`
- `GET|POST /api/investments/`
- `GET /api/investments/orders/`
- `GET|POST /api/payments/`
- `GET /api/referrals/`
- `GET /api/dashboard/`

## Roles

Supported roles:

- `admin`
- `investor`
- `representative`

`/api/dashboard/` returns different payloads based on authenticated user role.

## Permission Matrix (Custom)

- `Property` APIs: public read.
- `Investments`:
  - `admin`: full access
  - `investor`: own list/retrieve/create + order history
  - `representative`: read-only for own + referred users
- `Payments`:
  - `admin`: full access
  - `investor`: own list/retrieve/create
  - `representative`: read-only for own + referred users
- `Referrals`:
  - `admin`: all rows
  - `investor`/`representative`: own referral rows only
- `Me` and `Dashboard`: authenticated users with valid known role only.
