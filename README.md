# hackattoni

A repo containing some tools to automate a github process

## What this tool does
- creates a PR on master branch of a specific remote
- copy from indicated issues the labels and milestone
- it uses a template for the pr body

Setup of this repo
`git clone https://github.com/mbarto/hackattoni.git`
`npm install`

## Usage
configure correctly the hackattoni.json with these required info
```json
{
	"fork": "https://github.com/YOUR_USER/hackattoni.git",
	"remote": "https://github.com/mbarto/hackattoni.git",
	"github_token":"YourToken"
}
```

- go the desired repo
- run this command
`node path_to_this_folder/hackattoni/create_pr.js ISSUE_NUMBER`
