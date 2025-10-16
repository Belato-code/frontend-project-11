import * as yup from 'yup'
import i18next from 'i18next'
import resources from './locales/index.js'
import watch from './view.js'
import axios from 'axios'
import parser from './parser.js'

const makeURL = (link) => {
  const url = new URL('get', 'https://allorigins.hexlet.app')
  url.searchParams.append('disableCash', 'true')
  url.searchParams.append('url', link)

  return url.toString()
}

export default () => {
  const state = {
    existingUrls: [],
    status: 'filling',
    error: null,
    feeds: [],
    posts: [],
  }

  const elements = {
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('#url-input'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  }

  const getData = (url, watchedState, i18n) => {
    return axios.get(makeURL(url))
      .then((response) => {
        const parsedData = parser(response, i18n)
        return parsedData
      })
      .then((parsedData) => {
        watchedState.feeds.push(parsedData.feed)
        watchedState.posts.push(parsedData.posts)
        return parsedData
      })
      .catch(error => console.log(error.message))
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
              return getData(url, watchedState, i18n)
                .then(() => {
                  console.log(watchedState.feeds)
                  watchedState.error = null
                  watchedState.status = 'valid'
                  watchedState.existingUrls.push(url)
                  elements.form.reset()
                })
            }
            else {
              watchedState.status = 'error'
              watchedState.error = validationResult.message
              elements.input.focus()
            }
          })
          .catch((error) => {
            watchedState.status = 'invalidRSS'
            watchedState.error = error.message
            console.error('Request failed:', error)
          })
      })
  })
}
