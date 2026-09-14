const BASE_URL = "https://lamzytechnewsapi.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

function saveSession(data) {
  if (data && data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data && data.student) {
    localStorage.setItem("student", JSON.stringify(data.student));
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("student");
}

async function apiRequest(endpoint, options = {}, authRequired = false) {
  const headers = { Accept: "application/json", ...options.headers };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();

  if (authRequired) {
    if (!token) {
      throw new Error("You must be logged in to do this.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  } catch (error) {
    throw new Error("Unable to reach the API. Check your connection and try again.");
  }

  const responseText = await response.text();
  let result = {};
  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`The API returned an invalid response (${response.status}).`);
    }
  }

  if (!response.ok || result.success === false) {
    if (response.status === 401) {
      clearSession();
    }
    throw new Error(result.message || `Request failed (${response.status}).`);
  }

  return result.data;
}

async function getPosts() {
  const data = await apiRequest("/api/posts");
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  return data.content || data.posts || data.items || data.data?.content || data.data?.posts || [];
}

async function getPost(postId) {
  try {
    const data = await apiRequest(`/api/posts/${encodeURIComponent(postId)}`);
    return data?.post || data?.item || data?.data || data;
  } catch (error) {
    const postFromList = (await getPosts()).find((post) => String(post.id ?? post._id ?? post.postId) === String(postId));
    if (postFromList) return postFromList;
    throw error;
  }
}

async function createPost(post) {
  return apiRequest("/api/posts", {
    method: "POST",
    body: JSON.stringify(post),
  }, true);
}

async function updatePost(postId, post) {
  return apiRequest(`/api/posts/${encodeURIComponent(postId)}`, {
    method: "PUT",
    body: JSON.stringify(post),
  }, true);
}

async function deletePost(postId) {
  return apiRequest(`/api/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
  }, true);
}