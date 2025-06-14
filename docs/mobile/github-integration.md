# GitHub Integration Setup for OICAR Mobile App

## Automatic Deployments from GitHub Monorepo

Your repository: sokol-matija/OICAR-v2
Your mobile app directory: OICAR-MobileApp

## Method 1: Vercel Dashboard (Recommended)

### Step 1: Access Project Settings
1. Go to: https://vercel.com/matijas-projects-eb06a899/oicar-mobile-app/settings
2. Click on "Git" in the left sidebar

### Step 2: Connect GitHub Repository
1. Click "Connect Git Repository"
2. Select GitHub as provider
3. Choose repository: sokol-matija/OICAR-v2
4. Important: Set Root Directory to OICAR-MobileApp

### Step 3: Configure Build Settings
In the "Build & Development Settings" section:
- Framework Preset: Other
- Root Directory: OICAR-MobileApp
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install
- Development Command: npm run web

### Step 4: Configure Deployment Triggers
- Production Branch: main
- Deploy only when files in OICAR-MobileApp change

## Method 2: Command Line Integration

```bash
# From the OICAR-MobileApp directory
vercel link --yes
vercel git connect sokol-matija/OICAR-v2
```

## How It Works After Setup

### Automatic Deployments Trigger When:
- You push changes to the main branch
- Files in the OICAR-MobileApp directory are modified
- Package.json changes
- Source code changes in screens/, components/, utils/

### Deployments DON'T Trigger When:
- You change files in SnjofkaloAPI - Copy/
- You change files in OICAR-WebApp/
- You change files in Database/
- Only files outside OICAR-MobileApp are modified

## Testing the Setup

1. Make a small change to your mobile app (e.g., update a text in App.tsx)
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push
   ```
3. Check Vercel dashboard - should see new deployment triggered
4. Wait 2-3 minutes for build to complete
5. Check your live URL - changes should be reflected

## Deployment URL
Your app will always be available at:
https://oicar-mobile-rmc4b8h61-matijas-projects-eb06a899.vercel.app

## Monitoring Deployments
- Vercel Dashboard: https://vercel.com/matijas-projects-eb06a899/oicar-mobile-app
- Build Logs: Available in dashboard for each deployment
- GitHub Integration: Shows deployment status on GitHub commits

## Benefits of This Setup
- Automatic deployments on every push
- Only mobile app changes trigger builds (efficient)
- Preview deployments for pull requests
- Rollback capability from Vercel dashboard
- Build logs for debugging
- Free hosting with custom domain support

## Project Requirements Satisfied
- First user-facing application properly deployed to production
- Automatic deployment pipeline
- Public URL accessible from anywhere
- Integration with source control (GitHub) 