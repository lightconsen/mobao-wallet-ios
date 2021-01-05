import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../../providers/wallet'
import { Storage } from "@ionic/storage";
import { Md5 } from 'ts-md5/dist/md5';
import { AppConfig } from '../../../app/app.config';
import { AssetPage } from '../../asset/asset';
import { TabsPage } from '../../tabs/tabs';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the ImportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-import',
  templateUrl: 'import.html',
})
export class ImportPage extends BaseUI {
  private:string='';//私钥
  name:string='';//名称
  pwd:string='';//密码
  confirmPwd:string='';//二次密码
  eyeFlag1:boolean=false;//密码
  eyeFlag2:boolean=false;//确认密码
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public alertCtrl:AlertController,
    public walletProvider:WalletProvider,
    private storage:Storage) {
        super();
  }
  exportWallet(){//导入钱包
      let pwdReg = /^[a-zA-Z0-9_-]{8,16}$/;
      if(this.private===''){
          this.errorMsg(this.getResult("login.21"));
          return
      }
      if(this.name===''){
          this.errorMsg(this.getResult("assets.49"));
          return
      }
      if(this.pwd===''){
          this.errorMsg(this.getResult("login.7"));
          return
      }
      if(!(pwdReg.test(this.pwd))){
          this.errorMsg(this.getResult("login.8"))
          return
      }
      if(this.confirmPwd===''){
          this.errorMsg(this.getResult("login.7"));
      }
      if(this.confirmPwd!==this.pwd){
          this.errorMsg(this.getResult("login.9"));
          return
      }
    //   不少于8位字符，建议混合大小写字母、数字、特殊字符
      if(this.walletProvider.isValidPrivate(this.private.replace(/\s+/g, ""))){
          let wallet:any = this.walletProvider.importAccount(this.private.replace(/\s+/g, ""));
          if(typeof wallet === 'string'){
            this.errorMsg(this.getResult("login.10"));
            return;
          }else{
              console.log(wallet)
              this.storage.get('pockets').then((p)=>{
                  if(p){
                      let pockets=p;
                      pockets.unshift({
                          'name':this.name,
                          'pwd':Md5.hashStr(this.confirmPwd),
                          'address':wallet.address,
                          'secret':AppConfig.secretEnc('call',Md5.hashStr(this.confirmPwd),wallet.secret)
                      })
                      this.storage.set('pockets',pockets);
                  }else{
                      let pocket:any=[{
                          'name':this.name,
                          'pwd':Md5.hashStr(this.confirmPwd),
                          'address':wallet.address,
                          'secret':AppConfig.secretEnc('call',Md5.hashStr(this.confirmPwd),wallet.secret)
                      }]
                      this.storage.set('pockets',pocket);
                  }
              });
              this.storage.set('user',{
                  'name':this.name,
                  'pwd':Md5.hashStr(this.confirmPwd),
                  'address':wallet.address,
                  'secret':AppConfig.secretEnc('call',Md5.hashStr(this.confirmPwd),wallet.secret)
              }).then(()=>{
                    this.navCtrl.setRoot(TabsPage);
              });
          }
      }else{
          this.errorMsg(this.getResult("login.22"));
      }
      
  }

    
    
     
  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportPage');
  }
errorMsg(msg){
    //错误提示
    let prompt = this.alertCtrl.create({
        title:this.getResult("assets.1"),
        message: msg,
        buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            }
        ]
    });
    prompt.present();
}   
getResult(msg){
    return super.getI18n(msg,this.translate)
}
}
