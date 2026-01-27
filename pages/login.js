import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem('user')
    if (user) {
      router.push('/scanner')
    }
  }, [router])

  const handleGoogleLogin = (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your Google email')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Check if it's a Google account (gmail.com or google-based domain)
    const isGoogleAccount = email.toLowerCase().includes('gmail.com') || 
                           email.toLowerCase().includes('@g.') ||
                           email.toLowerCase().includes('googlemail.com')
    
    if (!isGoogleAccount) {
      setError('Please use a Google account (Gmail or Google Workspace)')
      return
    }

    setIsLoading(true)
    setError('')

    // Extract name from email
    const username = email.split('@')[0].replace(/[._]/g, ' ')
    const name = username.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const userData = {
      email: email,
      name: name || 'User',
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285f4&color=fff&bold=true`,
      loggedInAt: new Date().toISOString(),
    }

    // Store user data
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Redirect to scanner
    setTimeout(() => {
      router.push('/scanner')
    }, 500)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Login - CounterJob</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <main className={styles.main}>
        <div className={styles.loginCard}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🛒</div>
            <h1>CounterJob</h1>
          </div>

          <div className={styles.welcomeText}>
            <h2>Welcome!</h2>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.signInSection}>
            <form onSubmit={handleGoogleLogin} className={styles.loginForm}>
              <div className={styles.googleIcon}>
                <svg viewBox="0 0 24 24" width="40" height="40">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className={styles.googleTitle}>Sign in with Google</h3>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Enter your Google email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Signing in...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
              <p className={styles.helpText}>
                Use your Gmail or Google Workspace account
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
