# Octal Technical Training Institute

A comprehensive, modern web application for a computer training institute, built with the latest Next.js and React technologies. This platform offers extensive features for managing courses, students, certificates, and more.

## 🌟 Features

- **Robust Authentication & Authorization**: Secure login and user management powered by [Clerk](https://clerk.dev/).
- **Dynamic Dashboards & Analytics**: Interactive charts and data visualization using Chart.js and Recharts.
- **Course & Content Management**: Advanced rich-text editing for course materials built with Tiptap.
- **Certificate Generation**: Automated PDF certificate generation (jsPDF, html2canvas) with built-in QR code verification.
- **File Uploads**: Seamless and secure media/file uploads via UploadThing.
- **Modern UI/UX**: Fully responsive and accessible interface built with Tailwind CSS, Radix UI components, and Framer Motion animations.
- **Database**: Scalable data modeling using MongoDB and Mongoose.
- **Form Handling**: Efficient and type-safe forms with React Hook Form and Zod validation.
- **Email Notifications**: Integrated email service using Nodemailer.

## 🛠️ Tech Stack

- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Framer Motion
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Clerk
- **File Storage**: UploadThing
- **Forms & Validation**: React Hook Form, Zod
- **Rich Text Editor**: Tiptap
- **PDF & QR Code**: jsPDF, html2canvas, qrcode.react

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed (v18.x or later is recommended).

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd octal-technical-training-institute
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and configure the necessary variables. **Do not share your `.env` file publicly.**

   **Required Environment Variables:**
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
   CLERK_SECRET_KEY=""

   # MongoDB
   MONGODB_URI=""

   # UploadThing
   UPLOADTHING_SECRET=""
   UPLOADTHING_APP_ID=""
   
   # Email configuration (Nodemailer)
   EMAIL_HOST=""
   EMAIL_PORT=""
   EMAIL_USER=""
   EMAIL_PASS=""
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## 📝 License

This project is licensed under the MIT License.
