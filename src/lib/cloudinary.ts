import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Upload image to Cloudinary
export async function uploadImage(file: File, folder: string = 'lokus-shoes'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    // Convert File to Buffer for Cloudinary upload
    const arrayBuffer = file.arrayBuffer();
    arrayBuffer.then(buffer => {
      uploadStream.write(Buffer.from(buffer));
      uploadStream.end();
    }).catch(reject);
  });
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.result === 'ok');
      }
    });
  });
}

// Extract public ID from Cloudinary URL
export function extractPublicId(url: string): string {
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : '';
}

// Validate Cloudinary configuration
export function validateCloudinaryConfig(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}
