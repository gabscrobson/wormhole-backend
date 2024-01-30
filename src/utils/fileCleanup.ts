import { PrismaClient } from '@prisma/client'
import { r2 } from '../lib/cloudfare'
import { env } from './env'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import * as cron from 'node-cron'

const prisma = new PrismaClient()

export async function cleanupFiles() {
  // Get current time
  const currentTime = new Date()

  // Subtract 24 hours from current time
  currentTime.setHours(currentTime.getHours() - 24);

  // Query for files older than 24 hours
  const oldFiles = await prisma.file.findMany({
    where: {
      createdAt: {
        lt: currentTime
      }
    }
  })

  // For each old file
  for (const file of oldFiles) {
    // Delete from Cloudfare
    await r2.send(new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: file.key
    }))

    // Delete from database
    await prisma.file.delete({
      where: {
        id: file.id
      }
    })

    // Log deletion
    console.log(`🧹 Deleted file ${file.id}`)
  }
}

// Schedule cleanupFiles to run every 24 hours
cron.schedule('0 0 * * *', cleanupFiles)