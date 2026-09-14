import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  FileClock,
  FileText,
  Inbox,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'document-tracker-records-v1'

const emptyForm = {
  DocummentCode: '',
  Subject: '',
  DateReceive: '',
  ReleaseOfficeName: '',
  ReceiverName: '',
  Releasedate: '',
}

const starterRecords = [
  {
    id: 'DOC-1',
    DocummentCode: 'DOC-2026-001',
    Subject: 'Regional memorandum for review',
    DateReceive: '2026-09-10',
    ReleaseOfficeName: 'Administrative Division',
    ReceiverName: 'Maria Santos',
    Releasedate: '2026-09-11',
  },
  {
    id: 'DOC-2',
    DocummentCode: 'DOC-2026-002',
    Subject: 'Request for certification',
    DateReceive: '2026-09-12',
    ReleaseOfficeName: 'Human Resource Division',
    ReceiverName: 'Juan Dela Cruz',
    Releasedate: '',
  },
  {
    id: 'DOC-3',
    DocummentCode: 'DOC-2026-003',
    Subject: 'Submission of monthly accomplishment report',
    DateReceive: '2026-09-13',
    ReleaseOfficeName: 'Records Section',
    ReceiverName: 'Angela Reyes',
    Releasedate: '2026-09-14',
  },
]

