# CloudSolutions API — Full Documentation

**Base URL:** `http://localhost:3000/api/v1`  
**Swagger UI:** `http://localhost:3000/api/docs`  
**Auth:** Bearer JWT — `Authorization: Bearer <access_token>`

---

## Table of Contents

1. [Auth](#1-auth)
2. [Public — Health](#2-public--health)
3. [Public — Courses](#3-public--courses)
4. [Public — Enquiry](#4-public--enquiry)
5. [Student Panel — Profile](#5-student-panel--profile)
6. [Student Panel — Courses](#6-student-panel--courses)
7. [Admin Panel — Users](#7-admin-panel--users)
8. [Admin Panel — Students](#8-admin-panel--students)
9. [Admin Panel — Courses](#9-admin-panel--courses)
10. [Admin Panel — Enquiries](#10-admin-panel--enquiries)
11. [Super Admin — Dashboard](#11-super-admin--dashboard)
12. [Super Admin — Users](#12-super-admin--users)
13. [Super Admin — Admins](#13-super-admin--admins)
14. [Response Format](#14-response-format)
15. [Error Codes](#15-error-codes)

---

## 1. Auth

> No authentication required unless stated.

### POST `/auth/register`
Register a new student account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password@123",
  "phone": "+1234567890"
}
```

**Response `201`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password@123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "email": "...", "role": "student" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### POST `/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### GET `/auth/me`
🔒 **Auth required**

Get the current authenticated user's profile.

**Response `200`:**
```json
{
  "data": {
    "_id": "64f1a2b3...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "status": "active",
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### POST `/auth/logout`
🔒 **Auth required**

Invalidate the current refresh token.

**Response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

## 2. Public — Health

### GET `/health`
Health check. No auth required.

**Response `200`:**
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600.5,
    "environment": "development",
    "version": "1.0.0"
  }
}
```

---

## 3. Public — Courses

### GET `/courses`
List all **published** courses. No auth required.

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `search` | string | — | Search title, courseCode, category |
| `sortBy` | string | createdAt | Field to sort by |
| `sortOrder` | ASC\|DESC | DESC | Sort direction |

**Response `200`:**
```json
{
  "data": [
    {
      "_id": "64f1...",
      "title": "Introduction to Mathematics",
      "courseCode": "MATH-101",
      "description": "...",
      "instructor": "Dr. Jane Smith",
      "category": "Mathematics",
      "level": "beginner",
      "status": "published",
      "price": 99.99,
      "durationHours": 40,
      "startDate": "2024-02-01"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### GET `/courses/:id`
Get a single published course by MongoDB ObjectId.

**Response `200`:** Single course object.  
**Response `404`:** Course not found.

---

## 4. Public — Enquiry

### POST `/enquiry`
Submit an enquiry. No auth required.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "subject": "Admission enquiry for AI course",
  "message": "I would like to know more about the admission process and prerequisites...",
  "type": "admission"
}
```

**`type` values:** `general` | `admission` | `course` | `support` | `feedback`

**Response `201`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Enquiry submitted successfully. We will get back to you shortly.",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Admission enquiry for AI course",
    "type": "admission",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 5. Student Panel — Profile

> All endpoints require `Authorization: Bearer <token>` with **STUDENT** role.

### GET `/student/profile`
Get my student profile.

**Response `200`:**
```json
{
  "data": {
    "_id": "64f1...",
    "userId": { "_id": "...", "firstName": "John", "email": "john@example.com" },
    "studentCode": "STU-2024-1234",
    "grade": "10th",
    "section": "A",
    "dateOfBirth": "2005-01-15",
    "address": "123 Main St",
    "guardianName": "Mary Doe",
    "guardianPhone": "+1234567890",
    "status": "enrolled",
    "enrollmentDate": "2024-01-01",
    "courses": [...]
  }
}
```

---

### PATCH `/student/profile`
Update my student profile.

**Request Body (all optional):**
```json
{
  "grade": "11th",
  "section": "B",
  "address": "456 Oak Ave",
  "guardianName": "Mary Doe",
  "guardianPhone": "+9876543210",
  "guardianEmail": "mary@example.com"
}
```

---

### PATCH `/student/profile/account`
Update my account info (name, phone).

**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "phone": "+1112223333"
}
```

---

### POST `/student/profile/change-password`
Change my password.

**Request Body:**
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456"
}
```

**Response `200`:**
```json
{ "message": "Password changed successfully" }
```

---

## 6. Student Panel — Courses

> All endpoints require **STUDENT** role.

### GET `/student/courses`
Browse all published courses.

**Query Params:** Same as [Public Courses](#3-public--courses).

---

### GET `/student/courses/my-enrollments`
Get all courses I am enrolled in.

**Response `200`:**
```json
{
  "data": [
    { "_id": "64f1...", "title": "Math 101", "courseCode": "MATH-101", "status": "published" }
  ]
}
```

---

### GET `/student/courses/:id`
Get course details by ID.

---

## 7. Admin Panel — Users

> All endpoints require **ADMIN** or **SUPER_ADMIN** role.

### GET `/admin/users`
List all users with pagination + search.

**Query Params:** page, limit, search, sortBy, sortOrder

---

### GET `/admin/users/stats`
Get user statistics.

**Response `200`:**
```json
{
  "data": {
    "total": 150,
    "byRole": [
      { "_id": "student", "count": 130 },
      { "_id": "admin", "count": 18 },
      { "_id": "super_admin", "count": 2 }
    ],
    "byStatus": [
      { "_id": "active", "count": 140 },
      { "_id": "suspended", "count": 10 }
    ]
  }
}
```

---

### GET `/admin/users/:id`
Get user by MongoDB ObjectId.

---

### PATCH `/admin/users/:id`
Update user details or status.

**Request Body (all optional):**
```json
{
  "firstName": "John",
  "status": "suspended",
  "role": "admin"
}
```

**`status` values:** `active` | `inactive` | `suspended` | `pending`  
**`role` values:** `student` | `admin` | `super_admin`

---

## 8. Admin Panel — Students

> All endpoints require **ADMIN** or **SUPER_ADMIN** role.

### GET `/admin/students`
List all students with pagination.

### POST `/admin/students`
Create a student profile for an existing user.

**Request Body:**
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "studentCode": "STU-2024-001",
  "grade": "10th",
  "section": "A",
  "dateOfBirth": "2005-01-15",
  "address": "123 Main St",
  "guardianName": "Mary Doe",
  "guardianPhone": "+1234567890",
  "guardianEmail": "mary@example.com"
}
```

### GET `/admin/students/stats`
Get student enrollment statistics.

### GET `/admin/students/:id`
Get student by ID (with populated user and courses).

### PATCH `/admin/students/:id`
Update student. Can also update `status`:

**`status` values:** `enrolled` | `completed` | `dropped` | `suspended`

### DELETE `/admin/students/:id`
Delete student profile.

---

## 9. Admin Panel — Courses

> All endpoints require **ADMIN** or **SUPER_ADMIN** role.

### GET `/admin/courses`
List all courses (all statuses: draft, published, archived).

### POST `/admin/courses`
Create a new course.

**Request Body:**
```json
{
  "title": "Introduction to Mathematics",
  "courseCode": "MATH-101",
  "description": "A foundational math course covering algebra and geometry.",
  "instructor": "Dr. Jane Smith",
  "category": "Mathematics",
  "level": "beginner",
  "status": "draft",
  "price": 99.99,
  "maxStudents": 30,
  "durationHours": 40,
  "thumbnailUrl": "https://example.com/math-thumb.jpg",
  "startDate": "2024-02-01",
  "endDate": "2024-06-30"
}
```

**`level` values:** `beginner` | `intermediate` | `advanced`  
**`status` values:** `draft` | `published` | `archived`

### GET `/admin/courses/stats`
Get course statistics (by status and level).

### GET `/admin/courses/:id`
Get course by ID.

### PATCH `/admin/courses/:id`
Update course fields.

### PATCH `/admin/courses/:id/publish`
Publish a draft course (sets status → `published`).

### PATCH `/admin/courses/:id/archive`
Archive a course (sets status → `archived`).

### DELETE `/admin/courses/:id`
Delete course permanently.

---

## 10. Admin Panel — Enquiries

> All endpoints require **ADMIN** or **SUPER_ADMIN** role.

### GET `/admin/enquiries`
List all enquiries with filters and pagination.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `search` | string | Search name, email, subject |
| `status` | string | Filter by status |
| `type` | string | Filter by type |
| `sortBy` | string | Field to sort |
| `sortOrder` | ASC\|DESC | Sort direction |

**`status` filter values:** `new` | `in_progress` | `resolved` | `closed`  
**`type` filter values:** `general` | `admission` | `course` | `support` | `feedback`

---

### GET `/admin/enquiries/stats`
Get enquiry statistics.

**Response `200`:**
```json
{
  "data": {
    "total": 48,
    "newCount": 12,
    "byStatus": [
      { "_id": "new", "count": 12 },
      { "_id": "in_progress", "count": 20 },
      { "_id": "resolved", "count": 14 },
      { "_id": "closed", "count": 2 }
    ],
    "byType": [
      { "_id": "general", "count": 10 },
      { "_id": "admission", "count": 25 },
      { "_id": "course", "count": 8 },
      { "_id": "support", "count": 5 }
    ]
  }
}
```

---

### GET `/admin/enquiries/:id`
Get a single enquiry by ID (with assigned admin populated).

**Response `200`:**
```json
{
  "data": {
    "_id": "64f1...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "subject": "Admission enquiry",
    "message": "I would like to know...",
    "type": "admission",
    "status": "in_progress",
    "adminNotes": "Contacted by email on Jan 15",
    "assignedTo": {
      "_id": "64f2...",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "resolvedAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### PATCH `/admin/enquiries/:id`
Update enquiry status, notes, or assignment.

**Request Body (all optional):**
```json
{
  "status": "in_progress",
  "adminNotes": "Followed up via email. Awaiting response.",
  "assignedTo": "64f2a3b4c5d6e7f8a9b0c1d2"
}
```

---

### PATCH `/admin/enquiries/:id/assign-me`
Assign this enquiry to yourself and set status to `in_progress`.

**Response `200`:**
```json
{ "message": "Enquiry assigned", "data": { ... } }
```

---

### PATCH `/admin/enquiries/:id/resolve`
Mark enquiry as `resolved` (sets `resolvedAt` timestamp automatically).

---

### PATCH `/admin/enquiries/:id/close`
Mark enquiry as `closed`.

---

### DELETE `/admin/enquiries/:id`
Permanently delete an enquiry.

---

## 11. Super Admin — Dashboard

> All endpoints require **SUPER_ADMIN** role.

### GET `/superadmin/dashboard`
Platform-wide overview combining user, student, and course statistics.

**Response `200`:**
```json
{
  "data": {
    "platform": {
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "environment": "development"
    },
    "users": {
      "total": 150,
      "byRole": [...],
      "byStatus": [...]
    },
    "students": {
      "total": 130,
      "byStatus": [...]
    },
    "courses": {
      "total": 25,
      "byStatus": [...],
      "byLevel": [...]
    }
  }
}
```

---

## 12. Super Admin — Users

> All endpoints require **SUPER_ADMIN** role.

### GET `/superadmin/users`
List all users (same as Admin with full access).

### POST `/superadmin/users`
Create a user with **any** role (including admin/super_admin).

**Request Body:**
```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "superadmin@example.com",
  "password": "Admin@12345",
  "role": "super_admin"
}
```

### GET `/superadmin/users/stats`
Platform-wide user stats.

### GET `/superadmin/users/:id`
Get any user by ID.

### PATCH `/superadmin/users/:id`
Update any user field including role elevation.

### DELETE `/superadmin/users/:id`
Hard delete a user permanently.

---

## 13. Super Admin — Admins

> All endpoints require **SUPER_ADMIN** role.

### POST `/superadmin/admins`
Create a new admin account (forces role = `admin`).

**Request Body:**
```json
{
  "firstName": "New",
  "lastName": "Admin",
  "email": "newadmin@example.com",
  "password": "Admin@12345"
}
```

---

### PATCH `/superadmin/admins/:id/revoke`
Revoke admin privileges — demotes the user to `student` role.

---

### PATCH `/superadmin/admins/:id/elevate`
Elevate a user to `super_admin` role.

---

## 14. Response Format

All responses follow this consistent envelope:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Description of result",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/courses"
}
```

> `meta` is only present on paginated list responses.

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["email must be an email", "password is too short"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/register"
}
```

---

## 15. Error Codes

| Status | Meaning |
|--------|---------|
| `400` | Bad Request — validation failed or invalid input |
| `401` | Unauthorized — missing/invalid/expired JWT |
| `403` | Forbidden — authenticated but insufficient role |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate email or unique constraint violation |
| `429` | Too Many Requests — rate limit exceeded (100 req/60s) |
| `500` | Internal Server Error — unexpected server error |

---

## Password Policy

Passwords must be 8–50 characters and contain:
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (`@$!%*?&`)

---

## Role Hierarchy

```
SUPER_ADMIN
    └── ADMIN
            └── STUDENT
                    └── PUBLIC (unauthenticated)
```

Higher roles can access lower-role endpoints where explicitly granted.
