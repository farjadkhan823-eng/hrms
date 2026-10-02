# HRMS (Angular 20 + Node/Express + PostgreSQL + Prisma)

## Requirements
Node.js 20+, PostgreSQL, npm.

## 1. Backend
```bash
cd backend
npm install
cp .env.example .env          # then put your PostgreSQL password in DATABASE_URL
```
PostgreSQL mein database banayein: `CREATE DATABASE hrms_db;`
```bash
npx prisma migrate dev --name init
npm run seed                  # creates admin + 2 demo employees
npm run dev                   # http://localhost:5000
```

## 2. Frontend
```bash
cd frontend
npm install
npm start                     # http://localhost:4200
```

## Demo logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@hrms.com | Admin@123 |
| Employee | ali@hrms.com | Emp@123 |

## Business rules
- Late: check-in after 10:15 AM. On time: check-in by 10:15 AM.
- Early: check-out before 5:00 PM (late wins if both are true).
- No check-in: absent. Admin can give an offReason to mark it as off.
- Sunday: always off, no salary cut.
- Salary: absent 1000, late 500, off with leaveNotGiven 1000, first 2 leaves free, 500 per extra leave.
- Working days (Mon-Sat) with no attendance record are counted absent when salary is generated.

## Postman tests
Login first, copy `token`, and send it as `Authorization: Bearer <token>` on every other request.

| API | Body / Notes |
|---|---|
| GET /api/health | none |
| POST /api/auth/login | `{"email":"admin@hrms.com","password":"Admin@123"}` |
| GET /api/auth/me | token |
| POST /api/employees (admin) | `{"name":"Zain","email":"zain@hrms.com","password":"123456","department":"IT","salary":30000}` |
| GET /api/employees (admin) | none |
| GET /api/employees/:id | admin or same employee |
| PUT /api/employees/:id (admin) | `{"department":"HR","isActive":"inactive"}` |
| DELETE /api/employees/:id (admin) | none |
| POST /api/attendance/mark (employee) | `{"action":"checkIn"}` then `{"action":"checkOut"}` |
| POST /api/attendance/mark (admin) | `{"employeeId":2,"date":"2026-10-01","checkIn":"10:30","checkOut":"18:00"}` |
| POST /api/attendance/mark (admin, leave) | `{"employeeId":2,"date":"2026-10-01","offReason":"sickLeave"}` |
| GET /api/attendance | admin sees all, employee sees own |
| GET /api/attendance?filter=month&month=10&year=2026 | month filter |
| GET /api/attendance?filter=week | this week |
| GET /api/attendance?status=active&punctuality=late&offReason=onLeave | extra filters |
| POST /api/salary/generate (admin) | `{"month":10,"year":2026}` |
| GET /api/salary | admin all, employee own |
| GET /api/dashboard (admin) | cards + today's attendance |
