# Get your Google OAuth Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing
3. Click "Create Credentials" → "OAuth client ID"
4. Application type: Web application
5. Add authorized JavaScript origins:
   - http://localhost:3000
   - http://127.0.0.1:3000
6. Add authorized redirect URIs:
   - http://localhost:3000
   - http://127.0.0.1:3000
7. Copy the Client ID
8. Create .env.local file with:

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
