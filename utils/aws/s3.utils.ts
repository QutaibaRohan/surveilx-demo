import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function listVideos() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Prefix: 'videos/',
    });

    const { Contents } = await s3Client.send(command);
    
    if (!Contents) return [];

    // Generate signed URLs for each video
    const videos = await Promise.all(
      Contents.filter(item => item.Key !== 'videos/').map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
          Key: item.Key,
        });
        
        const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });
        
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

export async function uploadToS3(file: File, fileName: string, onProgress?: (progress: number) => void) {
  const s3Path = `published-videos/${fileName}`;
  
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      Key: s3Path,
      Body: file,
      ContentType: file.type,
      //ACL: 'public-read'
    });

    await s3Client.send(command);

    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${s3Path}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}