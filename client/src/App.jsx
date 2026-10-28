import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom'

const API_URL = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#151513] px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-lime-300/70'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }
  return data
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight text-white">
      <span className="grid size-8 place-items-center rounded-xl bg-lime-300 text-sm font-black text-[#17190f]">↗</span>
      <span>branch<span className="text-lime-300">.</span></span>
    </Link>
  )
}

function Header() {
  return (
    <header className="border-b border-white/[0.07]">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <Link
          to="/dashboard"
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-stone-300 transition hover:border-white/25 hover:text-white"
        >
          Dashboard
        </Link>
      </div>
    </header>
  )
}

function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [lookupUsername, setLookupUsername] = useState('')
  const [profileForm, setProfileForm] = useState({ name: '', username: '', bio: '', photo: '', socials: '' })
  const [linkForm, setLinkForm] = useState({ title: '', url: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function updateField(event) {
    setProfileForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function loadProfile(event) {
    event?.preventDefault()
    const username = lookupUsername.trim().replace(/^@/, '')
    if (!username) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const data = await request(`/profiles/${encodeURIComponent(username)}`)
      setProfile(data)
      setProfileForm({
        name: data.name || '',
        username: data.username || '',
        bio: data.bio || '',
        photo: data.photo || '',
        socials: (data.socials || []).join(', '),
      })
      setLookupUsername(data.username)
      setMessage('Profile loaded. You can update your details below.')
    } catch (requestError) {
      setProfile(null)
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveProfile(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const payload = {
      ...profileForm,
      username: profileForm.username.trim().replace(/^@/, ''),
      socials: profileForm.socials.split(',').map((item) => item.trim()).filter(Boolean),
    }
    try {
      const data = profile
        ? await request(`/profiles/${encodeURIComponent(profile.username)}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await request('/profiles', { method: 'POST', body: JSON.stringify(payload) })
      setProfile(data)
      setLookupUsername(data.username)
      setProfileForm((current) => ({ ...current, username: data.username }))
      setMessage(profile ? 'Your profile has been updated.' : 'Your profile is ready. Add your first link below.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function addLink(event) {
    event.preventDefault()
    if (!profile) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const data = await request(`/profiles/${encodeURIComponent(profile.username)}/links`, {
        method: 'POST',
        body: JSON.stringify(linkForm),
      })
      setProfile(data)
      setLinkForm({ title: '', url: '' })
      setMessage('Link added.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteLink(linkId) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const data = await request(`/profiles/${encodeURIComponent(profile.username)}/links/${linkId}`, {
        method: 'DELETE',
      })
      setProfile(data)
      setMessage('Link removed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#10100f]">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_340px] lg:gap-16 lg:py-16">
        <section>
          <div className="mb-9">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Your space on the web</p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Make it easy to find you.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-400">
              One simple page for everything you create, share, and are.
            </p>
          </div>

          <form onSubmit={loadProfile} className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#141412] p-4 sm:flex-row">
            <label className="sr-only" htmlFor="lookupUsername">Load an existing profile</label>
            <input
              id="lookupUsername"
              className={inputClass}
              value={lookupUsername}
              onChange={(event) => setLookupUsername(event.target.value)}
              placeholder="Load an existing username"
              autoComplete="username"
            />
            <button disabled={busy} className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#171715] transition hover:bg-lime-200 disabled:opacity-50">
              Load profile
            </button>
          </form>

          {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          {message && <p role="status" className="mb-5 rounded-xl border border-lime-300/20 bg-lime-300/[0.08] px-4 py-3 text-sm text-lime-100">{message}</p>}

          <form onSubmit={saveProfile} className="space-y-7">
            <section className="rounded-2xl border border-white/[0.08] bg-[#141412] p-5 sm:p-7">
              <div className="mb-6">
                <p className="text-xs font-medium text-stone-500">01 / PROFILE</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{profile ? 'Edit your profile' : 'Create your profile'}</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-xs font-medium text-stone-300">
                  Display name
                  <input required name="name" value={profileForm.name} onChange={updateField} className={`${inputClass} mt-2`} placeholder="Alex Morgan" />
                </label>
                <label className="text-xs font-medium text-stone-300">
                  Username
                  <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-[#151513] focus-within:border-lime-300/70">
                    <span className="pl-4 text-sm text-stone-600">@</span>
                    <input required name="username" value={profileForm.username} onChange={updateField} className="w-full bg-transparent px-2 py-3 text-sm text-stone-100 outline-none placeholder:text-stone-600" placeholder="alexmorgan" pattern="[A-Za-z0-9_-]+" />
                  </div>
                </label>
                <label className="text-xs font-medium text-stone-300 sm:col-span-2">
                  Short bio
                  <textarea name="bio" value={profileForm.bio} onChange={updateField} className={`${inputClass} mt-2 min-h-24 resize-y`} maxLength={300} placeholder="A little about you..." />
                </label>
                <label className="text-xs font-medium text-stone-300 sm:col-span-2">
                  Photo URL
                  <input name="photo" type="url" value={profileForm.photo} onChange={updateField} className={`${inputClass} mt-2`} placeholder="https://example.com/your-photo.jpg" />
                </label>
                <label className="text-xs font-medium text-stone-300 sm:col-span-2">
                  Social profile URLs <span className="font-normal text-stone-500">(comma separated)</span>
                  <input value={profileForm.socials} onChange={(event) => setProfileForm((current) => ({ ...current, socials: event.target.value }))} className={`${inputClass} mt-2`} placeholder="https://instagram.com/you, https://github.com/you" />
                </label>
              </div>
              <button disabled={busy} className="mt-6 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-[#17190f] transition hover:bg-lime-200 disabled:opacity-50">
                {busy ? 'Saving...' : profile ? 'Save changes' : 'Create profile'}
              </button>
            </section>
          </form>

          <section className="mt-7 rounded-2xl border border-white/[0.08] bg-[#141412] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-medium text-stone-500">02 / YOUR LINKS</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Add something worth clicking.</h2>
            </div>
            {!profile ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-stone-500">Create or load a profile to manage its links.</p>
            ) : (
              <>
                <form onSubmit={addLink} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
                  <label className="sr-only" htmlFor="linkTitle">Link title</label>
                  <input id="linkTitle" required value={linkForm.title} onChange={(event) => setLinkForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} placeholder="Link title" />
                  <label className="sr-only" htmlFor="linkUrl">Link URL</label>
                  <input id="linkUrl" required type="url" value={linkForm.url} onChange={(event) => setLinkForm((current) => ({ ...current, url: event.target.value }))} className={inputClass} placeholder="https://..." />
                  <button disabled={busy} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-lime-300/50 hover:text-lime-200 disabled:opacity-50">Add link</button>
                </form>
                <div className="mt-5 space-y-2">
                  {profile.links?.length ? profile.links.map((link) => (
                    <div key={link._id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#10100f] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-200">{link.title}</p>
                        <p className="truncate text-xs text-stone-500">{link.url}</p>
                      </div>
                      <button type="button" onClick={() => deleteLink(link._id)} disabled={busy} aria-label={`Delete ${link.title}`} className="shrink-0 rounded-lg px-3 py-2 text-xs text-stone-500 transition hover:bg-red-400/10 hover:text-red-200 disabled:opacity-50">Delete</button>
                    </div>
                  )) : <p className="py-2 text-sm text-stone-500">No links yet. Add your first one above.</p>}
                </div>
                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <p className="text-xs text-stone-500">Your public page</p>
                  <Link to={`/u/${encodeURIComponent(profile.username)}`} className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-lime-200 hover:text-lime-100">
                    branch.page/u/{profile.username}<span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </>
            )}
          </section>
        </section>

        <aside className="lg:pt-28">
          <div className="sticky top-8 rounded-[28px] border border-white/[0.08] bg-[#171715] p-5 shadow-2xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between px-1">
              <span className="text-xs font-medium text-stone-400">LIVE PREVIEW</span>
              <span className="flex items-center gap-1.5 text-[10px] text-stone-500"><span className="size-1.5 rounded-full bg-lime-300" /> YOUR PAGE</span>
            </div>
            <div className="flex min-h-[440px] flex-col items-center rounded-[22px] bg-[#0e0e0d] px-5 py-9 text-center">
              {profileForm.photo ? (
                <img src={profileForm.photo} alt="" className="size-20 rounded-full border border-white/10 object-cover" />
              ) : (
                <div className="grid size-20 place-items-center rounded-full border border-white/10 bg-[#20201d] text-2xl text-lime-200">{profileForm.name?.charAt(0)?.toUpperCase() || '✳'}</div>
              )}
              <h3 className="mt-4 text-lg font-semibold text-white">{profileForm.name || 'Your name'}</h3>
              <p className="mt-1 text-xs text-stone-500">@{profileForm.username || 'username'}</p>
              <p className="mt-3 max-w-[220px] text-xs leading-5 text-stone-400">{profileForm.bio || 'Your bio will show up here.'}</p>
              <div className="mt-7 w-full space-y-2">
                {(profile?.links || []).slice(0, 4).map((link) => (
                  <div key={link._id} className="rounded-xl border border-white/10 bg-[#191918] px-4 py-3 text-xs font-medium text-stone-200">{link.title}</div>
                ))}
                {!profile?.links?.length && <div className="rounded-xl border border-white/10 bg-[#191918] px-4 py-3 text-xs text-stone-500">Your links will appear here</div>}
              </div>
              <span className="mt-auto pt-8 text-[10px] font-semibold tracking-wide text-stone-600">MADE WITH BRANCH ↗</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

function PublicProfile() {
  const { username } = useParams()
  const [result, setResult] = useState({ username: '', profile: null, error: '' })

  useEffect(() => {
    let active = true
    request(`/profiles/${encodeURIComponent(username)}`)
      .then((profile) => { if (active) setResult({ username, profile, error: '' }) })
      .catch((requestError) => { if (active) setResult({ username, profile: null, error: requestError.message }) })
    return () => { active = false }
  }, [username])
  const isCurrentUsername = result.username === username
  const profile = isCurrentUsername ? result.profile : null
  const error = isCurrentUsername ? result.error : ''

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#10100f] px-5 py-12">
      <div className="pointer-events-none absolute -left-40 top-[-10rem] size-[28rem] rounded-full bg-lime-300/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-[-12rem] size-[30rem] rounded-full bg-emerald-500/[0.06] blur-[130px]" />
      <div className="relative w-full max-w-[440px] rounded-[30px] border border-white/[0.08] bg-[#171715]/90 px-6 py-9 text-center shadow-2xl shadow-black/30 sm:px-10 sm:py-11">
        <Brand />
        {error ? (
          <div className="py-16">
            <p className="text-4xl">✳</p>
            <h1 className="mt-5 text-xl font-semibold text-white">This page isn’t here yet.</h1>
            <p role="alert" className="mt-2 text-sm text-stone-400">{error}</p>
            <Link to="/dashboard" className="mt-6 inline-block text-sm text-lime-200 hover:text-lime-100">Create a profile ↗</Link>
          </div>
        ) : !profile ? (
          <div className="py-24 text-sm text-stone-500">Loading profile...</div>
        ) : (
          <>
            <div className="mt-9 flex justify-center">
              {profile.photo
                ? <img src={profile.photo} alt={`${profile.name}'s profile`} className="size-24 rounded-full border border-white/10 object-cover" />
                : <div className="grid size-24 place-items-center rounded-full border border-white/10 bg-[#22221f] text-3xl text-lime-200">{profile.name?.charAt(0)?.toUpperCase() || '✳'}</div>}
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">{profile.name}</h1>
            <p className="mt-1 text-sm text-stone-500">@{profile.username}</p>
            {profile.bio && <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-stone-300">{profile.bio}</p>}
            {profile.socials?.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {profile.socials.map((social, index) => (
                  <a key={`${social}-${index}`} href={social} target="_blank" rel="noreferrer" aria-label={`Social profile ${index + 1}`} className="grid size-9 place-items-center rounded-full border border-white/10 text-xs text-stone-300 transition hover:border-lime-300/50 hover:text-lime-200">↗</a>
                ))}
              </div>
            )}
            <div className="mt-8 space-y-3">
              {profile.links?.map((link) => (
                <a key={link._id} href={link.url} target="_blank" rel="noreferrer" className="group flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-[#20201d] px-5 py-3 text-sm font-medium text-stone-100 transition hover:-translate-y-0.5 hover:border-lime-300/50 hover:bg-[#252720]">
                  <span>{link.title}</span><span className="ml-2 text-lime-300 opacity-0 transition group-hover:opacity-100">↗</span>
                </a>
              ))}
              {!profile.links?.length && <p className="rounded-2xl border border-dashed border-white/10 px-4 py-7 text-sm text-stone-500">Links coming soon.</p>}
            </div>
            <Link to="/dashboard" className="mt-9 inline-block text-[10px] font-semibold tracking-[0.18em] text-stone-600 transition hover:text-stone-300">MAKE YOUR OWN PAGE ↗</Link>
          </>
        )}
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
