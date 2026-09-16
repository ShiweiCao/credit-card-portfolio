export const APP_STORAGE_KEY = 'credit_card_tracker_portfolio_v1';
export const GITHUB_GIST_TOKEN_KEY = 'github_gist_token';
export const GITHUB_GIST_ID_KEY = 'github_gist_id';
export const BACKUP_FILENAME = 'credit_card_portfolio.json';

const GITHUB_GISTS_URL = 'https://api.github.com/gists';

export class GistSyncError extends Error {}

const githubHeaders = (token: string) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
});

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

function validateBackup(data: string) {
  try {
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      throw new Error('The backup does not contain a card portfolio.');
    }
    return parsed;
  } catch (error) {
    if (error instanceof GistSyncError) throw error;
    throw new GistSyncError(
      error instanceof Error && error.message === 'The backup does not contain a card portfolio.'
        ? error.message
        : 'The backup file is not valid portfolio JSON.'
    );
  }
}

export async function exportToGist(): Promise<{ gistId: string; created: boolean }> {
  const token = localStorage.getItem(GITHUB_GIST_TOKEN_KEY)?.trim();
  if (!token) throw new GistSyncError('Add a GitHub token before exporting.');

  const portfolio = localStorage.getItem(APP_STORAGE_KEY);
  if (!portfolio) throw new GistSyncError('There is no local portfolio data to export.');

  // Do not upload malformed data, even if it made its way into localStorage.
  validateBackup(portfolio);

  const existingGistId = localStorage.getItem(GITHUB_GIST_ID_KEY)?.trim();
  const files = { [BACKUP_FILENAME]: { content: portfolio } };
  const url = existingGistId ? `${GITHUB_GISTS_URL}/${encodeURIComponent(existingGistId)}` : GITHUB_GISTS_URL;

  let response: Response;
  try {
    response = await fetch(url, {
      method: existingGistId ? 'PATCH' : 'POST',
      headers: githubHeaders(token),
      body: JSON.stringify(
        existingGistId
          ? { description: 'CardPortfolio cloud backup', files }
          : { description: 'CardPortfolio cloud backup', public: false, files }
      ),
    });
  } catch {
    throw new GistSyncError('Could not reach GitHub. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new GistSyncError(`GitHub could not save the backup: ${await getErrorMessage(response)}`);
  }

  const gist = (await response.json()) as { id?: string };
  if (!gist.id) throw new GistSyncError('GitHub did not return a Gist ID for this backup.');

  localStorage.setItem(GITHUB_GIST_ID_KEY, gist.id);
  return { gistId: gist.id, created: !existingGistId };
}

export async function importFromGist(): Promise<unknown[]> {
  const token = localStorage.getItem(GITHUB_GIST_TOKEN_KEY)?.trim();
  if (!token) throw new GistSyncError('Add a GitHub token before importing.');

  const gistId = localStorage.getItem(GITHUB_GIST_ID_KEY)?.trim();
  if (!gistId) throw new GistSyncError('Enter the Gist ID you want to restore from.');

  let response: Response;
  try {
    response = await fetch(`${GITHUB_GISTS_URL}/${encodeURIComponent(gistId)}`, {
      headers: githubHeaders(token),
    });
  } catch {
    throw new GistSyncError('Could not reach GitHub. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new GistSyncError(`GitHub could not load that Gist: ${await getErrorMessage(response)}`);
  }

  const gist = (await response.json()) as {
    files?: Record<string, { content?: string; truncated?: boolean; raw_url?: string }>;
  };
  const file = gist.files?.[BACKUP_FILENAME];
  if (!file) throw new GistSyncError(`This Gist does not contain ${BACKUP_FILENAME}.`);

  let content = file.content;
  if (file.truncated && file.raw_url) {
    try {
      const rawResponse = await fetch(file.raw_url, { headers: githubHeaders(token) });
      if (!rawResponse.ok) throw new Error();
      content = await rawResponse.text();
    } catch {
      throw new GistSyncError('GitHub returned a large backup, but its full contents could not be loaded.');
    }
  }
  if (!content) throw new GistSyncError('The backup file is empty.');

  const parsed = validateBackup(content);
  localStorage.setItem(APP_STORAGE_KEY, content);
  return parsed;
}
