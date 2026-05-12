import pptxgen from 'pptxgenjs'
import { formatDate } from '../utils/date'
import type { Workstream, Task, ReportContent } from '../types'

const BRAND = {
  indigo: '4F46E5',
  indigo_dark: '3730A3',
  slate: '1E293B',
  slate_light: 'F8FAFC',
  white: 'FFFFFF',
  green: '22C55E',
  red: 'EF4444',
  amber: 'F59E0B',
  blue: '3B82F6',
  gray: '94A3B8',
}

function hex(c: string) { return c }

export async function generateStatusReport(
  title: string,
  workstreams: Workstream[],
  tasks: Task[],
  report: ReportContent
): Promise<void> {
  const pptx = new pptxgen()

  pptx.defineLayout({ name: 'WIDESCREEN', width: 13.33, height: 7.5 })
  pptx.layout = 'WIDESCREEN'
  pptx.author = 'RSGS Flow'
  pptx.company = 'RSGS Flow'
  pptx.subject = title

  addCoverSlide(pptx, title)
  addExecutiveSummary(pptx, report)
  addMetricsSlide(pptx, report, tasks)
  addWorkstreamProgress(pptx, workstreams, report)
  addRisksSlide(pptx, report)
  addTimelineSlide(pptx, report)
  addTaskStatusSlide(pptx, tasks)

  await pptx.writeFile({ fileName: `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.pptx` })
}

function addCoverSlide(pptx: pptxgen, title: string) {
  const slide = pptx.addSlide()

  // Background gradient effect with shapes
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: BRAND.slate },
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.5, w: 13.33, h: 2,
    fill: { color: BRAND.indigo },
    line: { color: BRAND.indigo, width: 0 },
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.4, h: 7.5,
    fill: { color: BRAND.indigo },
  })

  // Tag
  slide.addText('PROJECT STATUS REPORT', {
    x: 0.7, y: 1.5, w: 8, h: 0.4,
    fontSize: 10,
    color: BRAND.indigo,
    bold: true,
    fontFace: 'Calibri',
    charSpacing: 3,
  })

  // Title
  slide.addText(title, {
    x: 0.7, y: 2, w: 10, h: 1.8,
    fontSize: 38,
    color: BRAND.white,
    bold: true,
    fontFace: 'Calibri',
    breakLine: true,
  })

  // Date
  slide.addText(`Generated: ${formatDate(new Date().toISOString())}`, {
    x: 0.7, y: 4.2, w: 6, h: 0.4,
    fontSize: 12,
    color: BRAND.gray,
    fontFace: 'Calibri',
  })

  // Logo area
  slide.addText('RSGS Flow', {
    x: 10, y: 6.8, w: 3, h: 0.4,
    fontSize: 14,
    color: BRAND.white,
    bold: true,
    fontFace: 'Calibri',
    align: 'right',
  })
}

function addExecutiveSummary(pptx: pptxgen, report: ReportContent) {
  const slide = pptx.addSlide()
  addSlideHeader(slide, pptx, 'Executive Summary')

  slide.addText(report.executive_summary || 'No summary provided.', {
    x: 0.5, y: 1.3, w: 12.3, h: 1.5,
    fontSize: 13,
    color: BRAND.slate,
    fontFace: 'Calibri',
    breakLine: true,
    wrap: true,
  })

  // Key stats boxes
  const metrics = report.metrics
  const boxes = [
    { label: 'Total Tasks', value: String(metrics.total_tasks), color: BRAND.blue },
    { label: 'Completed', value: String(metrics.completed_tasks), color: BRAND.green },
    { label: 'In Progress', value: String(metrics.in_progress_tasks), color: BRAND.indigo },
    { label: 'Blocked', value: String(metrics.blocked_tasks), color: BRAND.red },
    { label: 'Completion Rate', value: `${Math.round(metrics.completion_rate)}%`, color: BRAND.green },
  ]

  boxes.forEach((b, i) => {
    const x = 0.5 + i * 2.5
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 3.2, w: 2.3, h: 1.6,
      fill: { color: BRAND.slate_light },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.1,
    })
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 3.2, w: 0.08, h: 1.6,
      fill: { color: b.color },
    })
    slide.addText(b.value, {
      x: x + 0.2, y: 3.4, w: 2, h: 0.7,
      fontSize: 28,
      color: b.color,
      bold: true,
      fontFace: 'Calibri',
    })
    slide.addText(b.label, {
      x: x + 0.2, y: 4.2, w: 2, h: 0.4,
      fontSize: 10,
      color: BRAND.gray,
      fontFace: 'Calibri',
    })
  })

  // Completed items
  if (report.completed_items.length > 0) {
    slide.addText('Completed This Period', {
      x: 0.5, y: 5.2, w: 6, h: 0.35,
      fontSize: 11,
      color: BRAND.slate,
      bold: true,
      fontFace: 'Calibri',
    })
    const items = report.completed_items.slice(0, 4)
    items.forEach((item, i) => {
      slide.addText(`✓  ${item}`, {
        x: 0.5, y: 5.6 + i * 0.35, w: 12, h: 0.35,
        fontSize: 10,
        color: BRAND.green,
        fontFace: 'Calibri',
      })
    })
  }
}

