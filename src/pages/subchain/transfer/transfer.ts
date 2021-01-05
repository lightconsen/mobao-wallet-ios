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
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the TransferPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-transfer",
  templateUrl: "transfer.html"
})
export class TransferPage extends BaseUI {
  @ViewChild('pwdID') myInput;
  value: any; //路由过来的余额
  info: any; //路由过来的详情
  amount: any; //提币数量
  toAddr: string; //接收方地址
  pwd: any = ""; //密码pwd1: string;
  user: any;
  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    public walletProvider: WalletProvider,
    private barcodeScanner: BarcodeScanner,
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
    if (!this.amount) {
      this.errorMsg(this.getResult('subchain.29'));
      return;
    }
    if (!this.toAddr) {
      this.errorMsg(this.getResult('subchain.30'));
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
            this.Send();
          }
        }
      ]
    });
    prompt.present();
  }
  //转账
  async Send() {
    let secret = AppConfig.secretDec('call', this.user.pwd, this.user.secret) || AppConfig.secretDec('call', '123456', this.user.secret);
    if (Md5.hashStr(this.pwd) == this.user.pwd) {
      let res = await this.walletProvider.SubChainSend(
        secret,
        this.toAddr,
        this.amount,
        this.info.MicroChain,
        "http://" + this.info.monitor_ip + "/rpc"
      );
      console.log(res);
      if (res) {
        this.amount = "";
        this.toAddr = "";
        this.pwd = "";
        this.presentToast(this.getResult('assets.11'));
        this.navCtrl.pop();
      } else {
        this.errorMsg(this.getResult('subchain.14'));
      }
    } else {
      this.pwd = '';
      this.errorMsg(this.getResult('assets.13'));
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

  toCont() {
    //去联系人选择
    this.navCtrl.push("ContactsPage", {
      send: true,
      sendpage: "TokensendPage",
      token: this.info
    });
  }
  ionViewDidEnter() {
    if (this.navParams.get("contsItem")) {
      this.toAddr = this.navParams.get("contsItem").address || "";
    } else {
      //   console.log(this.navParams.get('contact'))
    }
  }
  Scan() {
    //扫码
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        if (barcodeData.cancelled) {
          return false;
        }
        if (barcodeData) {
          this.toAddr = barcodeData.text;
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }

}
