// Script to migrate products.json data to Firebase Firestore
// Run this script once to upload all products to Firestore

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc } = require('firebase/firestore')
const productsData = require('../data/products.json')

const firebaseConfig = {
  apiKey: "AIzaSyCbR-ji3W7X4UXM7Q8QZPjc5X1vxwH4hLs",
  authDomain: "counterjob-19049.firebaseapp.com",
  projectId: "counterjob-19049",
  storageBucket: "counterjob-19049.firebasestorage.app",
  messagingSenderId: "575885343971",
  appId: "1:575885343971:web:933566bebc46a0511a19d6",
  measurementId: "G-V9CW1M65RP"
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
