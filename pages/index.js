import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [router])

  return (
    <div className={styles.container}>
      <Head>
        <title>CounterJob - Barcode Scanner</title>
        <meta name="description" content="Barcode scanner application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to CounterJob
        </h1>

        <p className={styles.description}>
          Scan products to view their details
        </p>

        <div className={styles.grid}>
          <Link href="/scanner" className={styles.card}>
            <h2>Barcode Scanner &rarr;</h2>
            <p>Scan product barcodes to view details</p>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>CounterJob Barcode Scanner</p>
      </footer>
    </div>
  )
}
