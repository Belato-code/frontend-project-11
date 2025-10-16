import { uniqueId } from 'lodash'

const parser = (response, i18n) => {
  try {
    const xmlString = response.data.contents
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, "text/xml")
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
      throw new Error(i18n.t('errors.parserError'))
    }

    const feed = {
      id: uniqueId(),
      title: xmlDoc.querySelector('channel > title').textContent,
      description: xmlDoc.querySelector('channel > description').textContent,
      link: xmlDoc.querySelector('channel > link')?.textContent,
    }

    const posts = Array.from(xmlDoc.querySelectorAll('channel item')).map(item => {
      const itemContent = {
        feedId: feed.id,
        title: item.querySelector('title')?.textContent,
        description: item.querySelector('description')?.textContent,
        link: item.querySelector('link')?.textContent,
      }
      return itemContent
    })

    return { posts, feed }
  }
  catch (error) {
    throw error
  }
}

export default parser