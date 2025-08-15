# TikTok Downloader

A beautiful, luxurious TikTok downloader with dark theme and neon colors. Download TikTok videos without watermark with a stunning user interface.

## Features

- 🎨 **Luxurious Dark Theme** - Beautiful gradient backgrounds with neon red-black and cyan colors
- 📱 **Fully Responsive** - Works perfectly on all devices (mobile, tablet, desktop)
- 🖥️ **Auto Fullscreen** - Automatically enters fullscreen mode for immersive experience
- 🚀 **Fast Downloads** - Download videos without watermark in multiple qualities
- 🎵 **Music Download** - Extract and download the background music
- 📊 **Video Statistics** - View likes, comments, shares, and view counts
- 👤 **Author Information** - See creator details and profile
- 🔗 **Multiple Formats** - Support for videos and photo posts
- ⚡ **Workers.dev Ready** - Can be deployed to Cloudflare Workers

## Usage

### Web Interface

1. Open the website
2. Paste a TikTok URL in the input field
3. Click "Download" button
4. Choose your preferred download option (with/without watermark, HD quality)
5. Download the video or music

### API Endpoints

#### POST /api/download
\`\`\`json
{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
\`\`\`

#### GET /api/download?url=TIKTOK_URL
Query parameter: `url` - The TikTok video URL

### Response Format
\`\`\`json
{
  "success": true,
  "data": {
    "title": "Video title",
    "author": {
      "nickname": "Creator name",
      "fullname": "@username",
      "avatar": "profile_image_url"
    },
    "stats": {
      "views": "1.2M",
      "likes": "50K",
      "comment": "1.2K",
      "share": "500"
    },
    "data": [
      {
        "type": "nowatermark_hd",
        "url": "download_url"
      }
    ],
    "music_info": {
      "title": "Song title",
      "author": "Artist name",
      "url": "music_download_url"
    }
  }
}
\`\`\`

## Deployment

### Vercel (Web App)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Cloudflare Workers (API Only)
1. Install Wrangler CLI: `npm install -g wrangler`
2. Navigate to workers directory: `cd workers`
3. Login to Cloudflare: `wrangler login`
4. Deploy: `wrangler deploy`

Your API will be available at: `https://tiktok-downloader.your-subdomain.workers.dev`

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **API**: Next.js API Routes / Cloudflare Workers
- **Styling**: Tailwind CSS with custom gradients and animations

## Created by AL AZET

Follow on Instagram: [@al_azet](https://instagram.com/al_azet)
