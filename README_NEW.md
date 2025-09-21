# Classroom Progress Tracker

A modern web application for tracking student progress with role-based access control, built with Next.js, Supabase, and MongoDB.

## Features

- 🔐 Authentication with Supabase Auth
- 👥 Role-based access control (Student, Teacher, Head Teacher)
- 📊 Real-time progress tracking
- 📈 Class statistics and analytics
- 🚀 Edge Functions for complex calculations
- 🎨 Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL) + MongoDB
- **Edge Computing**: Supabase Edge Functions
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- MongoDB Atlas account (optional, for additional data storage)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# MongoDB (optional)
MONGODB_URI=your-mongodb-uri
MONGODB_DB_NAME=classroom_tracker
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/supabase-classroom-progress.git
   cd supabase-classroom-progress
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Edge Functions

To deploy the Edge Function for calculating class averages:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Deploy the function:
   ```bash
   supabase functions deploy class-averages
   ```

## Project Structure

```
├── src/
│   ├── app/                  # Next.js app directory
│   ├── components/           # Reusable UI components
│   ├── config/               # Configuration files
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── models/               # Database models
├── supabase/
│   └── functions/            # Supabase Edge Functions
└── public/                   # Static assets
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
