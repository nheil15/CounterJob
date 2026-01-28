# Firebase Firestore Setup Instructions

Your CounterJob application has been successfully migrated to use Firebase Firestore instead of local JSON files! 

## ✅ What's Been Done

1. **Firebase SDK installed** - Added Firebase package to your project
2. **Firestore utilities created** - All database operations now use Firestore
3. **All pages updated** to use Firestore:
   - Product scanner and details
   - Shopping cart
   - Checkout process
   - Receipt viewing
   - Transaction history
   - User profile

## 🔧 Setup Steps Required

### 1. Get Your Firebase API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **CounterJob** (counterjob-19049)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web platform (</>) icon
7. Copy your `apiKey` and `appId`

### 2. Update Firebase Configuration

Open `firebase.js` and replace:
```javascript
apiKey: "YOUR_API_KEY"  // Replace with your actual API key
appId: "YOUR_APP_ID"    // Replace with your actual APP ID
```

### 3. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (preferably close to your users)
5. Click "Enable"

### 4. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - read only for authenticated users
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only allow writes from migration script or admin
    }
    
    // Transactions collection - users can read/write their own
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
                     resource.data.user.email == request.auth.token.email;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               resource.data.user.email == request.auth.token.email;
    }
    
    // Carts collection - users can read/write their own
    match /carts/{cartId} {
      allow read, write: if request.auth != null && 
                           resource.data.userEmail == request.auth.token.email;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Migrate Your Products Data

After completing steps 1-4, run this command to upload your products to Firestore:

```bash
cd "c:\Users\nheileduria\OneDrive\Documents\CounterJob"
node scripts/migrate-to-firestore.js
```

**Important:** Make sure to update the API key and App ID in `scripts/migrate-to-firestore.js` before running!

## 📊 Firestore Collections Structure

Your Firestore database will have three collections:

### `products`
```javascript
{
  barcode: "0123456789012",
  name: "Wireless Bluetooth Headphones",
  price: 49.99,
  category: "Electronics",
  stock: 45,
  description: "...",
  brand: "TechSound",
  sku: "TS-WH-001"
}
```

### `transactions`
```javascript
{
  id: "TXN1234567890",
  barcode: "TXN1234567890",
  items: [...],
  subtotal: 100.00,
  tax: 12.00,
  total: 112.00,
  date: Timestamp,
  user: { email, name, ... }
}
```

### `carts`
```javascript
{
  userEmail: "user@example.com",
  items: [...],
  updatedAt: Timestamp
}
```

## 🔒 Firebase Authentication (Optional Enhancement)

Currently, the app uses localStorage for user authentication. For better security, consider implementing Firebase Authentication:

1. Enable Email/Password or Google Sign-In in Firebase Console
2. Update login.js to use Firebase Auth
3. Use Firebase Auth tokens for Firestore security rules

## 🚀 Testing Your Setup

1. Complete steps 1-5 above
2. Run your development server: `npm run dev`
3. Log in and scan a product barcode
4. Check Firebase Console > Firestore Database to see data being created

## 💾 Data Backup

Your original data is still in `data/products.json` - don't delete it until you've confirmed everything works!

## 📝 Notes

- The app includes fallback to localStorage if Firestore fails
- All async operations are wrapped in try-catch for error handling
- Firestore queries are optimized for performance

## ❓ Troubleshooting

If you encounter issues:
1. Check browser console for error messages
2. Verify your API keys are correct in `firebase.js`
3. Ensure Firestore is enabled in your Firebase project
4. Check Firestore security rules allow your operations

---

**Questions?** Check the [Firebase Documentation](https://firebase.google.com/docs/firestore)
