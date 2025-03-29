
import { FileItem } from '@/components/FileExplorer';
import axios from 'axios';

// Interface for GitHub API responses
interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface GitHubCommitResponse {
  sha: string;
  url: string;
}

interface GitHubError {
  message: string;
  documentation_url: string;
}

class GitHubService {
  private token: string | null = null;
  private owner: string | null = null;
  private repo: string | null = null;
  private baseUrl = 'https://api.github.com';

  setCredentials(token: string, owner: string, repo: string): void {
    console.log(`Setting credentials for repository: ${owner}/${repo}`);
    this.token = token;
    this.owner = owner;
    this.repo = repo;
  }

  private getHeaders() {
    if (!this.token) throw new Error('GitHub token not set');
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  async fetchRepository(): Promise<FileItem[]> {
    try {
      console.log(`Fetching repository contents for ${this.owner}/${this.repo}`);
      if (!this.owner || !this.repo) throw new Error('Repository credentials not set');

      // Get the default branch's latest commit
      console.log('Fetching repository default branch...');
      const repoResponse = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}`,
        { headers: this.getHeaders() }
      );
      const defaultBranch = repoResponse.data.default_branch;
      console.log(`Default branch: ${defaultBranch}`);

      // Get the tree
      console.log('Fetching repository tree...');
      const treeResponse = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers: this.getHeaders() }
      );
      console.log(`Fetched ${treeResponse.data.tree.length} tree items`);

      return this.processDirectoryContents(treeResponse.data.tree);
    } catch (error) {
      console.error('Error fetching repository:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const githubError = error.response.data as GitHubError;
        throw new Error(`GitHub API Error: ${githubError.message}`);
      }
      throw error;
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      console.log(`Fetching content for file: ${path}`);
      if (!this.owner || !this.repo) throw new Error('Repository credentials not set');

      const response = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`,
        { headers: this.getHeaders() }
      );
      console.log(`Successfully fetched content for: ${path}`);

      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const githubError = error.response.data as GitHubError;
        throw new Error(`Failed to fetch file content: ${githubError.message}`);
      }
      throw error;
    }
  }

  async commitChanges(files: { path: string; content: string }[], message: string): Promise<GitHubCommitResponse> {
    try {
      console.log(`Starting commit process for ${files.length} files`);
      if (!this.owner || !this.repo) throw new Error('Repository credentials not set');

      console.log('Fetching current commit SHA...');
      const masterRef = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/refs/heads/main`,
        { headers: this.getHeaders() }
      );
      const currentCommitSha = masterRef.data.object.sha;
      console.log(`Current commit SHA: ${currentCommitSha}`);

      console.log('Creating blobs for files...');
      const blobPromises = files.map(async file => {
        console.log(`Creating blob for: ${file.path}`);
        const blobResponse = await axios.post(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/blobs`,
          {
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64'
          },
          { headers: this.getHeaders() }
        );
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobResponse.data.sha
        };
      });

      const blobs = await Promise.all(blobPromises);
      console.log(`Created ${blobs.length} blobs successfully`);

      console.log('Creating new tree...');
      const treeResponse = await axios.post(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/trees`,
        {
          base_tree: currentCommitSha,
          tree: blobs
        },
        { headers: this.getHeaders() }
      );
      console.log(`New tree created with SHA: ${treeResponse.data.sha}`);

      console.log('Creating new commit...');
      const commitResponse = await axios.post(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/commits`,
        {
          message,
          tree: treeResponse.data.sha,
          parents: [currentCommitSha]
        },
        { headers: this.getHeaders() }
      );
      console.log(`New commit created with SHA: ${commitResponse.data.sha}`);

      console.log('Updating reference...');
      await axios.patch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/refs/heads/main`,
        { sha: commitResponse.data.sha },
        { headers: this.getHeaders() }
      );
      console.log('Reference updated successfully');

      return {
        sha: commitResponse.data.sha,
        url: commitResponse.data.url
      };
    } catch (error) {
      console.error('Error during commit process:', error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const githubError = error.response.data as GitHubError;
        throw new Error(`Failed to commit changes: ${githubError.message}`);
      }
      throw error;
    }
  }

  processDirectoryContents(items: GitHubTreeItem[]): FileItem[] {
    const result: FileItem[] = [];
    const dirs: Record<string, FileItem> = {};

    // First pass: create all directories
    items.forEach(item => {
      const pathParts = item.path.split('/');
      let currentPath = '';

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!dirs[currentPath]) {
          const dirItem: FileItem = {
            name: part,
            path: currentPath,
            type: 'directory',
            children: []
          };

          dirs[currentPath] = dirItem;

          if (parentPath) {
            dirs[parentPath].children?.push(dirItem);
          } else {
            result.push(dirItem);
          }
        }
      }
    });

    // Second pass: add all files
    items.forEach(item => {
      if (item.type === 'blob') {
        const pathParts = item.path.split('/');
        const fileName = pathParts.pop() || '';
        const dirPath = pathParts.join('/');

        const fileItem: FileItem = {
          name: fileName,
          path: item.path,
          type: 'file'
        };

        if (dirPath) {
          dirs[dirPath].children?.push(fileItem);
        } else {
          result.push(fileItem);
        }
      }
    });

    return result;
  }
}
const githubService = new GitHubService();
export default githubService;
