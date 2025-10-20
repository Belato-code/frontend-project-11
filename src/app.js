import * as yup from 'yup'
import i18next from 'i18next'
import resources from './locales/index.js'
import watch from './view.js'
import axios from 'axios'
import parser from './parser.js'

const makeURL = (link) => {
  const url = new URL('get', 'https://allorigins.hexlet.app')
  url.searchParams.append('disableCache', 'true')
  url.searchParams.append('url', link)

  return url.toString()
}

const updatePosts = (watchedState, i18n) => {
  const promises = watchedState.feeds.map((feed) => 
    axios.get(makeURL(feed.link))
      .then(response => {
        const { posts } = parser(response, i18n)
        const existingPostTitles = new Set(watchedState.posts.map(post => post.title))
        const newPosts = posts.filter(post => !existingPostTitles.has(post.title))
        
        if (newPosts.length > 0) {
          watchedState.posts.unshift(...newPosts)
        }
      })
      .catch((error) => {
        console.error('Error updating posts:', error)
      })
  )
  
  return Promise.allSettled(promises)
    .finally(() => setTimeout(() => updatePosts(watchedState, i18n), 5000))
}

export default () => {
  const state = {
    existingUrls: [],
    status: 'filling',
    error: null,
    feeds: [],
    posts: [],
    UI: {
      currentPostId: null,
      viewedPosts: new Set(),
    }
  }

  const elements = {
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('#url-input'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: document.querySelector('#postModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalDescription: document.getElementById('modalDescription'),
    modalLink: document.querySelector('.full-article')
  }

  const getRss = (url, watchedState, i18n) => {
    return axios.get(makeURL(url))
      .then((response) => {
        const parsedData = parser(response, i18n)
        return parsedData
      })
      .then((parsedData) => {
        parsedData.feed.link = url
        watchedState.feeds.unshift(parsedData.feed)
        watchedState.posts.unshift(...parsedData.posts)

        return parsedData
      })
      .catch(error => {
        throw error
      })
  }
  
  const i18n = i18next.createInstance()
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
      yup.setLocale({
        string: {  
          url: () => i18n.t('errors.url'),
        },
        mixed: {
          notOneOf: () => i18n.t('errors.exist'),
          required: () => i18n.t('errors.empty'),
        },
      })

      const watchedState = watch(state, elements, i18n)

      const validateURL = (existingUrls, url) => {
        const schema = yup.string().url().required().notOneOf(existingUrls)
        return schema
          .validate(url)
          .then(() => ({ isValid: true, message: null }))
          .catch((error) => ({
            isValid: false,
            message: error.message
          }))
      }

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault()
        const url = elements.input.value.trim()
        validateURL(watchedState.existingUrls, url)
          .then((validationResult) => {
            if (validationResult.isValid) {
              return getRss(url, watchedState, i18n)
                .then(() => {
                  watchedState.error = null
                  watchedState.status = 'valid'
                  watchedState.existingUrls.push(url)
                  elements.form.reset()
                })
                .catch((error) => {
                  watchedState.status = 'invalidRSS'
                  watchedState.error = error.message
                })
            }
            else {
              watchedState.status = 'error'
              watchedState.error = validationResult.message
              elements.input.focus()
            }
          })  
      })
      elements.posts.addEventListener('click', (e) => {
        const postId = e.target.dataset.id
        const linkId = e.target.dataset.linkId
        if (postId) {
          watchedState.UI.currentPostId = postId
          watchedState.UI.viewedPosts.add(postId)
        }
          if (linkId) {
          watchedState.UI.viewedPosts.add(linkId)
        }
      })

      updatePosts(watchedState, i18n)
  })
}
