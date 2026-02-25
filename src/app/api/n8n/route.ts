import { NextResponse } from 'next/server'

/**
 * n8n API 代理
 * 解决 CORS 问题并转发请求到本地 n8n 实例
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 转发到本地 n8n 工作流
    const response = await fetch('http://localhost:5678/webhook/avery-content-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'n8n workflow error', details: data },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('n8n proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to n8n', details: error.message },
      { status: 500 }
    )
  }
}
