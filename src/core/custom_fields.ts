/**
 * Order custom fields — contract v2 (feeef.all `docs/custom-fields.md`).
 *
 * Client mirror of the backend module `app/helpers/custom_fields/index.ts`
 * (keep both in sync). Storefronts use [visibleCustomFieldIds] to decide what
 * to render and [validateCustomFieldValues] for instant feedback; the server
 * re-validates everything.
 */

export const CUSTOM_FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'phone',
  'email',
  'select',
  'checkbox',
  'image',
  'file',
  'date',
  'time',
  'datetime',
  'timerange',
  'daterange',
  'datetimerange',
] as const
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number]

export const FILE_KINDS = ['image', 'pdf', 'document', 'spreadsheet', 'archive', 'text'] as const
export type FileKind = (typeof FILE_KINDS)[number]

export const FIELD_OPERATORS = [
  'equals',
  'notEquals',
  'in',
  'notIn',
  'filled',
  'empty',
  'gt',
  'lt',
  'checked',
  'unchecked',
] as const
export const PRODUCT_OPERATORS = ['in', 'notIn'] as const

export const LIMITS = {
  fields: 40,
  id: 64,
  label: 80,
  placeholder: 120,
  helpText: 300,
  regex: 200,
  text: 2000,
  defaultTextMax: 200,
  defaultTextareaMax: 1000,
  count: 20,
  defaultMaxCount: 10,
  options: 50,
  optionValue: 64,
  optionLabel: 80,
  conditions: 10,
  conditionValues: 50,
  url: 1000,
  valuesBytes: 64 * 1024,
} as const

export const FIELD_ID_RE = /^[A-Za-z0-9_-]{1,64}$/

export type CustomFieldCondition =
  | {
      source: 'field'
      fieldId: string
      operator: (typeof FIELD_OPERATORS)[number]
      value?: string | number | boolean | null
      values?: string[] | null
    }
  | { source: 'product'; operator: (typeof PRODUCT_OPERATORS)[number]; values: string[] }

export type CustomFieldVisibility = { match: 'all' | 'any'; conditions: CustomFieldCondition[] }

export type CustomField = {
  id: string
  label: string
  type: CustomFieldType
  required?: boolean
  multiple?: boolean
  minCount?: number | null
  maxCount?: number | null
  placeholder?: string | null
  helpText?: string | null
  minLength?: number | null
  maxLength?: number | null
  regexPattern?: string | null
  min?: number | null
  max?: number | null
  integer?: boolean
  options?: { value: string; label: string }[] | null
  accept?: FileKind[] | null
  visibility?: CustomFieldVisibility | null
  defaultValue?: unknown
  order?: number
  active?: boolean
  metadata?: Record<string, unknown>
}

const RANGE_TYPES = new Set<CustomFieldType>(['timerange', 'daterange', 'datetimerange'])

// ───────────────────────────────────────────────────────────── regex safety

/**
 * Conservative ReDoS guard (no RE2 available). Rejects:
 * nested quantifiers `(…+)+`, quantified alternation groups `(a|aa)+`,
 * backreferences, lookbehind, and over-long patterns.
 */
export function isSafeRegex(pattern: string): boolean {
  if (typeof pattern !== 'string' || pattern.length === 0 || pattern.length > LIMITS.regex)
    return false
  try {
    new RegExp(pattern)
  } catch {
    return false
  }
  if (/\\[1-9]|\\k<|\(\?<[=!]/.test(pattern)) return false
  // Strip escapes and character classes so their content can't fool the scan.
  const s = pattern.replace(/\\./g, 'x').replace(/\[[^\]]*\]/g, 'x')
  const stack: { quantified: boolean; alternation: boolean }[] = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '(') stack.push({ quantified: false, alternation: false })
    else if (c === '|' && stack.length) stack[stack.length - 1].alternation = true
    else if (c === ')') {
      const group = stack.pop()
      const next = s[i + 1]
      const quantifiedGroup = next === '*' || next === '+' || next === '{'
      if (group && quantifiedGroup && (group.quantified || group.alternation)) return false
      if (quantifiedGroup && stack.length) stack[stack.length - 1].quantified = true
      if (group?.quantified && stack.length) stack[stack.length - 1].quantified = true
    } else if ((c === '*' || c === '+' || c === '{') && stack.length) {
      stack[stack.length - 1].quantified = true
    }
  }
  return true
}

