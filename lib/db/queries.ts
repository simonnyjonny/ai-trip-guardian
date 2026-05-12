import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from './supabase'
import type { Trip, TripDocument, ItineraryItem } from '@/types/trip'
import type { RiskReport } from '@/types/report'

// ── Trips ──

export async function createTrip(input: {
  destination: string
  startDate?: string
  endDate?: string
  travelerType: string
  pace: string
  languageLevel: string
  tripRegion?: string
  primaryTransport?: string
  specialNeeds: string[]
  rawInput?: string
  inputMode?: string
  wishInput?: Record<string, unknown>
  userId?: string
}): Promise<Trip> {
  const id = uuidv4()
  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('trips')
    .insert({
      id,
      user_id: input.userId || null,
      title: `${input.destination} 行程`,
      destination: input.destination,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      traveler_type: input.travelerType,
      pace: input.pace,
      language_level: input.languageLevel,
      trip_region: input.tripRegion || 'auto',
      primary_transport: input.primaryTransport || 'unknown',
      special_needs: input.specialNeeds,
      raw_input: input.rawInput || null,
      input_mode: input.inputMode || 'itinerary',
      wish_input: input.wishInput || {},
      generated_itinerary: [],
      status: 'draft',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) throw new Error(`创建行程失败: ${error.message}`)
  return data as Trip
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const { data, error } = await supabaseAdmin
    .from('trips')
    .select()
    .eq('id', tripId)
    .single()

  if (error) return null
  return data as Trip
}

export async function updateTripStatus(
  tripId: string,
  status: Trip['status'],
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('trips')
    .update({ status })
    .eq('id', tripId)

  if (error) console.error(`Failed to update trip ${tripId} status:`, error)
}

// ── Analysis Stage ──

export async function setAnalysisStage(
  tripId: string,
  stage: string,
  errorMessage?: string | null,
): Promise<void> {
  const update: Record<string, unknown> = { analysis_stage: stage }
  if (stage === 'completed') {
    update.status = 'completed'
    update.analysis_completed_at = new Date().toISOString()
    update.analysis_error = null
  } else if (stage === 'failed') {
    update.status = 'failed'
    update.analysis_error = errorMessage || null
  } else if (stage === 'queued' || stage === 'parsing' || stage === 'parsed' || stage === 'generating_report') {
    update.status = 'analyzing'
    update.analysis_error = null
  }
  const { error } = await supabaseAdmin.from('trips').update(update).eq('id', tripId)
  if (error) console.error(`Failed to set analysis stage ${tripId}:`, error)
}

export async function startAnalysis(tripId: string, inputHash: string): Promise<void> {
  // Get current attempt count
  const { data: current } = await supabaseAdmin.from('trips').select('analysis_attempt_count').eq('id', tripId).single()
  const attempts = ((current?.analysis_attempt_count as number) || 0) + 1

  const { error } = await supabaseAdmin.from('trips').update({
    status: 'analyzing',
    analysis_stage: 'queued',
    analysis_error: null,
    analysis_started_at: new Date().toISOString(),
    analysis_attempt_count: attempts,
    last_analyzed_input_hash: inputHash,
  }).eq('id', tripId)

  if (error) console.error(`Failed to start analysis ${tripId}:`, error.message)
}

export function hashInput(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash.toString(36)
}

// ── Delete Trip (CASCADE) ──

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('trips').delete().eq('id', tripId)
  if (error) throw new Error(`删除行程失败: ${error.message}`)
}

// ── Documents ──

export async function createDocument(input: {
  trip_id: string
  file_url: string
  file_name?: string
  file_type?: string
  file_size_bytes?: number
}): Promise<TripDocument> {
  const id = uuidv4()
  const { data, error } = await supabaseAdmin
    .from('trip_documents')
    .insert({
      id,
      trip_id: input.trip_id,
      file_url: input.file_url,
      file_name: input.file_name || null,
      file_type: input.file_type || null,
      file_size_bytes: input.file_size_bytes || null,
      extracted_text: null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`文件上传失败: ${error.message}`)
  return data as TripDocument
}

// ── Itinerary Items ──

export async function deleteItineraryItems(tripId: string): Promise<void> {
  await supabaseAdmin.from('itinerary_items').delete().eq('trip_id', tripId)
}

export async function saveItineraryItems(
  tripId: string,
  items: Array<{
    day_index: number
    start_time?: string | null
    end_time?: string | null
    title: string
    location_name?: string | null
    address?: string | null
    category: string
    notes?: string | null
  }>,
): Promise<ItineraryItem[]> {
  await deleteItineraryItems(tripId)

  const rows = items.map((item, idx) => ({
    id: uuidv4(),
    trip_id: tripId,
    day_index: item.day_index,
    start_time: item.start_time || null,
    end_time: item.end_time || null,
    title: item.title,
    location_name: item.location_name || null,
    address: item.address || null,
    category: item.category,
    notes: item.notes || null,
    risk_level: 'low',
    risk_reasons: [],
    sort_order: idx,
    created_at: new Date().toISOString(),
  }))

  const { data, error } = await supabaseAdmin
    .from('itinerary_items')
    .insert(rows)
    .select()

  if (error) throw new Error(`保存行程项目失败: ${error.message}`)
  return data as ItineraryItem[]
}

export async function getItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  const { data, error } = await supabaseAdmin
    .from('itinerary_items')
    .select()
    .eq('trip_id', tripId)
    .order('day_index', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) return []
  return data as ItineraryItem[]
}

