import { put } from '@vercel/blob';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
config({ path: '.env.local' });

const BLOG_IMAGES_DIR = join(process.cwd(), 'public/images/blog');
const files = readdirSync(BLOG_IMAGES_DIR).filter((f) => f.endsWith('.png'));

console.log(`Uploading ${files.length} images to Vercel Blob...\n`);

const results = {};

for (const file of files) {
  const filePath = join(BLOG_IMAGES_DIR, file);
  const content = readFileSync(filePath);
  const slug = file.replace('.png', '');

  const blob = await put(`blog/${file}`, content, {
    access: 'public',
    contentType: 'image/png',
  });

  results[slug] = blob.url;
  console.log(`✅ ${file} → ${blob.url}`);
}

console.log('\n--- URL Map ---');
console.log(JSON.stringify(results, null, 2));
