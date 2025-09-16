import axios from 'axios';

// Your existing Axios instance setup
const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// --- API Functions for Events Hub ---

/**
 * Fetches events, with an optional filter for category.
 * @param {string} category - The category to filter by (e.g., "hackathons").
 * @returns {Promise} An axios promise for the request.
 */
export const getEvents = (category) => {
    let url = '/api/events';
    if (category && category !== 'all') {
        // Format the category for the backend (e.g., 'hackathons' -> 'Hackathon')
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1, -1);
        url += `?category=${formattedCategory}`;
    }
    return api.get(url);
};

/**
 * Creates a new team-finding post.
 * @param {object} postData - The data for the new post { eventId, description, extraSkills }.
 * @returns {Promise} An axios promise for the request.
 */
export const createTeamPost = (postData) => {
    return api.post('/api/posts/team-finding', postData);
};

/**
 * Fetches all team-finding posts for a specific event.
 * @param {string} eventId - The ID of the event.
 * @returns {Promise} An axios promise for the request.
 */
export const getPostsForEvent = (eventId) => {
    return api.get(`/api/posts/event/${eventId}`);
};

/**
 * Creates a new event.
 * @param {object} eventData - The data for the new event.
 * @returns {Promise} An axios promise for the request.
 */
export const createEvent = (eventData) => {
    return api.post('/api/events', eventData);
};


// Your existing default export
export default api;