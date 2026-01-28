// Script to migrate products.json data to Firebase Firestore
// Run this script once to upload all products to Firestore

require('dotenv').config({ path: '.env.local' })
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc } = require('firebase/firestore')
const productsData = require('../data/products.json')

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrateProducts() {
  console.log('Starting migration...')
  console.log(`Found ${productsData.products.length} products to migrate`)

  let successCount = 0
  let errorCount = 0

  for (const product of productsData.products) {
    try {
      const docRef = await addDoc(collection(db, 'products'), product)
      console.log(`✓ Added product: ${product.name} (ID: ${docRef.id})`)
      successCount++
    } catch (error) {
      console.error(`✗ Error adding product ${product.name}:`, error)
      errorCount++
    }
  }

  console.log('\n=== Migration Complete ===')
  console.log(`Successfully migrated: ${successCount} products`)
  console.log(`Failed: ${errorCount} products`)
  console.log('\nYou can now use Firestore for your product data!')
  
  process.exit(0)
}

// Run the migration
migrateProducts().catch(error => {
  console.error('Migration failed:', error)
  process.exit(1)
})
