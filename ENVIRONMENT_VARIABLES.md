# Environment Variables for Lokus 2.0

## Cloudinary Configuration (Required for Image Storage)

Create a `.env.local` file in the root directory and add the following Cloudinary environment variables:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### How to Get Cloudinary Credentials:

1. Sign up for a Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy the following values:
   - **Cloud name**: Your unique Cloudinary cloud name
   - **API Key**: Your API key
   - **API Secret**: Your API secret (keep this secure!)

### Example Configuration:

```bash
# .env.local
CLOUDINARY_CLOUD_NAME=lokus-shoes
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef1234567890abcdef1234567890
```

## Security Notes:

- Never commit your `.env.local` file to version control
- Keep your API secret secure and never expose it in client-side code
- The Cloudinary SDK will automatically use these environment variables
- Images will be uploaded to the "lokus-shoes" folder in your Cloudinary account

## Additional Environment Variables (Existing):

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/lokus

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing the Setup:

1. After adding the Cloudinary variables, restart your development server
2. Try uploading an image in the admin panel
3. Check your Cloudinary dashboard to see the uploaded images in the "lokus-shoes" folder

## Troubleshooting:

- **"Cloudinary configuration is missing"**: Make sure all three Cloudinary variables are set
- **"Upload failed"**: Check your Cloudinary API credentials and internet connection
- **"Invalid file type"**: Ensure you're uploading JPEG, PNG, or WebP images under 5MB
