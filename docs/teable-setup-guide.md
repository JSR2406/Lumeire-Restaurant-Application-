# Teable Setup Guide: Reservations Table & Email Automation

## Step 1: Verify Reservations Table Fields

Your Reservations table should have these fields:

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| Customer Name | Text | Primary field |
| Email | Email | Required |
| Phone | Phone | |
| Number of Guests | Number | |
| Special Requests | Long Text | |
| Status | Single Select | Options: "Pending", "Confirmed", "Cancelled" |
| Confirm | Checkbox | Default: unchecked |
| time slot | Single Select | Options: "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM", "08:00 PM - 10:00 PM" |
| Date | Link to Reservation Slots | |

## Step 2: Create Email Automation in Teable

1. Go to your Teable base
2. Click on "Automations" in the left sidebar
3. Click "+ New Automation"
4. Name it: "Send Reservation Confirmation Email"

### Trigger Setup:
- **Trigger Type**: "When record is created"
- **Table**: Select "Reservations"

### Action Setup:
- **Action Type**: "Send email"
- **To**: `{Email}` (use the Email field)
- **Subject**: `Reservation Confirmation - The Savory Table`
- **Body**: Use HTML mode and paste the email template below

## Step 3: Email Template (Copy this into Teable)

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background-color: #8B4513; padding: 30px; text-align: center;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">THE SAVORY TABLE</h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #333; margin: 0 0 20px; font-size: 24px; text-align: center;">Confirm Your Reservation</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Dear <strong>{Customer Name}</strong>,
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Thank you for your reservation request at The Savory Table. Please review your booking details below and click the button to confirm.
        </p>
        
        <!-- Reservation Details -->
        <table width="100%" style="background-color: #f9f9f9; border-radius: 8px; margin: 25px 0; padding: 20px;">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 8px 0; color: #333;"><strong>Date:</strong> {Date}</p>
              <p style="margin: 8px 0; color: #333;"><strong>Time:</strong> {time slot}</p>
              <p style="margin: 8px 0; color: #333;"><strong>Party Size:</strong> {Number of Guests} guests</p>
              <p style="margin: 8px 0; color: #333;"><strong>Special Requests:</strong> {Special Requests}</p>
            </td>
          </tr>
        </table>
        
        <!-- Confirm Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="https://lumeire-restaurant-application-janmejaysingh-invicis-projects.vercel.app/confirm-reservation?id={Record ID}" 
                 style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold;">
                Confirm My Reservation
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
          If the button doesn't work, copy and paste this link:<br>
          <a href="https://lumeire-restaurant-application-janmejaysingh-invicis-projects.vercel.app/confirm-reservation?id={Record ID}" style="color: #6366f1;">
            https://lumeire-restaurant-application-janmejaysingh-invicis-projects.vercel.app/confirm-reservation?id={Record ID}
          </a>
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #333; padding: 25px; text-align: center;">
        <p style="color: #D4AF37; margin: 0 0 10px; font-size: 16px;">The Savory Table</p>
        <p style="color: #999; margin: 0; font-size: 14px;">
          Tuesday - Thursday: 10:00 AM - 10:00 PM<br>
          Friday - Sunday: 10:00 AM - 11:00 PM<br>
          Monday: Closed
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
\`\`\`

## Step 4: Important - Replace YOUR-DOMAIN

After deploying your app to Vercel, replace `lumeire-restaurant-application-janmejaysingh-invicis-projects.vercel.app` in the email template with your actual domain.

For example: `https://savory-table.vercel.app/confirm-reservation?id={Record ID}`

## Step 5: Test the Automation

1. Submit a test reservation from your website
2. Check if the email is sent to the provided email address
3. Click the "Confirm My Reservation" button in the email
4. Verify that the reservation status changes to "Confirmed" in Teable

## Troubleshooting

- **Email not sending**: Check that the automation is enabled (toggle should be ON)
- **Fields not populating**: Make sure field names in `{Field Name}` exactly match your Teable field names
- **Confirm button not working**: Verify the domain URL is correct and the app is deployed
