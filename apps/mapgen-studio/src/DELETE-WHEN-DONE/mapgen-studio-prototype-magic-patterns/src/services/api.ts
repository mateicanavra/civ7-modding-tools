// ============================================================================
// API SERVICE
// ============================================================================
// API client for backend communication.
//
// Backend Engineers: This file defines the API contract.
// Implement these endpoints on your server:
//
// POST /api/generate     - Start a generation
// GET  /api/generate/:id - Get generation status/result
// GET  /api/presets      - List available presets
// POST /api/presets      - Save a new preset
// PUT  /api/presets/:id  - Update a preset
// DELETE /api/presets/:id - Delete a preset
// ============================================================================

import type {
  GenerateRequest,
  GenerateResponse,
  GenerationResult,
  SavePresetRequest,
  Preset } from
'../types';

// ============================================================================
// Configuration
// ============================================================================

/** Base URL for API requests. Override in production. */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** Default request timeout in milliseconds */
const REQUEST_TIMEOUT = 30000;

// ============================================================================
// HTTP Client
// ============================================================================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  timeout?: number;
}

async function request<T>(
endpoint: string,
options: RequestOptions = {})
: Promise<T> {
  const { method = 'GET', body, timeout = REQUEST_TIMEOUT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Error Handling
// ============================================================================

export class ApiError extends Error {
  constructor(
  public status: number,
  message: string)
  {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Generation API
// ============================================================================

/**
 * Start a new generation.
 *
 * Backend: This should queue the generation job and return immediately
 * with a job ID, or wait for completion if the generation is fast.
 */
export async function startGeneration(
request: GenerateRequest)
: Promise<GenerateResponse> {
  return request<GenerateResponse>('/generate', {
    method: 'POST',
    body: request
  });
}

/**
 * Get the status/result of a generation job.
 *
 * Backend: Return the current status. If complete, include the result.
 */
export async function getGenerationStatus(
jobId: string)
: Promise<GenerateResponse> {
  return request<GenerateResponse>(`/generate/${jobId}`);
}

/**
 * Poll for generation completion.
 * Useful for async generation jobs.
 */
export async function waitForGeneration(
jobId: string,
pollInterval = 1000,
maxAttempts = 60)
: Promise<GenerationResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await getGenerationStatus(jobId);

    if (response.status === 'ready' && response.result) {
      return response.result;
    }

    if (response.status === 'error') {
      throw new ApiError(500, response.result?.error || 'Generation failed');
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new ApiError(408, 'Generation timed out');
}

// ============================================================================
// Presets API
// ============================================================================

/**
 * List all available presets.
 */
export async function listPresets(): Promise<Preset[]> {
  return request<Preset[]>('/presets');
}

/**
 * Get a specific preset by ID.
 */
export async function getPreset(id: string): Promise<Preset> {
  return request<Preset>(`/presets/${id}`);
}

/**
 * Save a new preset.
 */
export async function savePreset(preset: SavePresetRequest): Promise<Preset> {
  return request<Preset>('/presets', {
    method: 'POST',
    body: preset
  });
}

/**
 * Update an existing preset.
 */
export async function updatePreset(
id: string,
preset: SavePresetRequest)
: Promise<Preset> {
  return request<Preset>(`/presets/${id}`, {
    method: 'PUT',
    body: preset
  });
}

/**
 * Delete a preset.
 */
export async function deletePreset(id: string): Promise<void> {
  await request(`/presets/${id}`, { method: 'DELETE' });
}

// ============================================================================
// Mock API (for development without backend)
// ============================================================================

/**
 * Mock implementation for development.
 * Replace API calls with these when backend is not available.
 */
export const mockApi = {
  async startGeneration(req: GenerateRequest): Promise<GenerateResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      jobId: `job_${Date.now()}`,
      status: 'ready',
      result: {
        id: `gen_${Date.now()}`,
        seed: req.recipeSettings.seed,
        completedAt: new Date().toISOString(),
        worldSettings: req.worldSettings
      }
    };
  },

  async listPresets(): Promise<Preset[]> {
    return [];
  }
};