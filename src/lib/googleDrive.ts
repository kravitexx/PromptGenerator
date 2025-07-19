import { DriveData, DriveError, ChatMessage, CustomFormat, UserPreferences } from '@/types';

// Google Drive API configuration
const DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const APP_DATA_FOLDER = 'appDataFolder';

// File names for different data types
const DATA_FILES = {
  CHATS: 'prompt_generator_chats.json',
  CUSTOM_FORMATS: 'prompt_generator_formats.json',
  USER_PREFERENCES: 'prompt_generator_preferences.json'
} as const;

/**
 * Gets the Google Drive access token from the current session
 */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from Clerk first
  try {
    // Import Clerk dynamically to avoid SSR issues
    const { useAuth } = await import('@clerk/nextjs');
    
    // This would be called from a component context where useAuth is available
    // For now, we'll check sessionStorage as a fallback
    const storedToken = sessionStorage.getItem('google_drive_token');
    if (storedToken) {
      return storedToken;
    }
    
    // If no stored token, we need to request Google Drive permissions
    return null;
  } catch (error) {
    console.warn('Failed to get Google Drive token from Clerk:', error);
    return sessionStorage.getItem('google_drive_token') || null;
  }
}

/**
 * Makes an authenticated request to the Google Drive API
 */
async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  
  if (!token) {
    throw new DriveError('NO_TOKEN', 'No Google Drive access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new DriveError('UNAUTHORIZED', 'Google Drive access token expired or invalid');
    } else if (response.status === 403) {
      throw new DriveError('FORBIDDEN', 'Insufficient permissions for Google Drive');
    } else if (response.status === 404) {
      throw new DriveError('NOT_FOUND', 'File not found in Google Drive');
    } else {
      throw new DriveError(
        'API_ERROR',
        errorData.error?.message || `Google Drive API error: ${response.status}`,
        errorData
      );
    }
  }

  return response;
}

/**
 * Finds a file in the AppDataFolder by name
 */
async function findFileByName(fileName: string): Promise<string | null> {
  try {
    const query = `name='${fileName}' and parents in '${APP_DATA_FOLDER}' and trashed=false`;
    const url = `${DRIVE_API_BASE_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
    
    const response = await makeAuthenticatedRequest(url);
    const data = await response.json();
    
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding file ${fileName}:`, error);
    return null;
  }
}

/**
 * Creates a new file in the AppDataFolder
 */
async function createFile(fileName: string, content: string): Promise<string> {
  const metadata = {
    name: fileName,
    parents: [APP_DATA_FOLDER],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('media', new Blob([content], { type: 'application/json' }));

  const token = await getAccessToken();
  const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new DriveError(
      'CREATE_ERROR',
      errorData.error?.message || 'Failed to create file in Google Drive',
      errorData
    );
  }

  const data = await response.json();
  return data.id;
}

/**
 * Updates an existing file in Google Drive
 */
