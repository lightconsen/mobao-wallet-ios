import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  AlertController
} from "ionic-angular";
import { WalletProvider } from "../../../providers/wallet";
import { Storage } from "@ionic/storage";
import { Md5 } from "ts-md5/dist/md5";
import { AppConfig } from "../../../app/app.config";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the CarryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-carry",
  templateUrl: "carry.html"
})
export class CarryPage extends BaseUI {
  @ViewChild('pwdID') myInput;
  value: any; //路由过来的余额
  info: any; //路由过来的详情
  amount: any; //提币数量
  pwd: any = ""; //密码pwd1: string;
  user: any;
  amountReg: any = /(^[0-9]*(.[0-9]+)?)$/;
  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    public walletProvider: WalletProvider,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {
    super();
    this.value = this.navParams.get("balance");
    this.info = this.navParams.get("info");
    console.log(this.info);
    this.storage.get("user").then(user => {
      this.user = user;
    });
  }

  enterPwd() {
    if (!this.amount || !this.amountReg.test(this.amount)) {
      this.errorMsg(this.getResult('subchain.11'));
      return;
    }
    if (this.amount > this.value) {
      this.errorMsg(this.getResult('subchain.12'));
      return;
    }
    let prompt = this.alertCtrl.create({
      title: this.getResult("assets.8"),
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder: this.getResult("assets.8"),
        },
      ],
      buttons: [
        {
          text: this.getResult("assets.9"),
          handler: data => {
          }
        },
        {
          text: this.getResult("assets.10"),
          handler: data => {
            this.pwd = data.password;
            this.withdraw();
          }
        }
      ]
    });
    prompt.present();
  }
  //提币
  async withdraw() {
    if (Md5.hashStr(this.pwd) == this.user.pwd) {
      let secret = AppConfig.secretDec('call', this.user.pwd, this.user.secret) || AppConfig.secretDec('call', '123456', this.user.secret);
      try {
        let res = await this.walletProvider.SubChainWith(secret,
          this.amount,
          this.info.dapp_base_address,
          this.info.MicroChain,
          "http://" + this.info.monitor_ip + "/rpc"
        );
        if (res) {
          console.log('提币请求返回', res)
          this.storage.get('frozen').then((f) => {
            if (f) {
              let arr: any = f;
              arr.push({
                hash: res,
                amount: this.amount,
                date: new Date().getTime()
              });
              this.storage.set('frozen', arr)
            } else {
              this.storage.set('frozen', [{
                hash: res,
                amount: this.amount,
                date: new Date().getTime()
              }]);
            }
          }).then(() => {
            this.amount = "";
          })
          this.presentToast(this.getResult('assets.11'));
          this.navCtrl.pop();
        } else {
          this.errorMsg(this.getResult('subchain.14'));
        }
      } catch (e) {
        this.presentToast(JSON.stringify(e));
      }
    } else {
      this.errorMsg(this.getResult('assets.13'));
      return;
    }
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
      title: this.getResult('assets.1'),
      message: msg,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });
    prompt.present();
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: "top",
      cssClass: "toast"
    });

    toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
    });

    toast.present();
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
