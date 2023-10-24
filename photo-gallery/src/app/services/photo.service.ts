import { JsonPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  constructor() {}

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const saveImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(saveImageFile);

    this.photos.unshift({
      filepath: 'soon...',
      webviewPath: capturedPhoto.webPath!,
    });
    // key value store
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }

  private async savePicture(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + '.jpeg';
    const saveFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  }

  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    for (let photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  private async readAsBase64(photo: Photo) {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return (await this.convertBlobToBase64(blob)) as string;
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
