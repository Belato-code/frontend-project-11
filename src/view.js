import onChange from 'on-change'
import { Modal } from 'bootstrap'

export default (state, elements, i18n) => {
  const { feedback, input, posts, feeds, modal, modalTitle, modalDescription, modalLink } = elements

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

  const renderModal = () => {
    console.log('renderModal called with postId:', state.UI.currentPostId)
    const currentPost = state.posts.find(post => post.id === state.UI.currentPostId)

    if (!currentPost) {
      console.error('Post not found for ID:', state.UI.currentPostId)
      return
    }

    modalTitle.textContent = currentPost.title
    modalDescription.textContent = currentPost.description || 'Описание отсутствует'
    modalLink.href = currentPost.link

    const modalInstance = new Modal(modal)
    modalInstance.show()
    console.log('Modal show called')
  }

  const preparePosts = (postsData) => {
    const lists = document.createElement('ul')
    lists.classList.add('list-group')

    if (!Array.isArray(postsData)) return lists

    postsData.forEach((post) => {
      if (!post || !post.title || !post.link) return

      const li = document.createElement('li')
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'rounded-0', 'border-0')

      const link = document.createElement('a')
      link.target = '_blank'
      link.dataset.linkId = post.id
      link.href = post.link
      link.textContent = post.title
      link.setAttribute('rel', 'noopener noreferrer')

      if (state.UI.viewedPosts.has(post.id)) {
        link.classList.add('fw-normal', 'link-secondary')
      }
      else {
        link.classList.add('fw-bold')
      }

      const button = document.createElement('button')
      button.dataset.id = post.id
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
      button.textContent = i18n.t('content.button')
      
      li.append(link, button)
      lists.append(li)
    })

    return lists
  }

  const renderPosts = () => {
    posts.innerHTML = ''
    if (!state.posts || state.posts.length === 0) return

    const card = document.createElement('div')
    card.classList.add('card', 'border-0')

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')
    const postsTitle = document.createElement('h2')
    postsTitle.classList.add('card-title', 'h4')
    postsTitle.textContent = i18n.t('content.posts')
    cardBody.append(postsTitle)

    const postsList = preparePosts(state.posts)
    card.append(cardBody, postsList)
    posts.append(card)
  }

  const renderFeeds = () => {
    feeds.innerHTML = ''
    if (!state.feeds || state.feeds.length === 0) return

    const container = document.createElement('div')
    container.classList.add('card', 'border-0')

    const div = document.createElement('div')
    div.classList.add('card-body')
    const title = document.createElement('h2')
    title.classList.add('card-title', 'h4')
    title.textContent = i18n.t('content.feeds')
    div.append(title)

    container.append(div)

    const ul = document.createElement('ul')
    ul.classList.add('list-group', 'list-group-flush')

    state.feeds.forEach((feed) => {
      const li = document.createElement('li')
      li.classList.add('list-group-item', 'border-0')

      const feedTitle = document.createElement('h3')
      feedTitle.classList.add('h6', 'm-0')
      feedTitle.textContent = feed.title

      const subtitle = document.createElement('p')
      subtitle.classList.add('m-0', 'small', 'text-black-50')
      subtitle.textContent = feed.description

      li.append(feedTitle, subtitle)
      ul.append(li)
    })

    container.append(ul)
    feeds.append(container)
  }

  const watchedState = onChange(state, (path, value) => {
    console.log('State changed:', path, value)

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
      case 'UI.currentPostId':
        if (value) {
          console.log('Opening modal for post ID:', value)
          renderModal()
        }
        break
      case 'UI.viewedPosts':
        renderPosts()
        break
      default:
        break
    }
  })

  handleFeedback()
  renderPosts()
  renderFeeds()

  return watchedState
}
