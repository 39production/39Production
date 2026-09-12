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
  Wrench,
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

const automaticTypes = new Set(['Invoice', 'Receipt', 'Order Confirmation'])

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
    icon: FolderKanban,
    items: manualTypes,
  },
]

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

export function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Doc[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'All' | DocSource>('All')
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
      setDocuments((docs.data || []).map((doc) => ({ ...doc, source: getSource(doc) })))
      setProjects(projectResponse.data || [])
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const types = useMemo(
    () => Array.from(new Set(documents.map((doc) => doc.type))).sort(),
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
      const matchesSource = sourceFilter === 'All' || getSource(doc) === sourceFilter
      const matchesType = typeFilter === 'All' || doc.type === typeFilter
      return matchesSearch && matchesSource && matchesType
    })
  }, [documents, search, sourceFilter, typeFilter])

  const openPreview = async (doc: Doc) => {
    try {
      const response = await get<{ data: Doc }>(`/api/admin/documents/${doc.id}`)
      setPreview(response.data)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to open document')
    }
  }

  const download = async (doc: Doc) => {
    try {
      const response = await get<{ data: Doc }>(`/api/admin/documents/${doc.id}`)
      downloadBusinessDocumentPdf(response.data)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to download PDF')
    }
  }

  const createDocument = async (value: Record<string, unknown>) => {
    try {
      await post('/api/admin/documents', value)
      setShow(false)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to generate document')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Documents</h2>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            Pusat dokumen bisnis 39Production. Dokumen transaksi dibuat otomatis oleh sistem,
            sedangkan dokumen proyek dapat dibuat admin saat dibutuhkan.
          </p>
        </div>
        <button
          onClick={() => setShow(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Generate Project Document
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FileText} label="All Documents" value={documents.length} />
        <Stat
          icon={CreditCard}
          label="Automatic Transactions"
          value={documents.filter((doc) => getSource(doc) === 'Automatic').length}
        />
        <Stat
          icon={FolderKanban}
          label="Project Documents"
          value={documents.filter((doc) => getSource(doc) === 'Manual').length}
        />
        <Stat
          icon={FileCheck2}
          label="Receipts"
          value={documents.filter((doc) => doc.type === 'Receipt').length}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard
          icon={Sparkles}
          title="Automatic Transaction Documents"
          text="Order confirmation, invoice DP, receipt DP, invoice pelunasan, receipt pelunasan, bukti pemeliharaan, dan bukti pembayaran member dibuat dari aktivitas sistem."
        />
        <InfoCard
          icon={FileSignature}
          title="Project & Business Documents"
          text="Admin dapat membuat proposal, quotation, SOW, agreement, contract, NDA, berita acara, completion report, handover, dan dokumen proyek lainnya."
        />
      </div>

      <div className="rounded-xl border border-border-default bg-bg-surface p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document, project, order..."
              className="w-full rounded-lg border border-border-default bg-bg-base py-2.5 pl-10 pr-4 text-sm text-text-primary"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as 'All' | DocSource)}
            className="rounded-lg border border-border-default bg-bg-base px-4 py-2.5 text-sm text-text-primary"
          >
            <option>All</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Project / Manual</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border-default bg-bg-base px-4 py-2.5 text-sm text-text-primary"
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

      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-border-default bg-bg-elevated/50">
                {['Document', 'Type', 'Source', 'Related To', 'Date', 'Status', 'Action'].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-sm text-text-muted">
                    Loading documents...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((doc) => {
                  const source = getSource(doc)
                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-border-default last:border-0 hover:bg-bg-elevated/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-brand-primary/10 p-2 text-brand-primary">
                            {doc.type === 'Receipt' ? (
                              <ReceiptText className="h-5 w-5" />
                            ) : source === 'Automatic' ? (
                              <CreditCard className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{doc.title}</p>
                            <p className="text-xs text-text-muted">{doc.number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-secondary">{getTypeLabel(doc.type)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            source === 'Automatic'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-brand-primary/10 text-brand-primary'
                          }`}
                        >
                          {source === 'Automatic' ? <Sparkles className="h-3 w-3" /> : <FolderKanban className="h-3 w-3" />}
                          {source === 'Automatic' ? 'Automatic' : 'Project / Manual'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-secondary">{doc.related_to || '-'}</td>
                      <td className="px-5 py-4 text-sm text-text-secondary">{formatDate(doc.date)}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary">
                          {doc.status === 'Active' ? 'Final' : doc.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openPreview(doc)}
                            title="Preview"
                            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => download(doc)}
                            title="Download PDF"
                            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated"
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
                  <td colSpan={7} className="p-12 text-center text-sm text-text-muted">
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
          onClose={() => setShow(false)}
          onSave={createDocument}
        />
      )}

      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-default p-5">
              <div>
                <h3 className="font-semibold text-text-primary">{preview.title}</h3>
                <p className="mt-1 text-xs text-text-muted">
                  {preview.number} · {getTypeLabel(preview.type)} · {getSource(preview)}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="rounded-lg p-2 hover:bg-bg-elevated">
                <X className="h-5 w-5 text-text-muted" />
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

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex gap-3">
        <div className="rounded-lg bg-brand-primary/10 p-3 text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{text}</p>
        </div>
      </div>
    </div>
  )
}

function DocModal({
  projects,
  onClose,
  onSave,
}: {
  projects: Project[]
  onClose: () => void
  onSave: (value: Record<string, unknown>) => void
}) {
  const [value, setValue] = useState({
    type: 'Project Proposal',
    title: '',
    project_id: '',
    related_to: '',
    status: 'Draft',
    content: '',
  })

  const selectedProject = projects.find((project) => project.id === Number(value.project_id))

  const update = (patch: Partial<typeof value>) => setValue((current) => ({ ...current, ...patch }))

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!value.title.trim()) return alert('Document title is required.')
    if (!value.content.trim()) return alert('Document content is required.')

    onSave({
      ...value,
      project_id: value.project_id || null,
      related_to: value.related_to || selectedProject?.name || '',
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-default p-5">
          <div>
            <h3 className="font-semibold text-text-primary">Generate Project Document</h3>
            <p className="mt-1 text-xs text-text-muted">Untuk proposal dan dokumen bisnis non-transaksi.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-bg-elevated">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-4">
            <p className="text-xs font-medium text-brand-primary">Automatic documents</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Invoice dan receipt pembayaran tidak dibuat dari form ini. Sistem akan membuatnya otomatis
              ketika DP, pelunasan, biaya pemeliharaan, dan pembayaran member tercatat.
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Document Type</span>
            <select
              value={value.type}
              onChange={(e) => update({ type: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-base px-3 py-2.5 text-sm text-text-primary"
            >
              {typeGroups.map((group) => (
                <optgroup key={group.title} label={group.title}>
                  {group.items.map((type) => (
                    <option key={type} value={type}>
                      {getTypeLabel(type)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Title</span>
            <input
              required
              value={value.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Contoh: Proposal Website Company Profile PT ABC"
              className="w-full rounded-lg border border-border-default bg-bg-base px-3 py-2.5 text-sm text-text-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Project</span>
            <select
              value={value.project_id}
              onChange={(e) => {
                const project = projects.find((item) => item.id === Number(e.target.value))
                update({
                  project_id: e.target.value,
                  related_to: project?.name || '',
                })
              }}
              className="w-full rounded-lg border border-border-default bg-bg-base px-3 py-2.5 text-sm text-text-primary"
            >
              <option value="">No project / general document</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.code ? `${project.code} — ` : ''}{project.name}
                </option>
              ))}
            </select>
          </label>

          {selectedProject?.customer && (
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniField icon={FolderKanban} label="Project" value={selectedProject.name} />
              <MiniField icon={Users} label="Customer" value={selectedProject.customer} />
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Document Content</span>
            <textarea
              required
              value={value.content}
              onChange={(e) => update({ content: e.target.value })}
              rows={10}
              placeholder={'Tuliskan isi dokumen...\n\nContoh untuk proposal:\n- Latar belakang\n- Tujuan proyek\n- Scope of Work\n- Timeline\n- Nilai proyek\n- Ketentuan pembayaran'}
              className="w-full resize-y rounded-lg border border-border-default bg-bg-base px-3 py-2.5 text-sm leading-6 text-text-primary"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-border-default pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border-default px-4 py-2.5 text-sm text-text-secondary"
            >
              Cancel
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white">
              <FileText className="h-4 w-4" />
              Generate Document
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MiniField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-base p-3">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  )
}
