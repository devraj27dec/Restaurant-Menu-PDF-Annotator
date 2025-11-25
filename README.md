# 📄 Restaurant Menu PDF Annotator

A full-stack web application that allows users to upload restaurant menus as PDFs, annotate them, extract structured text, edit the extracted fields (name, price, description, category), and export the data.

---

## 🚀 Features

* ✏️ Draw annotations on a PDF canvas
* 🔍 Extract text and bounding box coordinates
* 📝 Edit menu items in a structured layout
* 📤 Export data as CSV
* 🔐 Backend API with database support
* ☁️ Deployable (Docker, Vercel, Railway, Supabase, etc.)

---

## 🛠️ Setup Instructions

### **1️⃣ Clone Reps**
```bash
git clone https://github.com/devraj27dec/Restaurant-Menu-PDF-Annotator.git
cd Restaurant-Menu-PDF-Annotator
```
---

### **2️⃣ Install Dependencies**

```bash
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

---

### **3️⃣ Database Setup**

This project uses **PostgreSQL via Supabase**.

Create a database and run Prisma migrations:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

---

### ** 4️⃣Environment Variables**

Create a `.env` file in the backend:

```
DATABASE_URL="postgresql://username:password@host:port/db"
PORT=5000
```

Frontend env (optional):

```
VITE_API_URL=http://localhost:5000
```

---

## 📐 Architecture Overview

### **🧱 Tech Stack**

| Layer         | Technology                                     |
| ------------- | ---------------------------------------------- |
| Frontend      | React + TypeScript + Vite + Tailwind           |
| PDF Rendering | React-PDF / Canvas                             |
| Backend       | Node.js (Express)                              |
| Database      | PostgreSQL (Supabase)                          |
| ORM           | Prisma                                         |
| File Storage  | Local (can be extended to S3/Supabase Storage) |

---

### 📁 Folder Structure

```
📦 root
 ┣ 📂 frontend
 │  │  📂 src
 │  │  ┣ components/
 │  │  ┣ hooks/
 │  │  ┣ lib
 │  │  ┣ App.tsx
 │  │  ┣ Menu.tsx
 │  │  ┗ Main.tsx
 │  │  ┗ index.css  
 ┣ 📂 backend
 │  ┣ 📂 src
 │  │  ┣ controllers/
 │  │  ┣ routes/
 │  │  ┣ prisma.ts
 │  │  ┣ types.ts
 │  │  ┣ app.ts
 │  │  ┗ services.ts
 ┗ README.md
```

---

## 🔌 API Documentation

Base URL: `http://localhost:5000/api`

### **POST /menus/upload**

Upload a PDF.

| Field | Type | Required |
| ----- | ---- | -------- |
| file  | pdf  | ✔️       |

---

### **GET /menus/:id/extract**

Extract text + coordinates from uploaded PDF.

---

### **POST /menus/:id/items**

Create a structured menu item.

| Field       | Type   |
| ----------- | ------ |
| menuId      | string |
| name        | string |
| price       | number |
| description | string |
| category    | string |

---

### **GET /menus/:id/items**

Fetch mapped items.

---

### **DELETE /menus/:id**

Delete menu + related records.

---

## 🎯 Design Decisions & Trade-offs

| Decision                    | Reason                    | Trade-off                                        |
| --------------------------- | ------------------------- | ------------------------------------------------ |
| Prisma ORM                  | Type-safe DB layer        | Slight learning curve                            |
| Canvas-based PDF annotation | Fine control over drawing | Harder math vs built-in PDF annotation libraries |
| CSV export instead of Excel | Lightweight & universal   | No styling support                               |
| Local storage (development) | Fast iteration            | Needs cloud storage for production               |

---

## ⚠️ Known Limitations

* PDF text extraction accuracy depends on document formatting
* No user authentication yet
* Annotations are not re-rendered when PDF resizes
* Mobile support limited

---

## 🚧 Future Improvements

* Authentication + multi-user support
* Dashboard analytics to track PDF uploads and annotations
* AI auto-label menu items
* Undo / Redo support: step-by-step revert and restore of annotation changes
* Version control for edits
* Auto-save annotations to prevent data loss
* Optimize PDF upload and annotation extraction speed
---

## 🎥 Screenshots & Demo

| Feature | Preview |
|--------|---------|
| 📄 Upload & View PDF | ![Upload PDF](./frontend/public/s1.png) |
| ✏️ Draw Annotations | ![Annotations](./frontend/public/s2.png) |
| 📝 Editable Table View | ![Table View](./frontend/public/s3.png) |
| 📤 Export CSV | ![Export](./frontend/public/s4.png) |

---

## 📄 License

MIT License — Free for personal & commercial use.

---




