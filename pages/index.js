import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.isLoggedIn === false) {
      router.push('/login')
      return
    }
    
    setUserName(user.name?.split(' ')[0] || 'there')
  }, [router])

  return (
    <div className={styles.container}>
      <Head>
        <title>CounterJob - Fast Queue, No Wait</title>
        <meta name="description" content="Skip the long queues at the counter. Self-scan, self-checkout, and breeze through your shopping." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Info Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.contactInfo}>
            <span>📞 +1 800 123 4567</span>
            <span>✉️ info@counterjob.com</span>
            <span>📍 Your Location</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <span className={styles.logoText}>CounterJob</span>
            <span className={styles.logoBadge}>FAST</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/scanner">HOME</Link>
            <Link href="/cart">ABOUT</Link>
            <Link href="/profile">TYPOGRAPHY</Link>
            <Link href="/scanner" className={styles.contactsLink}>CONTACTS</Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroPattern}></div>
            <h1 className={styles.heroTitle}>
              <span className={styles.theText}>the</span>
              <span className={styles.bestText}>best</span>
              <span className={styles.solutionsText}>solutions.</span>
            </h1>
            <div className={styles.heroUnderline}></div>
            <p className={styles.heroTagline}>Fresh Ideas for Your Business</p>
            <div className={styles.scrollDown}>
              <div className={styles.scrollIcon}>↓</div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.aboutSection}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutImage}>
              <div className={styles.imagePlaceholder}>🛒</div>
            </div>
            <div className={styles.aboutText}>
              <div className={styles.aboutLabel}>ABOUT US</div>
              <h2 className={styles.aboutTitle}>
                What We <span className={styles.doText}>Do</span>
              </h2>
              <div className={styles.aboutUnderline}></div>
              <p className={styles.aboutDescription}>
                Small or big, your business will love our financial help and business consultations! We are happy when our clients are too... Actually, this is quite simple to achieve - because each time we help them in sorting out different accounting intricacies or save the day before filing the taxes, they are so grateful!
              </p>
              <p className={styles.aboutDescription}>
                With CounterJob, you can scan products yourself, manage your cart in real-time, and complete your purchase - all from your phone. No more standing in endless queues. Just scan, pay, and go!
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3>Scan Products</h3>
              <p>Use your phone's camera to scan product barcodes as you shop.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛒</div>
              <h3>Review Cart</h3>
              <p>Check items and adjust quantities in real-time.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💳</div>
              <h3>Quick Checkout</h3>
              <p>Complete purchase instantly and skip the line.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>The future is fast and convenient.</h2>
            <p>Experience seamless shopping with our self-checkout system</p>
            <Link href="/scanner" className={styles.ctaButton}>Start Shopping Now</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>CounterJob © 2026 - Making Shopping Faster, One Scan at a Time</p>
      </footer>
    </div>
  )
}
