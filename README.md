<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SmartRoster Pro - AI-Powered Workforce Management

SmartRoster Pro is an intelligent task and schedule management system for produce departments, featuring AI-powered PDF schedule scanning, automatic task distribution, and cloud sync across all your devices.

## Features

### 📅 Smart Schedule Management
- **PDF OCR Scanning**: Upload schedule PDFs and automatically extract employee shifts using Google Gemini AI
- **Touch-Optimized Editor**: Mobile-friendly schedule editor with preset shift times
- **Name Aliases**: OCR recognizes name variations automatically

### ✅ Intelligent Task Assignment
- **Auto-Distribution**: Smart task assignment based on employee roles, skills, and shift times
- **Priority Sorting**: Stocking tasks first, cleanup tasks last
- **Universal Tasks**: "Everybody" card with checkbox grid for end-of-shift tasks
- **Task Pool**: Drag-and-drop unassigned tasks
- **Manual Override**: Move tasks between employees easily

### 👥 Team Management
- **Employee Database**: Store team member info with roles and OCR aliases
- **Active/Inactive Status**: Manage team roster changes

### ☁️ Cloud Sync (NEW!)
- **Multi-Device Access**: Access from work computer, home PC, or phone
- **Real-time Sync**: Changes sync instantly across all devices
- **Secure Authentication**: Each user has their own isolated data
- **Automatic Backup**: Data stored securely in the cloud

### 🖨️ Print-Friendly Output
- **Customizable Layout**: Grid or list view
- **Professional Formatting**: Clean, readable daily worklists
- **Everybody Card**: Checkbox grid for universal tasks on print view

## Quick Start

### Prerequisites
- Node.js (v16+)
- A Supabase account (free tier works great!)
- Google Gemini API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Backend
Follow the detailed guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to:
- Create a Supabase project
- Set up the database schema
- Get your API credentials

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI API (for OCR)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the App
```bash
npm run dev
```

### 5. Create an Account
- Open the app in your browser
- Click "Sign up" and create your account
- Start managing your roster!

## Usage

### First Time Setup
1. **Create Account**: Sign up with email and password
2. **Configure Team**: Add your employees in the Team tab
3. **Set Up Task Rules**: Customize your task database
4. **Upload Schedule**: Use PDF OCR or manual entry

### Weekly Workflow
1. **Upload Schedule**: PDF scan → OCR extracts shifts
2. **Auto-Assign**: Click "Auto-Assign" for intelligent task distribution
3. **Adjust**: Manually move tasks as needed
4. **Print**: Generate professional worklists

### Multi-Device Access
- **Work Computer**: Upload schedule, configure tasks
- **Home**: Review and adjust from anywhere
- **Phone**: Quick edits on the go, emergency access

All devices stay in sync automatically!

## Deployment

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

Add environment variables in Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY` (or `GEMINI_API_KEY`)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: Google Gemini 2.5 Pro (OCR & Text Generation)
- **Icons**: Lucide React

## Data Import/Export

### Export Backup
Click the download icon in the navbar to save a JSON backup of all your data.

### Import Options
When importing, choose:
- **Schedule Only**: Import weekly schedule without changing task rules/team
- **Full Backup**: Restore complete configuration

## Security

- 🔒 Row Level Security (RLS) ensures data isolation
- 🔐 Secure authentication with Supabase Auth
- 🛡️ No data shared between users
- ☁️ Automatic cloud backups

## Support

- Check [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for setup help
- Review browser console for error messages
- Ensure environment variables are correctly configured

## License

MIT License - feel free to use and modify for your needs!

---

Built with ❤️ for produce department managers