function addMetricsSlide(pptx: pptxgen, report: ReportContent, tasks: Task[]) {
  const slide = pptx.addSlide()
  addSlideHeader(slide, pptx, 'Task Metrics & Completion')

  const metrics = report.metrics

  // Progress bar
  const pct = metrics.completion_rate / 100
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.5, w: 12.3, h: 0.35,
    fill: { color: 'E2E8F0' },
    line: { color: 'E2E8F0', width: 0 },
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.5, w: Math.max(0.1, 12.3 * pct), h: 0.35,
    fill: { color: BRAND.green },
    line: { color: BRAND.green, width: 0 },
  })
  slide.addText(`${Math.round(metrics.completion_rate)}% Complete`, {
    x: 0.5, y: 1.9, w: 12.3, h: 0.3,
    fontSize: 10,
    color: BRAND.gray,
    align: 'center',
    fontFace: 'Calibri',
  })

  // Pie chart data representation with colored blocks
  const statuses = [
    { label: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: BRAND.gray },
    { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: BRAND.blue },
    { label: 'Blocked', count: tasks.filter(t => t.status === 'blocked').length, color: BRAND.red },
    { label: 'Completed', count: metrics.completed_tasks, color: BRAND.green },
  ]

  statuses.forEach((s, i) => {
    const x = 0.5 + i * 3.1
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.5, w: 2.8, h: 2,
      fill: { color: BRAND.slate_light },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.12,
    })
    slide.addText(String(s.count), {
      x, y: 2.7, w: 2.8, h: 0.9,
      fontSize: 42,
      color: s.color,
      bold: true,
      align: 'center',
      fontFace: 'Calibri',
    })
    slide.addText(s.label, {
      x, y: 3.7, w: 2.8, h: 0.4,
      fontSize: 11,
      color: BRAND.slate,
      align: 'center',
      fontFace: 'Calibri',
    })
  })

  // Priority breakdown
  slide.addText('Priority Distribution', {
    x: 0.5, y: 5.0, w: 5, h: 0.35,
    fontSize: 12,
    color: BRAND.slate,
    bold: true,
    fontFace: 'Calibri',
  })
  const priorities = [
    { label: 'Critical', count: tasks.filter(t => t.priority === 'critical').length, color: BRAND.red },
    { label: 'High', count: tasks.filter(t => t.priority === 'high').length, color: BRAND.amber },
    { label: 'Medium', count: tasks.filter(t => t.priority === 'medium').length, color: BRAND.blue },
    { label: 'Low', count: tasks.filter(t => t.priority === 'low').length, color: BRAND.gray },
  ]
  priorities.forEach((p, i) => {
    slide.addText(`${p.label}: ${p.count}`, {
      x: 0.5 + (i % 2) * 2.5, y: 5.4 + Math.floor(i / 2) * 0.4, w: 2.3, h: 0.35,
      fontSize: 10,
      color: p.color,
      bold: true,
      fontFace: 'Calibri',
    })
  })
}

function addWorkstreamProgress(pptx: pptxgen, workstreams: Workstream[], report: ReportContent) {
  const slide = pptx.addSlide()
  addSlideHeader(slide, pptx, 'Workstream Progress')

  const progresses = report.workstream_progress.slice(0, 5)

  progresses.forEach((wp, i) => {
    const y = 1.4 + i * 1.1
    slide.addText(wp.title, {
      x: 0.5, y, w: 4, h: 0.4,
      fontSize: 11,
      color: BRAND.slate,
      bold: true,
      fontFace: 'Calibri',
    })

    const statusColor = wp.status === 'completed' ? BRAND.green : wp.status === 'on_hold' ? BRAND.amber : BRAND.indigo
    slide.addText(wp.status.replace('_', ' ').toUpperCase(), {
      x: 4.6, y, w: 1.5, h: 0.4,
      fontSize: 9,
      color: statusColor,
      bold: true,
      fontFace: 'Calibri',
    })

    // Progress bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: y + 0.45, w: 12.3, h: 0.22,
      fill: { color: 'E2E8F0' },
      line: { color: 'E2E8F0', width: 0 },
    })
    const pct = wp.completion_percent / 100
    if (pct > 0) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: y + 0.45, w: Math.max(0.05, 12.3 * pct), h: 0.22,
        fill: { color: statusColor },
        line: { color: statusColor, width: 0 },
      })
    }
    slide.addText(`${wp.completion_percent}%`, {
      x: 12.85, y: y + 0.4, w: 0.5, h: 0.3,
      fontSize: 9,
      color: BRAND.gray,
      fontFace: 'Calibri',
    })
  })
}

