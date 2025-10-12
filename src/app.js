import * as yup from 'yup'
import i18next from 'i18next'
import resources from './locales/index.js'
import watch from './view.js'

export default () => {
  const state = {
    existingUrls: [],
    status: 'filling',
    error: null,
  }

  const elements = {
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    input: document.getElementById('url-input'),
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

    const watchedStatus = watch(state, elements, i18n)
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
      validateURL(watchedStatus.existingUrls, url)
        .then((validationResult) => {
          if (validationResult.isValid) {
            watchedStatus.status = 'valid'
            watchedStatus.error = null
            watchedStatus.existingUrls.push(url)
            elements.form.reset()
          }
          else {
            watchedStatus.status = 'error'
            watchedStatus.error = validationResult.message
            elements.input.focus()
          }
        }).catch((error) => {
          state.status = 'error'
          state.error = i18n.t('errors.unknown')
          console.error('Validation promise failed:', error)
        })
    })
  })
}
