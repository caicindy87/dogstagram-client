document.addEventListener("DOMContentLoaded", () => {
  checkExistingDog();
  fetchPosts();
  createDog();
  createPost();
  listenToLikeBtn();
  listenToCommentSubmit();
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
  const partOne = `<div class="container-fluid">
  <div class="post-card">
    <div class="title-section">
      <span class="title">${postInfo.dog.name}</span>
      <button class="edit-button">Edit</button>
    </div>
    <img src="${postInfo.image_url}" alt="" class="image" />
    <button class="like-button" data-id="${postInfo.id}">♥</button>
    <p class="likes" id="${postInfo.id}">${postInfo.likes} Likes</p>
    <p class="caption">${postInfo.caption}</p>
    <p id="comments-title">Comments</p>`;

  let partTwo = `<ul class="comments" data-comment-post-id="${postInfo.id}">`;
  postInfo.comments.forEach((comment) => {
    partTwo += `<li>${comment.content}</li>`;
  });

  const partThree = `</ul>
  <form class="comment-form" data-form-id="${postInfo.id}">
    <input
      class="comment-input"
      type="text"
      name="comment"
      placeholder="Add a comment..."
      data-input-id="${postInfo.id}"
    />
    <button class="comment-button" type="submit">
      Post
    </button>
  </form>
</div>
</div>`;
  return partOne + partTwo + partThree;
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

function listenToCommentSubmit() {
  const card = document.getElementsByTagName("main")[0];

  card.addEventListener("submit", (event) => {
    event.preventDefault();

    if (event.target.className === "comment-form") {
      const commentInputValue = event.target.getElementsByClassName(
        "comment-input"
      )[0].value;
      const postId = parseInt(
        event.target.getElementsByClassName("comment-input")[0].dataset.inputId
      );

      fetch("http://localhost:3000/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: commentInputValue,
          post_id: postId,
        }),
      })
        .then((resp) => resp.json())
        .then((comment) => appendComment(comment));
    }
  });
}

function appendComment(json) {
  const postId = json.post.id;
  const ul = document.querySelector(`[data-comment-post-id='${postId}']`);
  const commentForm = document.querySelector(`[data-form-id='${postId}']`);
  const li = document.createElement("li");
  li.innerText = json.content;
  ul.append(li);
  commentForm.reset();
}

function createDog() {
  const dogForm = document.querySelector(".dog-form");
  const dogName = document.getElementById("dog-name-input");
  const dogBreed = document.getElementById("dog-breed-input");

  dogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    fetch("http://localhost:3000/api/v1/dogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: dogName.value,
        breed: dogBreed.value,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        localStorage.setItem("dog_id", data.id);
      });
    dogForm.reset();
  });
}

function createPost() {
  const card = document.getElementsByTagName("main")[0];
  const postForm = document.querySelector(".post-creation-form");
  const captionInput = document.getElementById("caption-input");
  const imageInput = document.getElementById("image-url-input");
  const dogId = localStorage.getItem("dog_id");

  postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    fetch(`http://localhost:3000/api/v1/dogs/${dogId}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: captionInput.value,
        image_url: imageInput.value,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        card.innerHTML += renderSinglePost(data);
      })
      .catch((err) => console.log(err.message));
  });
}

function checkExistingDog() {
  const dogFormContainer = document.querySelector(".dog-creation-form");
  const postForm = document.querySelector(".post-creation-form");
  let dogId = localStorage.getItem("dog_id");
  if (dogId) {
    dogFormContainer.style.display = "none";
    postForm.style.display = "block";
  } else {
    dogFormContainer.style.display = "block";
    postForm.style.display = "none";
  }
}
