/**
 * GitHub API Helper Functions
 *
 * SECURITY NOTE: This module handles sensitive operations.
 * - Never log passwords or file contents
 * - All data is passed through, never stored
 * - Cleanup functions ensure temporary data is deleted
 */

const GITHUB_API_BASE = 'https://api.github.com';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

function getConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    throw new Error('Missing required environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }

  return { token, owner, repo };
}

function getHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * Create a draft release for temporary file storage
 */
export async function createDraftRelease(): Promise<{ id: number; tag: string; uploadUrl: string }> {
  const { token, owner, repo } = getConfig();

  // Generate unique tag based on timestamp
  const tag = `sign-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: tag,
      name: `Signing Job ${new Date().toISOString()}`,
      draft: true,
      prerelease: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create release: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    tag: tag,
    uploadUrl: data.upload_url.replace('{?name,label}', ''),
  };
}

/**
 * Upload a file as a release asset
 */
export async function uploadReleaseAsset(
  uploadUrl: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ id: number; name: string; size: number }> {
  const { token } = getConfig();

  const url = `${uploadUrl}?name=${encodeURIComponent(fileName)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload asset: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    size: data.size,
  };
}

/**
 * Trigger the signing workflow
 * SECURITY: Passwords are passed directly to GitHub, never logged
 */
export async function triggerWorkflow(
  releaseTag: string,
  keystorePassword: string,
  keyAlias: string,
  keyPassword: string
): Promise<void> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/sign.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        ...getHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          release_tag: releaseTag,
          keystore_password: keystorePassword,
          key_alias: keyAlias,
          key_password: keyPassword,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to trigger workflow: ${response.status} - ${error}`);
  }
}

/**
 * Get the most recent workflow run for the signing workflow
 */
export async function getLatestWorkflowRun(): Promise<{
  id: number;
  status: string;
  conclusion: string | null;
  createdAt: string;
} | null> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/sign.yml/runs?per_page=1`,
    {
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get workflow runs: ${response.status}`);
  }

  const data = await response.json();

  if (data.workflow_runs.length === 0) {
    return null;
  }

  const run = data.workflow_runs[0];
  return {
    id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    createdAt: run.created_at,
  };
}

/**
 * Get workflow run status by ID
 */
export async function getWorkflowRun(runId: number): Promise<{
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
}> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs/${runId}`,
    {
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get workflow run: ${response.status}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    status: data.status,
    conclusion: data.conclusion,
  };
}

/**
 * Get artifact download URL for a workflow run
 */
export async function getArtifactDownloadUrl(runId: number): Promise<string | null> {
  const { token, owner, repo } = getConfig();

  // Get artifacts for the run
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
    {
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get artifacts: ${response.status}`);
  }

  const data = await response.json();

  // Find the signed-aab artifact
  const signedArtifact = data.artifacts.find(
    (a: { name: string }) => a.name === 'signed-aab'
  );

  if (!signedArtifact) {
    return null;
  }

  // Get download URL (requires authentication)
  // Return the archive download URL
  return `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/artifacts/${signedArtifact.id}/zip`;
}

/**
 * Download artifact and return as buffer
 */
export async function downloadArtifact(artifactUrl: string): Promise<Buffer> {
  const { token } = getConfig();

  const response = await fetch(artifactUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new Error('Artifact has expired or been deleted. Please sign your AAB again.');
    }
    throw new Error(`Failed to download artifact: ${response.status}`);
  }

  // Check content type to ensure we're getting a zip file, not an HTML error page
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html') || contentType.includes('text/plain')) {
    throw new Error('Artifact has expired or is no longer available. Please sign your AAB again.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Additional validation: check if the response looks like a zip file
  // ZIP files start with PK (0x50 0x4B)
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
    throw new Error('Artifact has expired or is no longer available. Please sign your AAB again.');
  }

  return buffer;
}

/**
 * Delete a release (cleanup)
 * This is a backup cleanup in case the workflow fails to delete
 */
export async function deleteRelease(releaseId: number): Promise<void> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases/${releaseId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  // 404 is OK - release may already be deleted by workflow
  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete release: ${response.status}`);
  }
}

/**
 * Find workflow run by release tag (searches recent runs)
 * Note: Currently returns the most recent run; releaseTag parameter reserved for future filtering
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function findWorkflowRunByRelease(_releaseTag: string): Promise<number | null> {
  const { token, owner, repo } = getConfig();

  // Get recent workflow runs
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/actions/workflows/sign.yml/runs?per_page=10`,
    {
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get workflow runs: ${response.status}`);
  }

  const data = await response.json();

  // Find run that was triggered with this release ID
  // We look for runs created in the last few minutes
  const recentRuns = data.workflow_runs.filter((run: { created_at: string }) => {
    const createdAt = new Date(run.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffMinutes < 10; // Within last 10 minutes
  });

  if (recentRuns.length > 0) {
    return recentRuns[0].id;
  }

  return null;
}
