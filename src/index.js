document.addEventListener("DOMContentLoaded", () => {
  checkWindowSize();
  listenToWindowResize();
  listenToSignOutBtn();
  checkExistingDog();
  fetchPosts();
  createDog();
  createPost();
  listenToLikeBtn();
  listenToCommentSubmit();
  listenToEditBtn();
  callDogPosts();
  filterDogs();
});

let addDog = false;

function checkWindowSize() {
  const h1 = document.querySelector("h1");
  const headerTag = document.querySelector("header");
  if (document.documentElement.clientWidth < 1090) {
    h1.style.display = "none";
    headerTag.style.justifyContent = "center";
  }
}

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

function renderPost(postInfo) {
  const firstSection = `<div class="container-fluid">
  <div class="post-card">
    <div class="title-section">
      <span class="title">${postInfo.dog.name}</span>
      <button class="edit-button">Edit</button>
    </div>
    <img src="${postInfo.image_url}" alt="" class="image" />
    <button class="like-button" data-post-id="${postInfo.id}" data-dog-id="${postInfo.dog.id}">♥</button>
    <p class="likes" id="${postInfo.id}">${postInfo.likes} Likes</p>
    <p class="caption">${postInfo.caption}</p>
    <p id="comments-title">Comments</p>`;

  let commentsSection = `<ul class="comments" data-comment-post-id="${postInfo.id}">`;

  postInfo.comments.forEach((comment) => {
    commentsSection += `<li>${comment.content}</li>`;
  });

  return firstSection + commentsSection;
}

function callDogPosts() {
  const profileBtn = document.getElementById("my-profile");
  let modalBody = document.querySelector(".modal-body");

  profileBtn.addEventListener("click", (e) => {
    modalBody.innerHTML = "These are your posts!";
    renderPostOnModal();
  });
}

function renderPostsModal(posts) {
  let modalBody = document.querySelector(".modal-body");
  posts.reverse().forEach((post) => {
    modalBody.innerHTML += renderPost(post);
  });
}

function renderPostOnModal() {
  const modalTitle = document.querySelector(".modal-title");
  const dogId = localStorage.getItem("dog_id");

  fetch(`http://localhost:3000/api/v1/dogs/${dogId}/posts`)
    .then((resp) => resp.json())
    .then((data) => {
      modalTitle.innerText = `${data[0].dog.name}'s profile`;
      renderPostsModal(data);
    });
}

function renderSinglePost(postInfo) {
  const breed = postInfo.dog.breed.toLowerCase();
  const partOne = `<div class="container-fluid" data-breed="${breed}">
  <div class="post-card">
    <div class="title-section">
      <span class="title">${postInfo.dog.name} - ${postInfo.dog.breed}</span>
    </div>
    <img src="${postInfo.image_url}" alt="" class="image" />
    <button class="like-button" data-post-id="${postInfo.id}" data-dog-id="${postInfo.dog.id}">♥</button>
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
      const postId = event.target.dataset.postId;
      const dogId = event.target.dataset.dogId;
      const getPostLikes = document.getElementById(`${postId}`);
      let currentLikes = parseInt(getPostLikes.innerText.split(" ")[0]);
      currentLikes += 1;
      getPostLikes.innerText = `${currentLikes} Likes`;
      fetch(`http://localhost:3000/api/v1/dogs/${dogId}/posts/${postId}`, {
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

      fetch(`http://localhost:3000/api/v1/posts/${postId}/comments`, {
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
        localStorage.setItem("dog_id", data.id);
        dogName.value = "";
        dogBreed.value = "";
        location.href = "index.html";
      });
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
        captionInput.value = "";
        imageInput.value = "";
        location.href = "index.html";
      })
      .catch((err) => console.log(err.message));
  });
}

function toggleDogForm() {
  const addBtn = document.querySelector("#new-dog-btn");
  const dogFormContainer = document.querySelector(".dog-creation-form");

  addBtn.addEventListener("click", () => {
    addDog = !addDog;
    if (addDog) {
      dogFormContainer.style.display = "inline-block";
    } else {
      dogFormContainer.style.display = "none";
    }
  });
}

