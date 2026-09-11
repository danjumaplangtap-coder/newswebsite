// api.js 
const BASE_URL = "https://lamzytechnewsapi.onrender.com"; 
  
/** 
 * Generic helper for calling the LamzyTech News API. 
 * @param {string} endpoint - e.g. "/api/posts" 
 * @param {object} options - fetch options (method, body, etc.) 
 * @param {boolean} authRequired - whether to attach the saved JWT 
 */ 
 
async function apiRequest(endpoint, options = {}, authRequired = false) { 
  const headers = { 
    "Content-Type": "application/json", 
    ...options.headers, 
  }; 
  
  if (authRequired) { 
    const token = localStorage.getItem("token"); 
    if (!token) { 
      throw new Error("You must be logged in to do this."); 
    } 
    headers["Authorization"] = `Bearer ${token}`; 
  } 
  
  const response = await fetch(`${BASE_URL}${endpoint}`, { 
    ...options, 
    headers, 
  }); 
  
  const result = await response.json(); 
  
  if (!result.success) { 
    // The API always explains what went wrong in `message` 
    throw new Error(result.message || "Something went wrong."); 
  } 
  
  return result.data; 
}