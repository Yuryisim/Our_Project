'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { TagParser } = require('./tagParser');

const DOCS_DIR = path.resolve(__dirname, 'docs');
const NAME_RE = /^[a-zA-Z0-9_-]+$/;
const parser = new TagParser({ maxLength: 50 });


function blankCode(text) {
  return text.replace(/```[\s\S]*?```|`[^`\n]*`/g, (m) => m.replace(/[^\n]/g, ' '));
}

async function readDocTags(name) {
  const markdown = await fs.readFile(path.join(DOCS_DIR, `${name}.md`), 'utf8');
  return parser.parse(blankCode(markdown), true);
}

async function listDocNames() {
  const files = await fs.readdir(DOCS_DIR);
  return files.filter((f) => f.endsWith('.md')).map((f) => path.basename(f, '.md'));
}

async function buildIndex() {
  const index = new Map();
  for (const name of await listDocNames()) {
    for (const { tag } of await readDocTags(name)) {
      if (!index.has(tag)) index.set(tag, []);
      index.get(tag).push(name);
    }
  }
  return index;
}

function mountTags(app) {
  app.get('/api/tags', async (req, res) => {
    try {
      const index = await buildIndex();
      const tags = [...index.entries()]
        .map(([tag, docs]) => ({ tag, count: docs.length, documents: docs }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
      res.json({ tags });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Cannot read tags' });
    }
  });

  app.get('/api/tags/:tag', async (req, res) => {
    try {
      const tag = req.params.tag.toLowerCase();
      const index = await buildIndex();
      res.json({ tag, documents: index.get(tag) || [] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Cannot read tags' });
    }
  });

  app.get('/api/docs/:name/tags', async (req, res) => {
    const { name } = req.params;
    if (!NAME_RE.test(name)) {
      return res.status(400).json({ error: 'Incorrect document name' });
    }
    try {
      const tags = await readDocTags(name);
      res.json({ name, tags });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Document not found' });
      }
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
}

module.exports = { mountTags };