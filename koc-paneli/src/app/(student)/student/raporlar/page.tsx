import { redirect } from 'next/navigation'
import { getAuthenticatedStudentId } from '@/lib/student/auth'
import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from '@/components/student/reports-client'
import { CoachPageHeader } from '@/components/coach/page-header'
import type { MonthlyReport } from '@/lib/coach/report-actions'

export default async function StudentReportsPage() {
  const studentId = await getAuthenticatedStudentId()
  if (!studentId) redirect('/giris')

  const supabase = await createClient()

  // Fetch only published reports for this student
  const { data: reports, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_published', true)
    .order('report_month', { ascending: false })

  if (error) {
    console.error('Error fetching student monthly reports:', error)
  }

  const mappedReports = ((reports as MonthlyReport[]) || []).map((r) => ({
    id: r.id,
    report_month: r.report_month,
    coach_comment: r.coach_comment,
    metrics_summary: r.metrics_summary,
    created_at: r.created_at,
  }))

  return (
    <div className="coach-page">
      <div className="coach-container space-y-8">
        <CoachPageHeader
          eyebrow="Student Portal"
          title="Aylık Raporlarım"
          description="Koçunuz tarafından hazırlanan aylık gelişim ve ölçüm analizleriniz."
        />
        <ReportsClient initialReports={mappedReports} />
      </div>
    </div>
  )
}
