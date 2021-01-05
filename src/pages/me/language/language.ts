import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the LanguagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
})
export class LanguagePage extends BaseUI {
  languageList:any = [{
      name:'简体中文',
      key:'zh'
  },{
      name:'English',
      key:'en'
  }];
  languageKey:string = 'zh';
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public storage: Storage,
    public translate: TranslateService) {
      super();
  }
  changeLang(l){
      this.translate.use(l);
      this.storage.set('language',l);
      this.navCtrl.pop();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad LanguagePage');
  }
  ionViewWillEnter(){
    //进入隐藏TabBars
    let elements=document.querySelectorAll(".tabbar");
    if(elements != null){
        Object.keys(elements).map((key) => {
            elements[key].style.display = 'none';
        });
    }
    this.storage.get("language").then((l)=>{
        this.languageKey = l;
    })
}
  getResult(msg){
      return super.getI18n(msg,this.translate)
  }
}
