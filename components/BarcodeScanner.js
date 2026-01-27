import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import styles from '../styles/Scanner.module.css'

export default function BarcodeScanner({ onScan, onError }) {
  const videoRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(null)
  const [scanStatus, setScanStatus] = useState('idle')
  const codeReaderRef = useRef(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader

    const startScanner = async () => {
      try {
        console.log('Initializing scanner...')
        
        // Request camera permissions explicitly
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        
        console.log('Camera permission granted')
        setHasPermission(true)
        setScanStatus('scanning')

        // Get video devices
        const videoInputDevices = await codeReader.listVideoInputDevices()
        console.log(`Found ${videoInputDevices.length} camera(s)`)

        if (videoInputDevices.length === 0) {
          throw new Error('No camera devices found')
        }

        // Select camera (prefer back camera)
        let selectedDeviceId = videoInputDevices[0].deviceId
        for (const device of videoInputDevices) {
          const label = device.label.toLowerCase()
          if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
            selectedDeviceId = device.deviceId
            console.log('Selected back camera:', device.label)
            break
          }
        }

        // Start continuous decoding
        console.log('Starting continuous scan...')
        scanningRef.current = true
        
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (!scanningRef.current) return

            if (result) {
              const scannedCode = result.getText()
              console.log('✓ BARCODE DETECTED:', scannedCode)
              
              setScanStatus('success')
              playBeep()
              
              // Immediately pass to parent
              if (onScan) {
                onScan(scannedCode)
              }
              
              // Brief pause before next scan
              scanningRef.current = false
              setTimeout(() => {
                if (isMounted) {
                  setScanStatus('scanning')
                  scanningRef.current = true
                }
              }, 500)
            }
            
            // Only log non-NotFoundException errors
            if (error && !(error instanceof NotFoundException)) {
              console.error('Scanner error:', error)
            }
          }
        )
        
        console.log('✓ Scanner is now active and ready')
        
      } catch (error) {
        console.error('Failed to start scanner:', error)
        if (isMounted) {
          setHasPermission(false)
          if (onError) {
            onError(error.message || 'Camera access denied')
          }
        }
      }
    }

    startScanner()

    return () => {
      isMounted = false
      scanningRef.current = false
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset()
          console.log('Scanner stopped')
        } catch (e) {
          console.error('Error stopping scanner:', e)
        }
      }
    }
  }, [])

  // Play beep sound on successful scan
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 1200
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    } catch (e) {
      console.log('Audio not available')
    }
  }

  return (
    <div className={styles.scanner}>
      {hasPermission === false && (
        <div className={styles.error}>
          <p>📷 Camera Access Required</p>
          <p>Please allow camera access to scan barcodes</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}
      
      {hasPermission === null && (
        <div className={styles.loading}>
          <p>📷 Initializing Camera...</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Please allow camera access when prompted
          </p>
        </div>
      )}

      <video
        ref={videoRef}
        className={styles.video}
        style={{ display: hasPermission ? 'block' : 'none' }}
        playsInline
        autoPlay
        muted
      />
      
      {hasPermission && (
        <div className={styles.scannerOverlay}>
          <div className={`${styles.scannerFrame} ${scanStatus === 'success' ? styles.scanSuccess : ''}`}>
            <div className={styles.corner} style={{ top: 0, left: 0 }}></div>
            <div className={styles.corner} style={{ top: 0, right: 0 }}></div>
            <div className={styles.corner} style={{ bottom: 0, left: 0 }}></div>
            <div className={styles.corner} style={{ bottom: 0, right: 0 }}></div>
            {scanStatus === 'success' && (
              <div className={styles.scanSuccessIndicator}>✓</div>
            )}
          </div>
          <p className={styles.scannerText}>
            {scanStatus === 'success' ? '✓ Barcode Scanned!' : 'Point camera at barcode'}
          </p>
        </div>
      )}
    </div>
  )
}
