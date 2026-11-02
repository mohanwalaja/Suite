import { getCategory } from '../../engine/categories'
import { useStudio } from '../../state/studio'
import { TextField } from '../ui'
import { PanelHint, PanelSection } from './common'
import { IconPlus, IconRotate, IconTrash } from '../icons'

export function ContentPanel() {
  const { design, updateContent, toast } = useStudio()
  if (!design) return null
  const c = design.content
  const category = getCategory(design.categoryId)

  const setPoint = (index: number, value: string) => {
    const points = [...c.points]
    points[index] = value
    updateContent({ points })
  }

  const addPoint = () => {
    if (c.points.length >= 5) {
      toast('Five supporting points is the useful maximum for a poster.', 'info')
      return
    }
    updateContent({ points: [...c.points, 'New supporting point'] })
  }

  const removePoint = (index: number) => updateContent({ points: c.points.filter((_, i) => i !== index) })

  return (
    <div className="space-y-6">
      <PanelHint>
        Write in English. Copy is measured against the real layout, so long lines are flagged before export — the
        poster never silently truncates a sentence.
      </PanelHint>

      <PanelSection title="Message">
        <TextField
          label="Eyebrow"
          value={c.eyebrow}
          maxLength={52}
          onChange={(value) => updateContent({ eyebrow: value })}
          placeholder="ASTROSIVAM · VEDIC ASTROLOGY"
        />
        <TextField
          label="Headline"
          value={c.headline}
          maxLength={96}
          multiline
          rows={3}
          onChange={(value) => updateContent({ headline: value })}
          placeholder="Your Birth Chart, Read With Care"
          hint="Keep it under ~55 characters for the biggest display sizes."
        />
        <TextField
          label="Subheadline"
          value={c.subheadline}
          maxLength={80}
          onChange={(value) => updateContent({ subheadline: value })}
          placeholder="Jathagam · Rasi · Navamsa"
        />
        <TextField
          label="Body copy"
          value={c.body}
          maxLength={320}
          multiline
          rows={4}
          onChange={(value) => updateContent({ body: value })}
          hint="Two or three short sentences read best at feed size."
        />
      </PanelSection>

      <PanelSection
        title="Supporting points"
        description="Shown as a numbered list, chips or steps depending on the composition."
        action={<span className="chip">{c.points.length}/5</span>}
      >
        <div className="space-y-2">
          {c.points.map((point, index) => (
            <div key={index} className="flex items-start gap-1.5">
              <span className="mt-2 w-4 shrink-0 text-center text-[10px] tabular-nums text-white/30">{index + 1}</span>
              <input
                className="input-sm"
                value={point}
                maxLength={64}
                aria-label={`Supporting point ${index + 1}`}
                onChange={(e) => setPoint(index, e.target.value)}
              />
              <button
                type="button"
                className="btn-quiet mt-0.5 h-8 w-8 shrink-0 px-0"
                onClick={() => removePoint(index)}
                aria-label={`Remove point ${index + 1}`}
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn-ghost w-full text-[12px]" onClick={addPoint}>
          <IconPlus size={14} /> Add a point
        </button>
      </PanelSection>

      <PanelSection title="Call to action & contact">
        <TextField label="Button / CTA" value={c.cta} maxLength={32} onChange={(value) => updateContent({ cta: value })} placeholder="Book a reading" />
        <TextField label="Phone or WhatsApp" value={c.contact} maxLength={40} onChange={(value) => updateContent({ contact: value })} placeholder="+91 00000 00000" hint="Leave blank to omit from the poster." />
        <TextField label="Website" value={c.website} maxLength={48} onChange={(value) => updateContent({ website: value })} placeholder="astrosivam.com" />
        <TextField label="Footer line" value={c.footer} maxLength={80} onChange={(value) => updateContent({ footer: value })} placeholder="Consultations in English · In person or online" />
      </PanelSection>

      <button
        type="button"
        className="btn-ghost w-full text-[12px]"
        onClick={() => {
          updateContent({ ...category.defaultContent })
          toast(`Loaded the ${category.name} copy preset.`, 'info')
        }}
      >
        <IconRotate size={14} /> Load {category.name} copy preset
      </button>
    </div>
  )
}