/** Runs a merchant regex against capped input; unsafe patterns are skipped. */
export function safeRegexTest(pattern: string, value: string, maxInput: number = LIMITS.text): boolean {
  if (!isSafeRegex(pattern)) return true
  return new RegExp(pattern).test(value.slice(0, maxInput))
}

// ───────────────────────────────────────────────────── definition checking

/**
 * Semantic checks Vine can't express. Returns the first problem as
 * `{ path, message }`, or null when the list is valid.
 */
export function checkCustomFieldDefinitions(
  fields: CustomField[]
): { path: string; message: string } | null {
  if (fields.length > LIMITS.fields)
    return { path: 'fields', message: `At most ${LIMITS.fields} custom fields` }
  const sorted = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const seen = new Set<string>()
  for (const f of sorted) {
    const p = `fields.${f.id}`
    if (!FIELD_ID_RE.test(f.id)) return { path: p, message: 'Invalid field id' }
    if (seen.has(f.id)) return { path: p, message: 'Duplicate field id' }
    if (f.regexPattern && !isSafeRegex(f.regexPattern))
      return { path: `${p}.regexPattern`, message: 'Unsafe or invalid validation pattern' }
    if (f.regexPattern && f.type !== 'text' && f.type !== 'phone')
      return { path: `${p}.regexPattern`, message: 'Patterns are only for text and phone' }
    if (f.type === 'checkbox' && f.multiple)
      return { path: `${p}.multiple`, message: 'A checkbox cannot be multiple' }
    if (f.minCount != null && f.maxCount != null && f.minCount > f.maxCount)
      return { path: `${p}.minCount`, message: 'minCount must be ≤ maxCount' }
    if (f.minLength != null && f.maxLength != null && f.minLength > f.maxLength)
      return { path: `${p}.minLength`, message: 'minLength must be ≤ maxLength' }
    if (f.min != null && f.max != null && f.min > f.max)
      return { path: `${p}.min`, message: 'min must be ≤ max' }
    if (f.type === 'select') {
      const opts = f.options ?? []
      if (opts.length === 0) return { path: `${p}.options`, message: 'Add at least one option' }
      if (new Set(opts.map((o) => o.value)).size !== opts.length)
        return { path: `${p}.options`, message: 'Option values must be unique' }
    }
    for (const c of f.visibility?.conditions ?? []) {
      if (c.source === 'field') {
        if (!seen.has(c.fieldId))
          return {
            path: `${p}.visibility`,
            message: 'A rule can only depend on a field placed before it',
          }
      }
    }
    seen.add(f.id)
  }
  return null
}

// ───────────────────────────────────────────────────────────── visibility

export const isFilled = (v: unknown) =>
  v !== null &&
  v !== undefined &&
  v !== false &&
  !(typeof v === 'string' && v.trim() === '') &&
  !(Array.isArray(v) && v.length === 0)

function matchFieldCondition(c: Extract<CustomFieldCondition, { source: 'field' }>, v: unknown) {
  const list = Array.isArray(v) ? v : isFilled(v) ? [v] : []
  const strs = list.map((x) => String(x))
  switch (c.operator) {
    case 'filled':
      return isFilled(v)
    case 'empty':
      return !isFilled(v)
    case 'checked':
      return v === true
    case 'unchecked':
      return v !== true
    case 'equals':
      return strs.includes(String(c.value ?? ''))
    case 'notEquals':
      return !strs.includes(String(c.value ?? ''))
    case 'in':
      return strs.some((s) => (c.values ?? []).includes(s))
    case 'notIn':
      return !strs.some((s) => (c.values ?? []).includes(s))
    case 'gt':
    case 'lt': {
      const n = Number(Array.isArray(v) ? v[0] : v)
      const ref = Number(c.value)
      if (!isFilled(v) || Number.isNaN(n) || Number.isNaN(ref)) return false
      return c.operator === 'gt' ? n > ref : n < ref
    }
  }
  return false
}

