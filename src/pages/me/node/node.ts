import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { WalletProvider } from '../../../providers/wallet';
import { Storage } from "@ionic/storage";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';

// import VConsole from 'vconsole';
// var vConsole = new VConsole();
/**
 * Generated class for the NodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-node',
  templateUrl: 'node.html',
})
export class NodePage extends BaseUI {
  clientVersion:string = '';//当前客户端的版本
  network:string = 'https://gateway.moac.io/mainnet';//所选择网络
  constructor(
    public translate: TranslateService,
    public navCtrl: NavController,
    private storage:Storage,
    public walletProvider: WalletProvider, 
    private toastCtrl: ToastController,
    public navParams: NavParams) {
      super();
      this.getClientVersion();
      //this.test();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NodePage');
  }
  async getClientVersion(){//获取当前客户端的版本
      this.storage.get('network').then((net)=>{
          if(net){
            this.network = net;
          }
      })
      let version = await this.walletProvider.chain3_clientVersion({});
      if(version){
          this.clientVersion = version.result;
      }
  }
  /*async test(){
    let option = {
      "assetCode":"TST",
      "gasPrice":"20000000000",
      "gasLimit":"21000"
    }
    let data = await this.walletProvider.getData('0xB96198C351990f97Fe2e894DDdEA8B8F811A4C0d','0.1',option);
    console.log('data',data);
  }*/
  save(){
      this.storage.set('network',this.network).then(()=>{
          this.presentToast(this.getResult("assets.51"));
      });
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'top',
      cssClass: 'toast'
    });

    toast.onDidDismiss(() => {
    //   console.log('Dismissed toast');
    });

    toast.present();
}
getResult(msg){
  return super.getI18n(msg,this.translate)
}
}
