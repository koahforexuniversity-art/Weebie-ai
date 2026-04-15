import { Octokit } from "@octokit/rest";

export function createGithub(token = process.env.GITHUB_OAUTH_TOKEN) {
  if (!token) throw new Error("GITHUB_OAUTH_TOKEN missing");
  return new Octokit({ auth: token });
}

export type RepoInit = {
  name: string;
  description?: string;
  privateRepo?: boolean;
  files: { path: string; content: string }[];
};

export async function createRepoWithFiles(init: RepoInit) {
  const gh = createGithub();
  const { data: user } = await gh.users.getAuthenticated();
  const repo = await gh.repos.createForAuthenticatedUser({
    name: init.name,
    description: init.description,
    private: init.privateRepo ?? true,
    auto_init: true,
  });

  const owner = user.login;
  const refName = "heads/main";
  const ref = await gh.git.getRef({ owner, repo: repo.data.name, ref: refName });
  const baseSha = ref.data.object.sha;
  const baseCommit = await gh.git.getCommit({ owner, repo: repo.data.name, commit_sha: baseSha });

  const blobs = await Promise.all(
    init.files.map((f) =>
      gh.git
        .createBlob({ owner, repo: repo.data.name, content: f.content, encoding: "utf-8" })
        .then((b) => ({ path: f.path, sha: b.data.sha })),
    ),
  );

  const tree = await gh.git.createTree({
    owner,
    repo: repo.data.name,
    base_tree: baseCommit.data.tree.sha,
    tree: blobs.map((b) => ({
      path: b.path,
      mode: "100644",
      type: "blob",
      sha: b.sha,
    })),
  });

  const commit = await gh.git.createCommit({
    owner,
    repo: repo.data.name,
    message: "chore: forgeagent v4 initial commit",
    tree: tree.data.sha,
    parents: [baseSha],
  });

  await gh.git.updateRef({
    owner,
    repo: repo.data.name,
    ref: refName,
    sha: commit.data.sha,
  });

  return { url: repo.data.html_url, owner, name: repo.data.name };
}
