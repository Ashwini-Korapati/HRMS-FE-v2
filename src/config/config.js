export const serverURL = 'http://localhost:5000/api';
// export const serverURL = 'https://hrmstest.nmitsls.com:5000/api'

// Derive the server origin (without the /api suffix) for serving static files like uploads
export const serverOrigin = (() => {
	try {
		// If serverURL already includes protocol/host, strip trailing /api
		return serverURL.replace(/\/?api\/?$/, '')
	} catch {
		return serverURL
	}
})()

// Build a full URL for assets (e.g., avatar paths) returned as relative paths like /uploads/avatars/...
export function toAssetUrl(path) {
	if (!path) return ''
	const s = String(path)
	// Pass-through absolute or data/blob URLs
	if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) return s
	// Normalize accidental /api prefix in asset paths
	let normalized = s
	if (normalized.startsWith('/api/')) normalized = normalized.replace(/^\/api\//, '/')
	if (normalized.startsWith('api/')) normalized = normalized.replace(/^api\//, '')
	// Absolute URL to server origin (without /api)
	if (normalized.startsWith('/')) return `${serverOrigin}${normalized}`
	return `${serverOrigin}/${normalized}`
}

// Optional global defaults (can be extended later)
export const httpDefaults = {
	timeout: 30000,
	defaultHeaders: { 'Content-Type': 'application/json' }
};
