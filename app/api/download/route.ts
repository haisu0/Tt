import { type NextRequest, NextResponse } from "next/server"

async function tiktokDl(url: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const data: Array<{ type: string; url: string }> = []

      function formatNumber(integer: number) {
        return Number(Number.parseInt(integer.toString())).toLocaleString().replace(/,/g, ".")
      }

      function formatDate(n: number, locale = "en") {
        return new Date(n * 1000).toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })
      }

      const response = await fetch("https://www.tikwm.com/api/", {
        method: "POST",
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://www.tikwm.com",
          Referer: "https://www.tikwm.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: new URLSearchParams({
          url: url,
          hd: "1",
        }),
      })

      const result = await response.json()
      const res = result.data

      if (!res) {
        throw new Error("No data received from TikTok API")
      }

      // Handle images (photo posts)
      if (!res.size && !res.wm_size && !res.hd_size && res.images) {
        res.images.forEach((v: string) => data.push({ type: "photo", url: v }))
      } else {
        // Handle videos
        if (res.wmplay) data.push({ type: "watermark", url: res.wmplay })
        if (res.play) data.push({ type: "nowatermark", url: res.play })
        if (res.hdplay) data.push({ type: "nowatermark_hd", url: res.hdplay })
      }

      resolve({
        ...res,
        status: true,
        title: res.title,
        taken_at: formatDate(res.create_time).replace("1970", ""),
        region: res.region,
        id: res.id,
        durations: res.duration,
        duration: res.duration + " Seconds",
        cover: res.cover,
        size_wm: res.wm_size,
        size_nowm: res.size,
        size_nowm_hd: res.hd_size,
        data: data,
        music_info: {
          id: res.music_info?.id || "",
          title: res.music_info?.title || "",
          author: res.music_info?.author || "",
          album: res.music_info?.album || null,
          url: res.music || res.music_info?.play || "",
        },
        stats: {
          views: formatNumber(res.play_count || 0),
          likes: formatNumber(res.digg_count || 0),
          comment: formatNumber(res.comment_count || 0),
          share: formatNumber(res.share_count || 0),
          download: formatNumber(res.download_count || 0),
        },
        author: {
          id: res.author?.id || "",
          fullname: res.author?.unique_id || "",
          nickname: res.author?.nickname || "",
          avatar: res.author?.avatar || "",
        },
      })
    } catch (e) {
      reject(e)
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    // Validate TikTok URL
    const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/
    if (!tiktokRegex.test(url)) {
      return NextResponse.json({ success: false, error: "Invalid TikTok URL" }, { status: 400 })
    }

    const data = await tiktokDl(url)

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("TikTok download error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ success: false, error: "URL parameter is required" }, { status: 400 })
  }

  try {
    const data = await tiktokDl(url)
    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("TikTok download error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