// ── Risk Reports ──

export async function deleteRiskReports(tripId: string): Promise<void> {
  await supabaseAdmin.from('risk_reports').delete().eq('trip_id', tripId)
}

export async function saveRiskReport(
  tripId: string,
  report: {
    overall_score: number
    overall_level: string
    summary: string
    dimension_scores: unknown
    top_risks: unknown[]
    daily_analysis: unknown[]
    recommendations: unknown[]
    optimized_itinerary: unknown[]
    contingency_plans: unknown[]
    communication_scripts: unknown[]
  },
  rawOutput: unknown,
  weatherSummary?: unknown,
  packingRecommendations?: unknown,
  transferPlans?: unknown,
): Promise<RiskReport> {
  await deleteRiskReports(tripId)

  const id = uuidv4()
  const { data, error } = await supabaseAdmin
    .from('risk_reports')
    .insert({
      id,
      trip_id: tripId,
      overall_score: report.overall_score,
      overall_level: report.overall_level,
      summary: report.summary,
      dimension_scores: report.dimension_scores,
      top_risks: report.top_risks,
      daily_analysis: report.daily_analysis,
      recommendations: report.recommendations,
      optimized_itinerary: report.optimized_itinerary,
      contingency_plans: report.contingency_plans,
      communication_scripts: report.communication_scripts,
      weather_summary: weatherSummary || {},
      packing_recommendations: packingRecommendations || {},
      transfer_plans: transferPlans || [],
      raw_ai_output: rawOutput,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`保存风险报告失败: ${error.message}`)
  return data as RiskReport
}

// ── Feedback ──

export async function saveFeedback(input: {
  trip_id: string
  risk_report_id: string
  risk_key?: string
  feedback_type: string
  comment?: string
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('risk_feedback')
    .insert({
      id: uuidv4(),
      trip_id: input.trip_id,
      risk_report_id: input.risk_report_id,
      risk_key: input.risk_key || null,
      feedback_type: input.feedback_type,
      comment: input.comment || null,
      created_at: new Date().toISOString(),
    })

  if (error) throw new Error(`保存反馈失败: ${error.message}`)
}

export async function getRiskReport(tripId: string): Promise<RiskReport | null> {
  const { data, error } = await supabaseAdmin
    .from('risk_reports')
    .select()
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as RiskReport
}

// ── Agent Runs ──

export async function logAgentRun(params: {
  tripId: string
  agentType: string
  input: unknown
  output: unknown
  status: 'pending' | 'running' | 'completed' | 'failed'
  errorMessage?: string
  durationMs?: number
  model?: string
  provider?: string
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from('agent_runs')
    .insert({
      id: uuidv4(),
      trip_id: params.tripId,
      agent_type: params.agentType,
      input: params.input,
      output: params.output,
      status: params.status,
      error_message: params.errorMessage || null,
      duration_ms: params.durationMs || null,
      model: params.model || null,
      provider: params.provider || null,
      created_at: new Date().toISOString(),
    })

  if (error) console.error(`[agent_runs] Failed to log ${params.agentType} for ${params.tripId}:`, error.message)
}

// ── Share with expiration ──

export async function createShare(
  tripId: string,
  reportId: string,
): Promise<{ share_token: string }> {
  // Check for existing active non-expired share
  const { data: existing } = await supabaseAdmin
    .from('report_shares')
    .select('share_token')
    .eq('trip_id', tripId)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .limit(1)
    .single()

  if (existing) return existing as { share_token: string }

  const token = uuidv4().replace(/-/g, '').slice(0, 16)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('report_shares')
    .insert({
      id: uuidv4(),
      trip_id: tripId,
      risk_report_id: reportId,
      share_token: token,
      is_active: true,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })
    .select('share_token')
    .single()

  if (error) throw new Error(`创建分享失败: ${error.message}`)
  return data as { share_token: string }
}

export async function getShareByToken(token: string): Promise<{
  share_token: string; trip_id: string; risk_report_id: string; is_active: boolean
} | null> {
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('report_shares')
    .select('share_token, trip_id, risk_report_id, is_active, expires_at')
    .eq('share_token', token)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .single()

  if (error || !data) return null
  return data
}
