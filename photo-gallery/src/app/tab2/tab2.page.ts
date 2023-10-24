import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { Preferences } from '@capacitor/preferences';
import { async } from 'rxjs';
// import { publicDecrypt } from 'crypto';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  constructor(public photoService: PhotoService) {}

  async ngOnInit() {
    await this.photoService.loadSaved();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}
