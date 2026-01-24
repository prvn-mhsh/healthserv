## 🏥 Misc Service – Articles Module

 This service provides a complete Articles Management API for a healthcare platform, enabling Doctors to write articles, Admins to moderate them, and Users (Patients) to read and report them.

>Built using Node.js, Express, MySQL, and documented with Swagger (OpenAPI 3.0).

### 🚀 Features 
#### Doctor

- Create article as DRAFT

- Update article (only when in DRAFT state)

- Submit article for Admin approval

#### Admin

- View pending articles

- Approve articles

- Reject articles (with reason)

- Delist published articles

#### User (Patient)

- View published articles

- Report articles

### 🧱 Tech Stack

- Node.js

- Express.js

- MySQL

- JWT Authentication

- Swagger UI (OpenAPI 3.0)



### 📁 Project Structure
```
healthserv/
│
├── controllers/
│   ├── doctor.controller.js
│   ├── adminArticle.controller.js
│   └── patient.controller.js
│
├── routes/
│   ├── doctor.routes.js
│   ├── admin.routes.js
│   └── patient.routes.js
│
├── middleware/
│   └── auth.js
│
├── swagger.json
├── app.js
├── .env
└── package.json
```
### ⚙️ Installation
```bash
git clone <your-repo-url>
cd healthserv
npm install
```
### 🔐 Environment Variables (.env)
```
PORT=4004

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=misc

JWT_SECRET=your_jwt_secret
```
### ▶️ Run the Server
```
node app.js


or

nodemon app.js
```

### 📘 Swagger API Documentation
```
Open in browser:

http://localhost:4004/docs

```
#### Swagger file:

swagger.json


#### 🔑 Authentication & Roles

All protected routes require:

Authorization: Bearer <JWT_TOKEN>


Roles:

DOCTOR

ADMIN

USER

Enforced using middleware:

authenticate
requireRole(['ROLE'])

### 🔄 Article Lifecycle
```
DRAFT → PENDING_APPROVAL → PUBLISHED
              ↓
           REJECTED
              ↓
          DELISTED
```
### 📌 API Endpoints
#### 👨‍⚕️ Doctor
| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| POST   | `/doctor/articles`            | Create article draft |
| PUT    | `/doctor/articles/:id`        | Update draft         |
| POST   | `/doctor/articles/:id/submit` | Submit for approval  |

#### 🧑‍💼 Admin
| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| GET    | `/admin/articles/pending`     | View pending articles |
| POST   | `/admin/articles/:id/approve` | Approve article       |
| POST   | `/admin/articles/:id/reject`  | Reject article        |
| POST   | `/admin/articles/:id/delist`  | Delist article        |


#### 👤 User (Patient)
| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/user/articles`            | Get published articles |
| POST   | `/user/articles/:id/report` | Report an article      |

### 🗄️ Database (MySQL)

Example table:
```sql
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  title VARCHAR(255),
  summary TEXT,
  content LONGTEXT,
  status ENUM('DRAFT','PENDING_APPROVAL','PUBLISHED','REJECTED','DELISTED') DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
### 🧪 Testing
```
Login and get JWT token

Open Swagger

Click Authorize

Enter:

Bearer <token>
```

### ❤️ Health Check
```
GET /health


Response:

{ "status": "healthserv running" }
```
---

### ✍️ Author

**Built  by Praveen Mahesh**