function addRisksSlide(pptx: pptxgen, report: ReportContent) {
  const slide = pptx.addSlide()
  addSlideHeader(slide, pptx, 'Risks & Issues')

  if (!report.risks.length) {
    slide.addText('No risks or issues identified at this time.', {
      x: 0.5, y: 2.5, w: 12.3, h: 0.5,
      fontSize: 14,
      color: BRAND.gray,
      align: 'center',
      fontFace: 'Calibri',
    })
    return
  }

  const severityColor: Record<string, string> = {
    critical: BRAND.red,
    high: BRAND.amber,
    medium: BRAND.blue,
    low: BRAND.gray,
  }

  report.risks.slice(0, 5).forEach((risk, i) => {
    const y = 1.4 + i * 1.1
    const color = severityColor[risk.severity] ?? BRAND.gray

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 0.06, h: 0.8,
      fill: { color },
    })
    slide.addText(risk.title, {
      x: 0.7, y, w: 11.5, h: 0.4,
      fontSize: 12,
      color: BRAND.slate,
      bold: true,
      fontFace: 'Calibri',
    })
    slide.addText(risk.description, {
      x: 0.7, y: y + 0.4, w: 10, h: 0.4,
      fontSize: 10,
      color: BRAND.gray,
      fontFace: 'Calibri',
      wrap: true,
    })
    slide.addText(risk.severity.toUpperCase(), {
      x: 11.5, y, w: 1.5, h: 0.4,
      fontSize: 9,
      color,
      bold: true,
      align: 'right',
      fontFace: 'Calibri',
    })
  })
}

function addTimelineSlide(pptx: pptxgen, report: ReportContent) {
  const slide = pptx.addSlide()
  addSlideHeader(slide, pptx, 'Upcoming Milestones')

  if (!report.upcoming_milestones.length) {
    slide.addText('No upcoming milestones defined.', {
      x: 0.5, y: 2.5, w: 12.3, h: 0.5,
      fontSize: 14,
      color: BRAND.gray,
      align: 'center',
      fontFace: 'Calibri',
    })
    return
  }

  report.upcoming_milestones.slice(0, 6).forEach((m, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 0.5 + col * 6.5
    const y = 1.5 + row * 1.7

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6, h: 1.5,
      fill: { color: BRAND.slate_light },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.1,
    })
    slide.addText(m.title, {
      x: x + 0.2, y: y + 0.15, w: 5.5, h: 0.5,
      fontSize: 12,
      color: BRAND.slate,
      bold: true,
      fontFace: 'Calibri',
    })
    slide.addText(`Due: ${formatDate(m.due_date)}`, {
      x: x + 0.2, y: y + 0.75, w: 5.5, h: 0.35,
      fontSize: 11,
      color: BRAND.indigo,
      fontFace: 'Calibri',
    })
  })
}

function addTaskStatusSlide(pptx: pptxgen, tasks: Task[]) {
  const slide = pptx.addSlide()
  addSlideHeader(slide, pptx, 'Task Overview')

  const overdueCount = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false
    return new Date(t.due_date) < new Date()
  }).length

  const rows = tasks.slice(0, 12).map(t => [
    { text: t.title.slice(0, 40) },
    { text: t.status.replace('_', ' ') },
    { text: t.priority },
    { text: t.due_date ? formatDate(t.due_date) : '—' },
  ])

  if (rows.length > 0) {
    slide.addTable(
      [
        [
          { text: 'Task', options: { bold: true, color: BRAND.white, fill: { color: BRAND.indigo } } },
          { text: 'Status', options: { bold: true, color: BRAND.white, fill: { color: BRAND.indigo } } },
          { text: 'Priority', options: { bold: true, color: BRAND.white, fill: { color: BRAND.indigo } } },
          { text: 'Due Date', options: { bold: true, color: BRAND.white, fill: { color: BRAND.indigo } } },
        ],
        ...rows,
      ],
      {
        x: 0.5, y: 1.4, w: 12.3,
        colW: [6.5, 2, 1.8, 2],
        fontSize: 10,
        border: { pt: 1, color: 'E2E8F0' },
        fill: { color: BRAND.slate_light },
        fontFace: 'Calibri',
        align: 'left',
      }
    )
  }

  slide.addText(`⚠ ${overdueCount} overdue tasks`, {
    x: 0.5, y: 6.8, w: 6, h: 0.35,
    fontSize: 10,
    color: BRAND.red,
    bold: true,
    fontFace: 'Calibri',
  })
}

function addSlideHeader(slide: pptxgen.Slide, pptx: pptxgen, title: string) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.8,
    fill: { color: BRAND.slate },
  })
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.06, h: 0.8,
    fill: { color: BRAND.indigo },
  })
  slide.addText(title, {
    x: 0.3, y: 0.1, w: 12, h: 0.6,
    fontSize: 20,
    color: BRAND.white,
    bold: true,
    fontFace: 'Calibri',
    valign: 'middle',
  })
  slide.addText('RSGS Flow', {
    x: 10.5, y: 0.1, w: 2.5, h: 0.6,
    fontSize: 11,
    color: BRAND.gray,
    align: 'right',
    fontFace: 'Calibri',
    valign: 'middle',
  })
}
