# OICAR Environment Variables Guide

## What We Did to Secure Our Secrets

We moved all our sensitive information out of our code files and into secure environment variable storage. This way our secrets aren't visible in our GitHub repository anymore.

## Azure Production API

Our production API runs on Azure App Service and gets its secrets from Application Settings. The database connection string looks like `Server=oicar-sql-server-***...920.database.windows.net` and the JWT secret key is `EFzyjphJnAtG***...v8c`. The encryption key is stored as `iqGmn4kVYz***...Pa` and the database password is `OicarAdmin***...4!`.

When our API runs on Azure, it automatically uses these environment variables instead of what's written in the code files.

## Local Development

For local development we use a `.env` file in the API folder. This file contains the same secrets as Azure but for when we run the API on our computer. The `.env` file is in `.gitignore` so it never gets uploaded to GitHub.

## Mobile App

The mobile app doesn't store any secrets anymore. We removed database passwords because the mobile app doesn't need them. JWT secret keys were removed since only the API needs these. Encryption keys were also removed because only the API handles encryption.

The mobile app only keeps the API endpoint URL which is fine to be public.

## JWT Token Details

The JWT secret lives only in the Azure API environment variables. Tokens expire after 60 minutes and refresh tokens expire after 7 days. When you login through the mobile app, the Azure API creates a JWT token using its secret key.

## Database Connection

The database password lives only in Azure environment variables. Our database server is `oicar-sql-server-***...920.database.windows.net`. The mobile app never talks directly to the database. It only talks to the API and the API talks to the database.

## What This Means

Our GitHub repository is now safe with no secrets visible. The production API is secure with Azure environment variables. Local development works with `.env` files. The mobile app is clean and only has what it needs. If someone sees our code they can't access our database or steal our secrets.

## Testing Results

We tested everything and it works perfectly. The mobile app connects to Azure API successfully. Login and authentication works correctly. Database operations work as expected. All secrets are properly hidden.

The mobile app logs show successful connection and login which proves our Azure environment variables are working correctly in production. 