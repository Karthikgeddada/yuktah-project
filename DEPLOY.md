# 🚀 Deployment Guide for Yuktah Health

## 1. Create a Vercel Account
If you haven't already, go to [vercel.com](https://vercel.com) and sign up (GitHub login is best).

## 2. Deploy the Project
1.  **Install Vercel CLI** (Optional but easy): 
    `npm install -g vercel`
    
2.  **Run Deploy Command**:
    Type inside your terminal:
    ```bash
    vercel
    ```
    
3.  **Follow the Prompts**:
    - Set up and deploy? **Yes** [y]
    - Which scope? **[Your Name]** (Just press Enter)
    - Link to existing project? **No** [n]
    - Project Name? **yuktah-health** (or whatever you like)
    - Directory? **./** (Just press Enter)

## 3. Configure Environment Variables (CRITICAL)
Vercel will ask you to set up Environment Variables. You can do this in the dashboard AFTER deployment fails (it usually fails first run without envs) OR during setup.

**Go to Vercel Dashboard > Your Project > Settings > Environment Variables**

Copy and paste these EXACT values:

```env
MONGODB_URI=mongodb+srv://geddadakarthik7_db_user:karthik2005@cluster0.vkernu3.mongodb.net/yuktah?retryWrites=true&w=majority
MONGODB_URI_REPORTS=mongodb+srv://geddadakarthik7_db_user:karthik2005@cluster0.vkernu3.mongodb.net/yuktah?retryWrites=true&w=majority
JWT_SECRET=92f4c3d8e5b6a7019283746501abcde1234567890f1e2d3c4b5a697801234567
NODE_ENV=production
GEMINI_API_KEY=AIzaSyDEmLlcdLjmQkD_sNy_-KflOIKak2xXaQI
RESEND_API_KEY=re_PaTPddwn_8aF5KwHvwSUYM7WgGjdv6cq5
```

## 4. Final Deploy
Once variables are saved on Vercel, go to the **Deployments** tab and **Redeploy** the latest commit, or just run `vercel --prod` in your terminal again.

---
**🎉 Done! Your app will be live at `https://yuktah-health.vercel.app`!**
