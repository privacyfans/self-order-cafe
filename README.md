# Cafe POS - Self Ordering System

Sistem kasir digital dengan self-ordering melalui QR code scanning untuk cafe.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes  
- **Database**: MySQL 8.0 dengan mysql2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0
- Database `cafe_pos_db` sudah dibuat dan diisi dengan schema

## 🛠️ Installation

1. Clone dan install dependencies:
```bash
cd /mnt/d/BWS/Project/Kasir/cafe-pos
npm install
```

2. Setup environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local sesuai konfigurasi database
```

3. Jalankan development server:
```bash
npm run dev
```

4. Buka browser: http://localhost:3000

## 📱 Fitur yang Sudah Diimplementasi

### Phase 1: Core Infrastructure ✅
- [x] Project setup dengan Next.js 15 + TypeScript
- [x] Database connection dengan MySQL2
- [x] TypeScript types definition
- [x] Zustand store untuk cart management
- [x] Utility functions (formatCurrency, generateOrderNumber)

### Phase 2: Customer Self-Ordering ✅
- [x] Home page dengan QR scanner simulation
- [x] API route untuk menu items (`/api/menu`)
- [x] API route untuk table info (`/api/tables/[tableId]`)
- [x] API route untuk order submission (`/api/orders`)
- [x] Customer menu page (`/menu/[tableId]`)
- [x] Cart functionality dengan Zustand
- [x] Mobile-first responsive design

## 🗂️ Struktur Project

```
src/
├── app/
│   ├── (customer)/           # Customer routes
│   │   ├── menu/[tableId]/   # Self-ordering interface
│   │   └── layout.tsx
│   ├── api/                  # API Routes
│   │   ├── menu/
│   │   ├── orders/
│   │   └── tables/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Home page
├── lib/
│   ├── db.ts                 # Database connection
│   └── utils.ts              # Utility functions
├── store/
│   └── cart.ts               # Cart state management
└── types/
    └── index.ts              # TypeScript types
```

## 🔄 Next Steps (Phase 3-6)

### Phase 3: Payment System
- [ ] Staff dashboard untuk monitoring orders
- [ ] Outstanding payments tracking
- [ ] Payment processing (Cash, QRIS, Card)
- [ ] Receipt generation

### Phase 4: Kitchen Display System  
- [ ] Real-time kitchen queue
- [ ] Order status updates
- [ ] Kitchen staff interface

### Phase 5: Reporting & Analytics
- [ ] Daily sales reports
- [ ] Popular items tracking
- [ ] Payment method analysis

### Phase 6: Advanced Features
- [ ] Real-time notifications
- [ ] Staff authentication
- [ ] Menu management interface
- [ ] QR code generation

## 🧪 Testing

Untuk testing aplikasi:

1. Buka http://localhost:3000
2. Pilih salah satu demo meja (1-6)
3. Browse menu berdasarkan kategori
4. Tambah item ke keranjang
5. Lihat cart summary di bottom

## 📊 Database Schema

Database schema sudah tersedia di:
- `/mnt/d/BWS/Project/Kasir/cafe-pos-database-schema.sql`

Pastikan database sudah dijalankan dengan schema tersebut sebelum menjalankan aplikasi.

## 🔧 Development

```bash
# Development server
npm run dev

# Build production
npm run build

# Start production server  
npm start

# Linting
npm run lint
```

## 📝 API Endpoints

- `GET /api/menu` - Fetch menu categories dan items
- `GET /api/tables/[tableId]` - Get table information
- `POST /api/orders` - Submit new order

## 🎯 Key Features

- ✅ QR Code self-ordering simulation
- ✅ Mobile-first responsive design
- ✅ Real-time cart management
- ✅ Category-based menu browsing
- ✅ Order submission to database
- ✅ TypeScript untuk type safety
- ✅ Modern Next.js App Router

Project ini mengikuti perencanaan di `PROJECT_PLAN.md` dan siap untuk development lanjutan ke Phase 3-6.
