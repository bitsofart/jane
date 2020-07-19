import Handlebars from 'handlebars'
import { getGhClient } from './gh'
import { config, owner, repo } from './config'

// There's a quick trick here so we can add content creator and style creator data at different moments. When we compile
// the template file the first time, it happens due to content selection, so we add only content creator data and the
// content itself. On the second run we add data for the style entry.

type ContentOptionsFirstRun = {
  content: string
  content_creator_url: string
  content_creator_handle: string
}

type ContentOptionsSecondRun = {
  style_creator_url: string
  style_creator_handle: string
}

type ContentOptions = ContentOptionsFirstRun | ContentOptionsSecondRun

async function buildContent(encodedTemplateFile: string, opts: ContentOptions): Promise<string> {
  const template = Handlebars.compile<ContentOptions>(Buffer.from(encodedTemplateFile, 'base64').toString('utf-8'))
  return template(opts)
}

export async function prepareContentFile(
  opts: ContentOptions,
  path: string = config.HTML_TEMPLATE_PATH,
): Promise<string> {
  const gh = getGhClient()
  const {
    data: { content: encodedTemplateFile },
  } = await gh.repos.getContent({
    owner,
    repo,
    path,
  })
  return buildContent(encodedTemplateFile, opts)
}
