/**
 * Analytics Configuration Helper
 * 
 * This script helps you quickly configure your analytics tracking IDs
 * Run this in your browser console to update the configuration
 */

// Configuration helper function
function configureAnalytics(gaId, fbPixelId) {
    console.log('🔧 Configuring Analytics...');
    
    // Validate Google Analytics ID format
    if (gaId && !gaId.startsWith('G-')) {
        console.warn('⚠️ Google Analytics ID should start with "G-" (e.g., G-ABC123DEF4)');
    }
    
    // Validate Facebook Pixel ID format
    if (fbPixelId && !/^\d{15,16}$/.test(fbPixelId)) {
        console.warn('⚠️ Facebook Pixel ID should be 15-16 digits (e.g., 123456789012345)');
    }
    
    // Create configuration object
    const config = {
        googleAnalytics: {
            enabled: !!gaId,
            measurementId: gaId || 'GA_MEASUREMENT_ID',
            debug: false
        },
        facebookPixel: {
            enabled: !!fbPixelId,
            pixelId: fbPixelId || 'FACEBOOK_PIXEL_ID'
        }
    };
    
    console.log('📊 Configuration:', config);
    
    // Instructions for manual update
    console.log(`
📝 To apply this configuration:

1. Open js/analytics.js
2. Find the ANALYTICS_CONFIG object
3. Update these lines:

   measurementId: '${gaId || 'GA_MEASUREMENT_ID'}',
   pixelId: '${fbPixelId || 'FACEBOOK_PIXEL_ID'}',

4. Save the file and refresh your page
5. Test using test-analytics.html
    `);
    
    return config;
}

// Example usage:
console.log(`
🚀 Analytics Configuration Helper

Usage:
configureAnalytics('G-ABC123DEF4', '123456789012345')

Examples:
// Google Analytics only
configureAnalytics('G-ABC123DEF4', null)

// Facebook Pixel only  
configureAnalytics(null, '123456789012345')

// Both
configureAnalytics('G-ABC123DEF4', '123456789012345')

// Disable both
configureAnalytics(null, null)
`);

// Make function available globally
window.configureAnalytics = configureAnalytics;
