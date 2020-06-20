const simpleGit = require("simple-git/promise");
const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");

const github_token = process.argv[2];
const zenhub_token = process.argv[3];
const issue_number = process.argv[4];

const octokit = new Octokit({ auth: github_token });
const git = simpleGit(".");
const fs = require("fs");
const template = fs.readFileSync("./template.md", "utf8");

async function doWork() {
  const {
    data: { login },
  } = await octokit.request("/user");
  const { current: head } = await git.branchLocal();
  await git.push("origin", head);
  console.log("Push done!");
  const url = await git.remote(["get-url", "origin"]);
  const [, , , owner, repogit] = url.split("/");
  const repo = repogit.split(".git")[0];
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
  });
  const {
    data: { number: pullNumber },
  } = await octokit.pulls.create({
    owner,
    repo,
    title: `#${issue_number} ${title}`,
    head,
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
}
doWork();
