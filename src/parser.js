import { uniqueId } from 'lodash'

const parser = (response, i18n) => {
  const xmlString = response.data.contents
  const domParser = new DOMParser()
  const xmlDoc = domParser.parseFromString(xmlString, 'text/xml')

  if (!xmlDoc.querySelector('channel > title')) {
    throw new Error(i18n.t('errors.parserError'))
  }

  const feed = {
    id: uniqueId(),
    title: xmlDoc.querySelector('channel > title')?.textContent || i18n.t('defaults.noTitle'),
    description: xmlDoc.querySelector('channel > description')?.textContent || '',
  }

  const posts = Array.from(xmlDoc.querySelectorAll('channel item'))
    .map(item => ({
      id: uniqueId(),
      feedId: feed.id,
      title: item.querySelector('title')?.textContent || i18n.t('defaults.noTitle'),
      description: item.querySelector('description')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
    }))
    .filter(post => post.title !== i18n.t('defaults.noTitle'))

  return { posts, feed }
}

export default parser
