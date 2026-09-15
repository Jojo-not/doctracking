import { useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { auth, db, firebaseConfigured } from './firebase'
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  DoorOpen,
  FileCheck2,
  FileText,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  X,
} from 'lucide-react'

const emptyForm = {
  DocummentCode: '',
  Subject: '',
  DateReceive: '',
  EndorsedTo: '',
  Name: '',
  Releasedate: '',
}

function getStatus(endorsedTo) {
  return String(endorsedTo || '').trim().toUpperCase() === 'BHROD-HRDD'
    ? 'Endorsed'
    : 'Release'
}

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

function authErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'That email address already has an account.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/weak-password':
      return 'Password must contain at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return error?.message || 'Authentication failed. Please try again.'
  }
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

function StatusBadge({ status }) {
  const endorsed = status === 'Endorsed'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        endorsed
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-blue-50 text-blue-700 ring-blue-200'
      }`}
    >
      <CheckCircle2 size={13} />
      {status}
    </span>
  )
}

function AuthScreen({ onGuest }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!firebaseConfigured || !auth) {
      setError('Firebase is not configured. Check your Vercel environment variables.')
      return
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
        await updateProfile(credential.user, { displayName: name.trim() })
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
    } catch (authError) {
      setError(authErrorMessage(authError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12">
      <section className="mx-auto hidden max-w-xl text-white lg:block">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200">
          <ShieldCheck size={16} />
          Secure document monitoring
        </div>
        <h1 className="mt-8 text-5xl font-bold tracking-tight">
          DocuTrack
          <span className="block text-blue-400">Document Monitoring System</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
          Authorized users can manage document records. Guests can open the public page to search and view records without making changes.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Users className="text-blue-300" size={24} />
            <p className="mt-4 font-semibold">User access</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">Create, edit and delete documents after signing in.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Search className="text-blue-300" size={24} />
            <p className="mt-4 font-semibold">Guest search</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">Public read-only document search and viewing.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">DocuTrack</p>
              <h2 className="text-xl font-bold text-slate-950">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <Field
                label="Name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                required
              />
            )}
            <Field
              label="Email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="name@example.com"
              required
            />
            <Field
              label="Password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Minimum 6 characters"
              required
            />

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                <CircleAlert size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <LoaderCircle size={18} className="animate-spin" /> : mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={onGuest}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <DoorOpen size={18} />
            Continue as Guest
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-slate-400">
            Guest access is view-only and includes document search.
          </p>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [guestMode, setGuestMode] = useState(false)
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [backendError, setBackendError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
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
  const canManage = Boolean(user)

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setAuthReady(true)
      return undefined
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      if (nextUser) setGuestMode(false)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    if (!firebaseConfigured || !db) {
      setBackendError('Firebase is not configured. Check your Vercel environment variables.')
      setIsLoading(false)
      return undefined
    }

    const unsubscribe = onSnapshot(
      collection(db, 'documents'),
      (snapshot) => {
        const nextRecords = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data()
          const EndorsedTo = data.EndorsedTo ?? data.ReleaseOfficeName ?? ''
          const Name = data.Name ?? data.ReceiverName ?? ''

          return {
            id: snapshotDoc.id,
            ...data,
            EndorsedTo,
            Name,
            Status: getStatus(EndorsedTo),
          }
        })

        setRecords(nextRecords)
        setBackendError('')
        setIsLoading(false)
      },
      (error) => {
        console.error('Firestore read error:', error)
        setBackendError(`Firebase Error: ${error.code || 'unknown'} - ${error.message}`)
        setIsLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    return records
      .filter((record) => {
        if (statusFilter === 'endorsed') return record.Status === 'Endorsed'
        if (statusFilter === 'release') return record.Status === 'Release'
        return true
      })
      .filter((record) => {
        if (!query) return true
        return [
          record.DocummentCode,
          record.Subject,
          record.DateReceive,
          record.EndorsedTo,
          record.Name,
          record.Releasedate,
          record.Status,
        ].some((value) => String(value || '').toLowerCase().includes(query))
      })
      .sort((a, b) => (b.DateReceive || '').localeCompare(a.DateReceive || ''))
  }, [records, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const endorsedCount = records.filter((record) => record.Status === 'Endorsed').length
  const releaseCount = records.length - endorsedCount
  const receivedThisMonth = records.filter((record) => {
    if (!record.DateReceive) return false
    const date = new Date(`${record.DateReceive}T00:00:00`)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  function openCreate() {
    if (!canManage) return
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  function openEdit(record) {
    if (!canManage) return
    setEditingId(record.id)
    setForm({
      DocummentCode: record.DocummentCode || '',
      Subject: record.Subject || '',
      DateReceive: record.DateReceive || '',
      EndorsedTo: record.EndorsedTo || '',
      Name: record.Name || '',
      Releasedate: record.Releasedate || '',
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

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!canManage) {
      setFormError('You must be signed in to manage documents.')
      return
    }

    const requiredFields = ['DocummentCode', 'Subject', 'DateReceive', 'EndorsedTo', 'Name']
    if (requiredFields.some((key) => !String(form[key]).trim())) {
      setFormError('Please complete all required fields.')
      return
    }

    const duplicateCode = records.some(
      (record) =>
        String(record.DocummentCode || '').trim().toLowerCase() === form.DocummentCode.trim().toLowerCase() &&
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

    if (!db) {
      setFormError('Firebase is not configured.')
      return
    }

    setIsSaving(true)
    const payload = {
      ...form,
      Status: getStatus(form.EndorsedTo),
      updatedAt: serverTimestamp(),
      updatedBy: user.email || user.uid,
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'documents', editingId), {
          ...payload,
          ReleaseOfficeName: deleteField(),
          ReceiverName: deleteField(),
        })
      } else {
        await addDoc(collection(db, 'documents'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.email || user.uid,
        })
      }
      closeForm()
    } catch (error) {
      console.error('Firestore save error:', error)
      setFormError(`Unable to save: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId || !canManage || !db) return

    try {
      await deleteDoc(doc(db, 'documents', deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error('Firestore delete error:', error)
      setBackendError(`Unable to delete: ${error.message}`)
      setDeleteId(null)
    }
  }

  async function handleLogout() {
    if (auth) await signOut(auth)
  }

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-blue-400" size={34} />
          <p className="mt-4 text-sm text-slate-300">Loading DocuTrack...</p>
        </div>
      </div>
    )
  }

  if (!user && !guestMode) {
    return <AuthScreen onGuest={() => setGuestMode(true)} />
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
            <div className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold ring-1 ring-inset ring-white/10">
              <LayoutDashboard size={18} />
              {canManage ? 'Document Records' : 'Guest Records'}
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400">
              <Archive size={18} />
              Cloud Firestore
            </div>
          </nav>

          <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Access</p>
            <p className="mt-2 text-sm font-semibold text-slate-200">
              {canManage ? user.displayName || user.email : 'Guest / View only'}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {canManage ? 'Authenticated CRUD access.' : 'Search and view records only.'}
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

        <main className="min-w-0 flex-1 bg-slate-50">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
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
                    {canManage ? 'Dashboard' : 'Public Guest Page'}
                  </p>
                  <h2 className="truncate text-xl font-bold tracking-tight text-slate-950">Document Monitoring</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManage ? (
                  <>
                    <button
                      onClick={openCreate}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      <Plus size={18} />
                      <span className="hidden sm:inline">Add Document</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <LogOut size={17} />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setGuestMode(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                  >
                    <LogIn size={17} />
                    Login / Sign Up
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {!canManage && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm text-blue-800">
                <ShieldCheck size={19} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Guest view</p>
                  <p className="mt-1 leading-6">You can search and view document records. Editing and deleting are disabled.</p>
                </div>
              </div>
            )}

            {backendError && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
                <CircleAlert size={19} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Firebase connection needs attention</p>
                  <p className="mt-1 leading-6">{backendError}</p>
                </div>
              </div>
            )}

            <section>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-950">Overview</h3>
                <p className="mt-1 text-sm text-slate-500">Track incoming documents and endorsement/release status.</p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={FileText} label="Total Documents" value={records.length} helper="All records" tone="blue" />
                <StatCard icon={CheckCircle2} label="Endorsed" value={endorsedCount} helper="Endorsed To = BHROD-HRDD" tone="emerald" />
                <StatCard icon={FileCheck2} label="Release" value={releaseCount} helper="All other Endorsed To values" tone="amber" />
                <StatCard icon={Inbox} label="Received This Month" value={receivedThisMonth} helper="Current month" tone="violet" />
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Document Records</h3>
                    <p className="mt-1 text-sm text-slate-500">{filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'} found</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 sm:w-80">
                      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search code, subject, name..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="all">All Status</option>
                      <option value="endorsed">Endorsed</option>
                      <option value="release">Release</option>
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
                      <th className="px-6 py-3.5">Endorsed To</th>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Release Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      {canManage && <th className="px-6 py-3.5 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRecords.map((record) => (
                      <tr key={record.id} className="transition hover:bg-slate-50/70">
                        <td className="max-w-sm px-6 py-4">
                          <div className="font-semibold text-slate-950">{record.DocummentCode}</div>
                          <div className="mt-1 line-clamp-2 text-sm text-slate-500">{record.Subject}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(record.DateReceive)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{record.EndorsedTo || '—'}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{record.Name || '—'}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(record.Releasedate)}</td>
                        <td className="px-6 py-4"><StatusBadge status={record.Status} /></td>
                        {canManage && (
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openEdit(record)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Pencil size={16} /></button>
                              <button onClick={() => setDeleteId(record.id)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        )}
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
                      <StatusBadge status={record.Status} />
                    </div>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2"><CalendarDays size={16} className="mt-0.5 text-slate-400" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Received</p><p className="mt-0.5 text-slate-700">{formatDate(record.DateReceive)}</p></div></div>
                      <div className="flex items-start gap-2"><Archive size={16} className="mt-0.5 text-slate-400" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Endorsed To</p><p className="mt-0.5 text-slate-700">{record.EndorsedTo || '—'}</p></div></div>
                      <div className="flex items-start gap-2"><UserRound size={16} className="mt-0.5 text-slate-400" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name</p><p className="mt-0.5 text-slate-700">{record.Name || '—'}</p></div></div>
                      <div className="flex items-start gap-2"><FileCheck2 size={16} className="mt-0.5 text-slate-400" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Release Date</p><p className="mt-0.5 text-slate-700">{formatDate(record.Releasedate)}</p></div></div>
                    </div>
                    {canManage && (
                      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button onClick={() => openEdit(record)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Pencil size={15} />Edit</button>
                        <button onClick={() => setDeleteId(record.id)} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={15} />Delete</button>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {isLoading ? (
                <div className="px-6 py-16 text-center"><LoaderCircle size={30} className="mx-auto animate-spin text-blue-600" /><h4 className="mt-4 font-bold text-slate-900">Loading Firebase records</h4></div>
              ) : visibleRecords.length === 0 ? (
                <div className="px-6 py-16 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Search size={24} /></div><h4 className="mt-4 font-bold text-slate-900">No records found</h4><p className="mt-1 text-sm text-slate-500">Try another search term.</p></div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-slate-500">Page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages}</span></p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} />Previous</button>
                  <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={16} /></button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {isFormOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-xl">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">{editingId ? 'Update record' : 'New record'}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{editingId ? 'Edit Document' : 'Add Document'}</h3></div>
              <button onClick={closeForm} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close form"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formError && <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><CircleAlert size={18} className="mt-0.5 shrink-0" /><span>{formError}</span></div>}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Document Code" name="DocummentCode" value={form.DocummentCode} onChange={handleChange} placeholder="e.g. DOC-2026-004" required />
                <Field label="Date Received" name="DateReceive" value={form.DateReceive} onChange={handleChange} type="date" required />
                <div className="sm:col-span-2"><Field label="Subject" name="Subject" value={form.Subject} onChange={handleChange} placeholder="Enter document subject" required /></div>
                <Field label="Endorsed To" name="EndorsedTo" value={form.EndorsedTo} onChange={handleChange} placeholder="e.g. BHROD-HRDD" required />
                <Field label="Name" name="Name" value={form.Name} onChange={handleChange} placeholder="Enter receiver/person name" required />
                <Field label="Release Date" name="Releasedate" value={form.Releasedate} onChange={handleChange} type="date" />
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Automatic Status</p>
                  <div className="mt-2"><StatusBadge status={getStatus(form.EndorsedTo)} /></div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">BHROD-HRDD = Endorsed. Any other value = Release.</p>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving && <LoaderCircle size={16} className="animate-spin" />}{isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && canManage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 size={22} /></div>
            <h3 className="mt-5 text-xl font-bold text-slate-950">Delete this document?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">This permanently removes the record from Firestore and cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button onClick={confirmDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700">Delete Record</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
