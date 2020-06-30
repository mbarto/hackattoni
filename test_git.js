/*global process*/

const simpleGit = require('simple-git/promise');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const issue_number = process.argv[2] || 1;

// the following resource will be applied to the cwd (current working directory)
const git = simpleGit('.');
const configFile = fs.readFileSync("./configOptions.json", "utf8");
const {
  githubToken,
  remote,
  fork,
  templatePath= "./.github/PULL_REQUEST_TEMPLATE.md"
} = JSON.parse(configFile);
const template = fs.readFileSync(templatePath, "utf8");

const octokit = new Octokit({ auth: githubToken });

async function doWork() {
  try {
    const {
      data: { login },
    } = await octokit.request('/user');
    const { current: head } = await git.branchLocal();

    console.log('head', head);
    console.log('login', login);
    console.log('remote', remote);
    console.log('fork', fork);
    console.log('configFile', configFile || {});
    console.log('issue_number', issue_number);
    console.log('template', template);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
doWork();
