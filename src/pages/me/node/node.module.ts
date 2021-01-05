import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NodePage } from './node';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    NodePage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(NodePage),
  ],
})
export class NodePageModule {}
