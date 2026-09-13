import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  ReceiptText,
  FileCheck2,
  Download,
  Plus,
  Search,
  Eye,
  X,
  Sparkles,
  FolderKanban,
  CreditCard,
  Users,
  FileSignature,
} from 'lucide-react'
import { get, post, formatDate } from '@/utils/businessApi'
import { downloadBusinessDocumentPdf } from './pdf'

type DocType =
  | 'Invoice'
  | 'Receipt'
  | 'Order Confirmation'
  | 'Project Proposal'
  | 'Quotation'
  | 'Project Brief'
  | 'Scope of Work'
  | 'Agreement'
  | 'Contract'
  | 'NDA'
  | 'Berita Acara'
  | 'Project Completion'
  | 'Handover'
  | 'Maintenance Agreement'
  | 'Project Statement'

type DocSource = 'Automatic' | 'Manual'

interface Doc {
  id: number
  number: string
  type: DocType | string
  title: string
  project_id?: number | null
  related_to: string
  date: string
  status: 'Draft' | 'Final' | 'Active' | string
  content: string
  html?: string
  source?: DocSource
}

interface Project {
  id: number
  code?: string
  name: string
  customer?: string
}

type AdminTheme = 'dark' | 'light'

interface ThemeTokens {
  page: string
  surface: string
  elevated: string
  input: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  hover: string
  placeholder: string
}

const automaticTypes = new Set([
  'Invoice',
  'Receipt',
  'Order Confirmation',
])

const manualTypes = [
  'Project Proposal',
  'Quotation',
  'Project Brief',
  'Scope of Work',
  'Agreement',
  'Contract',
  'NDA',
  'Berita Acara',
  'Project Completion',
  'Handover',
  'Maintenance Agreement',
  'Project Statement',
]

const typeGroups = [
  {
    title: 'Project & Business',
    items: manualTypes,
  },
]

function useAdminTheme() {
  const readTheme = (): AdminTheme =>
    document.documentElement.dataset.adminTheme === 'light'
      ? 'light'
      : 'dark'

  const [theme, setTheme] = useState<AdminTheme>(readTheme)

  useEffect(() => {
    const syncTheme = () => setTheme(readTheme())

    syncTheme()

    const observer = new MutationObserver(syncTheme)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-admin-theme'],
    })

    return () => observer.disconnect()
  }, [])

  return theme
}

function getThemeTokens(theme: AdminTheme): ThemeTokens {
  if (theme === 'light') {
    return {
      page: 'bg-[#f7f7fa]',
      surface: 'bg-white',
      elevated: 'bg-neutral-50',
      input: 'bg-white',
      border: 'border-neutral-200',
      textPrimary: 'text-neutral-900',
      textSecondary: 'text-neutral-600',
      textMuted: 'text-neutral-500',
      hover: 'hover:bg-neutral-50',
      placeholder: 'placeholder:text-neutral-400',
    }
  }

  return {
    page: 'bg-[#0b0b0f]',
    surface: 'bg-[#15151b]',
    elevated: 'bg-[#1b1b22]',
    input: 'bg-[#0f0f13]',
    border: 'border-white/[0.08]',
    textPrimary: 'text-white',
    textSecondary: 'text-white/70',
    textMuted: 'text-white/45',
    hover: 'hover:bg-white/[0.04]',
    placeholder: 'placeholder:text-white/25',
  }
}

function getSource(doc: Doc): DocSource {
  if (doc.source) return doc.source
  if (automaticTypes.has(doc.type)) return 'Automatic'
  return 'Manual'
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'Invoice':
      return 'Invoice'
    case 'Receipt':
      return 'Transaction Receipt'
    case 'Order Confirmation':
      return 'Order Confirmation'
    case 'Project Proposal':
      return 'Proposal'
    case 'Quotation':
      return 'Quotation'
    case 'Scope of Work':
      return 'SOW'
    case 'Project Completion':
      return 'Completion Report'
    case 'Maintenance Agreement':
      return 'Maintenance Agreement'
    default:
      return type
  }
}

function getStatusClasses(
  status: string,
  theme: AdminTheme,
) {
  if (status === 'Active' || status === 'Final') {
    return theme === 'light'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-emerald-500/10 text-emerald-400'
  }

  if (status === 'Draft') {
    return theme === 'light'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-amber-500/10 text-amber-400'
  }

  return theme === 'light'
    ? 'bg-neutral-100 text-neutral-600'
    : 'bg-white/[0.06] text-white/60'
}

