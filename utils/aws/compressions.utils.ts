import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
ffmpeg.on('log', (log) => console.log(log));

export async function compressVideo(file: File) {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  const inputFileName = 'input.mp4';
  const outputFileName = 'output.mp4';

  await ffmpeg.writeFile(inputFileName, await fetchFile(file));

  // Compress video with reasonable quality
  await ffmpeg.exec([
    '-i', inputFileName,
    '-c:v', 'libx264',
    '-crf', '28', // Compression quality (18-28 is good, lower = better quality)
    '-preset', 'medium', // Compression speed vs quality tradeoff
    '-c:a', 'aac',
    '-b:a', '128k', // Audio bitrate
    outputFileName
  ]);

  const data = await ffmpeg.readFile(outputFileName);
  const dataBuffer = Buffer.from(data).buffer;

  // Cleanup
  await ffmpeg.deleteFile(inputFileName);
  await ffmpeg.deleteFile(outputFileName);

  const compressedBlob = new Blob([dataBuffer], { type: 'video/mp4' });
  return new File([compressedBlob], file.name, { type: 'video/mp4' });
}