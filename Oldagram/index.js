import { posts } from "./data";
import { v4 as uuidv4 } from "uuid"

const mainEl = document.querySelector("#main")

const getArticles = () => {
    let articles = ""

    for (let post of posts) {
        articles += `
            <section class="author">
                <img id="post-author-avatar" class="avatar" src="${post.avatar}"
                    alt="The profile picture of the post author">
                <div class="author-details">
                    <h1 id="post-author-name">${post.name}</h1>
                    <p id="post-author-location">${post.location}</p>
                </div>
            </section>
    
            <section class="post-image-container">
                <img id="post-image" class="post-image" src="${post.post}"
                    alt="An image uploaded by the post author">
            </section>
    
            <section class="container">
                <div class="post-icons-container">
                    <i class="${post.isLiked ? "fa-solid" : "fa-regular"} fa-heart ${post.isLiked ? "liked" : ""}" data-like="${post.uuid}"></i>
                    <i class="fa-regular fa-comment-dots" data-comment="${post.uuid}"></i>
                    <i class="fa-duotone fa-regular fa-paper-plane"></i>
                </div>
                <h1 id="likes-count">${post.likes} likes</h1>
                <div id="comments-${post.uuid}" class="${post.isShown || "hidden"} comments">
                    <p><span>${post.username}</span> ${post.comment}</p>
                </div>
            </section>
        `
    }

    return articles
}

const render = () => {
    mainEl.innerHTML = getArticles()
}

render()

document.addEventListener("click", (e) => {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    }
    else if (e.target.dataset.comment) {
        handleCommentClick(e.target.dataset.comment)
    }
})

const handleLikeClick = (postId) => {
    const postObject = posts.filter((post) => { return postId === post.uuid })[0]
    postObject.isLiked ? postObject.likes-- : postObject.likes++
    postObject.isLiked = !postObject.isLiked
    render()
}

const handleCommentClick = (postId) => {
    const postObject = posts.filter((post) => { return postId === post.uuid })[0]
    postObject.isShown = !postObject.isShown
    render()
}
