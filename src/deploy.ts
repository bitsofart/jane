import axios, {AxiosResponse} from 'axios'
import crypto from 'crypto'
import { vercel_project_id } from './config'
import { buildContent } from './template'
import { PRAuthor, GithubFile } from './types'

// @TODO: Move those to config
const fileUploadEndpoint = 'https://api.vercel.com/v2/now/files'
const deployEndpoint = 'https://api.vercel.com/v12/now/deployments?forceNew=1'
const deployToken = process.env.DEPLOY_TOKEN

async function uploadFile(file: GithubFile, author: PRAuthor): Promise<[string, string, number]> {
  const fileUrl = file.raw_url
  const fileName = file.filename
  console.log(`Uploading ${fileName}...`)
  const { data: rawContent } = await axios.get<string>(fileUrl)
  const fileContent =
    fileName === 'index.html'
      ? await buildContent(rawContent, { style_creator_url: author.url, style_creator_handle: author.handle }, false)
      : rawContent
  const fileSha1 = crypto.createHash('sha1').update(fileContent).digest('hex')
  const fileSize = Buffer.byteLength(fileContent, 'utf8')
  await axios.request({
    url: fileUploadEndpoint,
    method: 'post',
    headers: {
      Authorization: `BEARER ${deployToken}`,
      'Content-Length': fileSize,
      'x-now-digest': fileSha1,
    },
    data: fileContent,
  })
  return [fileName, fileSha1, fileSize]
}

async function triggerDeployment(files: Array<[string, string, number]>): Promise<AxiosResponse> {
  return axios.request({
    url: deployEndpoint,
    method: 'post',
    headers: {
      Authorization: `BEARER ${deployToken}`,
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
  files: Array<GithubFile>,
  author: PRAuthor,
): Promise<string> {
  console.log(`Gathering files for deploying ${prNumber}`)
  const filesSha = await Promise.all(files.map((file) => uploadFile(file, author)))
  console.log(`Triggering deploy ${prNumber}`)
  const response = await triggerDeployment(filesSha)
  if (response.status >= 400) {
    throw new Error(`Deploy Error: ${response.status} ${response.statusText}`)
  }
  const deployUrl = response.data?.url;
  return deployUrl || ''
}