function togglePostForm() {
  const addBtn = document.querySelector("#new-dog-btn");
  const postFormContainer = document.querySelector(".post-creation-form");

  addBtn.addEventListener("click", () => {
    addDog = !addDog;
    if (addDog) {
      postFormContainer.style.display = "none";
    } else {
      postFormContainer.style.display = "inline-block";
    }
  });
}

function checkExistingDog() {
  const dogFormContainer = document.querySelector(".dog-creation-form");
  const postForm = document.querySelector(".post-creation-form");
  const profileBtn = document.getElementById("my-profile");
  const signOutBtn = document.getElementById("sign-out-button");

  let dogId = localStorage.getItem("dog_id");

  if (dogId) {
    togglePostForm();
    dogFormContainer.style.display = "none";
    profileBtn.style.display = "block";
    signOutBtn.style.display = "flex";
  } else {
    toggleDogForm();
    postForm.style.display = "none";
    dogFormContainer.style.display = "none";
    profileBtn.style.display = "none";
    signOutBtn.style.display = "none";
  }
}

function filterDogs() {
  const input = document.getElementById("filter");
  input.addEventListener("input", (event) => {
    filter(input.value.toLowerCase());
    function filter(e) {
      var regex = new RegExp("\\b\\w*" + e + "\\w*\\b");
      $(".container-fluid")
        .hide()
        .filter(function () {
          return regex.test($(this).data("breed"));
        })
        .show();
    }
  });
}

function listenToEditBtn(postData) {
  const modalBody = document.querySelector(".modal-body");
  modalBody.addEventListener("click", (event) => {
    if (event.target.className === "edit-button") {
      const parentElement = event.target.parentElement.parentElement;

      const caption = event.target.parentElement.parentElement.getElementsByClassName(
        "caption"
      )[0];
      const captionInnerText = caption.innerText;
      const postId = parseInt(
        event.target.parentElement.parentElement.getElementsByClassName(
          "like-button"
        )[0].dataset.postId
      );
      const dogId = parseInt(
        event.target.parentElement.parentElement.getElementsByClassName(
          "like-button"
        )[0].dataset.dogId
      );
      const editForm = document.createElement("form");
      const editCaptionInputField = document.createElement("input");
      const editSubmitBtn = document.createElement("button");

      editForm.id = "edit-caption-form";
      editSubmitBtn.type = "submit";
      editSubmitBtn.innerText = "Update";
      editSubmitBtn.id = "edit-caption-submit-button";
      editCaptionInputField.id = "edit-caption-field";
      editCaptionInputField.type = "text";
      editCaptionInputField.value = captionInnerText;

      editForm.append(editCaptionInputField, editSubmitBtn);

      parentElement.replaceChild(editForm, caption);

      listenToEditSubmit(dogId, postId, parentElement, caption);
    }
  });
}

function listenToEditSubmit(dogId, postId, parentElement, caption) {
  const editForm = document.getElementById("edit-caption-form");
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const editCaptionField = document.getElementById("edit-caption-field");

    fetch(`http://localhost:3000/api/v1/dogs/${dogId}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: editCaptionField.value,
      }),
    })
      .then((resp) => resp.json())
      .then((post) => {
        console.log(post);
        caption.innerText = post.caption;
        parentElement.replaceChild(caption, editForm);
      });
  });
}

function listenToWindowResize() {
  const h1 = document.querySelector("h1");
  const headerTag = document.querySelector("header");

  window.addEventListener("resize", () => {
    if (document.documentElement.clientWidth < 1265) {
      h1.style.display = "none";
      headerTag.style.justifyContent = "center";
    } else {
      h1.style.display = "block";
      headerTag.style.justifyContent = "flex-end";
    }
  });
}

function listenToSignOutBtn() {
  const signOutBtn = document.getElementById("sign-out-button");
  signOutBtn.addEventListener("click", () => {
    localStorage.clear();
    location.href = "index.html";
  });
}
