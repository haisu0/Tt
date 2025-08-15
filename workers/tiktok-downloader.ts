// Cloudflare Workers version for deployment to workers.dev

type Env = {}

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

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url)

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      let tiktokUrl: string | null = null

      if (request.method === "POST") {
        const body = await request.json()
        tiktokUrl = body.url
      } else if (request.method === "GET") {
        tiktokUrl = url.searchParams.get("url")
      }

      if (!tiktokUrl) {
        return new Response(JSON.stringify({ success: false, error: "URL is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // Validate TikTok URL
      const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/
      if (!tiktokRegex.test(tiktokUrl)) {
        return new Response(JSON.stringify({ success: false, error: "Invalid TikTok URL" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const data = await tiktokDl(tiktokUrl)

      return new Response(JSON.stringify({ success: true, data: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("TikTok download error:", error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Internal server error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }
  },
}
