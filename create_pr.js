const simpleGit = require("simple-git/promise");
const { Octokit } = require("@octokit/rest");

const issue_number = process.argv[2];

const git = simpleGit(".");
const fs = require("fs");
const configFile = fs.readFileSync("./hackattoni.json", "utf8");
const {github_token, remote, fork} = JSON.parse(configFile);
const octokit = new Octokit({ auth: github_token });

const template = fs.readFileSync("./.github/PULL_REQUEST_TEMPLATE/new_feature.md", "utf8");

async function doWork() {
  try {
    const {
      data: { login },
    } = await octokit.request("/user");
    const { current: head } = await git.branchLocal();
    await git.push(fork, head);
    console.log("Push done!");
    const url = await git.remote(["get-url", remote]);
    const [, , , owner, repogit] = url.split("/");
    const repo = repogit.split(".git")[0].replace(/\n/, "").replace(/\r/, "");
    const {
      data: {
        milestone: { number: milestoneNumber },
        title,
        labels,
      },
    } = await octokit.issues.get({
      owner,
      repo,
      issue_number,
    }).catch(e => console.log(e));
    const {
      data: { number: pullNumber },
    } = await octokit.pulls.create({
      owner,
      repo,
      title: `#${issue_number} ${title}`,
      head: `${login}:${head}`,
      base: "master",
      body: template,
    });
    console.log("Pull created!");
    await octokit.issues.update({
      owner,
      repo,
      issue_number: pullNumber,
      labels: labels.map((l) => l.name),
      milestone: milestoneNumber,
      assignees: [login],
    });
    console.log("Assigned labels, milestone and assignee");
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
doWork();
