import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudio } from '../state/studio'
import { CATEGORIES } from '../engine/categories'
import { PosterThumb } from '../components/PosterCanvas'
import { NewPosterModal } from '../components/NewPosterModal'
import { CloudSync } from '../components/CloudSync'
import { cx, EmptyState, Modal } from '../components/ui'
import { IconCopy, IconGrid, IconPlus, IconTrash } from '../components/icons'
import type { CategoryId } from '../engine/types'

export default function ProjectsPage() {
  const { projects, deleteProject, duplicateProject } = useStudio()
  const navigate = useNavigate()
  const [newPoster, setNewPoster] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const list = projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.design.content.headline.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || p.design.categoryId === category
      return matchesQuery && matchesCategory
    })
    return sort === 'recent'
      ? [...list].sort((a, b) => b.updatedAt - a.updatedAt)
      : [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [projects, query, category, sort])

  const pendingRecord = projects.find((p) => p.id === pendingDelete)

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 pb-20 pt-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.24em] text-[#d9ae6b]/70">Project library</p>
          <h1 className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] text-white">Your posters</h1>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-white/40">
            {projects.length === 0
              ? 'Saved designs appear here. Everything is stored in this browser — export to keep a permanent copy.'
              : `${projects.length} saved design${projects.length === 1 ? '' : 's'} in local storage.`}
          </p>
        </div>
        <button type="button" className="btn-primary h-10" onClick={() => setNewPoster(true)}>
          <IconPlus size={16} /> New poster
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          className="input h-9 w-full max-w-xs text-[12.5px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or headline"
          aria-label="Search projects"
        />
        <select className="input h-9 w-auto max-w-[190px] py-0 text-[12.5px]" value={category} onChange={(e) => setCategory(e.target.value as CategoryId | 'all')} aria-label="Filter by category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input h-9 w-auto py-0 text-[12.5px]" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name')} aria-label="Sort projects">
          <option value="recent">Newest first</option>
          <option value="name">Name A–Z</option>
        </select>
        {filtered.length !== projects.length ? (
          <span className="chip">{filtered.length} shown</span>
        ) : null}
      </div>

      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<IconGrid size={30} />}
            title={projects.length === 0 ? 'No projects yet' : 'No projects match those filters'}
            description={
              projects.length === 0
                ? 'Create your first poster — the studio will pick a composition that suits your category, then you can edit every layer.'
                : 'Clear the search or choose a different category to see the rest of your library.'
            }
            action={
              <button type="button" className="btn-primary" onClick={() => (projects.length === 0 ? setNewPoster(true) : (setQuery(''), setCategory('all')))}>
                {projects.length === 0 ? 'Create a poster' : 'Clear filters'}
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition hover:border-white/25"
              >
                <button type="button" className="block w-full text-left" onClick={() => navigate(`/studio/${project.id}`)}>
                  <PosterThumb design={project.design} width={300} className="aspect-[4/5] w-full" />
                </button>
                <div className="px-2.5 py-2">
                  <button
                    type="button"
                    className="block w-full truncate text-left text-[12px] font-medium text-white/85 hover:text-white"
                    onClick={() => navigate(`/studio/${project.id}`)}
                  >
                    {project.name}
                  </button>
                  <p className="truncate text-[10px] text-white/30">
                    {project.design.compositionId} · {project.design.width}×{project.design.height}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-white/25">
                      {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-0.5 opacity-60 transition group-hover:opacity-100">
                      <button
                        type="button"
                        className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
                        onClick={() => duplicateProject(project.id)}
                        aria-label={`Duplicate ${project.name}`}
                      >
                        <IconCopy size={13} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-white/50 hover:bg-red-500/15 hover:text-red-200"
                        onClick={() => setPendingDelete(project.id)}
                        aria-label={`Delete ${project.name}`}
                      >
                        <IconTrash size={13} />
                      </button>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <CloudSync />
        <div className="panel p-4">
          <h2 className="text-[13px] font-medium text-white/80">Where projects live</h2>
          <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-white/40">
            <li>• Browser storage (IndexedDB-free, localStorage JSON) is the default and needs no account.</li>
            <li>• Clearing site data removes local projects; export a PNG or JPEG to keep a permanent copy.</li>
            <li>• Logos and uploaded artwork are embedded in the project record, so a saved poster reopens exactly as exported.</li>
            <li>• Cloud sync is optional, scoped to your own account, and never required for the editor.</li>
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-white/90">Sample posters</h2>
            <p className="mt-1 text-[12px] text-white/35">
              The generated test gallery — 30 posters across every category and all four aspect classes, rendered by the same engine.
            </p>
          </div>
          <Link to="/docs#samples" className="text-[11.5px] text-[#d9ae6b]/80 hover:text-[#d9ae6b]">
            How samples are generated →
          </Link>
        </div>
        <SampleGallery />
      </section>

      <NewPosterModal open={newPoster} onClose={() => setNewPoster(false)} />

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete project"
        description={`“${pendingRecord?.name ?? ''}” will be removed from this browser. This cannot be undone.`}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setPendingDelete(null)}>
              Keep it
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                if (pendingDelete) deleteProject(pendingDelete)
                setPendingDelete(null)
              }}
            >
              Delete project
            </button>
          </div>
        }
      >
        <p className="text-[12px] leading-relaxed text-white/45">
          Export the poster first if you need a copy. Local projects are not backed up anywhere.
        </p>
      </Modal>
    </div>
  )
}

interface SampleEntry {
  file: string
  title: string
  category: string
  composition: string
  width: number
  height: number
}

function SampleGallery() {
  const [samples, setSamples] = useState<SampleEntry[] | null>(null)
  const [lightbox, setLightbox] = useState<SampleEntry | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}samples/manifest.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { posters?: SampleEntry[] } | null) => {
        if (!cancelled) setSamples(data?.posters ?? [])
      })
      .catch(() => {
        if (!cancelled) setSamples([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (samples === null) {
    return <div className="mt-3 h-28 rounded-2xl skeleton" />
  }

  if (samples.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-white/[0.12] px-4 py-6 text-[12px] leading-relaxed text-white/35">
        No sample manifest found. Run <code className="rounded bg-black/40 px-1 py-0.5 text-white/60">npm run samples</code> to
        generate 30 posters into <code className="rounded bg-black/40 px-1 py-0.5 text-white/60">public/samples</code>; they will
        appear here automatically.
      </div>
    )
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
        {samples.map((sample) => (
          <button
            key={sample.file}
            type="button"
            className={cx(
              'group overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] transition hover:border-white/30',
              sample.height > sample.width * 1.6 ? 'row-span-2' : '',
            )}
            onClick={() => setLightbox(sample)}
            title={`${sample.title} · ${sample.composition}`}
          >
            <img
              src={`${import.meta.env.BASE_URL}samples/${sample.file}`}
              alt={`${sample.title} — ${sample.composition}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Modal open={Boolean(lightbox)} onClose={() => setLightbox(null)} title={lightbox?.title ?? 'Sample'} description={lightbox ? `${lightbox.category} · ${lightbox.composition} · ${lightbox.width}×${lightbox.height}` : undefined} wide>
        {lightbox ? (
          <img src={`${import.meta.env.BASE_URL}samples/${lightbox.file}`} alt={lightbox.title} className="mx-auto max-h-[70dvh] w-auto rounded-lg" />
        ) : null}
      </Modal>
    </>
  )
}
