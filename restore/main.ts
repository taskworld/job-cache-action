import * as core from '@actions/core'
import * as cache from '@actions/cache'

const resultFilePath = '/tmp/result.json'

async function run() {
	core.setOutput('cache-key', core.getInput('cache-key'))

	const cacheHit = !!(await cache.restoreCache([resultFilePath], core.getInput('cache-key')))
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