/**
 * Ids of fields visible for [values] + [productIds] (§3 of the contract).
 */
export function visibleCustomFieldIds(
  fields: CustomField[],
  values: Record<string, unknown>,
  productIds: string[]
): Set<string> {
  const visible = new Set<string>()
  const sorted = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const f of sorted) {
    if (f.active === false) continue
    const conditions = f.visibility?.conditions ?? []
    if (conditions.length === 0) {
      visible.add(f.id)
      continue
    }
    const results = conditions.map((c) =>
      c.source === 'product'
        ? c.operator === 'in'
          ? productIds.some((id) => c.values.includes(id))
          : !productIds.some((id) => c.values.includes(id))
        : matchFieldCondition(c, visible.has(c.fieldId) ? values[c.fieldId] : undefined)
    )
    if (f.visibility?.match === 'any' ? results.some(Boolean) : results.every(Boolean))
      visible.add(f.id)
  }
  return visible
}

// ───────────────────────────────────────────────────────────── values

export type ValueCheckOptions = {
  /** Public checkout: image/file URLs must point at our CDN upload prefix. */
  uploadPrefix?: string | null
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})?$/
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/
const PHONE_RE = /^\+?[0-9][0-9\s().-]{5,24}$/

function checkScalar(
  f: CustomField,
  v: unknown,
  opts: ValueCheckOptions,
  base: CustomFieldType = f.type
): string | null {
  switch (base) {
    case 'text':
    case 'textarea':
    case 'phone':
    case 'email': {
      if (typeof v !== 'string') return 'must be text'
      const max: number = Math.min(
        f.maxLength ?? (base === 'textarea' ? LIMITS.defaultTextareaMax : LIMITS.defaultTextMax),
        LIMITS.text
      )
      const len = Array.from(v).length
      if (len > max) return `must be at most ${max} characters`
      if (f.minLength != null && len < f.minLength)
        return `must be at least ${f.minLength} characters`
      if (base === 'email' && !EMAIL_RE.test(v)) return 'must be a valid email address'
      if (base === 'phone' && !f.regexPattern && !PHONE_RE.test(v))
        return 'must be a valid phone number'
      if (f.regexPattern && !safeRegexTest(f.regexPattern, v, max)) return 'format is invalid'
      return null
    }
    case 'number': {
      const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
      if (typeof n !== 'number' || !Number.isFinite(n)) return 'must be a number'
      if (f.integer && !Number.isInteger(n)) return 'must be a whole number'
      if (f.min != null && n < f.min) return `must be at least ${f.min}`
      if (f.max != null && n > f.max) return `must be at most ${f.max}`
      return null
    }
    case 'select':
      if (typeof v !== 'string' || !(f.options ?? []).some((o) => o.value === v))
        return 'must be one of the listed options'
      return null
    case 'checkbox':
      return typeof v === 'boolean' ? null : 'must be true or false'
    case 'image':
    case 'file': {
      if (typeof v !== 'string' || v.length > LIMITS.url || !/^https:\/\//i.test(v))
        return 'must be an uploaded file'
      if (opts.uploadPrefix && !v.startsWith(opts.uploadPrefix)) return 'must be an uploaded file'
      return null
    }
    case 'date':
      return typeof v === 'string' && (DATE_RE.test(v) || ISO_RE.test(v)) && !Number.isNaN(Date.parse(v))
        ? null
        : 'must be a valid date'
    case 'time':
      return typeof v === 'string' && (TIME_RE.test(v) || ISO_RE.test(v)) ? null : 'must be a valid time'
    case 'datetime':
      return typeof v === 'string' && ISO_RE.test(v) && !Number.isNaN(Date.parse(v))
        ? null
        : 'must be a valid date and time'
    default:
      return 'has an unsupported type'
  }
}

function checkOne(f: CustomField, v: unknown, opts: ValueCheckOptions): string | null {
  if (!RANGE_TYPES.has(f.type)) return checkScalar(f, v, opts)
  const base: CustomFieldType =
    f.type === 'timerange' ? 'time' : f.type === 'daterange' ? 'date' : 'datetime'
  let start: unknown, end: unknown
  if (Array.isArray(v) && v.length === 2) [start, end] = v
  else if (v && typeof v === 'object' && !Array.isArray(v)) {
    start = (v as any).start
    end = (v as any).end
  } else if (typeof v === 'string') {
    // Legacy free-text range.
    return v.length <= LIMITS.defaultTextMax ? null : 'is too long'
  } else return 'must be a start and end'
  return checkScalar(f, start, opts, base) ?? checkScalar(f, end, opts, base)
}

export type CustomFieldIssue = { fieldId: string; message: string }

/**
 * Validates [values] against [fields]. Returns the cleaned object (hidden /
 * inactive keys dropped, strings trimmed) plus issues keyed by field id.
 */
export function validateCustomFieldValues(
  fields: CustomField[],
  values: Record<string, unknown>,
  productIds: string[],
  opts: ValueCheckOptions = {}
): { cleaned: Record<string, unknown>; issues: CustomFieldIssue[] } {
  const issues: CustomFieldIssue[] = []
  const byId = new Map(fields.map((f) => [f.id, f]))
  const trimmed: Record<string, unknown> = {}
  for (const [key, raw] of Object.entries(values)) {
    if (!byId.has(key)) {
      issues.push({ fieldId: key, message: 'is not a field of this store' })
      continue
    }
    trimmed[key] = typeof raw === 'string' ? raw.trim() : raw
  }
  const visible = visibleCustomFieldIds(fields, trimmed, productIds)
  const cleaned: Record<string, unknown> = {}
  for (const f of fields) {
    if (!visible.has(f.id)) continue
    const v = trimmed[f.id]
    if (!isFilled(v)) {
      if (f.required) issues.push({ fieldId: f.id, message: 'is required' })
      continue
    }
    if (f.multiple && f.type !== 'checkbox') {
      if (!Array.isArray(v)) {
        issues.push({ fieldId: f.id, message: 'must be a list' })
        continue
      }
      const items = v.filter(isFilled)
      const max = Math.min(f.maxCount ?? LIMITS.defaultMaxCount, LIMITS.count)
      if (items.length > max) issues.push({ fieldId: f.id, message: `allows at most ${max} values` })
      else if (f.minCount != null && items.length < f.minCount)
        issues.push({ fieldId: f.id, message: `needs at least ${f.minCount} values` })
      else {
        const bad = items.map((x) => checkOne(f, x, opts)).find(Boolean)
        if (bad) issues.push({ fieldId: f.id, message: bad })
        else cleaned[f.id] = items
      }
      continue
    }
    if (Array.isArray(v) && !RANGE_TYPES.has(f.type)) {
      issues.push({ fieldId: f.id, message: 'must be a single value' })
      continue
    }
    if (f.type === 'checkbox' && f.required && v !== true) {
      issues.push({ fieldId: f.id, message: 'must be checked' })
      continue
    }
    const bad = checkOne(f, v, opts)
    if (bad) issues.push({ fieldId: f.id, message: bad })
    else cleaned[f.id] = f.type === 'number' ? Number(v) : v
  }
  return { cleaned, issues }
}

/**
 * Fields to render for an order form, in display order, given the current
 * values and the product ids in the cart.
 */
export function visibleCustomFields(
  fields: CustomField[] | null | undefined,
  values: Record<string, unknown>,
  productIds: string[]
): CustomField[] {
  const list = fields ?? []
  const visible = visibleCustomFieldIds(list, values, productIds)
  return [...list]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((f) => visible.has(f.id))
}

/** Accepted `<input accept>` value for an image/file field. */
export function customFieldAcceptAttribute(field: CustomField): string {
  if (field.type === 'image') return 'image/jpeg,image/png,image/webp,image/gif'
  const kinds = field.accept?.length ? field.accept : [...FILE_KINDS]
  const map: Record<FileKind, string> = {
    image: 'image/jpeg,image/png,image/webp,image/gif',
    pdf: 'application/pdf,.pdf',
    document: '.doc,.docx',
    spreadsheet: '.xls,.xlsx',
    archive: '.zip,.rar',
    text: '.txt,text/plain',
  }
  return kinds.map((k) => map[k]).join(',')
}

/** Spreadsheet-safe cell (formula-injection guard). */
export function csvSafeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}
