# Setting up accounts (Supabase + Google sign-in)

One-time setup, about 20 minutes. You create the accounts and enter passwords yourself; nothing secret needs to be shared.

---

## 1. Create the Supabase project

1. Go to **supabase.com** → **Start your project** → sign in (signing in with GitHub is easiest).
2. **New project**:
   - Name: `aham`
   - Database password: click **Generate**, then save it in your password manager (you won't need it day to day).
   - Region: **South Asia (Mumbai)**
3. Wait 1–2 minutes while it sets up.

## 2. Create the table

1. Left menu → **SQL Editor** → **New query**.
2. Open `supabase/setup.sql` from this project, copy all of it, paste it, and click **Run**. You should see "Success. No rows returned".

## 3. Connect the app

1. Left menu → **Project Settings** (gear icon) → **API Keys** (or **Data API**).
2. Copy the **Project URL** and the **anon public** key (it may be called the **publishable** key). Both are public by design: they're built into the app, and the security rules from step 2 protect everyone's data.
3. Create a file called `.env.local` in the `Aham_app` folder containing:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

(Or paste the two values to Claude and it will create the file.) `.env.local` is never uploaded to GitHub.

⚠️ Never use the **service_role** or **secret** key in the app.

## 4. Sign-in settings

**Authentication → Sign In / Providers → Email**
- Keep **Email** enabled.
- Turn **Confirm email** **off** for now. Supabase's built-in email service only sends a few emails per hour, which testers would hit quickly. You can turn it back on later with your own email service (Authentication → Emails → SMTP settings).

**Authentication → URL Configuration**
- **Site URL:** `com.onupm.aham://login-callback`
- **Redirect URLs** → Add:
  - `com.onupm.aham://login-callback`
  - `http://localhost:3000`

## 5. Google sign-in

### 5a. Google Cloud (creates the "Continue with Google" button's credentials)
1. Go to **console.cloud.google.com** → project picker at the top → **New project** → name it `Aham` → **Create**, then select it.
2. Left menu → **APIs & Services → OAuth consent screen** (may be called **Google Auth Platform**) → **Get started**:
   - App name: `Aham`
   - User support email: your email
   - Audience: **External**
   - Contact email: your email → **Create**
3. **Branding**: add the app logo (`store/play-icon-512.png`) and the privacy policy link `https://github.com/onu-pm/aham/blob/main/PRIVACY.md`.
4. **Audience** → **Publish app** (otherwise only test users you list can sign in).
5. **Clients** → **Create client**:
   - Application type: **Web application**
   - Name: `Aham Supabase`
   - **Authorized redirect URIs** → Add: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     (Copy this exact address from Supabase → Authentication → Sign In / Providers → Google, where it's labelled "Callback URL".)
   - **Create**. Keep the **Client ID** and **Client secret** window open.

### 5b. Back in Supabase
1. **Authentication → Sign In / Providers → Google** → turn it **on**.
2. Paste the **Client ID** and **Client secret** → **Save**.

## 6. Demo account for Google Play reviewers

Play reviewers need to get past the sign-in screen.

1. Supabase → **Authentication → Users → Add user → Create new user**.
2. Email: something like `aham.review@gmail.com` (it doesn't need to be a real inbox while Confirm email is off). Choose a password, and tick **Auto confirm user**.
3. Play Console → **App content → App access** → **All or some functionality is restricted** → **Add instructions**:
   - Name: `Demo account`
   - Username: the demo email
   - Password: the demo password
   - Any other information: `Tap "I already have an account" and sign in with these details.`

## 7. Play Console updates (before uploading version 1.1)

**App content → Data safety → Edit**
- Does your app collect or share user data? **Yes**
- Is all data encrypted in transit? **Yes**
- Do you provide a way for users to request deletion? **Yes**
- Data types collected (all: **Collected**, **not shared**, **not processed ephemerally**, **required**, purpose **App functionality** and **Account management**):
  - **Personal info → Email address**
  - **Personal info → Name**
  - **Personal info → User IDs**
  - **App activity → Other user-generated content** (habits, plans, lists)
- **Delete account URL:** `https://github.com/onu-pm/aham/blob/main/DELETE_ACCOUNT.md`

**App content → Privacy policy**: same link as before (`.../PRIVACY.md`). The policy has been updated for accounts.

**App content → App access**: see step 6.
