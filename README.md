# CounterJob - Barcode Scanner

A Next.js application with barcode scanning functionality to scan products and display their details.

## Features

- 📷 Real-time barcode scanning using device camera
- 📦 Product details display after scanning
- 📊 Scan history tracking
- 📱 Responsive design
- 🎯 Support for multiple barcode formats (EAN, UPC, Code128, etc.)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Click on "Barcode Scanner" to access the scanner page

4. Allow camera permissions when prompted

5. Point your camera at a barcode to scan

## How to Use

1. Navigate to the Scanner page
2. Allow camera access in your browser
3. Position a barcode within the scanning frame
4. The app will automatically detect and scan the barcode
5. Product details will be displayed on the right side
6. Scan history is shown at the bottom

## Test Barcodes

You can test with these sample barcodes:
- `0123456789012` - Sample Product A
- `9876543210987` - Sample Product B
- `5555555555555` - Demo Product C

## Customization

### Adding Your Product Database

Edit the `productDatabase` object in [pages/scanner.js](pages/scanner.js) to add your products:

```javascript
const productDatabase = {
  'YOUR_BARCODE': {
    name: 'Your Product Name',
    barcode: 'YOUR_BARCODE',
    price: '$XX.XX',
    category: 'Category',
    stock: 100,
    description: 'Product description',
  }
}
```

### Connecting to an API

Replace the mock database with an API call in the `handleScan` function:

```javascript
const handleScan = async (barcode) => {
  try {
    const response = await fetch(`/api/products/${barcode}`)
    const product = await response.json()
    setScannedProduct(product)
  } catch (error) {
    console.error('Error fetching product:', error)
  }
}
```

## Technologies Used

- **Next.js** - React framework
- **@zxing/library** - Barcode scanning library
- **React Hooks** - State management

## Browser Compatibility

The barcode scanner requires:
- Camera access
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Troubleshooting

**Camera not working?**
- Make sure you've allowed camera permissions
- Check if your browser supports camera access
- Ensure you're using HTTPS (required for camera access in production)

**Barcode not scanning?**
- Ensure good lighting
- Hold the barcode steady within the frame
- Try different distances from the camera
- Make sure the barcode is clear and not damaged

## License

MIT
