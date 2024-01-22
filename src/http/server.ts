import fastify from "fastify";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/cloudfare";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {z} from 'zod';
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

const app = fastify();

const prisma = new PrismaClient()

// POST /uploads
app.post('/uploads', async (request) => {
    const uploadBodySchema = z.object({
      name: z.string().min(1),
      contentType: z.string().regex(/\w+\/[-+. \w]+/),
    })

    const {name, contentType} = uploadBodySchema.parse(request.body)

    const fileKey = randomUUID().concat('-', name);

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: 'wormhole-dev',
        Key: fileKey,
        ContentType: contentType,
      }),
      {
        expiresIn: 600,
      }
    )

    const file = await prisma.file.create({
      data: {
        name,
        contentType,
        key: fileKey
      }
    })

    return {signedUrl, fileId: file.id}
})

// GET /uploads/:id
app.get('/uploads/:id', async (request) => {
  const fileParamsSchema = z.object({
    id: z.string().cuid(),
  })

  const {id} = fileParamsSchema.parse(request.params)

  const file = await prisma.file.findUniqueOrThrow({
    where: {
      id
    }
  })

  const signedUrl = await getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: 'wormhole-dev',
      Key: file.key,
    }),
    {
      expiresIn: 600,
    }
  )

  return signedUrl
})

// GET /files/:id
app.get('/files/:id', async (request) => {
  const fileParamsSchema = z.object({
    id: z.string().cuid(),
  })

  const {id} = fileParamsSchema.parse(request.params)

  const file = await prisma.file.findUniqueOrThrow({
    where: {
      id
    }
  })

  return file
})

app.listen({
  port: 3333,
  host: '0.0.0.0'
}).then(() => {
  console.log('🔥 HTTP server running!')
})