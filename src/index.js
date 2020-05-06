document.addEventListener("DOMContentLoaded", () => {
  checkExistingDog();
  fetchPosts();
  createDog();
  createPost();
});

function fetchPosts() {
  fetch("http://localhost:3000/api/v1/posts")
    .then((resp) => resp.json())
    .then((posts) => renderPosts(posts));
}

function renderPosts(posts) {
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
