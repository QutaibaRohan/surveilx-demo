import { 
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Standard S3 client for regular operations
const standardS3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  }
});

// Accelerated S3 client for uploads
const acceleratedS3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
  useAccelerateEndpoint: true
});

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export async function listVideos() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Prefix: 'videos/',
    });

    const { Contents } = await standardS3Client.send(command);
    
    if (!Contents) return [];

    // Generate signed URLs for each video
    const videos = await Promise.all(
      Contents.filter(item => item.Key !== 'videos/').map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
          Key: item.Key,
        });
        
        const url = await getSignedUrl(standardS3Client, getObjectCommand, { expiresIn: 3600 });
        
        return {
          id: item.Key,
          file_name: item.Key?.split('/').pop() || 'Untitled',
          created_at: item.LastModified,
          aws_path: url,
          size: item.Size,
        };
      })
    );

    return videos;
  } catch (error) {
    console.error('Error listing videos:', error);
    throw error;
  }
}

export async function uploadToS3(file: File, fileName: string) {
  // For small files, use simple upload
  if (file.size <= CHUNK_SIZE) {
    return uploadSmallFile(file, fileName);
  }
  
  // For larger files, use multipart upload
  return uploadLargeFile(file, fileName);
}

async function uploadSmallFile(file: File, fileName: string) {
  const s3Path = `published-videos/${fileName}`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: s3Path,
      Body: file,
      ContentType: file.type,
    });

    await acceleratedS3Client.send(command);
   

    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${s3Path}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

async function uploadLargeFile(file: File, fileName: string) {
  const s3Path = `published-videos/${fileName}`;
  let uploadId: string | undefined;

  try {
    // Step 1: Initialize multipart upload
    const { UploadId } = await acceleratedS3Client.send(new CreateMultipartUploadCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: s3Path,
      ContentType: file.type,
    }));
    uploadId = UploadId;

    console.log('Started multipart upload with ID:', uploadId);

    // Step 2: Prepare chunks
    const numParts = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedBytes = 0;

    // Step 3: Create upload promises for parallel processing
    const uploadPromises = Array.from({ length: numParts }, async (_, index) => {
      const start = index * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = await file.slice(start, end).arrayBuffer();

      console.log(`Preparing part ${index + 1}/${numParts}, size: ${chunk.byteLength}`);

      const command = new UploadPartCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: s3Path,
        UploadId: uploadId,
        PartNumber: index + 1,
        Body: Buffer.from(chunk),
      });

      const response = await acceleratedS3Client.send(command);
      const etag = response.ETag?.replace(/^"|"$/g, '');
      
      if (!etag) {
        throw new Error(`Failed to get ETag for part ${index + 1}`);
      }

      // Update progress
      uploadedBytes += chunk.byteLength;
      

      return {
        PartNumber: index + 1,
        ETag: `"${etag}"`
      };
    });

    // Step 4: Wait for all parts to upload
    console.log('Uploading all parts in parallel...');
    const parts = await Promise.all(uploadPromises);
    console.log('All parts uploaded successfully');

    // Sort parts by part number to ensure correct order
    parts.sort((a, b) => a.PartNumber - b.PartNumber);

    // Step 5: Complete multipart upload
    console.log('Completing upload with parts:', parts);
    await acceleratedS3Client.send(new CompleteMultipartUploadCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: s3Path,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts }
    }));

   
    console.log('Upload completed successfully');

    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${s3Path}`;

  } catch (error) {
    console.error('Error during multipart upload:', error);
    if (uploadId) {
      try {
        await acceleratedS3Client.send(new AbortMultipartUploadCommand({
          Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
          Key: s3Path,
          UploadId: uploadId,
        }));
        console.log('Upload aborted successfully');
      } catch (abortError) {
        console.error('Error aborting multipart upload:', abortError);
      }
    }
    throw error;
  }
}