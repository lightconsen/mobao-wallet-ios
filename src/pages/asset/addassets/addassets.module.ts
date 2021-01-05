import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddassetsPage } from './addassets';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddassetsPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(AddassetsPage),
  ],
})
export class AddassetsPageModule {}
