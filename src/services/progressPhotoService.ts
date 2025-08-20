const API_BASE_URL = 'https://sweat93laravel.obs.com.gr/api/v1';

export interface ProgressPhoto {
  id: number;
  imageUrl: string;
  date: string;
  caption?: string;
}

export interface UploadResponse {
  message: string;
  photos: ProgressPhoto[];
}

class ProgressPhotoService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  }

  async getPhotos(): Promise<ProgressPhoto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/progress-photos`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress photos');
      }

      const data = await response.json();
      return data; // Backend returns array directly
    } catch (error) {
      console.error('Error fetching progress photos:', error);
      throw error;
    }
  }

  async uploadPhotos(files: File[], caption?: string): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      
      // Add all files to the form data
      files.forEach((file) => {
        formData.append('photos[]', file);
      });

      // Add caption if provided
      if (caption && caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const response = await fetch(`${API_BASE_URL}/progress-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          // Don't set Content-Type, let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors
        if (response.status === 422 && errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : errorData.message);
        }
        
        throw new Error(errorData.message || 'Failed to upload photos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  }

  async deletePhoto(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/progress-photos/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Backend returns {message: "..."} with status 200
      await response.json();
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  // Validation helpers
  validateFile(file: File): string | null {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'Μόνο αρχεία JPG, JPEG και PNG επιτρέπονται';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'Το αρχείο δεν πρέπει να ξεπερνά τα 5MB';
    }

    return null;
  }

  validateFiles(files: File[]): string[] {
    const errors: string[] = [];
    
    files.forEach((file, index) => {
      const error = this.validateFile(file);
      if (error) {
        errors.push(`Αρχείο ${index + 1}: ${error}`);
      }
    });

    return errors;
  }
}

export const progressPhotoService = new ProgressPhotoService();