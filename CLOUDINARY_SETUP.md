# Cloudinary Setup for Lokus 2.0

## Environment Variables

Create a `.env.local` file in the root directory and add the following Cloudinary environment variables:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How to Get Cloudinary Credentials:

1. **Sign up for Cloudinary**: Go to [https://cloudinary.com](https://cloudinary.com) and create a free account
2. **Navigate to Dashboard**: After logging in, go to your Dashboard
3. **Copy your credentials**:
   - **Cloud name**: Your unique Cloudinary cloud name (e.g., "lokus-shoes")
   - **API Key**: Your API key (24-character string)
   - **API Secret**: Your API secret (keep this secure!)

## Example Configuration:

```bash
# .env.local
CLOUDINARY_CLOUD_NAME=lokus-shoes
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef1234567890abcdef1234567890
```

## Features Implemented:

### ✅ Cloudinary Utility (`src/lib/cloudinary.ts`)
- SDK initialization with environment variables
- Image upload with automatic optimization
- Image deletion functionality
- Configuration validation

### ✅ Upload API (`src/app/api/admin/upload/route.ts`)
- Admin authentication verification
- FormData image file handling
- File validation (JPEG, PNG, WebP, max 5MB)
- Upload to "lokus-shoes" folder
- Standard JSON responses using apiSuccess/apiError

### ✅ ImageUploader Component (`src/components/admin/ImageUploader.tsx`)
- **5-slot grid layout**: Main, Side, Back, Top, Sole views
- **Drag-and-drop interface**: Premium UI with visual feedback
- **Loading states**: Spinner during upload
- **Image preview**: Real-time preview with remove functionality
- **State management**: onImagesChange callback for parent integration

### ✅ Admin Integration (`src/app/admin/shoes/AdminShoesClient.tsx`)
- **Form integration**: ImageUploader in create/edit forms
- **Data binding**: Images array sync with form state
- **Database sync**: POST and PATCH handlers save images array
- **Thumbnail display**: Primary image shown in admin list view

## Usage:

1. **Add Environment Variables**: Set up your Cloudinary credentials in `.env.local`
2. **Restart Development Server**: `npm run dev`
3. **Test Upload**: Go to admin panel → shoes → create new shoe
4. **Upload Images**: Use the 5-slot uploader to add product images
5. **View Results**: Images appear in admin list and product details

## Security Notes:

- Never commit `.env.local` to version control
- Keep API secret secure and never expose it in client code
- Admin-only access to upload endpoints
- File type and size validation for security

## Troubleshooting:

- **"Cloudinary configuration is missing"**: Check environment variables
- **"Upload failed"**: Verify API credentials and internet connection
- **"Invalid file type"**: Use only JPEG, PNG, or WebP images under 5MB
- **Build errors**: Ensure all environment variables are set correctly

## File Structure:

```
src/
├── lib/
│   └── cloudinary.ts          # Cloudinary utility functions
├── app/api/admin/upload/
│   └── route.ts               # Upload API endpoint
├── components/admin/
│   └── ImageUploader.tsx      # Multi-view image uploader
└── app/admin/shoes/
    └── AdminShoesClient.tsx   # Admin panel integration
```

The Cloudinary image storage system is now fully integrated and ready for production use!
