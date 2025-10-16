import onChange from "on-change"

export default (state, elements, i18n) => {
  const { feedback, input, posts, feeds } = elements

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
      case 'invalidRSS':
        feedback.textContent = state.error
        feedback.classList.add('text-danger')
        break
      default:
        break
    }
  }

  const preparePosts = (posts) => {
    const lists = document.createElement('ul')
    lists.classList.add('list-group')

    posts.forEach((post) => {
      const li = document.createElement('li')
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'rounded-0', 'border-0')

      const link = document.createElement('a')
      link.classList.add('fw-bold')
      link.href = post.link
      link.textContent = post.title

      const button = document.createElement('button')
      button.classList.add('btn', 'btn-outline-primary')
      button.textContent = i18n.t('content.button')
      
      li.append(link, button)
      lists.append(li)
    })

    return lists
  }

  const renderPosts = () => {
    posts.innerHTML = ''
    const card = document.createElement('div')
    card.classList.add('card', 'border-0')

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')
    const postsTitle = document.createElement('h2')
    postsTitle.classList.add('card-title', 'h4')
    postsTitle.textContent = i18n.t('content.posts')
    cardBody.append(postsTitle)

    card.append(cardBody)

    state.posts.forEach(element => {
      const post = preparePosts(element)
      card.append(post)
    })
    posts.append(card)
  }

  const renderFeeds = () => {
    feeds.innerHTML = ''
    const container = document.createElement('div')
    container.classList.add('card', 'border-0', 'rounded-0')

    const div = document.createElement('div')
    div.classList.add('card-body', 'border-0', 'rounded-0')
    const title = document.createElement('h2')
    title.classList.add('card-title', 'h4')
    title.textContent = i18n.t('content.feeds')
    div.append(title)

    container.append(div)

    state.feeds.forEach((feed) => {
      const ul = document.createElement('ul')
      ul.classList.add('list-group')

      const li = document.createElement('li')
      li.classList.add('list-group-item', 'rounded-0', 'border-0')

      const title = document.createElement('h3')
      title.classList.add('h6')
      title.textContent = feed.title

      const subtitle = document.createElement('p')
      subtitle.classList.add('m-0', 'text-black-50')
      subtitle.textContent = feed.description

      li.append(title, subtitle)
      ul.append(li)
      container.append(ul)
    })
    feeds.append(container)
  }

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'status':
      case 'error':
        handleFeedback()
        break
      case 'posts':
        renderPosts()
        break
      case 'feeds':
        renderFeeds()
        break
      default:
        break
    }
  })
  return watchedState
}