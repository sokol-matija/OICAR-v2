# OICAR Mobile App - Web Deployment Guide

## 🌐 Deploy to Vercel (FREE)

### Prerequisites
- GitHub account
- Vercel account (free)

### Step 1: Prepare for Web Build

1. **Test web build locally first:**
```bash
cd OICAR-MobileApp
npm run web
```

2. **Create production build script** (add to package.json):
```json
{
  "scripts": {
    "build": "expo export --platform web",
    "start": "expo start",
    "web": "expo start --web"
  }
}
```

### Step 2: Configure for Vercel

Create `vercel.json` in OICAR-MobileApp folder:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Deploy to Vercel

**Option A: GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect GitHub account
4. Import OICAR project
5. Set build settings:
   - Framework: Other
   - Build Command: `cd OICAR-MobileApp && npm run build`
   - Output Directory: `OICAR-MobileApp/dist`
6. Deploy!

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# In OICAR-MobileApp folder
cd OICAR-MobileApp
vercel

# Follow prompts
```

### Step 4: Access on Mobile
- Open the Vercel URL in mobile browser
- Works like a native app
- Can be "installed" via browser's "Add to Home Screen"

### Mobile Browser Features
- ✅ Touch interactions
- ✅ Responsive design  
- ✅ API calls to your backend
- ✅ Local storage for auth tokens
- ✅ Camera access (via browser)
- ⚠️ Some native features limited

## 🎯 Expected Result
Your app will be accessible at: `https://your-app-name.vercel.app` 