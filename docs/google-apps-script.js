/**
 * Google Apps Script for Form Submission Webhook
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Form
 * 2. Click the three dots menu → Script editor
 * 3. Paste this entire script
 * 4. Update the CONFIG values below
 * 5. Save the script
 * 6. Run → Run function → Select "onFormSubmit" → Authorize the script
 * 7. Go to Triggers (clock icon) → Add Trigger:
 *    - Function: onFormSubmit
 *    - Event source: From form
 *    - Event type: On form submit
 * 8. Save the trigger
 * 
 * IMPORTANT: Make sure your Google Form questions match the field mappings below
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
  // Your API endpoint URL
  API_URL: 'https://your-api-domain.com/email/form-submission',
  
  // API Key for authentication (optional but recommended)
  // Set this to match your FORM_WEBHOOK_API_KEY environment variable
  API_KEY: 'your-api-key-here',
  
  // Map your Google Form question titles to API field names
  // Update the keys to match YOUR form's question titles exactly
  FIELD_MAPPING: {
    'Name': 'name',                    // Required
    'Email': 'email',                  // Required
    'Phone Number': 'phone',           // Optional
    // Add more fields as needed - they will be sent in additionalData
    // 'Your Message': 'message',
    // 'How did you hear about us?': 'source',
  }
};

// ============================================
// MAIN FUNCTION - Triggered on form submit
// ============================================
function onFormSubmit(e) {
  try {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // Build the payload
    const payload = {
      name: '',
      email: '',
      phone: '',
      additionalData: {}
    };
    
    // Process each form response
    itemResponses.forEach(function(itemResponse) {
      const questionTitle = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      
      // Check if this question is in our field mapping
      const fieldName = CONFIG.FIELD_MAPPING[questionTitle];
      
      if (fieldName) {
        if (['name', 'email', 'phone'].includes(fieldName)) {
          // Core fields
          payload[fieldName] = answer;
        } else {
          // Additional data fields
          payload.additionalData[fieldName] = answer;
        }
      } else {
        // Unmapped fields go to additionalData with sanitized key
        const sanitizedKey = questionTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');
        payload.additionalData[sanitizedKey] = answer;
      }
    });
    
    // Validate required fields
    if (!payload.name || !payload.email) {
      Logger.log('Error: Missing required fields (name or email)');
      Logger.log('Payload received: ' + JSON.stringify(payload));
      return;
    }
    
    // Remove empty additionalData if no extra fields
    if (Object.keys(payload.additionalData).length === 0) {
      delete payload.additionalData;
    }
    
    // Remove empty phone if not provided
    if (!payload.phone) {
      delete payload.phone;
    }
    
    // Send to API
    const response = sendToApi(payload);
    Logger.log('API Response: ' + JSON.stringify(response));
    
  } catch (error) {
    Logger.log('Error processing form submission: ' + error.toString());
  }
}

// ============================================
// API REQUEST FUNCTION
// ============================================
function sendToApi(payload) {
  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      'x-api-key': CONFIG.API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(CONFIG.API_URL, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();
  
  if (responseCode !== 200) {
    Logger.log('API Error - Status: ' + responseCode + ', Body: ' + responseBody);
    throw new Error('API returned status ' + responseCode);
  }
  
  return JSON.parse(responseBody);
}

// ============================================
// TEST FUNCTION - Use this to test your setup
// ============================================
function testSubmission() {
  const testPayload = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+62812345678',
    additionalData: {
      message: 'This is a test submission'
    }
  };
  
  Logger.log('Sending test payload: ' + JSON.stringify(testPayload));
  
  try {
    const response = sendToApi(testPayload);
    Logger.log('Success! Response: ' + JSON.stringify(response));
  } catch (error) {
    Logger.log('Test failed: ' + error.toString());
  }
}

// ============================================
// MANUAL TRIGGER SETUP (run once)
// ============================================
function createTrigger() {
  // Get the active form
  const form = FormApp.getActiveForm();
  
  // Delete any existing triggers
  const triggers = ScriptApp.getUserTriggers(form);
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Create new trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
    
  Logger.log('Trigger created successfully!');
}
