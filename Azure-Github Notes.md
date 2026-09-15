# Azure & GitHub Setup — Plain English Reference

Last updated: 2026-09-15

This document explains what was set up, why, and how to fix things
if they stop working. Written for future-you who has forgotten the
details.


## The Big Picture

MyBGAccounts is a web page (not a traditional app). It has no
server — it's just files (HTML, CSS, JavaScript) that run entirely
in your browser. It needs two external services:

1. **GitHub** — hosts the web page files so you can open the app
   from any device with a browser
2. **Azure (Microsoft)** — gives the app permission to read and
   write a single encrypted file on your OneDrive


## GitHub — Where the App Lives

### What it does
GitHub stores your code and also serves it as a live website
using a feature called **GitHub Pages**. When you update the code
and push it to GitHub, the website updates automatically within
a minute or two.

### Your setup
- **Repository**: https://github.com/bernieonline/TrackMyApp
- **Live site**: https://bernieonline.github.io/TrackMyApp/
- **Visibility**: Public (anyone can see the code, but that's
  fine — your financial data is encrypted on OneDrive, not in
  the code)
- **Branch**: main — GitHub Pages serves whatever is on the
  main branch

### If the site stops loading
- Check https://github.com/bernieonline/TrackMyApp to make sure
  the repository still exists and is public
- Go to the repository **Settings > Pages** and confirm it says
  "Your site is live" with the correct URL
- If you recently pushed code with an error in it, the site
  will show that error. Check the code works locally first.
- GitHub occasionally has outages — check
  https://www.githubstatus.com


## Azure — How the App Talks to OneDrive

### Why it's needed
The app stores your encrypted data file on OneDrive. Microsoft
won't let any random web page access your OneDrive — you have
to register the app with Microsoft first. That registration
lives in Azure (Microsoft's cloud platform). Think of it as
an ID badge that the app shows to Microsoft when it asks to
read or write your file.

### What was registered
- **App name**: MyBGAccounts (or whatever it was named during
  registration)
- **Client ID**: f388e9f8-d1d5-4623-a9ce-4d92aff9403e
  (This is like a public ID number — it's not a password.
  It's safe for it to be visible in the code.)
- **App type**: Single-page application (SPA)
- **Account type**: Personal Microsoft accounts only
  (not work/school accounts)

### Redirect URIs — the most likely thing to break
When you sign in, Microsoft needs to know where to send you
back to after login. These approved "return addresses" are
called **redirect URIs**. If the address the app is running
on doesn't match one of the registered URIs, sign-in will
fail with an error about "redirect URI mismatch".

**Currently registered redirect URIs:**
- `https://bernieonline.github.io/TrackMyApp/`
  (the live GitHub Pages site)
- There may also be older localhost entries from development
  — these are harmless

**If sign-in stops working**, this is the first thing to check:
1. Go to https://portal.azure.com
2. Sign in with your Microsoft account
3. Search for "App registrations" in the top search bar
4. Click on MyBGAccounts (or find it under "All applications")
5. Click **Authentication** in the left menu
6. Check that the URL you're trying to use the app from is
   listed under redirect URIs
7. If it's missing, add it and click **Save**

### Permissions (API scopes)
The app requests two permissions when you sign in:
- **Files.ReadWrite** — lets it read and write files on your
  OneDrive (specifically the MyBGAccounts folder)
- **User.Read** — lets it see your name for the welcome message

These permissions are "delegated" meaning they only work when
YOU are signed in. The app can't access your OneDrive without
you actively logging in.

### Where your data file lives on OneDrive
- Folder: **MyBGAccounts** (in the root of your OneDrive)
- File: **mybgaccounts.dat**
- Full path: MyBGAccounts/mybgaccounts.dat
- The file contains encrypted data — if you open it in
  OneDrive you'll just see a long string of random characters.
  That's normal.

### If OneDrive save/load stops working
- **"Sign-in failed"**: Check the redirect URI (see above).
  Also check that the Azure app registration still exists.
- **"Failed to get file metadata" or 403 error**: The
  permissions may have been revoked. Go to
  https://account.live.com/consent/Manage and check that
  MyBGAccounts still has permission. If not, sign out and
  sign back in — it will re-request permission.
- **"Modified by another device" warning**: This is normal
  if you had the app open on two devices. Reload to get the
  latest version, then make your changes.
- **File not found (first run)**: This is normal. The app
  creates the file automatically when you first save.


## How They Work Together — The Full Flow

1. You open **https://bernieonline.github.io/TrackMyApp/**
   on your PC or iPad
2. GitHub Pages serves the app files to your browser
3. You click **Sign In** — the app uses the Azure client ID
   to open a Microsoft login popup
4. You sign in with your Microsoft account — Microsoft checks
   that the app's client ID and redirect URI match what's
   registered in Azure
5. Microsoft gives the app a temporary token (like a
   time-limited pass) to access your OneDrive
6. The app uses that token to download mybgaccounts.dat from
   your OneDrive
7. You enter your passphrase — the app decrypts the data
   locally in your browser (nothing unencrypted is sent
   anywhere)
8. When you save, the app encrypts the data and uploads it
   back to OneDrive using the same token

**Important**: your passphrase never leaves your device. Azure
and GitHub never see your actual financial data. Microsoft can
see that a file called mybgaccounts.dat exists on your OneDrive,
but its contents are encrypted.


## Key Accounts and Logins

| What | Where | Logged in with |
|------|-------|---------------|
| GitHub (code hosting) | github.com | Your GitHub account (bernieonline) |
| Azure Portal (app registration) | portal.azure.com | Your Microsoft account |
| The app itself (OneDrive access) | bernieonline.github.io/TrackMyApp | Your Microsoft account |

### If you change your Microsoft password
The app will ask you to sign in again next time. No other
action needed — the Azure app registration is not affected.

### If you change your GitHub password
No effect on the live site. You'll just need the new password
next time you push code from your PC.


## Troubleshooting Checklist

If something isn't working, go through this list in order:

1. **Can you reach the site?**
   Open https://bernieonline.github.io/TrackMyApp/ — if it
   doesn't load, it's a GitHub Pages issue (see above)

2. **Can you sign in?**
   Click Sign In — if it fails, check the Azure redirect URI
   matches your current URL exactly (see above)

3. **Can it read/write OneDrive?**
   If sign-in works but loading/saving fails, check the
   permissions haven't been revoked (see above)

4. **Can you decrypt?**
   If the data loads but won't decrypt, you may have the
   wrong passphrase. There is no password reset — the
   passphrase is the only way to read the data.
