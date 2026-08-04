import { createAPIFileRoute } from '@tanstack/react-start'
import { supabase } from '@/lib/supabase'
import { AIKeyManager } from '@/orchestrator/key-manager/AIKeyManager'

export const APIRoute = createAPIFileRoute('/api/keepalive')({
  GET: async ({ request }) => {
    // 1. Security Check
    const isCron = request.headers.get('x-vercel-cron') === '1'
    
    // Check for authenticated user if not cron
    let isAuth = false;
    if (!isCron) {
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) isAuth = true
      }
    }

    if (!isCron && !isAuth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    const start = performance.now()
    
    // 2. Initialize Result
    const result = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        auth: 'ok',
        storage: 'ok',
        ai: 'ok'
      },
      version: 'production'
    }

    // 3. Verify Database (lightweight read)
    try {
      // presentations is a known table, we select just the id of 1 row
      const { error } = await supabase.from('presentations').select('id').limit(1)
      if (error) throw error
    } catch (e: any) {
      result.status = 'degraded'
      result.services.database = e.message || 'Database query failed'
    }

    // 4. Verify Auth
    try {
      // ping the auth service
      const { error } = await supabase.auth.getSession()
      if (error) throw error
    } catch (e: any) {
      result.status = 'degraded'
      result.services.auth = e.message || 'Auth service unreachable'
    }

    // 5. Verify Storage
    try {
      // ping the storage service by listing buckets
      const { error } = await supabase.storage.listBuckets()
      if (error) throw error
    } catch (e: any) {
      result.status = 'degraded'
      result.services.storage = e.message || 'Storage service unreachable'
    }

    // 6. Verify AI System
    try {
      // Just discover keys to ensure env variables / key manager works
      const keys = AIKeyManager.discoverKeys('GEMINI_API_KEY')
      if (!keys || keys.length === 0) {
        throw new Error('No AI keys discovered or AIKeyManager failed to initialize')
      }
    } catch (e: any) {
      result.status = 'degraded'
      result.services.ai = e.message || 'AI System verification failed'
    }

    const duration = performance.now() - start

    // 7. Logging (Safe, no secrets)
    console.log('[KeepAlive Health Check]', JSON.stringify({
      timestamp: result.timestamp,
      durationMs: Math.round(duration),
      status: result.status,
      services: result.services
    }))

    // 8. Return 200 HTTP Response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  }
})
