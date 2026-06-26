'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedCoachId } from '@/lib/coach/auth'

export type MonthlyReport = {
  id: string
  student_id: string
  coach_id: string
  report_month: string
  coach_comment: string | null
  is_published: boolean
  pdf_path: string | null
  metrics_summary: {
    avg_weight?: number | null
    weight_diff?: number | null
    avg_waist?: number | null
    avg_sleep?: number | null
    avg_steps?: number | null
    avg_diet?: number | null
    avg_energy?: number | null
    bench_max?: number | null
    squat_max?: number | null
    deadlift_max?: number | null
    workouts_completed?: number | null
    workouts_target?: number | null
    weekly_breakdown?: Array<{
      week_number: number
      label: string
      avg_weight: number | null
      avg_waist: number | null
      bench_max: number | null
      squat_max: number | null
      deadlift_max: number | null
      avg_sleep: number | null
      avg_steps: number | null
      avg_diet: number | null
      avg_energy: number | null
      workouts_completed: number
      workouts_target: number
      photo_url: string | null
    }> | null
  }
  created_at: string
  updated_at: string
}

export type ActionResult = { success: true; data?: unknown } | { success: false; error: string }

async function verifyCoachStudent(
  coachId: string,
  coachStudentId: string,
  studentId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('coach_students')
    .select('id')
    .eq('id', coachStudentId)
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .single()

  return Boolean(data)
}

export async function getMonthlyReports(studentId: string): Promise<MonthlyReport[]> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('student_id', studentId)
    .eq('coach_id', coachId)
    .order('report_month', { ascending: false })

  if (error) {
    console.error('Error fetching monthly reports:', error)
    return []
  }

  return (data as MonthlyReport[]) || []
}

export type SaveMonthlyReportInput = {
  coachStudentId: string
  studentId: string
  reportMonth: string
  coachComment: string
  isPublished: boolean
  metricsSummary: {
    avg_weight?: number | null
    weight_diff?: number | null
    avg_waist?: number | null
    avg_sleep?: number | null
    avg_steps?: number | null
    avg_diet?: number | null
    avg_energy?: number | null
    bench_max?: number | null
    squat_max?: number | null
    deadlift_max?: number | null
    workouts_completed?: number | null
    workouts_target?: number | null
    weekly_breakdown?: Array<{
      week_number: number
      label: string
      avg_weight: number | null
      avg_waist: number | null
      bench_max: number | null
      squat_max: number | null
      deadlift_max: number | null
      avg_sleep: number | null
      avg_steps: number | null
      avg_diet: number | null
      avg_energy: number | null
      workouts_completed: number
      workouts_target: number
      photo_url: string | null
    }> | null
  }
  pdfBase64: string
}

export async function saveMonthlyReport(input: SaveMonthlyReportInput): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const {
    coachStudentId,
    studentId,
    reportMonth,
    coachComment,
    isPublished,
    metricsSummary,
    pdfBase64
  } = input

  if (!coachStudentId || !studentId || !reportMonth) {
    return { success: false, error: 'Öğrenci bilgisi ve ay seçimi zorunludur.' }
  }

  const isLinked = await verifyCoachStudent(coachId, coachStudentId, studentId)
  if (!isLinked) {
    return { success: false, error: 'Öğrenci ilişkisi bulunamadı.' }
  }

  if (!pdfBase64) {
    return { success: false, error: 'Geçersiz PDF dosyası.' }
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = Buffer.from(pdfBase64, 'base64')
  } catch (e) {
    console.error('Base64 decode error:', e)
    return { success: false, error: 'PDF verisi okunamadı.' }
  }

  const supabase = await createClient()

  // Generate storage path: coachId/studentId/reportMonth-reportId.pdf
  const filename = `${reportMonth}-${crypto.randomUUID()}.pdf`
  const storagePath = `${coachId}/${studentId}/${filename}`

  // Upload file buffer
  const { error: uploadError } = await supabase.storage
    .from('monthly-reports')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true, // Upsert true if replacing
    })

  if (uploadError) {
    console.error('Error uploading PDF report:', uploadError)
    return { success: false, error: 'PDF dosyası yüklenemedi: ' + uploadError.message }
  }

  // We check if a report already exists for this month/student to update or insert
  const { data: existingReport } = await supabase
    .from('monthly_reports')
    .select('id, pdf_path')
    .eq('student_id', studentId)
    .eq('report_month', reportMonth)
    .single()

  const reportData = {
    student_id: studentId,
    coach_id: coachId,
    report_month: reportMonth,
    coach_comment: coachComment || null,
    is_published: isPublished,
    pdf_path: storagePath,
    metrics_summary: metricsSummary,
    updated_at: new Date().toISOString(),
  }

  if (existingReport) {
    // If there is an existing PDF path, delete it first to save storage space
    if (existingReport.pdf_path && existingReport.pdf_path !== storagePath) {
      await supabase.storage.from('monthly-reports').remove([existingReport.pdf_path])
    }

    const { error: updateError } = await supabase
      .from('monthly_reports')
      .update(reportData)
      .eq('id', existingReport.id)

    if (updateError) {
      console.error('Error updating report database record:', updateError)
      return { success: false, error: 'Rapor güncellenemedi.' }
    }
  } else {
    const { error: insertError } = await supabase
      .from('monthly_reports')
      .insert(reportData)

    if (insertError) {
      console.error('Error inserting report database record:', insertError)
      // Clean up uploaded storage file
      await supabase.storage.from('monthly-reports').remove([storagePath])
      return { success: false, error: 'Rapor kaydedilemedi.' }
    }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function deleteMonthlyReport(
  reportId: string,
  coachStudentId: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()

  // Fetch report details
  const { data: report, error: fetchError } = await supabase
    .from('monthly_reports')
    .select('pdf_path, coach_id')
    .eq('id', reportId)
    .single()

  if (fetchError || !report || report.coach_id !== coachId) {
    return { success: false, error: 'Rapor bulunamadı veya yetkiniz yok.' }
  }

  // Delete storage file
  if (report.pdf_path) {
    const { error: storageError } = await supabase.storage
      .from('monthly-reports')
      .remove([report.pdf_path])
    
    if (storageError) {
      console.error('Error deleting report PDF from storage:', storageError)
    }
  }

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('monthly_reports')
    .delete()
    .eq('id', reportId)

  if (deleteError) {
    console.error('Error deleting report record:', deleteError)
    return { success: false, error: 'Rapor silinemedi.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function publishMonthlyReport(
  reportId: string,
  coachStudentId: string
): Promise<ActionResult> {
  const coachId = await getAuthenticatedCoachId()
  if (!coachId) {
    return { success: false, error: 'Oturum bulunamadı.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('monthly_reports')
    .update({ is_published: true, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .eq('coach_id', coachId)

  if (error) {
    console.error('Error publishing report:', error)
    return { success: false, error: 'Rapor yayınlanamadı.' }
  }

  revalidatePath(`/coach/ogrenciler/${coachStudentId}`)
  return { success: true }
}

export async function getReportSignedUrl(reportId: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data: report, error } = await supabase
    .from('monthly_reports')
    .select('pdf_path')
    .eq('id', reportId)
    .single()

  if (error || !report?.pdf_path) {
    return null
  }

  const { data, error: signError } = await supabase.storage
    .from('monthly-reports')
    .createSignedUrl(report.pdf_path, 60 * 60) // 1 hour expiration

  if (signError || !data?.signedUrl) {
    return null
  }

  return data.signedUrl
}
