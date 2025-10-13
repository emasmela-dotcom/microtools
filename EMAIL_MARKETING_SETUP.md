# Email Marketing Integration Setup Guide

This guide will help you configure Mailchimp and ConvertKit integration for your Digital Hermit landing page.

## 🚀 Quick Setup

### Step 1: Choose Your Email Provider

You can use either **Mailchimp** or **ConvertKit**. Both are fully supported with the same features.

### Step 2: Get Your API Credentials

#### For Mailchimp:
1. Go to [Mailchimp](https://mailchimp.com/) and log in
2. Navigate to **Account** → **Extras** → **API keys**
3. Create a new API key or copy an existing one
4. Go to **Audience** → **All contacts** → **Settings** → **Audience name and defaults**
5. Copy your **Audience ID** (List ID)
6. Note your **Server prefix** (e.g., us1, us2, etc.)

#### For ConvertKit:
1. Go to [ConvertKit](https://convertkit.com/) and log in
2. Navigate to **Account** → **Settings** → **API**
3. Copy your **API Key**
4. Go to **Forms** and create a new form or use an existing one
5. Copy the **Form ID** from the form settings

### Step 3: Configure Your Integration

1. **Open `js/email-marketing.js`**
2. **Find the `EMAIL_MARKETING_CONFIG` object** (around line 12)
3. **Update the configuration:**

#### For Mailchimp:
```javascript
const EMAIL_MARKETING_CONFIG = {
    enabled: true,
    provider: 'mailchimp', // Set to 'mailchimp'
    
    mailchimp: {
        enabled: true,
        apiKey: 'your-actual-api-key-here', // Replace with your API key
        listId: 'your-actual-list-id-here', // Replace with your List ID
        serverPrefix: 'us1', // Replace with your server prefix
        tags: ['digital-hermit', 'landing-page'],
        doubleOptIn: true, // Set to false to skip email confirmation
        updateExisting: true
    }
};
```

#### For ConvertKit:
```javascript
const EMAIL_MARKETING_CONFIG = {
    enabled: true,
    provider: 'convertkit', // Set to 'convertkit'
    
    convertkit: {
        enabled: true,
        apiKey: 'your-actual-api-key-here', // Replace with your API key
        formId: 'your-actual-form-id-here', // Replace with your Form ID
        tags: ['digital-hermit', 'landing-page'],
        doubleOptIn: true, // Set to false to skip email confirmation
        updateExisting: true
    }
};
```

## 🔧 Advanced Configuration

### Custom Fields Mapping

You can map form fields to custom fields in your email provider:

#### Mailchimp Custom Fields:
```javascript
mergeFields: {
    FNAME: 'name', // Maps form name to Mailchimp FNAME field
    INTERESTS: 'interests', // Maps interests to custom field
    HOBBIES: 'hobbies', // Maps hobbies to custom field
    LOCATION: 'location' // Maps location to custom field
}
```

#### ConvertKit Custom Fields:
```javascript
fields: {
    first_name: 'name', // Maps form name to ConvertKit first_name field
    interests: 'interests', // Maps interests to custom field
    hobbies: 'hobbies', // Maps hobbies to custom field
    location: 'location' // Maps location to custom field
}
```

### Tags and Segmentation

Add tags to automatically segment your subscribers:

```javascript
tags: [
    'digital-hermit',
    'landing-page',
    'interest-based-matching',
    'privacy-focused'
]
```

### Double Opt-in Settings

Control whether users need to confirm their email:

```javascript
doubleOptIn: true, // Users must confirm their email
// or
doubleOptIn: false, // Users are subscribed immediately
```

## 🧪 Testing Your Setup

### Test Connection

1. **Open your browser's developer console** (F12)
2. **Run this command:**
   ```javascript
   window.emailMarketing.testConnection()
   ```
3. **Check the result** - you should see success message with your list/form details

### Test Form Submission

1. **Fill out the form** on your landing page
2. **Submit the form**
3. **Check your email provider** to see if the subscriber was added
4. **Check the browser console** for any error messages

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const EMAIL_MARKETING_CONFIG = {
    enabled: true,
    debug: true, // Enable debug mode
    // ... rest of config
};
```

## 📊 What Gets Synced

### Form Data Mapped to Email Provider:

- **Name** → First Name field
- **Email** → Email address
- **Interests** → Custom field (comma-separated)
- **Hobbies** → Custom field
- **Submission timestamp** → Automatically tracked
- **Tags** → Applied based on configuration

### Analytics Integration:

- **Subscription success** events tracked
- **Subscription failure** events tracked
- **Provider performance** metrics
- **Conversion rates** monitoring

## 🔒 Security & Privacy

### API Key Security:
- **Never commit API keys** to version control
- **Use environment variables** in production
- **Rotate API keys** regularly
- **Monitor API usage** for unusual activity

### Data Privacy:
- **GDPR compliance** with double opt-in
- **Data encryption** in transit
- **Minimal data collection** principle
- **User consent** tracking

## 🚨 Troubleshooting

### Common Issues

#### "Invalid API key" Error
- **Check your API key** is correct and active
- **Verify server prefix** for Mailchimp
- **Ensure API key has proper permissions**

#### "List/Form not found" Error
- **Verify List ID** (Mailchimp) or **Form ID** (ConvertKit)
- **Check if list/form exists** and is active
- **Ensure API key has access** to the list/form

#### "Network error" Message
- **Check internet connection**
- **Verify CORS settings** if testing locally
- **Check browser console** for detailed errors

#### Subscribers Not Appearing
- **Check double opt-in settings** - users may need to confirm email
- **Verify tags and custom fields** are properly configured
- **Check spam folder** for confirmation emails
- **Review email provider logs** for errors

### Debug Steps

1. **Enable debug mode:**
   ```javascript
   debug: true
   ```

2. **Check browser console** for detailed logs

3. **Test connection:**
   ```javascript
   window.emailMarketing.testConnection()
   ```

4. **Verify configuration:**
   ```javascript
   window.emailMarketing.getConfig()
   ```

## 📈 Analytics & Monitoring

### Tracked Events:
- `email_subscription_success` - Successful subscription
- `email_subscription_error` - Failed subscription
- `email_provider_connection_test` - Connection test results

### Metrics to Monitor:
- **Subscription success rate**
- **Provider response times**
- **Error frequency**
- **User engagement** after subscription

## 🔄 Fallback Handling

### When Email Provider Fails:
1. **Data saved to localStorage** as backup
2. **User sees success message** (form still works)
3. **Admin can export fallback data** from dashboard
4. **Retry mechanism** for failed subscriptions

### Fallback Data Location:
- **localStorage key:** `email_fallback_subscriptions`
- **Access via admin dashboard** export feature
- **Manual retry** capability

## 🚀 Production Deployment

### Environment Variables:
```javascript
// Use environment variables in production
const EMAIL_MARKETING_CONFIG = {
    mailchimp: {
        apiKey: process.env.MAILCHIMP_API_KEY,
        listId: process.env.MAILCHIMP_LIST_ID,
        serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX
    }
};
```

### Server-Side Integration:
For production, consider moving email integration to your backend:
- **More secure** API key handling
- **Better error handling**
- **Rate limiting** protection
- **Audit logging**

## 📞 Support

### Getting Help:
1. **Check this guide** for common solutions
2. **Enable debug mode** for detailed logging
3. **Test connection** to verify setup
4. **Check email provider documentation**

### Email Provider Support:
- **Mailchimp:** [API Documentation](https://mailchimp.com/developer/)
- **ConvertKit:** [API Documentation](https://developers.convertkit.com/)

---

**Ready to go live?** Test your setup and start collecting email subscribers automatically! 🎯
