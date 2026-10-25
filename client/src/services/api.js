import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // Gemini generation can take 15-25s
});

/**
 * Initialize / Generate a new cyber-forensic case via Gemini
 * @param {string} premise
 * @param {'easy'|'medium'|'hard'} difficulty
 */
export async function createCase(premise, difficulty = 'medium') {
  const response = await apiClient.post('/cases', { premise, difficulty });
  return response.data;
}

/**
 * Fetch active case by ID (culprit and solution hidden)
 * @param {string} id
 */
export async function getCase(id) {
  const response = await apiClient.get(`/cases/${id}`);
  return response.data;
}

/**
 * Fetch case archive / history
 */
export async function getAllCases() {
  const response = await apiClient.get('/cases');
  return response.data;
}

/**
 * Mark a forensic clue as discovered (+5 pts)
 * @param {string} caseId
 * @param {string} clueId
 */
export async function discoverClue(caseId, clueId) {
  const response = await apiClient.post(`/cases/${caseId}/clues/${clueId}/discover`);
  return response.data;
}

/**
 * Request decryption of next progressive hint (-10 pts)
 * @param {string} caseId
 */
export async function requestHint(caseId) {
  const response = await apiClient.post(`/cases/${caseId}/hints`);
  return response.data;
}

/**
 * Submit formal indictment / accusation against a prime suspect
 * @param {string} caseId
 * @param {string} suspectId
 * @param {string} reason
 */
export async function submitAccusation(caseId, suspectId, reason) {
  const response = await apiClient.post(`/cases/${caseId}/accuse`, {
    accusedSuspectId: suspectId,
    reason,
  });
  return response.data;
}

/**
 * Fetch full debrief and revealed culprit explanation after conclusion
 * @param {string} caseId
 */
export async function getCaseResult(caseId) {
  const response = await apiClient.get(`/cases/${caseId}/result`);
  return response.data;
}

export default apiClient;
