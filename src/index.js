document.addEventListener("DOMContentLoaded", () => {
  fetchPosts();
});

function fetchPosts() {
  fetch("http://localhost:3000/api/v1/posts")
    .then((resp) => resp.json())
    .then((posts) => renderPosts(posts));
}

function renderPosts(posts) {
  console.log(posts);
  const card = document.getElementsByTagName("main")[0];
  posts.forEach((post) => {
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
      <button class="like-button">♥</button>
      <p class="likes">${postInfo.likes} Likes</p>
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
