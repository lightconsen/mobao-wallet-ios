import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LanguagePage } from './language';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    LanguagePage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(LanguagePage),
  ],
})
export class LanguagePageModule {}
