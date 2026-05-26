import type { CollectionEntry } from 'astro:content'
import { projectSlugFromId } from '@/lib/utils'

export type ProjectEntry = CollectionEntry<'projects'>
export type ProjectIndexEntry = ProjectEntry & {
  data: ProjectEntry['data'] & {
    name: string
    description: string
    status: 'active' | 'wip' | 'archived'
  }
}
export type ProjectSubpageEntry = ProjectEntry & {
  data: ProjectEntry['data'] & { title: string }
}

/** Last path segment of a content id (e.g. `emote-showcase/terms` -> `terms`). */
export function pageSlugFromId(id: string) {
  const segment = id.split('/').pop()
  return segment && segment.length > 0 ? segment : id
}

export function isProjectIndexEntry(
  entry: ProjectEntry,
): entry is ProjectIndexEntry {
  return (
    Boolean(entry.data.name?.trim()) &&
    Boolean(entry.data.description?.trim()) &&
    Boolean(entry.data.status)
  )
}

export function isProjectSubpageEntry(
  entry: ProjectEntry,
): entry is ProjectSubpageEntry {
  return (
    Boolean(entry.data.title?.trim()) && !entry.data.name?.trim()
  )
}

export function getSubpagesForProject(
  entries: ProjectEntry[],
  projectSlug: string,
): ProjectSubpageEntry[] {
  const subpages: ProjectSubpageEntry[] = []
  for (const entry of entries) {
    if (
      isProjectSubpageEntry(entry) &&
      projectSlugFromId(entry.id) === projectSlug
    ) {
      subpages.push(entry)
    }
  }
  return subpages.sort((a, b) => {
    const orderDiff = a.data.order - b.data.order
    if (orderDiff !== 0) return orderDiff
    return a.data.title.localeCompare(b.data.title)
  })
}
