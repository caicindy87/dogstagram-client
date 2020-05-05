document.addEventListener("DOMContentLoaded", () => {
  fetchPosts();
  listenToLikeBtn();
});

function fetchPosts() {
  fetch("http://localhost:3000/api/v1/posts")
    .then((resp) => resp.json())
    .then((posts) => renderPosts(posts));
}

function renderPosts(posts) {
  const card = document.getElementsByTagName("main")[0];
  posts.reverse().forEach((post) => {
    card.innerHTML += renderSinglePost(post);
  });
}

function renderSinglePost(postInfo) {
  return `<div class="container-fluid">
    <div class="post-card">
      <div class="title-section">
        <span class="title">${postInfo.dog.name}</span>
        <button class="edit-button">Edit</button>
      </div>
      <img src="${postInfo.image_url}" alt="" class="image" />
      <button class="like-button" data-id="${postInfo.id}">♥</button>
      <p class="likes" id="${postInfo.id}">${postInfo.likes} Likes</p>
      <p class="caption">${postInfo.caption}</p>
      <ul class="comments">
      </ul>
      <form class="comment-form">
        <input
          class="comment-input"
          type="text"
          name="comment"
          placeholder="Add a comment..."
        />
        <button class="comment-button" type="submit">
          Post
        </button>
      </form>
    </div>
  </div>`;
}

function listenToLikeBtn() {
  const card = document.getElementsByTagName("main")[0];
  card.addEventListener("click", (event) => {
    if (event.target.className === "like-button") {
      const postId = event.target.dataset.id;
      const getPostLikes = document.getElementById(`${postId}`);
      let currentLikes = parseInt(getPostLikes.innerText.split(" ")[0]);
      currentLikes += 1;
      getPostLikes.innerText = `${currentLikes} Likes`;
      fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          likes: currentLikes,
        }),
      });
    }
  });
}
