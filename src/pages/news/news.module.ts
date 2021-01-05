import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsPage } from './news';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NewsPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(NewsPage),
  ],
})
export class NewsPageModule {}
