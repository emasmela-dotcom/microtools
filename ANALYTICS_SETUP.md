# Analytics Setup Guide

This guide will help you configure Google Analytics 4 and Facebook Pixel tracking for your Digital Hermit landing page.

## 🚀 Quick Setup

### Step 1: Get Your Tracking IDs

#### Google Analytics 4
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use an existing one
3. Go to **Admin** → **Data Streams** → **Web**
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

#### Facebook Pixel
1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Events Manager**
3. Create a new Pixel or use an existing one
4. Copy your **Pixel ID** (format: `123456789012345`)

### Step 2: Configure Analytics

1. Open `js/analytics.js`
2. Find the `ANALYTICS_CONFIG` object at the top of the file
3. Replace the placeholder values:

```javascript
const ANALYTICS_CONFIG = {
    googleAnalytics: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 Measurement ID
        debug: false, // Set to true for testing
    },
    
    facebookPixel: {
        enabled: true,
        pixelId: '123456789012345', // Replace with your Facebook Pixel ID
    },
    
    // ... rest of config
};
```

### Step 3: Test Your Setup

1. Open your landing page in a browser
2. Open Developer Tools (F12) → Console
3. Look for these messages:
   - ✅ "Google Analytics 4 initialized"
   - ✅ "Facebook Pixel initialized"
   - ✅ "Analytics tracking initialized"

## 📊 What Gets Tracked

### Automatic Tracking
- **Page Views**: When users visit your landing page
- **Scroll Depth**: 25%, 50%, 75%, 90% milestones
- **Time on Page**: 30 seconds, 1 minute, 2 minutes milestones
- **Form Interactions**: Field focus, blur, and validation errors
- **Interest Selections**: Which interests users select
- **Form Submissions**: Successful signups with user data

### Custom Events
- `form_submission`: When users successfully submit the form
- `form_validation_error`: When form validation fails
- `interest_selection`: When users select/deselect interests
- `button_click`: When users click the submit button
- `scroll_depth`: When users scroll to specific depths
- `time_on_page`: Time-based engagement tracking

## 🔧 Advanced Configuration

### Enable Debug Mode
For testing and development, enable debug mode:

```javascript
googleAnalytics: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX',
    debug: true, // Enable debug mode
}
```

### Disable Specific Tracking
You can disable individual tracking features:

```javascript
settings: {
    trackFormInteractions: false, // Disable form tracking
    trackScrollDepth: false,      // Disable scroll tracking
    trackTimeOnPage: false,       // Disable time tracking
    trackInterestSelections: false, // Disable interest tracking
}
```

### Privacy Settings
The analytics respect user privacy preferences:

```javascript
settings: {
    respectDoNotTrack: true,  // Respect Do Not Track header
    anonymizeIP: true,        // Anonymize IP addresses
}
```

## 📈 Analytics Dashboard

### Google Analytics 4
View your data in the GA4 dashboard:
- **Real-time**: See live user activity
- **Events**: View custom events and conversions
- **Audiences**: Create custom audiences based on behavior
- **Conversions**: Track form submissions as conversions

### Facebook Pixel
View your data in Facebook Events Manager:
- **Events**: See all tracked events
- **Custom Audiences**: Create audiences for retargeting
- **Conversions**: Track form submissions as conversions
- **Attribution**: See which ads drive conversions

## 🎯 Setting Up Conversions

### Google Analytics 4
1. Go to **Admin** → **Events** → **Create Event**
2. Create a conversion event for `form_submission`
3. Set up conversion tracking in your GA4 property

### Facebook Pixel
1. Go to **Events Manager** → **Custom Conversions**
2. Create a conversion for `CompleteRegistration` event
3. Set up conversion tracking for your campaigns

## 🔍 Testing Your Setup

### Google Analytics 4
1. Use **Real-time** reports to see live data
2. Use **DebugView** in GA4 for detailed event tracking
3. Check **Events** report for custom events

### Facebook Pixel
1. Use **Facebook Pixel Helper** browser extension
2. Check **Events Manager** for real-time events
3. Use **Test Events** feature for debugging

## 🚨 Troubleshooting

### Common Issues

#### Analytics Not Loading
- Check that your Measurement ID and Pixel ID are correct
- Ensure the analytics.js file is loaded before script.js
- Check browser console for JavaScript errors

#### Events Not Tracking
- Verify that the analytics object is available: `window.analytics`
- Check that events are being fired in the console
- Ensure your tracking IDs are properly configured

#### Privacy Compliance
- The analytics respect Do Not Track preferences
- IP addresses are anonymized by default
- No personally identifiable information is sent to analytics

### Debug Mode
Enable debug mode to see detailed logging:

```javascript
googleAnalytics: {
    debug: true,
}
```

This will log all events to the browser console for debugging.

## 📋 Checklist

- [ ] Google Analytics 4 property created
- [ ] Facebook Pixel created
- [ ] Measurement ID added to analytics.js
- [ ] Pixel ID added to analytics.js
- [ ] Analytics loading confirmed in console
- [ ] Form submission tracking tested
- [ ] Conversion events set up in GA4
- [ ] Conversion events set up in Facebook
- [ ] Privacy settings configured
- [ ] Debug mode tested (if needed)

## 🔒 Privacy & Compliance

This analytics implementation includes:
- **Do Not Track** respect
- **IP anonymization**
- **GDPR compliance** considerations
- **No PII** in analytics data
- **User consent** handling (you may want to add a cookie banner)

## 📞 Support

If you need help with analytics setup:
1. Check the browser console for error messages
2. Verify your tracking IDs are correct
3. Test with debug mode enabled
4. Check the analytics dashboards for data

---

**Note**: Replace the placeholder IDs with your actual tracking IDs before going live!
