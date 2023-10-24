This action is similar to [actions/cache](https://github.com/actions/cache) but it also saves the current [`job.status`](https://docs.github.com/en/actions/learn-github-actions/contexts#job-context) (**success** or **failure**) and restores it in a later run when the same `cache-key` hits.

This offers two separate actions `taskworld/job-cache-action/save` and `taskworld/job-cache-action/restore` due to the limitations of how job status is derived in JavaScript action.

## Usage example

```yml
on:
	pull_request:

jobs:
	eslint:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v3

			- id: cache
				uses: taskworld/job-cache-action/restore@v1
				with:
					cache-key: build-${{ hashFiles('src') }}
					path: pass-your-additional-files-here

			- runs: npx eslint

			- uses: taskworld/job-cache-action/save@v1
				with:
					cache-key: ${{ steps.cache.outputs.cache-key }}
					path: pass-your-additional-files-here
```
