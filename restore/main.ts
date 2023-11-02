import * as core from '@actions/core'
import * as cache from '@actions/cache'

const resultFilePath = '/tmp/result.json'

async function run() {
	if (core.isDebug()) {
		core.info('Skipped restoring job status cache because debug logging was enabled.')
		core.setOutput('cache-hit', false)
		return
	}

	const cacheKey = core.getInput('cache-key', { required: true })
	core.setOutput('cache-key', cacheKey)

	const cacheHit = Boolean(await cache.restoreCache(
		[resultFilePath, ...core.getMultilineInput('files')],
		cacheKey
	))
	console.log('cache-hit =', cacheHit)
	core.setOutput('cache-hit', cacheHit)

	if (cacheHit) {
		const result = require(resultFilePath)
		console.log('status =', result.status)

		const ending = result.url ? (' at ' + result.url) : ' previously.'

		if (result.status === 'failure') {
			core.setFailed('This job has failed' + ending)
		} else {
			core.info('This job has succeeded' + ending)
		}

		core.info('If you want to bypass job status cache, please re-run this job with debug logging enabled.')
		core.info('See https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging')
	}
}

run()
