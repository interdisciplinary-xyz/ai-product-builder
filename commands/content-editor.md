---
description: Edit CMS content (pages, blog posts, sections) via the CMS admin or its programmatic API
allowed-tools: Bash, Read, Grep, Glob
---

# Content Editor

> **🔧 Reuse & local setup**
>
> Canonical copy — lives in `AI/` (source of truth). To use in a repo, copy to `.claude/commands/content-editor.md` and localize the items below.
>
> **Reusability:** template-ready — abstracted into a reusable template; fill the «placeholders».
>
> **Local definitions to provide per repo** (fill the placeholders in this doc, or define once in the repo's `.claude/CLAUDE.md`):
> - Product/app name — `«PROJECT»`.
> - CMS + database — `«DB_CMS»` (e.g. a headless CMS + database).
> - Admin panel URL + dev port — `http://localhost:«PORT»/admin`.
> - Locales — `«LOCALES»`, split into `«DEFAULT_LOCALE»` (e.g. en) + `«OTHER_LOCALE»` (e.g. pl).
> - Env var names — `«DB_URI»`, `«CMS_SECRET»`.
> - CMS config + collection/query/component paths — `«CMS_CONFIG»`, `«COLLECTIONS_PATH»`, `«QUERIES_PATH»`, `«BLOCKS_PATH»`, `«RENDERER_PATH»`.
> - Collection names + fields + section block types — `«COLLECTION»` (e.g. pages/blogs/media), `«SECTION_BLOCKS»` (e.g. Hero, About, Contact, FAQ…).
> - Query functions + cache tags — `«CMS_QUERY_FN»`, `«CACHE_TAG»`.
> - Seed script path + command + seeded slug — `«SEED_SCRIPT_PATH»` (e.g. scripts/seed.ts), `«PKG_MGR» seed`, `«SEED_CHECK»`.

You are a content editor for the «PROJECT» CMS («DB_CMS»). Your job is to read, create, update, or delete content through the CMS admin panel or the CMS programmatic API.

## Admin Panel

The CMS admin panel is accessible at `http://localhost:«PORT»/admin` during development. It provides a full GUI for managing all collections and their content, including localized fields.

## CMS Configuration

The CMS is configured at `«CMS_CONFIG»`. It uses:

- **Database**: «DB_CMS»
- **Rich Text**: a rich-text editor (e.g. Lexical)
- **Localization**: «LOCALES» (a default locale + others)

### Environment Variables

- `«DB_URI»` — database connection string
- `«CMS_SECRET»` — secret key for CMS auth/encryption

## Collections

Collections are defined at `«COLLECTIONS_PATH»`. Each `«COLLECTION»` below is an example shape — adapt the names and fields to your CMS.

### Pages (e.g. `«COLLECTION»` for pages)

CMS-driven pages with composable section blocks.

**Fields (example):** `title` (localized), `slug` (unique), `mainImage` (upload → media), `publishedAt`, `sections` (blocks)

**Section block types:** `«SECTION_BLOCKS»` (e.g. Hero, About, Contact, FAQ, How It Works, Partners, Plans, Team)

Each block type has localized text fields and a `sectionId` for anchor linking. Block definitions live in `«BLOCKS_PATH»`.

### Blogs (e.g. `«COLLECTION»` for blog posts)

Blog posts with localized rich text content.

**Fields (example):** `title` (localized), `slug` (unique), `mainImage` (upload → media), `publishedAt`, `body` (localized richText)

### Media (e.g. `«COLLECTION»` for uploads)

Upload collection for images and files.

**Fields (example):** `alt` (text for accessibility)

## Querying Content

### Server-Side Queries (Recommended)

CMS queries live at `«QUERIES_PATH»` and use the framework's caching primitives. Name each `«CMS_QUERY_FN»` after what it fetches and tag its cache with a `«CACHE_TAG»` so it can be revalidated per content type:

```typescript
// Fetch a page by slug + locale (cached, tag: «CACHE_TAG», e.g. 'homepage')
«CMS_QUERY_FN»(slug: string, locale: string)

// Fetch a list for locale (cached, tag: «CACHE_TAG», e.g. 'blog')
«CMS_QUERY_FN»(locale: string)

// Fetch a single item by slug + locale (cached, tag: «CACHE_TAG», e.g. 'blog')
«CMS_QUERY_FN»(slug: string, locale: string)
```

### Programmatic API

For scripts and API routes, use the CMS programmatic API directly. The exact import + client differ per CMS; the shape is:

```typescript
// Find documents
const result = await cms.find({
  collection: '«COLLECTION»',
  locale: '«DEFAULT_LOCALE»',
  where: { slug: { equals: '«SEED_CHECK»' } },
});

// Create document
await cms.create({
  collection: '«COLLECTION»',
  locale: '«DEFAULT_LOCALE»',
  data: { title: 'New Page', slug: 'new-page', sections: [...] },
});

// Update document
await cms.update({
  collection: '«COLLECTION»',
  id: doc.id,
  locale: '«OTHER_LOCALE»',
  data: { title: 'Updated Title' },
});

// Delete document
await cms.delete({ collection: '«COLLECTION»', id: doc.id });
```

### Seeding Content

A seed script exists at `«SEED_SCRIPT_PATH»` (e.g. `scripts/seed.ts`). Run it with:

```bash
«PKG_MGR» seed
```

This populates the database with homepage content in all «LOCALES», plus a sample blog post.

## Content Rendering

### Block renderer

The block-renderer component at `«RENDERER_PATH»` (your block-renderer) maps CMS block types to UI components. Typically it reads the block type to select a component from a map, strips CMS internal fields before passing props, and maps an anchor id onto the rendered element for in-page navigation.

### Blog Rich Text

Blog posts use the rich-text editor. Rich text is rendered with the CMS's rich-text renderer component.

### Images

CMS media has direct URLs — use `image.url` (no URL builder needed if your CMS serves direct asset URLs).

## Instructions

When the user asks you to edit content: $ARGUMENTS

1. **Identify the content** — query the CMS to find the relevant document
2. **Read before writing** — always fetch current content before making changes
3. **Mind the locale** — the CMS stores localized fields per-locale; specify `locale` in queries
4. **Show the user what you plan to change** — diff the old vs new content
5. **Recommend using the admin panel** — for complex edits, direct the user to `/admin`
6. **For programmatic mutations** — use the CMS programmatic API via a script
7. **Keep it safe** — never delete content without explicit user confirmation

If no specific task is provided, list all available collections and their current document counts.
