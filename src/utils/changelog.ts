export interface ChangelogVersion {
  version: string;
  date: string;
  categories: {
    title: string;
    items: string[];
  }[];
}

export function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = [];
  const lines = markdown.split('\n');

  let currentVersion: ChangelogVersion | null = null;
  let currentCategory: { title: string; items: string[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const versionMatch = line.match(/^##\s*\[([^\]]+)\]\s*-\s*(.+)$/);
    if (versionMatch) {
      if (currentVersion) {
        if (currentCategory) {
          currentVersion.categories.push(currentCategory);
          currentCategory = null;
        }
        versions.push(currentVersion);
      }
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        categories: []
      };
      continue;
    }

    if (!currentVersion) continue;

    const categoryMatch = line.match(/^###\s+(.+)$/);
    if (categoryMatch) {
      if (currentCategory) {
        currentVersion.categories.push(currentCategory);
      }
      currentCategory = { title: categoryMatch[1], items: [] };
      continue;
    }

    const itemMatch = line.match(/^[-*]\s+(.+)$/);
    if (itemMatch && currentCategory) {
      currentCategory.items.push(itemMatch[1]);
    }
  }

  if (currentVersion) {
    if (currentCategory) {
      currentVersion.categories.push(currentCategory);
    }
    versions.push(currentVersion);
  }

  return versions;
}
