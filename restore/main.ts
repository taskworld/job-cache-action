import * as core from '@actions/core'
import * as cache from '@actions/cache'

const resultFilePath = '/tmp/result.json'

async function run() {
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

		if (result.status === 'failure') {
			core.setFailed('This job has failed at ' + result.url)
		} else {
			core.info('This job has succeeded at ' + result.url)
		}
	}
}

run()
