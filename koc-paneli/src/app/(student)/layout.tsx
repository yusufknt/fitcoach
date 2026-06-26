import { StudentSidebar } from '@/components/layout/student-sidebar'

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090B] md:flex-row">
      <StudentSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
