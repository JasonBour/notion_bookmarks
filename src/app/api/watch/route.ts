// src/app/api/watch/route.ts
// 个人美股盯盘页的服务端：策略配置下发 + 行情代理（API key 不下发到浏览器）
//
// 需要两个环境变量（Vercel → Project → Settings → Environment Variables）：
//   WATCH_PASSWORD  访问口令，也是接口令牌
//   FINNHUB_KEY     Finnhub API key（可选，配了就优先用它拿实时价）
//
// 用法：
//   GET  /api/watch?mode=config            → 策略配置（需 x-watch-token 头）
//   GET  /api/watch?mode=quote&sym=MU      → 实时报价（需 x-watch-token 头）
//   POST /api/watch?mode=auth  {password}  → 校验口令

import { NextRequest, NextResponse } from 'next/server';
import strategyConfig from './strategy.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Zone {
  name: string;
  from: number;
  to: number;
  color: string;
}

interface Level {
  label: string;
  price: number;
}

interface Stock {
  symbol: string;
  name?: string;
  earnings?: string;
  earningsNote?: string;
  zones?: Zone[];
  levels?: Level[];
  notes?: string;
}

interface StrategyConfig {
  version: number;
  interval?: number;
  stocks: Stock[];
}

const STRATEGY = strategyConfig as unknown as StrategyConfig;

/**
 * 策略来源：优先读环境变量 WATCH_STRATEGY（可避免策略落进公开仓库），
 * 没配就用仓库内的 strategy.json。
 */
function loadStrategy(): StrategyConfig {
  const raw = process.env.WATCH_STRATEGY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StrategyConfig;
      if (parsed && Array.isArray(parsed.stocks)) return parsed;
      console.error('WATCH_STRATEGY 结构不对，回退到 strategy.json');
    } catch {
      console.error('WATCH_STRATEGY 不是合法 JSON，回退到 strategy.json');
    }
  }
  return STRATEGY;
}

interface Quote {
  price: number;
  prevClose: number;
  pre: number | null;
  post: number | null;
  src: string;
}

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

function expectedPassword(): string {
  return process.env.WATCH_PASSWORD || '';
}

/** 定长比较，避免逐字符提前返回 */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAuthed(req: NextRequest): boolean {
  return sameSecret(req.headers.get('x-watch-token') || '', expectedPassword());
}

/* ================= 行情源：Finnhub → 腾讯 → Yahoo ================= */

async function fetchFinnhub(sym: string, key: string): Promise<Quote | null> {
  try {
    const u = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
    const r = await fetch(u, { cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    if (d && typeof d.c === 'number' && d.c > 0 && d.pc > 0) {
      return { price: d.c, prevClose: d.pc, pre: null, post: null, src: 'finnhub' };
    }
  } catch {
    /* fallthrough */
  }
  return null;
}

async function fetchTencent(sym: string): Promise<Quote | null> {
  try {
    const u = `https://qt.gtimg.cn/q=us${encodeURIComponent(sym)}`;
    const r = await fetch(u, { cache: 'no-store' });
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    // 腾讯返回 GBK，必须转码
    const text = new TextDecoder('gbk').decode(buf);
    const m = text.match(/v_[^=]+="([^"]*)"/);
    if (!m) return null;
    const f = m[1].split('~');
    const price = parseFloat(f[3]);
    const prevClose = parseFloat(f[4]);
    if (!isFinite(price) || price <= 0 || !isFinite(prevClose)) return null;
    return { price, prevClose, pre: null, post: null, src: 'tencent' };
  } catch {
    /* fallthrough */
  }
  return null;
}

async function fetchYahoo(sym: string): Promise<Quote | null> {
  const targets = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`
  ];
  for (const u of targets) {
    try {
      const r = await fetch(u, {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!r.ok) continue;
      const data = await r.json();
      const m = data?.chart?.result?.[0]?.meta;
      if (m && m.regularMarketPrice != null) {
        return {
          price: m.regularMarketPrice,
          prevClose: m.previousClose != null ? m.previousClose : m.chartPreviousClose,
          pre: m.preMarketPrice != null ? m.preMarketPrice : null,
          post: m.postMarketPrice != null ? m.postMarketPrice : null,
          src: 'yahoo'
        };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

async function proxyQuote(sym: string): Promise<Quote | null> {
  const key = process.env.FINNHUB_KEY || '';
  if (key) {
    const q1 = await fetchFinnhub(sym, key);
    if (q1) return q1;
  }
  const q2 = await fetchTencent(sym);
  if (q2) return q2;
  return fetchYahoo(sym);
}

/* ================= 路由 ================= */

export async function GET(req: NextRequest) {
  if (!expectedPassword()) {
    return json({ error: '服务端未配置 WATCH_PASSWORD' }, 500);
  }
  if (!isAuthed(req)) {
    return json({ error: 'unauthorized' }, 401);
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || '';

  if (mode === 'config') {
    return json(loadStrategy());
  }

  if (mode === 'quote') {
    const sym = (url.searchParams.get('sym') || '').trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(sym)) {
      return json({ error: 'bad symbol' }, 400);
    }
    const q = await proxyQuote(sym);
    if (q) return json(q);
    return json({ error: '行情源全部失败' }, 502);
  }

  return json({ error: 'unknown mode' }, 400);
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if ((url.searchParams.get('mode') || '') !== 'auth') {
    return json({ error: 'unknown mode' }, 400);
  }
  if (!expectedPassword()) {
    return json({ error: '服务端未配置 WATCH_PASSWORD' }, 500);
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  if (!sameSecret(typeof body.password === 'string' ? body.password : '', expectedPassword())) {
    return json({ error: 'unauthorized' }, 401);
  }
  return json({ ok: true });
}
