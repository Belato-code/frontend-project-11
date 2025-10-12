import onChange from "on-change"

export default (state, elements, i18n) => {
  const { feedback, input } = elements

  const handleFeedback = () => {
    input.classList.remove('is-valid', 'is-invalid')
    feedback.classList.remove('text-success', 'text-danger')
    switch (state.status) {
      case 'error':
        feedback.classList.add('text-danger')
        input.classList.add('is-invalid')
        feedback.textContent = state.error
        break
      case 'valid':
        feedback.classList.add('text-success')
        feedback.textContent = i18n.t('success')
        input.classList.add('is-valid')
        break
      default:
        break
    }
  }

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'status':
      case 'error':
        handleFeedback()
        break
      default:
        break
    }
  })
  return watchedState
}