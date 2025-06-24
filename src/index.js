const BASE_URL = "http://localhost:3000/posts";
let currentPostId = null;

function main() {
  displayPosts();
  addNewPostListener();
  addEditFormListener();
}

function displayPosts() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(posts => {
      const list = document.getElementById("post-list");
      list.innerHTML = "";

      posts.forEach(post => {
        const div = document.createElement("div");
        div.textContent = post.title;
        div.classList.add("post-title");
        div.addEventListener("click", () => handlePostClick(post.id));
        list.appendChild(div);
      });

      // Auto-load the first post only if currentPostId is null
      if (posts.length > 0 && !currentPostId) {
        handlePostClick(posts[0].id);
      }

      if (posts.length === 0) {
        document.getElementById("post-detail").innerHTML = "<h2>No posts available</h2>";
      }
    });
}

function handlePostClick(id) {
  fetch(`${BASE_URL}/${id}`)
    .then(res => res.json())
    .then(post => {
      currentPostId = post.id;
      const detail = document.getElementById("post-detail");
      detail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <img 
          src="${post.image || 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80'}"
          alt="${post.title}" 
          style="max-width:100%; border-radius:10px; margin:10px 0;"
          onerror="this.src='https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80';"
        >
        <p>${post.content}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
      `;
      document.getElementById("edit-btn").addEventListener("click", () => showEditForm(post));
      document.getElementById("delete-btn").addEventListener("click", handleDelete);
    });
}

function addNewPostListener() {
  const form = document.getElementById("new-post-form");
  form.addEventListener("submit", e => {
    e.preventDefault();

    const newPost = {
      title: form.title.value.trim(),
      content: form.content.value.trim(),
      author: form.author.value.trim(),
      image: form.image.value.trim()
    };

    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })
      .then(res => res.json())
      .then(() => {
        form.reset();
        currentPostId = null;
        displayPosts();
      });
  });
}

function showEditForm(post) {
  const form = document.getElementById("edit-post-form");
  form.classList.remove("hidden");
  form["edit-title"].value = post.title;
  form["edit-content"].value = post.content;
  form["edit-image"].value = post.image || "";
}

function addEditFormListener() {
  const form = document.getElementById("edit-post-form");
  form.addEventListener("submit", e => {
    e.preventDefault();

    const updated = {
      title: form["edit-title"].value.trim(),
      content: form["edit-content"].value.trim(),
      image: form["edit-image"].value.trim()
    };

    fetch(`${BASE_URL}/${currentPostId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })
      .then(res => res.json())
      .then(() => {
        form.classList.add("hidden");
        displayPosts();
        handlePostClick(currentPostId);
      });
  });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    form.classList.add("hidden");
  });
}

function handleDelete() {
  if (!currentPostId) return;

  fetch(`${BASE_URL}/${currentPostId}`, {
    method: "DELETE"
  })
    .then(() => {
      currentPostId = null; // Clear the current post ID
      document.getElementById("post-detail").innerHTML = "<h2>Select a post</h2>";
      displayPosts();
    })
    .catch(error => {
      console.error("Failed to delete post:", error);
    });
}

document.addEventListener("DOMContentLoaded", main);