function formatDate(value) {
  if (!value) return '—'

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function StatCard({ icon: Icon, label, value, helper, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>

        <div className={`rounded-2xl p-3 ring-1 ${tones[tone]}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  )
}

function StatusBadge({ released }) {
  if (released) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <CheckCircle2 size={13} />
        Released
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
      <FileClock size={13} />
      Pending
    </span>
  )
}

function App() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : starterRecords
    } catch {
      return starterRecords
    }
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [formError, setFormError] = useState('')
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageSize = 6

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    return records
      .filter((record) => {
        if (statusFilter === 'released') return Boolean(record.Releasedate)
        if (statusFilter === 'pending') return !record.Releasedate
        return true
      })
      .filter((record) => {
        if (!query) return true
        return [
          record.DocummentCode,
          record.Subject,
          record.DateReceive,
          record.ReleaseOfficeName,
          record.ReceiverName,
          record.Releasedate,
        ].some((value) => String(value || '').toLowerCase().includes(query))
      })
      .sort((a, b) => (b.DateReceive || '').localeCompare(a.DateReceive || ''))
  }, [records, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const releasedCount = records.filter((record) => record.Releasedate).length
  const pendingCount = records.length - releasedCount

  const receivedThisMonth = records.filter((record) => {
    if (!record.DateReceive) return false
    const date = new Date(`${record.DateReceive}T00:00:00`)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  function openEdit(record) {
    setEditingId(record.id)
    setForm({
      DocummentCode: record.DocummentCode,
      Subject: record.Subject,
      DateReceive: record.DateReceive,
      ReleaseOfficeName: record.ReleaseOfficeName,
      ReceiverName: record.ReceiverName,
      Releasedate: record.Releasedate,
    })
    setFormError('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const requiredFields = [
      'DocummentCode',
      'Subject',
      'DateReceive',
      'ReleaseOfficeName',
      'ReceiverName',
    ]

    const hasMissingField = requiredFields.some((key) => !form[key].trim())
    if (hasMissingField) {
      setFormError('Please complete all required fields.')
      return
    }

    const duplicateCode = records.some(
      (record) =>
        record.DocummentCode.trim().toLowerCase() === form.DocummentCode.trim().toLowerCase() &&
        record.id !== editingId,
    )

    if (duplicateCode) {
      setFormError('Document Code must be unique.')
      return
    }

    if (form.Releasedate && form.Releasedate < form.DateReceive) {
      setFormError('Release Date cannot be earlier than Date Received.')
      return
    }

    if (editingId) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editingId ? { ...record, ...form } : record,
        ),
      )
    } else {
      setRecords((current) => [
        {
          id:
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`,
          ...form,
        },
        ...current,
      ])
    }

    closeForm()
  }

  function confirmDelete() {
    if (!deleteId) return
    setRecords((current) => current.filter((record) => record.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950 px-5 py-6 text-white transition duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-950/30">
                <FileText size={23} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-300">Records System</p>
                <h1 className="text-lg font-bold tracking-tight">DocuTrack</h1>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mt-10 space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white ring-1 ring-inset ring-white/10">
              <LayoutDashboard size={18} />
              Document Records
            </button>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400">
              <Archive size={18} />
              Local Storage
            </div>
          </nav>

          <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Storage
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-200">Browser persistence enabled</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Records remain available after refreshing this browser.
            </p>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu size={20} />
                </button>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">
                    Dashboard
                  </p>
                  <h2 className="truncate text-xl font-bold tracking-tight text-slate-950">
                    Document Monitoring
                  </h2>
                </div>
              </div>

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Document</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <section>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-950">Overview</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Track incoming documents, release details, and receiving personnel.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={FileText}
                  label="Total Documents"
                  value={records.length}
                  helper="All records"
                  tone="blue"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Released"
                  value={releasedCount}
                  helper="With release date"
                  tone="emerald"
                />
                <StatCard
                  icon={FileClock}
                  label="Pending"
                  value={pendingCount}
                  helper="Awaiting release"
                  tone="amber"
                />
                <StatCard
                  icon={Inbox}
                  label="Received This Month"
                  value={receivedThisMonth}
                  helper="Current month"
                  tone="violet"
                />
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Document Records</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'} found
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 sm:w-80">
                      <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search records..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="all">All Status</option>
                      <option value="released">Released</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/80">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3.5">Document</th>
                      <th className="px-6 py-3.5">Date Received</th>
                      <th className="px-6 py-3.5">Release Office</th>
                      <th className="px-6 py-3.5">Receiver</th>
                      <th className="px-6 py-3.5">Release Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRecords.map((record) => (
                      <tr key={record.id} className="transition hover:bg-slate-50/70">
                        <td className="max-w-sm px-6 py-4">
                          <div className="font-semibold text-slate-950">{record.DocummentCode}</div>
                          <div className="mt-1 line-clamp-2 text-sm text-slate-500">{record.Subject}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(record.DateReceive)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {record.ReleaseOfficeName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {record.ReceiverName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(record.Releasedate)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge released={record.Releasedate} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(record)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteId(record.id)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {visibleRecords.map((record) => (
                  <article key={record.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950">{record.DocummentCode}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{record.Subject}</p>
                      </div>
                      <StatusBadge released={record.Releasedate} />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CalendarDays size={16} className="mt-0.5 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Received
                          </p>
                          <p className="mt-0.5 text-slate-700">{formatDate(record.DateReceive)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Archive size={16} className="mt-0.5 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Office
                          </p>
                          <p className="mt-0.5 text-slate-700">{record.ReleaseOfficeName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <UserRound size={16} className="mt-0.5 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Receiver
                          </p>
                          <p className="mt-0.5 text-slate-700">{record.ReceiverName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileCheck2 size={16} className="mt-0.5 text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Release Date
                          </p>
                          <p className="mt-0.5 text-slate-700">{formatDate(record.Releasedate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => openEdit(record)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(record.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {visibleRecords.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <Search size={24} />
                  </div>
                  <h4 className="mt-4 font-bold text-slate-900">No records found</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Try another search term or add a new document.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-700">{currentPage}</span> of{' '}
                  <span className="font-semibold text-slate-700">{totalPages}</span>
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                  {editingId ? 'Update record' : 'New record'}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {editingId ? 'Edit Document' : 'Add Document'}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <CircleAlert size={18} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Document Code"
                  name="DocummentCode"
                  value={form.DocummentCode}
                  onChange={handleChange}
                  placeholder="e.g. DOC-2026-004"
                  required
                />

                <Field
                  label="Date Received"
                  name="DateReceive"
                  value={form.DateReceive}
                  onChange={handleChange}
                  type="date"
                  required
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Subject"
                    name="Subject"
                    value={form.Subject}
                    onChange={handleChange}
                    placeholder="Enter document subject"
                    required
                  />
                </div>

                <Field
                  label="Release Office Name"
                  name="ReleaseOfficeName"
                  value={form.ReleaseOfficeName}
                  onChange={handleChange}
                  placeholder="e.g. Administrative Division"
                  required
                />

                <Field
                  label="Receiver Name"
                  name="ReceiverName"
                  value={form.ReceiverName}
                  onChange={handleChange}
                  placeholder="Enter receiver name"
                  required
                />

                <Field
                  label="Release Date"
                  name="Releasedate"
                  value={form.Releasedate}
                  onChange={handleChange}
                  type="date"
                />
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  {editingId ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">Delete this document?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This action permanently removes the record from local storage and cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
