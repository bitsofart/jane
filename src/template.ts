import Handlebars from 'handlebars'

// There's a quick trick here so we can add content creator and style creator data at different moments. When we compile
// the template file the first time, it happens due to content selection, so we add only content creator data and the
// content itself. On the second run we add data for the style entry.

type ContentOptionsFirstRun = {
  content: string
  content_creator_url: string
  concent_creator_handle: string
}

type ContentOptionsSecondRun = {
  style_creator_url: string
  style_creator_handle: string
}

type ContentOptions = ContentOptionsFirstRun | ContentOptionsSecondRun

export async function buildContent(encodedTemplateFile: string, opts: ContentOptions): Promise<string> {
  const template = Handlebars.compile<ContentOptions>(Buffer.from(encodedTemplateFile, 'base64').toString('utf-8'))
  return template(opts)
}