async function updateFile(fileId: string, content: string): Promise<void> {
  const token = await getAccessToken();
  const response = await fetch(`${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: content,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new DriveError(
      'UPDATE_ERROR',
      errorData.error?.message || 'Failed to update file in Google Drive',
      errorData
    );
  }
}

/**
 * Reads the content of a file from Google Drive
 */
async function readFile(fileId: string): Promise<string> {
  const response = await makeAuthenticatedRequest(
    `${DRIVE_API_BASE_URL}/files/${fileId}?alt=media`
  );
  
  return await response.text();
}

/**
 * Saves or updates a file in Google Drive
 */
async function saveFile(fileName: string, content: string): Promise<void> {
  try {
    const existingFileId = await findFileByName(fileName);
    
    if (existingFileId) {
      await updateFile(existingFileId, content);
    } else {
      await createFile(fileName, content);
    }
  } catch (error) {
    if (error instanceof DriveError) {
      throw error;
    }
    throw new DriveError(
      'SAVE_ERROR',
      `Failed to save ${fileName} to Google Drive`,
      error as unknown
    );
  }
}

/**
 * Loads a file from Google Drive
 */
async function loadFile(fileName: string): Promise<string | null> {
  try {
    const fileId = await findFileByName(fileName);
    
    if (!fileId) {
      return null; // File doesn't exist yet
    }
    
    return await readFile(fileId);
  } catch (error) {
    if (error instanceof DriveError && error.code === 'NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

/**
 * Saves chat messages to Google Drive
 */
export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  const content = JSON.stringify({
    messages,
    lastUpdated: new Date().toISOString(),
    version: 1
  }, null, 2);
  
  await saveFile(DATA_FILES.CHATS, content);
}

/**
 * Loads chat messages from Google Drive
 */
export async function loadChatMessages(): Promise<ChatMessage[]> {
  try {
    const content = await loadFile(DATA_FILES.CHATS);
    
    if (!content) {
      return []; // No saved chats yet
    }
    
    const data = JSON.parse(content);
    
    // Validate and transform the data
    if (data.messages && Array.isArray(data.messages)) {
      return data.messages.map((msg: unknown) => ({
        ...(msg as Record<string, unknown>),
        timestamp: new Date((msg as { timestamp: string }).timestamp)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
}

/**
 * Saves custom formats to Google Drive
 */
export async function saveCustomFormats(formats: CustomFormat[]): Promise<void> {
  const content = JSON.stringify({
    formats,
    lastUpdated: new Date().toISOString(),
    version: 1
  }, null, 2);
  
  await saveFile(DATA_FILES.CUSTOM_FORMATS, content);
}

/**
 * Loads custom formats from Google Drive
 */
export async function loadCustomFormats(): Promise<CustomFormat[]> {
  try {
    const content = await loadFile(DATA_FILES.CUSTOM_FORMATS);
    
    if (!content) {
      return []; // No saved formats yet
    }
    
    const data = JSON.parse(content);
    
    if (data.formats && Array.isArray(data.formats)) {
      return data.formats;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading custom formats:', error);
    return [];
  }
}

/**
 * Saves user preferences to Google Drive
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  const content = JSON.stringify({
    preferences,
    lastUpdated: new Date().toISOString(),
    version: 1
  }, null, 2);
  
  await saveFile(DATA_FILES.USER_PREFERENCES, content);
}

/**
 * Loads user preferences from Google Drive
 */
export async function loadUserPreferences(): Promise<UserPreferences | null> {
  try {
    const content = await loadFile(DATA_FILES.USER_PREFERENCES);
    
    if (!content) {
      return null; // No saved preferences yet
    }
    
    const data = JSON.parse(content);
    
    if (data.preferences) {
      return data.preferences;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
}

/**
 * Saves all user data to Google Drive
 */
export async function saveAllData(data: DriveData): Promise<void> {
  const savePromises = [];
  
  if (data.chats) {
    savePromises.push(saveChatMessages(data.chats));
  }
  
  if (data.customFormats) {
    savePromises.push(saveCustomFormats(data.customFormats));
  }
  
  if (data.userPreferences) {
    savePromises.push(saveUserPreferences(data.userPreferences));
  }
  
  await Promise.all(savePromises);
}

/**
 * Loads all user data from Google Drive
 */
export async function loadAllData(): Promise<DriveData> {
  const [chats, customFormats, userPreferences] = await Promise.all([
    loadChatMessages(),
    loadCustomFormats(),
    loadUserPreferences()
  ]);
  
  return {
    chats,
    customFormats,
    userPreferences: userPreferences || {
      defaultModel: 'stable-diffusion-3.5',
      customFormats: [],
      savedPrompts: []
    }
  };
}

/**
 * Checks if Google Drive is available and accessible
 */
export async function checkDriveAccess(): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    
    // Try to access the AppDataFolder
    const response = await makeAuthenticatedRequest(
      `${DRIVE_API_BASE_URL}/files?q=parents in '${APP_DATA_FOLDER}'&pageSize=1`
    );
    
    return response.ok;
  } catch (error) {
    console.error('Drive access check failed:', error);
    return false;
  }
}

/**
 * Gets Drive storage usage information
 */
export async function getDriveStorageInfo(): Promise<{
  used: number;
  limit: number;
  available: number;
} | null> {
  try {
    const response = await makeAuthenticatedRequest(
      `${DRIVE_API_BASE_URL}/about?fields=storageQuota`
    );
    
    const data = await response.json();
    
    if (data.storageQuota) {
      const used = parseInt(data.storageQuota.usage || '0');
      const limit = parseInt(data.storageQuota.limit || '0');
      
      return {
        used,
        limit,
        available: limit - used
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}

/**
 * Clears all app data from Google Drive (with confirmation)
 */
export async function clearAllDriveData(): Promise<void> {
  const fileNames = Object.values(DATA_FILES);
  
  for (const fileName of fileNames) {
    try {
      const fileId = await findFileByName(fileName);
      if (fileId) {
        await makeAuthenticatedRequest(
          `${DRIVE_API_BASE_URL}/files/${fileId}`,
          { method: 'DELETE' }
        );
      }
    } catch (error) {
      console.error(`Error deleting ${fileName}:`, error);
      // Continue with other files even if one fails
    }
  }
}

/**
 * Creates a backup of all data
 */
export async function createBackup(): Promise<string> {
  const data = await loadAllData();
  const backup = {
    ...data,
    backupDate: new Date().toISOString(),
    version: 1
  };
  
  const backupFileName = `backup_${Date.now()}.json`;
  const content = JSON.stringify(backup, null, 2);
  
  await saveFile(backupFileName, content);
  return backupFileName;
}

/**
 * Restores data from a backup file
 */
export async function restoreFromBackup(backupFileName: string): Promise<void> {
  const content = await loadFile(backupFileName);
  
  if (!content) {
    throw new DriveError('NOT_FOUND', 'Backup file not found');
  }
  
  const backup = JSON.parse(content);
  
  // Validate backup structure
  if (!backup.chats && !backup.customFormats && !backup.userPreferences) {
    throw new DriveError('INVALID_BACKUP', 'Invalid backup file format');
  }
  
  // Restore the data
  await saveAllData({
    chats: backup.chats || [],
    customFormats: backup.customFormats || [],
    userPreferences: backup.userPreferences || {
      defaultModel: 'stable-diffusion-3.5',
      customFormats: [],
      savedPrompts: []
    }
  });
}