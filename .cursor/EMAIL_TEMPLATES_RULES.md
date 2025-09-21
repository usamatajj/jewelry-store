# Email Templates Rules for Cursor AI

## Overview

The jewelry store application includes a comprehensive email system with custom HTML templates for user authentication and order management.

## Template Structure

### Location

- **Templates Folder**: `/templates/email/` (outside Next.js build process)
- **Documentation**: `.cursor/EMAIL_TEMPLATES.md`
- **Email Service**: `src/lib/email-service.ts`
- **Order API**: `src/app/api/orders/route.ts`

### Available Templates

1. **Signup Confirmation** (`signup-confirmation.html`)

   - **Purpose**: Welcome new users after registration
   - **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`
   - **Integration**: Supabase Auth email templates

2. **Password Reset** (`password-reset.html`)

   - **Purpose**: Password reset requests
   - **Variables**: `{{ .Email }}`, `{{ .ConfirmationURL }}`
   - **Integration**: Supabase Auth email templates

3. **Order Confirmation** (`order-confirmation.html`)
   - **Purpose**: Order confirmation with full details
   - **Variables**: Dynamic order data (customer, items, totals, shipping)
   - **Integration**: Automatic sending via order API

## Email Service Configuration

### Current Setup

- **Service**: Resend API integration
- **Environment Variable**: `RESEND_API_KEY`
- **Fallback**: Graceful error handling if email fails

### Template Variables for Order Confirmation

```typescript
interface OrderConfirmationData {
  customerName: string;
  email: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string;
  estimatedDelivery: string;
  orderTrackingURL: string;
}
```

## Implementation Rules

### 1. Template Design

- **Styling**: Inline CSS for email client compatibility
- **Branding**: Gold color scheme (`#d4af37`) matching store theme
- **Responsive**: Mobile-friendly design
- **Images**: Use reliable CDN-hosted images

### 2. Email Service Integration

- **Error Handling**: Never fail orders if email sending fails
- **Logging**: Log email failures for debugging
- **Fallback**: Continue order processing even if email fails

### 3. Supabase Auth Templates

- **Setup**: Copy HTML to Supabase Dashboard → Authentication → Email Templates
- **Variables**: Use Supabase's template variable syntax
- **Testing**: Test with real email addresses

### 4. Order Confirmation Flow

1. Order created in database
2. Order items inserted
3. Product details fetched for email
4. Email HTML generated dynamically
5. Email sent via Resend API
6. Success/failure logged

## Development Guidelines

### When Adding New Email Types

1. Create HTML template in `/templates/email/`
2. Add email service function in `src/lib/email-service.ts`
3. Update documentation in `.cursor/EMAIL_TEMPLATES.md`
4. Test across multiple email clients

### When Modifying Templates

1. Keep inline CSS for compatibility
2. Test in multiple email clients
3. Verify all links work correctly
4. Check mobile responsiveness

### Environment Variables Required

```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3002  # for production
```

## Testing Checklist

### Email Templates

- [ ] Test in Gmail, Outlook, Apple Mail
- [ ] Check mobile email clients
- [ ] Verify all links work
- [ ] Test with different screen sizes
- [ ] Confirm variable replacement works

### Order Confirmation

- [ ] Test complete checkout flow
- [ ] Verify email is sent
- [ ] Check email content accuracy
- [ ] Test with multiple items
- [ ] Verify order tracking link

## Troubleshooting

### Common Issues

1. **Templates not updating**: Clear cache, check Supabase dashboard
2. **Emails not sending**: Verify API keys, check email service logs
3. **Styling issues**: Ensure inline CSS, test across clients
4. **Variables not replacing**: Check exact variable names

### Debug Steps

1. Check browser console for errors
2. Verify environment variables
3. Test email service API directly
4. Check Supabase email template settings
5. Review email service logs

## Security Considerations

- Never include sensitive data in email templates
- Use HTTPS for all links
- Validate user input before including in emails
- Consider rate limiting for email sending
- Sanitize dynamic content

## Future Enhancements

- Add email templates for:

  - Order shipping notifications
  - Order delivery confirmations
  - Abandoned cart reminders
  - Newsletter subscriptions
  - Customer feedback requests

- Consider implementing:
  - Email analytics tracking
  - A/B testing for templates
  - Automated email sequences
  - Customer preference management
