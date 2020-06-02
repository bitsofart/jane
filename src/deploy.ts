import axios from 'axios'
import crypto from 'crypto'
import { GithubFile } from './types'

const fileUploadEndpoint = 'https://api.vercel.com/v2/now/files'
const deployEndpoint = 'https://api.vercel.com/v12/now/deployments'
const vercelToken = process.env.VERCEL_TOKEN

async function uploadFile(file: GithubFile): Promise<[string, string, number]> {
  const { data: fileContent } = await axios.get<string>(file.raw_url)
  const fileSha1 = crypto.createHash('sha1').update(fileContent, 'utf8').digest().toString('utf8')
  const fileSize = Buffer.byteLength(fileContent, 'utf8')
  await axios.request({
    url: fileUploadEndpoint,
    method: 'post',
    headers: {
      Authorization: `BEARER ${vercelToken}`,
      'Content-Length': fileSize,
      'x-now-digest': fileSha1,
    },
    data: fileContent,
  })
  return [file.filename, fileSha1, fileSize]
}

async function triggerDeployment(prNumber: number, files: Array<[string, string, number]>) {
  return axios.request({
    url: deployEndpoint,
    headers: {
      Authorization: `BEARER ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      name: `css-contest-entry-${prNumber}`,
      files: files.map((file) => ({
        file: file[0],
        sha: file[1],
        size: file[2],
      })),
    },
  })
}

export async function deployPullRequestPreview(prNumber: number, files: GithubFile[]): Promise<void> {
  Promise.all(files.map(uploadFile))
    .then((filesSha) => triggerDeployment(prNumber, filesSha))
    .then((data) => {
      console.log(`Deployed ${prNumber} successfully.`, { data })
    })
    .catch((error) => {
      console.error(`Something went wrong while trying to deploy PR#${prNumber}.`, { error })
    })
}
