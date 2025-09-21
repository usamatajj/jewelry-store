# Email Templates for Luxe Jewelry Store

This folder contains HTML email templates for the jewelry store application.

## Available Templates

### 1. Signup Confirmation (`signup-confirmation.html`)

- **Purpose**: Sent when a new user signs up
- **Variables**:
  - `{{ .Email }}` - User's email address
  - `{{ .ConfirmationURL }}` - Email confirmation link
- **Usage**: Automatically sent by Supabase Auth when email confirmation is enabled

### 2. Password Reset (`password-reset.html`)

- **Purpose**: Sent when a user requests a password reset
- **Variables**:
  - `{{ .Email }}` - User's email address
  - `{{ .ConfirmationURL }}` - Password reset link
- **Usage**: Automatically sent by Supabase Auth when password reset is requested

### 3. Order Confirmation (`order-confirmation.html`)

- **Purpose**: Sent after a successful order placement
- **Variables**:
  - `{{ .CustomerName }}` - Customer's full name
  - `{{ .OrderNumber }}` - Order number
  - `{{ .OrderDate }}` - Date of the order
  - `{{ .ItemName }}` - Product name (for single item orders)
  - `{{ .ItemPrice }}` - Product price
  - `{{ .Subtotal }}` - Order subtotal
  - `{{ .ShippingCost }}` - Shipping cost
  - `{{ .Tax }}` - Tax amount
  - `{{ .Total }}` - Total order amount
  - `{{ .ShippingAddress }}` - Delivery address
  - `{{ .EstimatedDelivery }}` - Estimated delivery date
  - `{{ .OrderTrackingURL }}` - Link to track the order
- **Usage**: Sent automatically via the order API when an order is created

## How to Use These Templates

### For Supabase Auth Templates (Signup & Password Reset)

1. **Access Supabase Dashboard**:

   - Go to your Supabase project dashboard
   - Navigate to **Authentication** → **Email Templates**

2. **Update Templates**:

   - Copy the HTML content from the template files
   - Paste into the corresponding Supabase email template editor
   - Replace the Go template variables (`{{ .VariableName }}`) with Supabase's variables:
     - `{{ .Email }}` → `{{ .Email }}`
     - `{{ .ConfirmationURL }}` → `{{ .ConfirmationURL }}`

3. **Save Changes**:
   - Click "Save" in the Supabase dashboard
   - Test by signing up a new user or requesting a password reset

### For Order Confirmation Emails

The order confirmation email is handled automatically by the application:

1. **Email Service**: The app uses the `email-service.ts` utility to send emails
2. **Integration**: Currently configured to work with Resend (but can be adapted for other services)
3. **Automatic Sending**: Emails are sent when orders are created via `/api/orders`

## Email Service Configuration

### Using Resend (Recommended)

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get API Key**: Generate an API key from your Resend dashboard
3. **Add to Environment Variables**:
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   ```

### Using Other Email Services

You can modify `src/lib/email-service.ts` to work with:

- **SendGrid**: Replace the fetch call with SendGrid's API
- **Mailgun**: Use Mailgun's API endpoints
- **AWS SES**: Use AWS SDK for email sending
- **Nodemailer**: For SMTP-based email sending

## Customization

### Styling

- All templates use inline CSS for maximum email client compatibility
- Colors and fonts can be customized by editing the `<style>` sections
- The gold color scheme (`#d4af37`) matches the jewelry store branding

### Content

- Update the store name, address, and contact information in the footer
- Modify the welcome messages and feature lists as needed
- Add your actual social media links

### Images

- Replace placeholder image URLs with your actual product images
- Ensure images are hosted on a reliable CDN
- Consider using base64 encoded images for critical branding elements

## Testing

### Local Testing

1. Use email testing services like:
   - [Mailtrap](https://mailtrap.io) for development
   - [Litmus](https://litmus.com) for email client testing
   - [Email on Acid](https://www.emailonacid.com) for comprehensive testing

### Production Testing

1. Test with real email addresses on different providers (Gmail, Outlook, Apple Mail)
2. Check mobile email clients
3. Verify all links work correctly
4. Test with different screen sizes

## Troubleshooting

### Common Issues

1. **Templates not updating**: Clear browser cache and check Supabase dashboard
2. **Emails not sending**: Verify API keys and email service configuration
3. **Styling issues**: Ensure all CSS is inline and test across email clients
4. **Variables not replacing**: Check that variable names match exactly

### Support

For issues with:

- **Supabase Auth templates**: Check Supabase documentation
- **Order confirmation emails**: Review the `email-service.ts` configuration
- **Template styling**: Test in multiple email clients and adjust CSS

## Security Notes

- Never include sensitive information in email templates
- Use HTTPS for all links in emails
- Validate all user input before including in email content
- Consider implementing email rate limiting to prevent abuse
