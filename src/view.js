import { string } from 'yup'
import onChange from 'on-change'

const feedback = document.querySelector('.feedback')
const form = document.querySelector('.rss-form')

const state = {
  valid: '',
  feeds: [],
  message: '',
}

const watchedObject = onChange(state, function (path, value, previousValue) {
  return { path, value, previousValue }
})

function validator (str) {
  return new Promise((resolve) => {
    let schema = string().url().nullable()

    if (state.feeds.includes(str)) {
      resolve ({
        valid: 'exist',
        message: 'RSS уже существует',
      })
      return
    }
    schema.isValid(str)
      .then(data => {
        if (data === false) {
          resolve ({
            valid: false,
            message: 'Ссылка должна быть валидным URL'
          })
          return 
        }
        else {
          state.feeds.push(str)
          resolve ({
            valid: true,
            message: 'RSS успешно загружен',
          })
        }
    })
    .catch(error => {
      resolve({
        valid: false,
        message: 'Ошибка при проверке URL'
      })
    })
  })
}

function render () {
  const input = document.getElementById('url-input')
  input.focus()

  input.classList.remove('is-invalid')
  feedback.innerHTML = ''
  feedback.classList.remove('text-danger', 'text-success')
  switch (watchedObject.valid) {
    case false: {
      input.classList.add('is-invalid')
      feedback.classList.add('text-danger')
      break
    }
    case true: {
      form.reset()
      feedback.classList.add('text-success')
      break
    }
    case 'exist': {
      input.classList.add('is-invalid')
      feedback.classList.add('text-danger')
      break
    }
    default: {
      break
    }
  }

  feedback.textContent = watchedObject.message
}

export default function view() {
  form.addEventListener('submit', (e) => {
  e.preventDefault()
  const formInput = e.target.querySelector('#url-input')
  const url = formInput.value.trim()
  render()

  validator(url)
    .then(validationData => {
      watchedObject.valid = validationData.valid
      watchedObject.message = validationData.message
      render()
    })
  })
}