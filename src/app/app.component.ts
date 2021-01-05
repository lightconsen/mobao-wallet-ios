import { Component, NgZone } from '@angular/core';
import { App,Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import {Storage} from "@ionic/storage";
import { LoginPage } from '../pages/login/login'
import { ImportPage } from '../pages/login/import/import'
import { SetpwdPage } from '../pages/login/setpwd/setpwd'
import { TranslateService } from "@ngx-translate/core";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  pockets:any=[];
  user:any={};
  lang: string = 'zh';
  constructor(
    private app:App,
    platform: Platform, 
    statusBar: StatusBar,
    private zone: NgZone,
    private storage:Storage,
    private menuCtrl:MenuController,
    splashScreen: SplashScreen,
    private translate: TranslateService) {
        this.storage.get('user').then((user)=>{//获取当前用户
            if(user){
                this.rootPage = TabsPage;
            }else{
                this.rootPage = 'LoginPage';
            }
        })
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.initTranslateConfig();//初始化中文
            statusBar.styleDefault();
            splashScreen.hide();
        });
        
  } //语言设置
  initTranslateConfig() {
    // 参数类型为数组，数组元素为本地语言json配置文件名
    this.translate.addLangs(["zh","en"]);
    // 从storage中获取语言设置
    this.storage.get('language').then((l)=>{
      if(l){
        this.lang = l;
        // 设置默认语言
        this.translate.setDefaultLang(this.lang);
        // 检索指定的翻译语言，返回Observable
        this.translate.use(this.lang);
      }else{
        // 设置默认语言
        this.translate.setDefaultLang(this.lang);
        // 检索指定的翻译语言，返回Observable
        this.translate.use(this.lang);
      }
      // 存储到storage
      this.storage.set('language',this.lang);
    })

  }
    ionOpen() {
        this.storage.get('pockets').then((p)=>{
            if(p){
                // this.pockets = p;
                this.zone.run(() => {
                    this.pockets = p;
                });
            }
        })
        this.storage.get('user').then((user)=>{
            if(user){
                // this.pockets = p;
                this.zone.run(() => {
                    this.user = user;
                });
            }
        })
    }
    jump(item){
        if(item != ''){
            this.app.getRootNav().push(item);
            this.menuCtrl.close();
        }else{
            //err
        }
    }
}
