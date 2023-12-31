import * as core from '@actions/core'
import * as github from '@actions/github'
import * as cache from '@actions/cache'
import * as fs from 'fs/promises'
import * as path from 'path'
import { mkdirp } from 'mkdirp'

const resultFilePath = '/tmp/result.json'

async function run() {
	
	const status = core.getInput('job-status', { required: true })
	console.log('status =', status)

	// Do not save `cancelled` job status as it is inconclusive
	if (status === 'success' || status === 'failure') {
		const api = github.getOctokit(core.getInput('github-token'), { required: true })

		const { data: { jobs } } = await api.rest.actions.listJobsForWorkflowRun({
			...github.context.repo,
			run_id: github.context.runId,
		}).catch(error => {
			console.error(error)

			return { data: { jobs: [] } }
		})

		// Do not match `job.name` as it can be different in matrix
		const job = jobs.find(job => job.runner_name === process.env.RUNNER_NAME)
		core.debug('job = ' + JSON.stringify(job, null, 2))

		const result = {
			status, // Do not use `job.steps[*].conclusion` from GitHub API as it does not reflect the most recent progress.
			url: job?.html_url || `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}`,
		}

		await mkdirp(path.dirname(resultFilePath))
		await fs.writeFile(resultFilePath, JSON.stringify(result), 'utf-8')

		await cache.saveCache(
			[resultFilePath, ...core.getMultilineInput('files')],
			core.getInput('cache-key', { required: true })
		)

		console.log(`Job status has been cached.`)
	} else {
		console.log('Job status has not been cached due to inconclusive conclusion.')
	}
}

run()
