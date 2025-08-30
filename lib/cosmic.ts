import { createBucketClient } from '@cosmicjs/sdk'
import { getCosmicBucketSlug, getCosmicReadKey, getCosmicWriteKey } from './utils'

export const cosmic = createBucketClient({
  bucketSlug: getCosmicBucketSlug(),
  readKey: getCosmicReadKey(),
  writeKey: getCosmicWriteKey(),
})

// Error helper for Cosmic SDK
export function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}