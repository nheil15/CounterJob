import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCbR-ji3W7X4UXM7Q8QZPjc5X1vxwH4hLs",
  authDomain: "counterjob-19049.firebaseapp.com",
  projectId: "counterjob-19049",
  storageBucket: "counterjob-19049.firebasestorage.app",
  messagingSenderId: "575885343971",
  appId: "1:575885343971:web:933566bebc46a0511a19d6",
  measurementId: "G-V9CW1M65RP"
}

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export { db }
