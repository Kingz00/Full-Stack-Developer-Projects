import { posts } from "./data";

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
                    <img id="like-icon-${post.id}" class="post-icons" src="./images/icon-heart.png" alt="An icon to like the post">
                    <img id="comment-icon-${post.id}" class="post-icons" src="./images/icon-comment.png"
                        alt="An icon to add a comment to the post">
                    <img id="dm-icon-${post.id}" class="post-icons" src="./images/icon-dm.png"
                        alt="An icon to send the user a direct message">
                </div>
                <h1 id="likes-count">${post.likes} likes</h1>
                <div>
                    <p id="comments" class="comments"><span>${post.username}</span> ${post.comment}</p>
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

// const postIconsContainer = document.querySelectorAll(".post-icons-container")
// for (let postIcon of postIconsContainer) {
//     postIcon.addEventListener("click", (e) => {

//         for (let post of posts) {
//             if (e.target.id === `like-icon-${post.id}`) {
//                 post = { ...post, likes: post.likes += 1 }
//                 // console.log(post)
//             }
//         }

//         console.log(posts)
//         // render()
//         // postIcon.removeEventListener("click", render())
//     })
// }
