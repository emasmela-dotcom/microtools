# 🧪 Analytics Testing Guide

This guide will help you test and verify your analytics setup for the Digital Hermit landing page.

## 🚀 Quick Test Setup

### Step 1: Configure Your Tracking IDs

1. **Open `js/analytics.js`**
2. **Find the `ANALYTICS_CONFIG` object** (around line 12)
3. **Replace the placeholder values:**

```javascript
const ANALYTICS_CONFIG = {
    googleAnalytics: {
        enabled: true,
        measurementId: 'G-ABC123DEF4', // Your actual GA4 ID
        debug: true, // Enable for testing
    },
    
    facebookPixel: {
        enabled: true,
        pixelId: '123456789012345', // Your actual Pixel ID
    },
    // ... rest of config
};
```

### Step 2: Test Your Configuration

1. **Open `test-analytics.html`** in your browser
2. **Check the status indicators:**
   - ✅ Green = Working correctly
   - ⚠️ Yellow = Needs configuration
   - ❌ Red = Error or not loaded

3. **Test different events** using the test buttons
4. **Monitor the console output** for event confirmations

## 🔍 Detailed Testing Steps

### Test 1: Basic Configuration Check

1. Open `test-analytics.html`
2. Look for these messages in the console:
   ```
   ✅ Analytics configuration loaded
   ✅ Google Analytics: Configured
   ✅ Facebook Pixel: Configured
   ✅ Analytics initialized successfully
   ```

### Test 2: Event Tracking

Click each test button and verify:

#### Page View Test
- **Button:** "Test Page View"
- **Expected:** Console shows "✅ Page view event sent"
- **GA4:** Check Real-time reports
- **Facebook:** Check Events Manager

#### Form Submission Test
- **Button:** "Test Form Submission"
- **Expected:** Console shows "✅ Form submission event sent"
- **GA4:** Look for `form_submission` event
- **Facebook:** Look for `CompleteRegistration` event

#### Button Click Test
- **Button:** "Test Button Click"
- **Expected:** Console shows "✅ Button click event sent"
- **GA4:** Look for `button_click` event

#### Validation Error Test
- **Button:** "Test Validation Error"
- **Expected:** Console shows "✅ Validation error event sent"
- **GA4:** Look for `form_validation_error` event

#### Interest Selection Test
- **Button:** "Test Interest Selection"
- **Expected:** Console shows "✅ Interest selection event sent"
- **GA4:** Look for `interest_selection` event

### Test 3: Live Landing Page

1. **Open `index.html`** in your browser
2. **Fill out the form** with test data
3. **Submit the form**
4. **Check analytics dashboards** for the events

## 📊 Verifying in Analytics Dashboards

### Google Analytics 4

1. **Go to your GA4 property**
2. **Check Real-time reports:**
   - **Real-time** → **Overview**: Should show active users
   - **Real-time** → **Events**: Should show custom events

3. **Check Events report:**
   - **Events** → **All events**: Look for your custom events
   - **Events** → **Conversions**: Set up form_submission as conversion

### Facebook Pixel

1. **Go to Facebook Events Manager**
2. **Check Test Events:**
   - **Events Manager** → **Test Events**: Should show live events
   - **Events Manager** → **Overview**: Should show event counts

3. **Check Pixel Helper:**
   - Install Facebook Pixel Helper browser extension
   - Visit your landing page
   - Should show green checkmarks for events

## 🐛 Troubleshooting

### Common Issues

#### "Analytics not loaded"
- **Check:** Is `analytics.js` loading before `script.js`?
- **Fix:** Ensure script order in HTML is correct

#### "Please configure your Measurement ID"
- **Check:** Did you replace `GA_MEASUREMENT_ID` with your actual ID?
- **Fix:** Update the `measurementId` in `analytics.js`

#### "Please configure your Pixel ID"
- **Check:** Did you replace `FACEBOOK_PIXEL_ID` with your actual ID?
- **Fix:** Update the `pixelId` in `analytics.js`

#### Events not showing in dashboards
- **Check:** Are you using the correct property/pixel?
- **Check:** Is debug mode enabled for testing?
- **Check:** Are there any JavaScript errors in console?

### Debug Mode

Enable debug mode for detailed logging:

```javascript
googleAnalytics: {
    enabled: true,
    measurementId: 'G-ABC123DEF4',
    debug: true, // Enable debug mode
}
```

This will show detailed event information in the browser console.

## ✅ Testing Checklist

- [ ] Analytics configuration loaded successfully
- [ ] Google Analytics 4 initialized
- [ ] Facebook Pixel initialized
- [ ] Page view events tracked
- [ ] Form submission events tracked
- [ ] Button click events tracked
- [ ] Validation error events tracked
- [ ] Interest selection events tracked
- [ ] Events visible in GA4 Real-time reports
- [ ] Events visible in Facebook Events Manager
- [ ] No JavaScript errors in console
- [ ] Debug mode working (if enabled)

## 🎯 Expected Results

### Console Output
```
🔍 Analytics Test Page Loaded
📊 Checking analytics setup...
✅ Analytics configuration loaded
✅ Google Analytics: Configured
✅ Facebook Pixel: Configured
✅ Analytics initialized successfully
```

### GA4 Real-time Reports
- Active users: 1+
- Events: page_view, form_submission, etc.
- Custom events: All your tracked events

### Facebook Events Manager
- Test Events: Live events showing
- Pixel Helper: Green checkmarks
- Event counts: Increasing numbers

## 🚀 Going Live

Once testing is complete:

1. **Set debug mode to false:**
   ```javascript
   debug: false, // Disable debug mode for production
   ```

2. **Test on the live landing page:**
   - Fill out the actual form
   - Submit with real data
   - Verify events in dashboards

3. **Set up conversions:**
   - **GA4:** Mark `form_submission` as conversion
   - **Facebook:** Set up `CompleteRegistration` conversion

4. **Monitor performance:**
   - Check conversion rates
   - Monitor user behavior
   - Optimize based on data

---

**Need help?** Check the browser console for error messages and refer to the `ANALYTICS_SETUP.md` guide for detailed configuration instructions.
