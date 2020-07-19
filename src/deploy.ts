import axios from 'axios'
import crypto from 'crypto'
import { vercel_project_id } from './config'
import { GithubFile, GithubContentFile } from './types'

const fileUploadEndpoint = 'https://api.vercel.com/v2/now/files'
const deployEndpoint = 'https://api.vercel.com/v12/now/deployments?forceNew=1'
const vercelToken = process.env.VERCEL_TOKEN

async function uploadFile(file: GithubFile | GithubContentFile): Promise<[string, string, number]> {
  const fileUrl = file.githubFileType === 'pr' ? file.raw_url : file.download_url
  const fileName = file.githubFileType === 'pr' ? file.filename : file.name
  const { data: fileContent } = await axios.get<string>(fileUrl)
  const fileSha1 = crypto.createHash('sha1').update(fileContent).digest('hex')
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
  return [fileName, fileSha1, fileSize]
}

async function triggerDeployment(files: Array<[string, string, number]>) {
  return axios.request({
    url: deployEndpoint,
    method: 'post',
    headers: {
      Authorization: `BEARER ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      name: vercel_project_id,
      files: files.map((file) => ({
        file: file[0],
        sha: file[1],
        size: file[2],
      })),
      projectSettings: {
        framework: null,
      },
    },
  })
}

export async function deployPullRequestPreview(
  prNumber: number,
  files: Array<GithubContentFile | GithubFile>,
): Promise<string> {
  try {
    console.log(`Gathering files for deploying ${prNumber}`)
    const filesSha = await Promise.all(files.map(uploadFile))
    console.log(`Triggering deploy ${prNumber}`)
    const {
      data: { url: deployUrl },
    } = await triggerDeployment(filesSha)
    return deployUrl
  } catch (error) {
    console.error(`Something went wrong while trying to deploy PR#${prNumber}.\n`)
    if (error.response) {
      console.error(`status: ${error.response.status}\n`)
      console.error(`status-text: ${error.response.statusText}\n`)
      console.error(`data: ${JSON.stringify(error.response.data)}.`)
    } else {
      console.error(error)
    }
  }
}
