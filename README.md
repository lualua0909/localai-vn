# Astra AI

Landing page & web app cho nền tảng AI doanh nghiệp. Xây dựng bằng Next.js 14, TailwindCSS, Firebase, Framer Motion, và React Three Fiber.

## Tính năng

- Landing page Apple-inspired với hero 3D, subnav pills, 6 feature sections, pricing, footnotes
- Dark mode / Light mode (auto system detect)
- Firebase Auth (Google + Email/Password)
- Firestore: lưu leads đăng ký & feedback người dùng
- Protected `/app` page với profile & feedback form
- Responsive, accessible, performant
- R3F 3D canvas với fallback cho thiết bị yếu & prefers-reduced-motion

## Setup

### 1. Firebase Project

1. Tạo project tại [Firebase Console](https://console.firebase.google.com)
2. Bật **Authentication** → Sign-in method: Google + Email/Password
3. Tạo **Firestore Database** (start in test mode cho dev)
4. Lấy Web App config từ Project Settings

### 2. Environment Variables

```bash
cp .env.example .env
```

Điền các giá trị Firebase config vào file `.env`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

### 4. Build Production

```bash
npm run build
npm start
```

## Docker

```bash
# Build
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your_key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  -t astra-ai .

# Run
docker run -p 3000:3000 astra-ai
```

## Deploy Vercel

1. Push repo lên GitHub
2. Import project vào [Vercel](https://vercel.com)
3. Thêm Environment Variables trong Vercel Dashboard (tất cả `NEXT_PUBLIC_FIREBASE_*`)
4. Deploy — Vercel auto-detect Next.js framework

## Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── signin/page.tsx     # Auth page
│   ├── app/page.tsx        # Protected dashboard
│   └── api/leads/route.ts  # Lead capture API
├── components/
│   ├── layout/             # Header, Footer, SubNav
│   ├── hero/               # HeroSection + HeroCanvas (R3F)
│   ├── sections/           # Feature sections, Pricing, Footnotes
│   ├── ui/                 # Button, Card, ScrollReveal, BentoGrid, etc.
│   ├── auth/               # AuthGuard
│   └── feedback/           # FeedbackForm
├── lib/
│   ├── firebase.ts         # Firebase init
│   ├── firestore.ts        # Firestore helpers
│   └── useAuth.ts          # Auth hook
└── middleware.ts            # Security headers
```

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript strict)
- **Styling:** TailwindCSS
- **Auth & DB:** Firebase Auth + Firestore
- **Animation:** Framer Motion
- **3D:** React Three Fiber + Drei
- **Icons:** Lucide React
- **Theme:** next-themes