export function AdminDocumentsPage() {
  const theme = useAdminTheme()
  const c = getThemeTokens(theme)

  const [documents, setDocuments] = useState<Doc[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] =
    useState<'All' | DocSource>('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [show, setShow] = useState(false)
  const [preview, setPreview] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)

    try {
      const [docs, projectResponse] = await Promise.all([
        get<{ data: Doc[] }>('/api/admin/documents'),
        get<{ data: Project[] }>('/api/admin/projects'),
      ])

      setDocuments(
        (docs.data || []).map((doc) => ({
          ...doc,
          source: getSource(doc),
        })),
      )

      setProjects(projectResponse.data || [])
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Failed to load documents',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const types = useMemo(
    () =>
      Array.from(
        new Set(documents.map((doc) => doc.type)),
      ).sort(),
    [documents],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()

    return documents.filter((doc) => {
      const matchesSearch =
        !q ||
        `${doc.number} ${doc.title} ${doc.related_to} ${doc.type}`
          .toLowerCase()
          .includes(q)

      const matchesSource =
        sourceFilter === 'All' ||
        getSource(doc) === sourceFilter

      const matchesType =
        typeFilter === 'All' ||
        doc.type === typeFilter

      return (
        matchesSearch &&
        matchesSource &&
        matchesType
      )
    })
  }, [
    documents,
    search,
    sourceFilter,
    typeFilter,
  ])

  const openPreview = async (doc: Doc) => {
    try {
      const response = await get<{ data: Doc }>(
        `/api/admin/documents/${doc.id}`,
      )

      setPreview(response.data)
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Failed to open document',
      )
    }
  }

  const download = async (doc: Doc) => {
    try {
      const response = await get<{ data: Doc }>(
        `/api/admin/documents/${doc.id}`,
      )

      downloadBusinessDocumentPdf(response.data)
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Failed to download PDF',
      )
    }
  }

  const createDocument = async (
    value: Record<string, unknown>,
  ) => {
    try {
      await post('/api/admin/documents', value)
      setShow(false)
      await load()
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Failed to generate document',
      )
    }
  }

  return (
    <div className={`min-h-full space-y-6 ${c.page}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2
            className={`text-2xl font-bold ${c.textPrimary}`}
          >
            Documents
          </h2>

          <p
            className={`mt-1 max-w-3xl text-sm leading-6 ${c.textMuted}`}
          >
            Pusat dokumen bisnis 39Production. Dokumen transaksi
            dibuat otomatis oleh sistem, sedangkan dokumen proyek
            dapat dibuat admin saat dibutuhkan.
          </p>
        </div>

        <button
          onClick={() => setShow(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Generate Project Document
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={FileText}
          label="All Documents"
          value={documents.length}
          theme={theme}
        />

        <Stat
          icon={CreditCard}
          label="Automatic Transactions"
          value={
            documents.filter(
              (doc) =>
                getSource(doc) === 'Automatic',
            ).length
          }
          theme={theme}
        />

        <Stat
          icon={FolderKanban}
          label="Project Documents"
          value={
            documents.filter(
              (doc) => getSource(doc) === 'Manual',
            ).length
          }
          theme={theme}
        />

        <Stat
          icon={FileCheck2}
          label="Receipts"
          value={
            documents.filter(
              (doc) => doc.type === 'Receipt',
            ).length
          }
          theme={theme}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard
          icon={Sparkles}
          title="Automatic Transaction Documents"
          text="Order confirmation, invoice DP, receipt DP, invoice pelunasan, receipt pelunasan, bukti pemeliharaan, dan bukti pembayaran member dibuat dari aktivitas sistem."
          theme={theme}
        />

        <InfoCard
          icon={FileSignature}
          title="Project & Business Documents"
          text="Admin dapat membuat proposal, quotation, SOW, agreement, contract, NDA, berita acara, completion report, handover, dan dokumen proyek lainnya."
          theme={theme}
        />
      </div>

      <div
        className={`rounded-xl border ${c.border} ${c.surface} p-4`}
      >
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${c.textMuted}`}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document, project, order..."
              className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) =>
              setSourceFilter(
                e.target.value as 'All' | DocSource,
              )
            }
            className={`rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-2.5 text-sm outline-none transition focus:border-violet-500/60`}
          >
            <option value="All">All Sources</option>
            <option value="Automatic">
              Automatic
            </option>
            <option value="Manual">
              Project / Manual
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            className={`rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-4 py-2.5 text-sm outline-none transition focus:border-violet-500/60`}
          >
            <option value="All">All Types</option>

            {types.map((type) => (
              <option key={type} value={type}>
                {getTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-xl border ${c.border} ${c.surface}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr
                className={`border-b ${c.border} ${c.elevated}`}
              >
                {[
                  'Document',
                  'Type',
                  'Source',
                  'Related To',
                  'Date',
                  'Status',
                  'Action',
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider ${c.textMuted}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`p-12 text-center text-sm ${c.textMuted}`}
                  >
                    Loading documents...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((doc) => {
                  const source = getSource(doc)

                  return (
                    <tr
                      key={doc.id}
                      className={`border-b ${c.border} last:border-0 ${c.hover} transition-colors`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 rounded-lg bg-violet-500/10 p-2 text-violet-500">
                            {doc.type === 'Receipt' ? (
                              <ReceiptText className="h-5 w-5" />
                            ) : source === 'Automatic' ? (
                              <CreditCard className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate font-medium ${c.textPrimary}`}
                            >
                              {doc.title}
                            </p>

                            <p
                              className={`mt-1 text-xs ${c.textMuted}`}
                            >
                              {doc.number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className={`px-5 py-4 text-sm ${c.textSecondary}`}
                      >
                        {getTypeLabel(doc.type)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${source === 'Automatic'
                              ? theme === 'light'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-violet-500/10 text-violet-500'
                            }`}
                        >
                          {source === 'Automatic' ? (
                            <Sparkles className="h-3 w-3" />
                          ) : (
                            <FolderKanban className="h-3 w-3" />
                          )}

                          {source === 'Automatic'
                            ? 'Automatic'
                            : 'Project / Manual'}
                        </span>
                      </td>

                      <td
                        className={`px-5 py-4 text-sm ${c.textSecondary}`}
                      >
                        {doc.related_to || '-'}
                      </td>

                      <td
                        className={`px-5 py-4 text-sm ${c.textSecondary}`}
                      >
                        {formatDate(doc.date)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            doc.status,
                            theme,
                          )}`}
                        >
                          {doc.status === 'Active'
                            ? 'Final'
                            : doc.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              openPreview(doc)
                            }
                            title="Preview"
                            className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => download(doc)}
                            title="Download PDF"
                            className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className={`p-12 text-center text-sm ${c.textMuted}`}
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {show && (
        <DocModal
          projects={projects}
          theme={theme}
          onClose={() => setShow(false)}
          onSave={createDocument}
        />
      )}

      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className={`max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border ${c.border} ${c.surface} shadow-2xl`}
          >
            <div
              className={`flex items-center justify-between border-b ${c.border} p-5`}
            >
              <div className="min-w-0">
                <h3
                  className={`truncate font-semibold ${c.textPrimary}`}
                >
                  {preview.title}
                </h3>

                <p
                  className={`mt-1 truncate text-xs ${c.textMuted}`}
                >
                  {preview.number} ·{' '}
                  {getTypeLabel(preview.type)} ·{' '}
                  {getSource(preview)}
                </p>
              </div>

              <button
                onClick={() => setPreview(null)}
                className={`shrink-0 rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <iframe
                title={preview.number}
                srcDoc={preview.html}
                className="h-[75vh] w-full rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  theme,
}: {
  icon: any
  label: string
  value: number
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.surface} p-5 transition hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-sm ${c.textMuted}`}>
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${c.textPrimary}`}
          >
            {value}
          </p>
        </div>

        <div className="shrink-0 rounded-lg bg-violet-500/10 p-3 text-violet-500">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  title,
  text,
  theme,
}: {
  icon: any
  title: string
  text: string
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`rounded-xl border ${c.border} ${c.surface} p-5`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 rounded-lg bg-violet-500/10 p-3 text-violet-500">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3
            className={`font-semibold ${c.textPrimary}`}
          >
            {title}
          </h3>

          <p
            className={`mt-1 text-sm leading-6 ${c.textSecondary}`}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}

function DocModal({
  projects,
  theme,
  onClose,
  onSave,
}: {
  projects: Project[]
  theme: AdminTheme
  onClose: () => void
  onSave: (value: Record<string, unknown>) => void
}) {
  const c = getThemeTokens(theme)

  const [value, setValue] = useState({
    type: 'Project Proposal',
    title: '',
    project_id: '',
    related_to: '',
    status: 'Draft',
    content: '',
  })

  const selectedProject = projects.find(
    (project) =>
      project.id === Number(value.project_id),
  )

  const update = (
    patch: Partial<typeof value>,
  ) => {
    setValue((current) => ({
      ...current,
      ...patch,
    }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!value.title.trim()) {
      return alert(
        'Document title is required.',
      )
    }

    if (!value.content.trim()) {
      return alert(
        'Document content is required.',
      )
    }

    onSave({
      ...value,
      project_id: value.project_id || null,
      related_to:
        value.related_to ||
        selectedProject?.name ||
        '',
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${c.border} ${c.surface} shadow-2xl`}
      >
        <div
          className={`flex items-center justify-between border-b ${c.border} p-5`}
        >
          <div>
            <h3
              className={`font-semibold ${c.textPrimary}`}
            >
              Generate Project Document
            </h3>

            <p
              className={`mt-1 text-xs ${c.textMuted}`}
            >
              Untuk proposal dan dokumen bisnis non-transaksi.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`rounded-lg p-2 ${c.textMuted} ${c.hover} transition`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 p-5"
        >
          <div
            className={`rounded-lg border border-violet-500/20 ${theme === 'light'
                ? 'bg-violet-50'
                : 'bg-violet-500/[0.06]'
              } p-4`}
          >
            <p className="text-xs font-semibold text-violet-500">
              Automatic documents
            </p>

            <p
              className={`mt-1 text-xs leading-5 ${c.textSecondary}`}
            >
              Invoice dan receipt pembayaran tidak dibuat
              dari form ini. Sistem akan membuatnya otomatis
              ketika DP, pelunasan, biaya pemeliharaan,
              dan pembayaran member tercatat.
            </p>
          </div>

          <label className="block">
            <span
              className={`mb-1.5 block text-xs font-medium ${c.textSecondary}`}
            >
              Document Type
            </span>

            <select
              value={value.type}
              onChange={(e) =>
                update({ type: e.target.value })
              }
              className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
            >
              {typeGroups.map((group) => (
                <optgroup
                  key={group.title}
                  label={group.title}
                >
                  {group.items.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {getTypeLabel(type)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block">
            <span
              className={`mb-1.5 block text-xs font-medium ${c.textSecondary}`}
            >
              Title
            </span>

            <input
              required
              value={value.title}
              onChange={(e) =>
                update({
                  title: e.target.value,
                })
              }
              placeholder="Contoh: Proposal Website Company Profile PT ABC"
              className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
            />
          </label>

          <label className="block">
            <span
              className={`mb-1.5 block text-xs font-medium ${c.textSecondary}`}
            >
              Project
            </span>

            <select
              value={value.project_id}
              onChange={(e) => {
                const project = projects.find(
                  (item) =>
                    item.id === Number(
                      e.target.value,
                    ),
                )

                update({
                  project_id: e.target.value,
                  related_to:
                    project?.name || '',
                })
              }}
              className={`w-full rounded-lg border ${c.border} ${c.input} ${c.textPrimary} px-3 py-2.5 text-sm outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
            >
              <option value="">
                No project / general document
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.code
                    ? `${project.code} — `
                    : ''}
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          {selectedProject?.customer && (
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniField
                icon={FolderKanban}
                label="Project"
                value={selectedProject.name}
                theme={theme}
              />

              <MiniField
                icon={Users}
                label="Customer"
                value={selectedProject.customer}
                theme={theme}
              />
            </div>
          )}

          <label className="block">
            <span
              className={`mb-1.5 block text-xs font-medium ${c.textSecondary}`}
            >
              Document Content
            </span>

            <textarea
              required
              value={value.content}
              onChange={(e) =>
                update({
                  content: e.target.value,
                })
              }
              rows={10}
              placeholder={
                'Tuliskan isi dokumen...\n\nContoh untuk proposal:\n- Latar belakang\n- Tujuan proyek\n- Scope of Work\n- Timeline\n- Nilai proyek\n- Ketentuan pembayaran'
              }
              className={`w-full resize-y rounded-lg border ${c.border} ${c.input} ${c.textPrimary} ${c.placeholder} px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10`}
            />
          </label>

          <div
            className={`flex justify-end gap-3 border-t ${c.border} pt-4`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg border ${c.border} ${c.textSecondary} px-4 py-2.5 text-sm transition ${c.hover}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <FileText className="h-4 w-4" />
              Generate Document
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MiniField({
  icon: Icon,
  label,
  value,
  theme,
}: {
  icon: any
  label: string
  value: string
  theme: AdminTheme
}) {
  const c = getThemeTokens(theme)

  return (
    <div
      className={`rounded-lg border ${c.border} ${c.elevated} p-3`}
    >
      <div
        className={`flex items-center gap-2 ${c.textMuted}`}
      >
        <Icon className="h-4 w-4" />

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 text-sm font-medium ${c.textPrimary}`}
      >
        {value}
      </p>
    </div>
  )
}