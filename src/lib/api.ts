const API_BASE = '/sporttracker/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const tokenParam = token ? `token=${encodeURIComponent(token)}` : '';
    const url = `${API_BASE}/${path}${tokenParam ? `?${tokenParam}` : ''}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        error: body?.error ?? `HTTP ${res.status}`,
        status: res.status,
      };
    }

    const data = await res.json();
    return { data, status: res.status };
  } catch {
    return { error: 'Network error' };
  }
}

export async function fetchTrainings(token: string) {
  return apiFetch<{
    history: import('./types').CompletedTraining[];
    customExercises: string[];
  }>('trainings.php', token);
}

export async function saveTraining(
  token: string,
  training: import('./types').CompletedTraining,
) {
  return apiFetch<{ history: import('./types').CompletedTraining[] }>(
    'trainings.php',
    token,
    {
      method: 'POST',
      body: JSON.stringify(training),
    },
  );
}

export async function deleteTraining(token: string, trainingId: string) {
  return apiFetch<{ history: import('./types').CompletedTraining[] }>(
    'trainings.php',
    token,
    {
      method: 'DELETE',
      body: JSON.stringify({ id: trainingId }),
    },
  );
}

export async function registerUser(login: string, password: string) {
  return apiFetch<{ token: string; login: string }>('register.php', null, {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  });
}

export async function loginUser(login: string, password: string) {
  return apiFetch<{ token: string; login: string }>('login.php', null, {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  });
}

export async function fetchCustomExercises(token: string) {
  return apiFetch<{ customExercises: string[] }>(
    'custom-exercises.php',
    token,
  );
}

export async function addCustomExercise(token: string, name: string) {
  return apiFetch<{ ok: boolean }>('custom-exercises.php', token, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function fetchOneRm(token: string) {
  return apiFetch<{ oneRm: import('./types').OneRmEntry[] }>('one-rm.php', token);
}

export async function saveOneRm(
  token: string,
  exerciseName: string,
  oneRm: number,
) {
  return apiFetch<{ oneRm: import('./types').OneRmEntry[] }>('one-rm.php', token, {
    method: 'POST',
    body: JSON.stringify({ exerciseName, oneRm }),
  });
}

export async function deleteOneRm(token: string, id: string) {
  return apiFetch<{ oneRm: import('./types').OneRmEntry[] }>('one-rm.php', token, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}
